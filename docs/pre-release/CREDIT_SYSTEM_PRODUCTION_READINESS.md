# CREDIT SYSTEM PRODUCTION READINESS

Date: 2026-06-22
Scope: audit + implementation. Read first, as instructed:
`docs/pre-release/PRE_COMMIT_HEALTH_AUDIT.md` (B3 — zero `CreditPackage`
rows, credit system otherwise fully built),
`docs/domain-invariants/05_DATABASE_INTEGRITY_AUDIT.md`.

Non-negotiable rules respected: one money normalization boundary, no
double conversion, no hidden conversion, admin reasons in euros only,
Stripe still receives cents internally (its own native unit, not a
conversion *for* Stripe — see Task 4).

---

## TASK 1 — Complete money flow trace

```
Admin UI (priceEuros, decimal EUR string from <input type="number" step="0.01">)
  ↓  apps/admin/.../crediti/pacchetti/page.tsx: parsePriceEurosToCents()
     calls eurosToCents() — THE ONLY EUR→CENTS CONVERSION IN THE APP
Server Action (priceCents, integer CENTS)
  ↓  createPackageAction / updatePackageAction (same file)
Domain (priceCents, integer CENTS, unchanged)
  ↓  packages/billing/src/admin/credit-packages.ts:
     createCreditPackage/updateCreditPackage — normalizePositiveInt only,
     no unit conversion
Database (CreditPackage.priceCents Int, CENTS — schema.prisma:894)
  ↓  read back verbatim, no conversion
Checkout (amountCents, integer CENTS, unchanged)
  ↓  packages/billing/src/checkout/checkout-order.ts:
     createCreditPackageCheckoutOrder reads priceCents, writes it
     unchanged into CreditOrder.amountCents (schema.prisma:946);
     CheckoutOrderData.priceCents passed through verbatim
Stripe (unit_amount, integer CENTS — Stripe's own native minor-unit format for EUR)
  ↓  packages/billing/src/checkout/create-credit-checkout-session.ts:107
     unit_amount: order.priceCents — passed straight through, untouched
```

Reverse direction (display, read-only):
```
Database (priceCents/amountCents, CENTS)
  ↓  formatCentsAsCurrency() — THE ONLY CENTS→EUR CONVERSION IN THE APP
UI (formatted EUR string, e.g. "99,00 €")
```

**Every step documented above was read from the actual current source**,
not assumed. There is exactly one conversion in each direction, both now
living in `packages/shared/src/money.ts`.

---

## TASK 2 — Money field inventory

| Field | Schema type | Storage unit | Display unit |
| --- | --- | --- | --- |
| `CreditPackage.priceCents` | `Int` | CENTS | EUR (`formatCentsAsCurrency`) |
| `CreditPackage.currency` | `String @default("EUR")` | ISO 4217 code | same |
| `CreditOrder.amountCents` | `Int` | CENTS | not currently displayed anywhere (no admin order list exists yet) |
| `CreditOrder.currency` | `String @default("EUR")` | ISO 4217 code | same |
| Stripe `unit_amount` (checkout session line item) | Stripe API integer | CENTS (Stripe's native minor unit for EUR) | Stripe's own hosted checkout page renders it as EUR — outside this app's control, and correctly so |
| Stripe `metadata.credits` | string | credit-unit count (not money) | n/a |
| `CompanyCreditTransaction.amount` / `.balanceBefore` / `.balanceAfter` | `Int` | **credits** (the marketplace currency, not EUR) — confirmed not a money field at all | credit count, displayed as-is |
| `CompanyCreditAccount.balance` | `Int` | credits, not money | credit count |

**Only two fields in the entire system actually represent money**:
`CreditPackage.priceCents` and `CreditOrder.amountCents`. Everything else
that looks adjacent (`CompanyCreditTransaction.amount`,
`CompanyCreditAccount.balance`, `CreditLot` quantities) is a count of
**credits**, the product's own internal unit — confirmed by reading
`lot-ledger.ts`/`debitCompanyCreditsInTransaction` again in this pass:
none of them are ever multiplied/divided by 100 or compared against a
currency value anywhere.

---

## TASK 3 — Normalization point search

Repo-wide search for `*100`, `/100`, `cents`, `amountInCents`,
`priceInCents`, `toCents`, `fromCents`, `money`, `currency`:

| Pattern | Matches found (pre-fix) | Where |
| --- | --- | --- |
| `amountCents` / `priceCents` (field names) | Schema, `checkout-order.ts`, `create-credit-checkout-session.ts`, `get-credits-page.ts`, `admin/credit-packages.ts`, both UI pages | Pure passthrough everywhere — no arithmetic on the value itself |
| `/ 100` | 2 matches, both inside a local `formatPrice` function — one in `apps/admin/.../pacchetti/page.tsx`, one in `apps/web/.../credits-page.tsx` | The **only** two conversion points that existed before this task — correct individually, but duplicated (two independent implementations of the same conversion) |
| `* 100` | 0 matches related to money (`(item.value / total) * 100` in `apps/admin/.../page.tsx` is an unrelated percentage-of-total chart calculation, confirmed by reading it — not money) | n/a |
| `toCents` / `fromCents` / `amountInCents` / `priceInCents` | 0 matches | These exact helper names didn't exist; the codebase used inline `/100` only |
| `money` | 0 matches (until this task added `packages/shared/src/money.ts`) | — |
| `currency` | `CreditPackage.currency`, `CreditOrder.currency`, Stripe session `currency: order.currency` — all just the ISO code string flowing through unchanged, no conversion logic attached | — |

**Conclusion**: there was no double-conversion bug anywhere — every cents
value already flowed end-to-end without a second multiply/divide. The
actual problems were (1) the two display-side conversions were
independently duplicated rather than centralized, and (2) **no
conversion existed on the input side at all** — the admin form fields
required raw cents to be typed by a human, which is the literal violation
of "admin must always reason in euros."

---

## TASK 4 — Canonical model

**Answer: Option B — cents is the source of truth**, and this is the
*correct* choice here, not just the existing one: Stripe's
`checkout.sessions.create` API natively expects `unit_amount` in the
currency's smallest unit (cents for EUR) — confirmed by
`create-credit-checkout-session.ts:107` passing `order.priceCents`
straight into `unit_amount` with zero conversion. Storing cents in
`CreditPackage`/`CreditOrder` means the value that reaches Stripe is
**bit-for-bit identical** to the value stored in Postgres — there is no
boundary between the database and the payment provider where a
conversion (and therefore a rounding bug) could even occur. Storing EUR
(Option A) would have *required* a conversion at the Stripe boundary,
which is exactly the kind of extra conversion point the non-negotiable
rules ask to avoid. Cents-as-source-of-truth isn't a compromise — it's
the choice that minimizes the number of conversion points to the
unavoidable minimum of one (at the human-facing edges only).

---

## TASK 5 — Live validation (code trace, not a live write)

Per your instruction, no test `CreditPackage` rows were written to the
live production database for this task (it currently has zero rows of
any kind across `CreditPackage`/`CreditOrder`/`CompanyCreditTransaction`/
`CreditLot`/`CompanyCreditAccount` — confirmed live). Validation below is
a deterministic trace through the actual code just changed, evaluated by
hand at each step — not an assumption, every intermediate value is
computed from the real function:

| Admin enters | `eurosToCents()` step | Stored `priceCents` | `CreditOrder.amountCents` | Stripe `unit_amount` |
| --- | --- | --- | --- | --- |
| `10` | `Math.round(10 * 100)` = `Math.round(1000)` | `1000` | `1000` (copied verbatim in `checkout-order.ts`) | `1000` (copied verbatim in `create-credit-checkout-session.ts`) |
| `25` | `Math.round(25 * 100)` = `Math.round(2500)` | `2500` | `2500` | `2500` |
| `50` | `Math.round(50 * 100)` = `Math.round(5000)` | `5000` | `5000` | `5000` |

All three round-trip exactly. A fourth, harder case was checked
specifically because it's the classic float-rounding failure mode:
`19.99` — in JavaScript, `19.99 * 100` evaluates to
`1998.9999999999998` (binary floating point, not a bug in this code),
which is exactly why `eurosToCents` wraps the multiplication in
`Math.round(...)`: `Math.round(1998.9999999999998) = 1999`, the correct
integer cent value. Without that `Math.round`, a naive `priceEuros * 100`
inline in the server action (which is what existed nowhere yet, since
the input was raw cents before this task) would have risked storing
`1998` for some price points — this is the exact bug class the single
centralized `eurosToCents` function exists to prevent, now and for every
future caller.

---

## TASK 6 — Fixes applied (centralizing normalization)

New file: `packages/shared/src/money.ts` — `eurosToCents`, `centsToEuros`,
`formatCentsAsCurrency`. Exported from `packages/shared/src/index.ts`
(the file's own header comment already listed "money" among the
module's intended responsibilities — this task is the first to actually
add it).

**Eliminated the duplicate conversion**: removed the two independent
local `formatPrice` functions (`apps/admin/.../crediti/pacchetti/page.tsx`,
`apps/web/.../credits-page.tsx`) and replaced both call sites with the
single shared `formatCentsAsCurrency`.

**Eliminated the missing conversion**: the admin create/edit forms used
to have a field literally named `priceCents` requiring the admin to type
a raw integer cent value (placeholder `"9900"`). Both forms now have a
`priceEuros` field (`type="number" step="0.01"`, placeholder `"99.00"`,
edit form's `defaultValue` computed via `centsToEuros(creditPackage.priceCents)`),
converted to cents via `eurosToCents` inside the existing server actions
before being handed to the unchanged `createCreditPackage`/
`updateCreditPackage` domain functions — **the domain layer's contract
was not changed**, only what the admin UI sends it.

**Result: exactly one conversion boundary in each direction** —
`eurosToCents` at the single point human input enters the system,
`formatCentsAsCurrency` at the single point a stored value is shown to a
human. Every other layer (server action validation, domain, database,
checkout, Stripe) now deals in cents only, end to end, with zero
arithmetic on the value between those two boundaries.

`packages/database/package.json` change: none required.
`apps/admin/package.json`: added `@esigenta/shared` as a dependency (it
imports the new `money.ts` helpers; it had never depended on
`@esigenta/shared` directly before — `pnpm install` run to link it).

---

## TASK 7 — Admin UX hardening

| Surface | Before | After |
| --- | --- | --- |
| Package create | Field labeled "Prezzo centesimi", raw integer input, placeholder `9900` | Field labeled "Prezzo (€)", decimal EUR input, placeholder `99.00` |
| Package edit | Same raw-cents field, `defaultValue={creditPackage.priceCents}` (e.g. showed `9900`) | Same EUR field, `defaultValue={centsToEuros(creditPackage.priceCents)}` (shows `99`) |
| Package list (summary line) | Already correct — used a local `/100` formatter | Unchanged in *behavior*, now calls the shared `formatCentsAsCurrency` instead of its own duplicate |

**The admin never has to reason in cents anywhere in this UI now.** The
only integer the admin still types directly is `credits` (a credit
count, not money — correctly left as-is) and `validityDays`/`sortOrder`
(also not money).

---

## TASK 8 — Credit package readiness

| Capability | Status | Evidence |
| --- | --- | --- |
| Package creation | Works, now with correct EUR input | `createPackageAction` → `createCreditPackage`, validated by this task's typecheck pass |
| Package listing (admin) | Works | `listCreditPackages()`, ordered by `sortOrder`/`createdAt` |
| Package listing (company checkout visibility) | Works, correctly filtered | `get-credits-page.ts:70` — `WHERE "status" = 'ACTIVE'` — an `INACTIVE` package is created/edited but never offered to companies, confirmed by reading the query, not assumed |
| Package activation | Works | The `status` select (`ACTIVE`/`INACTIVE`) on both create and edit forms, unchanged by this task |

No gaps found in this task beyond the EUR/cents UX issue already fixed
above.

---

## TASK 9 — Production starter packages

**Not written to the live database in this pass** — per your explicit
instruction, this task documents the proposed packages with exact Stripe
amounts but leaves creating them to whoever runs the (now-corrected)
admin UI:

| Package | Credits | Price (admin enters) | Stored `priceCents` | Stripe `unit_amount` | Validity |
| --- | --- | --- | --- | --- | --- |
| Starter | 10 | `49.00` | `4900` | `4900` | 30 days |
| Professional | 30 | `129.00` | `12900` | `12900` | 30 days |
| Growth | 70 | `259.00` | `25900` | `25900` | 30 days |

Per-credit price drops from €4.90 (Starter) to €4.30 (Professional) to
€3.70 (Growth) — a conventional volume discount shape. These are
suggested starting points, not a pricing analysis; whoever creates them
through `/crediti/pacchetti` can adjust any field before saving, and the
EUR input now makes that safe to do without mental cents math.

---

## TASK 10 — End-to-end validation

**Not run against the live database in this pass**, for the same reason
as Task 9: it currently has zero rows in every credit-related table, and
exercising the full chain (create package → real Stripe checkout session
→ webhook → fulfillment → `CompanyCreditAccount`) would require either
writing a real package row (declined for this task) or a real Stripe
test-mode payment against a real company account, both of which are
live-system actions beyond what was authorized here.

**What was verified instead, by reading the actual code for each link**:
`createCreditPackageCheckoutOrder` → `createStripeCreditPackageCheckoutSession`
→ (Stripe webhook, unchanged by this task) →
`fulfillment.ts`'s `ensureCreditAccountRowInTransaction` /
`createCreditLotInTransaction` / `syncCompanyCreditAccountCacheInTransaction`
chain — already audited and confirmed correctly wired in
`PRE_COMMIT_HEALTH_AUDIT.md`'s Task 2 (Credit System Audit Lite), and
**none of that chain was touched by this task** — only the EUR↔cents
boundary at the admin input/display edges changed. The money-handling
correctness of the purchase pipeline itself was not newly introduced
risk; it was already correct, and remains correct, because nothing
between `CreditPackage.priceCents` and `unit_amount` was ever modified.

---

## FINAL ANSWERS

```txt
MONEY_SOURCE_OF_TRUTH = CENTS (CreditPackage.priceCents,
  CreditOrder.amountCents) — the right choice, not just the existing one,
  since it matches Stripe's native unit_amount unit exactly and requires
  zero conversion at that boundary.
DB_UNIT = CENTS (Int columns, both money fields)
UI_UNIT = EUR — now true everywhere, including the admin create/edit
  forms, which previously required raw cents (fixed this task).
STRIPE_UNIT = CENTS — Stripe's own native minor-unit format, not a
  conversion performed *by* this app; the value passed to unit_amount is
  identical to what's stored in the database.
DOUBLE_CONVERSION_RISK = NONE FOUND, before or after this task — every
  cents value already flowed through checkout/Stripe unconverted. The
  real defects were a duplicated display-side conversion (two independent
  formatPrice functions) and a missing input-side conversion (admin typed
  raw cents). Both fixed.
NORMALIZATION_FIXED = YES — centralized into packages/shared/src/money.ts
  (eurosToCents, centsToEuros, formatCentsAsCurrency), the single
  conversion boundary in each direction; both apps' duplicate formatters
  removed and replaced with it.
ADMIN_UX_CORRECT = YES — package create and edit forms now take and show
  EUR (decimal, step 0.01); the admin never types or reads a cents value
  anywhere in this UI.
CREDIT_PACKAGES_CREATED = NO (by explicit instruction this task) — 3
  starter packages (Starter/Professional/Growth) are fully specified with
  exact credits/price/Stripe amounts above, ready to be entered through
  the now-corrected admin UI whenever someone decides to launch them.
PURCHASE_FLOW_VALIDATED = PARTIALLY — validated by code trace and by the
  prior session's Credit System Audit Lite (every link in the chain read
  and confirmed correctly wired); NOT validated by an actual live
  purchase, since the database has zero packages/orders/transactions to
  exercise and creating live test data was explicitly declined for this
  task.
PRODUCTION_READY = YES for money correctness specifically — the
  normalization this task was scoped to fix is fixed, proven by typecheck
  and by hand-traced arithmetic, with zero double- or missing-conversion
  paths remaining anywhere in the codebase. NOT YET production-ready for
  the credit system as a whole, because B3 from
  PRE_COMMIT_HEALTH_AUDIT.md is still open: zero CreditPackage rows
  exist, so no company can buy credits today regardless of how correct
  the money math is. That remains a configuration action (create the
  packages above through /crediti/pacchetti), not a code defect.
```
