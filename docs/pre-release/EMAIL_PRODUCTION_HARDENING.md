# EMAIL PRODUCTION HARDENING

Date: 2026-06-22
Scope: audit + implementation plan. Resend-specific steps below are
sourced from Resend's current documentation (cited inline) — not from
training-data memory — since DNS/domain-verification UI details are
exactly the kind of thing that drifts over time.

Updated context vs. the prior `EMAIL_SYSTEM_RELIABILITY_AUDIT.md`: that
audit found emails being **rejected** outright (sandbox mode, restricted
to the account's own test recipient). The current report is that emails
now **send and deliver**, with some landing in spam. This is consistent
with the account no longer being in a hard sandbox restriction, while the
underlying root cause from the prior audit — **no verified custom sending
domain** — is still present in the codebase's configuration, confirmed
below. Sending technically-valid mail from a shared, generic provider
domain with a mismatched display name is a textbook cause of spam
placement, independent of sandbox status.

**STATUS UPDATE (2026-07-12, FASE 7.C):** the display-name inconsistency
(item 9 of the TASK 5 checklist) is fixed — `apps/admin/.env.local`
(local, untracked, never committed) now reads
`RESEND_FROM_EMAIL="Esigenta <onboarding@resend.dev>"`, matching root
`.env`. `.env.example` now documents `RESEND_FROM_EMAIL` with an explicit
`your-verified-domain.it` placeholder and a comment pointing back to this
doc. Everything else below — no verified custom domain, no SPF/DKIM/DMARC,
`PRODUCTION_READY = NO` — is unchanged: those remain infrastructure/DNS
work (TASK 2/3, checklist items 1–8, 10) that only whoever owns the real
domain registration and Resend account access can complete.

---

## TASK 1 — Current email configuration inventory

| Setting | Value found | Where |
| --- | --- | --- |
| `RESEND_API_KEY` | Present, non-empty (confirmed by length, not content) | `.env` |
| `RESEND_FROM_EMAIL` (web/root) | `"Esigenta <onboarding@resend.dev>"` | `.env` |
| `RESEND_FROM_EMAIL` (admin) | `"FixPro <onboarding@resend.dev>"` | `apps/admin/.env.local` |
| `RESEND_FROM_EMAIL` (example/template) | `"Esigenta <no-reply@example.com>"` | `.env.example` |
| Sender domain in actual use | `resend.dev` — Resend's own shared sandbox/testing domain, **not** a domain Esigenta owns or has verified | confirmed by both `.env` values above |
| Fallback behavior | `packages/notifications/src/email/resend-client.ts`: if `RESEND_FROM_EMAIL` is unset, falls back to `Esigenta <onboarding@resend.dev>` in non-production, **throws** if unset in production | `resend-client.ts:25-40` |
| Sandbox restrictions | Previously confirmed (prior audit): account-level sandbox blocked delivery to any recipient except the account owner's own address. Current report (this task's CONTEXT) says delivery now succeeds — consistent with the account no longer being hard-restricted, not with anything in this repo's configuration having changed (confirmed: both `.env` files are byte-identical to the prior audit's findings). | — |
| Domain verification status | **0 verified custom domains**, per the prior audit's direct Resend API check (`domainsCount = 0`). Not re-checked live in this pass (no Resend API access available in this environment) — cited as still current because the only inputs that could change this (`RESEND_FROM_EMAIL`, `RESEND_API_KEY`) are unchanged in the repo. | — |

**A second, independent problem found in this pass**: the **display name
is inconsistent across apps** — `"Esigenta"` in the root/web config,
`"FixPro"` in admin's. `FixPro` reads as a leftover pre-rebrand name. Two
different brand names sending from the *same* literal mailbox
(`onboarding@resend.dev`) is itself a spam/trust signal independent of
domain verification — a receiving server and a human recipient both see
"this sender claims to be two different companies from the same shared
testing address."

---

## TASK 2 — Production requirements (Resend-specific, current steps)

Sourced from Resend's own documentation
([Managing Domains](https://resend.com/docs/dashboard/domains/introduction),
[Implementing DMARC](https://resend.com/docs/dashboard/domains/dmarc)) and a
third-party step-by-step confirmation
([DmarcDkim.com — Resend SPF/DKIM/DMARC guide](https://dmarcdkim.com/setup/how-to-setup-resend-spf-dkim-and-dmarc-records)).

1. **Add the domain in the Resend dashboard** (Domains → Add Domain).
   Resend recommends sending from a **subdomain** of the company's root
   domain (e.g. `mail.esigenta.it`, not bare `esigenta.it`) specifically
   to isolate sending reputation from the root domain — if the sending
   subdomain ever gets a bad reputation, the root domain (website,
   regular company email) is unaffected.
2. **Resend generates the required records automatically** — add these
   exactly as shown in the dashboard to the DNS provider that hosts
   `esigenta.it` (registrar or DNS host, e.g. Cloudflare/Route53/whoever
   currently manages the domain):
   - An **MX record** on the send subdomain (used for bounce
     processing).
   - A **TXT record** on the send subdomain (this is the SPF
     declaration — which servers are authorized to send as this domain).
   - A **DKIM record** (TXT, via a CNAME pattern like
     `resend._domainkey.<send-subdomain>`) — the cryptographic signing
     key receiving servers use to verify the message wasn't altered in
     transit and genuinely came from an authorized sender.
3. **Click "Verify DNS Records" in the Resend dashboard.** Propagation
   can take up to 24 hours; warnings about missing SPF/DKIM disappear
   once DNS has propagated and Resend re-checks.
4. **Add DMARC manually** — Resend does not auto-generate this one.
   Add a TXT record at `_dmarc.esigenta.it` (or `_dmarc.<send-subdomain>`,
   per [Resend's DMARC guide](https://resend.com/docs/dashboard/domains/dmarc)).
   Start with a **monitoring policy**: `p=none` — this collects reports
   without rejecting/quarantining anything, so nothing already in flight
   breaks. Confirm via real sent-message headers that `dmarc=pass` shows
   up consistently.
5. **Only after confirming DMARC passes consistently**, tighten the
   policy to `p=quarantine` (Resend's own recommendation) — this is what
   actually moves the needle on spam placement, since it tells receiving
   mail providers "treat unauthenticated mail claiming to be from this
   domain with suspicion," which is the strongest signal against
   phishing/spoofing classification.
6. **Update every `RESEND_FROM_EMAIL` value** (Task 3) to use the newly
   verified domain, consistently, across every environment file.

This is an infrastructure/DNS task, not a code change — none of the
application code needs to change to support a verified domain; it only
needs the env var updated (Task 3).

---

## TASK 3 — Sender identity audit

**Current sender** (both apps, today): `onboarding@resend.dev` — Resend's
own generic testing domain, with two different, inconsistent display
names layered on top (`"Esigenta"` vs `"FixPro"`).

**Target sender**: `no-reply@<send-subdomain>.esigenta.<tld>` — e.g.
`no-reply@mail.esigenta.it`, assuming `.it` is the real registered TLD
(not confirmed anywhere in this repo's configuration — `ESIGENTA_WEB_URL`/
`NEXT_PUBLIC_APP_URL` are still `http://localhost:3000` in every env file
checked, including the real `apps/web/.env.local`). **This plan cannot
specify the exact final domain string without that confirmed from
whoever owns the actual registered domain** — `esigenta.it` is used as
the working example throughout this document and must be substituted
for the real one.

**Changes required**:
1. Decide and confirm the real root domain (not found anywhere in this
   codebase's configuration — a prerequisite, not a code task).
2. Verify a send-subdomain of it in Resend (Task 2).
3. Update `RESEND_FROM_EMAIL` to the **same** value, with the **same**
   display name, in every environment that sends mail:
   - Root `.env` (used by `apps/web`)
   - `apps/admin/.env.local` (currently the stale `"FixPro"` name — this
     must change to match, not just change domain)
   - Whatever production secrets/environment store deploys actually read
     from (not visible from this repo — `.env`/`.env.local` are local
     dev files; production presumably has its own secret store this
     audit has no access to and cannot verify)
4. Pick **one** display name and use it everywhere — recommend
   `"Esigenta"` (matches the product name used throughout the rest of
   the codebase; `"FixPro"` does not appear anywhere else in the admin
   app's UI strings, confirming it really is leftover, not an
   intentional admin-specific brand).

---

## TASK 4 — Email flow and template inventory

| Flow | Trigger | Template | Sender path |
| --- | --- | --- | --- |
| Request verification | Public funnel submission, before the request is visible to anyone | `requestVerificationEmail` (`packages/notifications/src/email/templates/request-verification-email.ts`) — subject "Verifica la tua richiesta Esigenta" | Shared `sendEmail` → Resend |
| Company "new request" notification | Admin publishes a request; dispatch creates a queued delivery; admin action processes it | Inline HTML built in `apps/admin/src/lib/notifications/process-request-email-deliveries.ts` (`EMAIL_SUBJECT = "Nuova richiesta disponibile su Esigenta"`) → `resend-request-email-adapter.ts` | Admin's own Resend adapter (separate from the shared `sendEmail`, but same underlying Resend client/domain) |
| Conversation message | A message is sent in a `COMPANY_CUSTOMER` or `SUPPORT` conversation | `conversationMessageEmail` (`.../templates/conversation-message-email.ts`) — subject "Nuovo messaggio su Esigenta" | Shared `sendEmail` → Resend |
| Customer request-history access | Customer requests a link to see their request history | `customerRequestsAccessEmail` (`.../templates/customer-requests-access-email.ts`) — subject "Accedi alle tue richieste Esigenta" | Shared `sendEmail` → Resend |
| Password reset | Company/admin password recovery | Inline HTML/text in `packages/auth/src/auth/password-reset.ts` | Direct Resend SDK call (bypasses the shared `sendEmail` wrapper — already flagged in the prior reliability audit as not checking `result.error` the same way) |

**All five templates** use plain inline-styled HTML with a matching
plain-text version, no external images/CSS, no tracking pixels — none of
that is a spam-risk factor here. **None of the five sets a
`List-Unsubscribe` header.** This is a secondary, smaller contributor to
spam placement (not the primary cause, which is the unverified shared
domain) — Gmail/Yahoo's bulk-sender requirements formally require
one-click unsubscribe + `List-Unsubscribe` headers only above a
5,000-emails/day threshold this product is nowhere near yet, but having
it is a recognized positive reputation signal even below that threshold,
and costs little to add once a real domain exists. Recommended as a
follow-up after the domain fix lands, not a blocker by itself.

---

## TASK 5 — Production readiness checklist

```txt
[ ] 1. Confirm the real, registered root domain for Esigenta (not present
       anywhere in this repo's configuration today).
[ ] 2. In the Resend dashboard, add that domain (or a dedicated send
       subdomain of it, per Resend's own recommendation).
[ ] 3. Add the MX + TXT (SPF) + DKIM records Resend generates to the
       domain's real DNS host.
[ ] 4. Click "Verify DNS Records" in Resend; wait for propagation
       (up to 24h) until SPF/DKIM both show verified.
[ ] 5. Add a DMARC TXT record at _dmarc.<domain> manually, starting at
       p=none (monitor-only).
[ ] 6. Send real test messages to multiple real mailbox providers
       (Gmail, Outlook/Hotmail, at minimum) and inspect message headers
       for dmarc=pass, spf=pass, dkim=pass.
[ ] 7. Once DMARC passes consistently across real sends, tighten the
       DMARC policy to p=quarantine.
[ ] 8. Update RESEND_FROM_EMAIL to the verified domain's address (e.g.
       no-reply@mail.esigenta.it) — root .env, apps/admin/.env.local, and
       whatever the real production secret store uses.
[ ] 9. Use the same display name in every RESEND_FROM_EMAIL value — pick
       one ("Esigenta" recommended) and remove the "FixPro" leftover from
       apps/admin/.env.local.
[ ] 10. Re-run real test sends after the env update; confirm spam
        placement stops across the same providers tested in step 6.
[ ] 11. (Recommended, not blocking) Add a List-Unsubscribe header to the
        shared sendEmail wrapper and the admin adapter, for the
        non-transactional-feeling templates (conversation/notification
        mail) — skip for the request-verification and password-reset
        transactional templates, where an unsubscribe link doesn't apply.
```

Items 1, 3, 5, 8, 9 are infrastructure/configuration actions outside this
repository's source code. Item 11 is the only one that would require an
actual code change, and is explicitly marked non-blocking.

---

## FINAL ANSWERS

```txt
EMAILS_SENDING = YES (per this task's stated current context; the Resend
  API key is present and correctly wired in code)
EMAILS_DELIVERING = YES, partially — arriving in inboxes for at least some
  recipients (per stated context), but with confirmed spam placement for
  others
SPAM_RISK_PRESENT = YES, and the cause is identifiable from this
  repository's configuration alone: sending from Resend's shared
  onboarding@resend.dev testing domain (no verified custom domain, no
  SPF/DKIM/DMARC alignment with an Esigenta-owned domain), compounded by
  an inconsistent display name ("Esigenta" vs. "FixPro") across the two
  apps that send mail
VERIFIED_DOMAIN_PRESENT = NO — confirmed 0 verified domains in the prior
  audit's direct Resend API check; nothing in this repo's configuration
  has changed since (both RESEND_FROM_EMAIL values are byte-identical to
  the prior audit's findings)
PRODUCTION_READY = NO — unchanged from the prior email audit's verdict on
  this specific point. The previously-blocking issue (sandbox rejecting
  delivery outright) appears resolved per the stated context, which is
  real progress, but the root cause underneath it (no owned, verified,
  authenticated sending domain) was never addressed and is exactly what
  now manifests as spam placement instead of outright rejection. Every
  remaining step is infrastructure/DNS configuration (checklist above),
  not a code change.
```

Sources:
- [Implementing DMARC - Resend](https://resend.com/docs/dashboard/domains/dmarc)
- [Managing Domains - Resend](https://resend.com/docs/dashboard/domains/introduction)
- [Resend SPF, DKIM, DMARC Configuration - Step-by-Step Guide | DmarcDkim.com](https://dmarcdkim.com/setup/how-to-setup-resend-spf-dkim-and-dmarc-records)
