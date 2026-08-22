const FUNNEL_SESSION_ID_STORAGE_PREFIX = "esigenta:funnel-session:"

function storageKeyFor(interventionSlug: string): string {
  return FUNNEL_SESSION_ID_STORAGE_PREFIX + interventionSlug
}

const UUID_SHAPE_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// --- FASE 7C: sessionStorage is treated as fallible everywhere, not just
// "absent". Property access on window.sessionStorage itself (not just its
// methods) can throw in some locked-down browser configurations — a single
// try/catch around the whole expression covers both, since the property
// read and the method call happen inside the same evaluated statement. All
// three wrappers are best-effort: on failure they behave as if storage were
// simply empty/a no-op, never propagating an exception to the caller (see
// resolveFunnelSessionId/clearFunnelSessionId below and the FASE 7C
// report, "Strategia sessionStorage"). ---

function safeSessionStorageGet(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSessionStorageSet(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value)
  } catch {
    // Best-effort: the id is still returned to the caller (see
    // resolveFunnelSessionId) — see the FASE 7C.1 report,
    // "Semantica della submission", for what actually preserves
    // continuity when this fails.
  }
}

function safeSessionStorageRemove(key: string): void {
  try {
    window.sessionStorage.removeItem(key)
  } catch {
    // Best-effort clear (FASE 7C): a failure here must never turn a
    // successful Request into an error, block the success screen, or
    // prevent GA4/Ads — see clearFunnelSessionId below.
  }
}

// --- FASE 7C.1: window.name as the hard-refresh-surviving fallback carrier
// when sessionStorage is unavailable.
//
// Why window.name and not the two alternatives that look tempting at
// first:
//
// - history.state: verified by reading Next.js 16's actual shipped router
//   source (node_modules/next/dist/client/components/app-router.js), not
//   assumed. On essentially every route commit, Next's own router calls
//   `window.history.pushState/replaceState` with a hardcoded object
//   literal — `{ __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: tree }` —
//   that does NOT spread whatever was there before. Anything we write to
//   history.state ourselves is reliably clobbered by Next's own
//   navigation lifecycle, not preserved across it. Confirmed unusable
//   here, not merely "risky" — see the FASE 7C.1 report for the exact
//   source lines.
// - A URL/hash carrier: this app's GA4 loader (ga4-minimal-loader.tsx)
//   calls `gtag("config", GA4_MEASUREMENT_ID)` with no
//   `send_page_view: false` and no page_location override, so GA4's
//   default automatic page_view WOULD capture the full URL — including a
//   hash fragment, since GA4's default page_location is
//   `window.location.href`. Putting funnelSessionId in the URL in any
//   form would leak it to Google by default. Ruled out for the same
//   reason this codebase already strips the legacy `?q=` funnel query
//   server-side before any client code (including Analytics) can see it
//   (see apps/web/src/app/richiesta/[requestSlug]/page.tsx).
//
// window.name has none of these problems: it is a plain per-tab string,
// untouched by Next.js (grepped the same router source above — no
// reference to window.name anywhere in it), never sent over HTTP (unlike
// a cookie, so no new exposure to server/Vercel logs), and never read by
// gtag/GA4 for anything. It is a long-standing, stable web platform
// primitive (used for cross-frame messaging since well before storage
// APIs existed) that persists for the lifetime of the tab/top-level
// browsing context — including across a hard refresh — and, like
// sessionStorage, is NOT shared with an independently-opened new tab
// (which always starts with an empty window.name), while a *duplicated*
// tab typically inherits it along with the rest of the browsing context
// — the same "same compilation" semantic sessionStorage already has
// today. See the FASE 7C.1 report, "Multi-tab", for the one caveat this
// carries (verified by documented browser behavior, not executed here in
// a live browser — no such tool is available in this environment).
//
// Scoped by interventionSlug exactly like the sessionStorage key, stored
// as a small JSON map rather than a single value, since one tab can in
// principle visit more than one intervention's funnel over its lifetime
// (e.g. back to the home page, then a different intervention) without
// losing an still-in-progress compilation for the first one.

const WINDOW_NAME_CARRIER_PREFIX = "esigenta:funnel-session-carrier:"

type WindowNameCarrier = Record<string, string>

function isWindowNameCarrier(value: unknown): value is WindowNameCarrier {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  return Object.values(value).every((entry) => typeof entry === "string")
}

function readWindowNameCarrier(): WindowNameCarrier {
  try {
    const raw = window.name

    if (!raw || !raw.startsWith(WINDOW_NAME_CARRIER_PREFIX)) {
      return {}
    }

    const parsed: unknown = JSON.parse(raw.slice(WINDOW_NAME_CARRIER_PREFIX.length))

    return isWindowNameCarrier(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function writeWindowNameCarrier(carrier: WindowNameCarrier): void {
  try {
    window.name = WINDOW_NAME_CARRIER_PREFIX + JSON.stringify(carrier)
  } catch {
    // Best-effort, same principle as sessionStorage above.
  }
}

/** Reads a valid, matching id for this slug from window.name, or null — never throws, never trusts a malformed/foreign window.name value. */
function readFromWindowNameCarrier(interventionSlug: string): string | null {
  const value = readWindowNameCarrier()[interventionSlug]

  return typeof value === "string" && UUID_SHAPE_PATTERN.test(value) ? value : null
}

/** Best-effort mirror into window.name — additive: preserves any other slug already tracked in this tab. */
function writeToWindowNameCarrier(interventionSlug: string, id: string): void {
  writeWindowNameCarrier({ ...readWindowNameCarrier(), [interventionSlug]: id })
}

/** Best-effort removal of a single slug's entry — never touches any other slug's entry. */
function removeFromWindowNameCarrier(interventionSlug: string): void {
  const carrier = readWindowNameCarrier()

  if (!(interventionSlug in carrier)) {
    return
  }

  const next = { ...carrier }

  delete next[interventionSlug]
  writeWindowNameCarrier(next)
}

// --- FASE 7C, reviewed in FASE 7C.1: three-tier id generation. Never
// assumes crypto.randomUUID exists or succeeds; never assumes
// crypto.getRandomValues exists either. The final tier cannot itself
// throw (Math.random/Date.now/performance.now/string ops are ECMAScript
// or long-standing Web Platform primitives, not permission-gated APIs —
// unlike storage/crypto, there is no realistic browser configuration
// where they throw), so this function is guaranteed not to propagate an
// exception by construction. See the FASE 7C.1 report,
// "UUID generation", for why the tier 3 entropy was reconsidered (not
// just kept) now that this id backs a real database UNIQUE constraint. ---

/** Lowercase hex digits only, matching crypto.randomUUID()'s own casing — see FUNNEL_SESSION_ID_PATTERN in packages/domain/.../funnel-session-id.ts (case-insensitive there, but no reason to deviate). */
function randomHexString(length: number): string {
  let out = ""

  for (let index = 0; index < length; index += 1) {
    out += Math.floor(Math.random() * 16).toString(16)
  }

  return out
}

/** Formats exactly 32 hex characters into the 8-4-4-4-12 shape the server's normalizeFunnelSessionId() expects (packages/domain/src/public/requests/funnel-session-id.ts) — the one hard compatibility requirement for every tier below, including the fallbacks. */
function formatAsUuidShape(hex32: string): string {
  return [
    hex32.slice(0, 8),
    hex32.slice(8, 12),
    hex32.slice(12, 16),
    hex32.slice(16, 20),
    hex32.slice(20, 32),
  ].join("-")
}

/**
 * Tier 2: crypto.getRandomValues()-based UUID v4 construction — used only
 * when crypto.randomUUID is missing or throws, but crypto.getRandomValues
 * is still available (broader support than randomUUID specifically — the
 * latter shipped years later in the Web Crypto API). Sets the
 * version/variant nibbles for a proper UUID v4 shape (not required by the
 * server's regex, which doesn't pin them, but free to do and keeps the id
 * looking like a real UUID either way).
 */
function generateUuidFromRandomValues(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))

  // Indices 6/8 are always in-bounds for a freshly-allocated 16-byte
  // array — the non-null assertions only satisfy noUncheckedIndexedAccess,
  // not a real possibility of undefined here.
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")

  return formatAsUuidShape(hex)
}

/**
 * Tier 3 — final fallback, used only when neither crypto.randomUUID nor
 * crypto.getRandomValues is usable. Not cryptographically secure, and
 * that is an explicit non-requirement here (confirmed again in FASE
 * 7C.1): this id is never used for authentication, only for telemetry
 * correlation and — since FASE 7B — Request.submissionSessionId business
 * idempotency, so it only needs to realistically avoid collisions between
 * real concurrent users, not resist a determined attacker deliberately
 * trying to guess/collide another user's id.
 *
 * FASE 7C.1 reconsideration: kept the same overall shape as FASE 7C
 * (never just Date.now() alone, explicitly called out as insufficient),
 * but widened the entropy pool now that this id also backs a real
 * database UNIQUE constraint — Date.now() (millisecond resolution) is
 * combined with performance.now()'s own fractional/sub-millisecond
 * component (a second, independent time source at finer resolution) and
 * 24 (not 20) further random hex digits from Math.random(). This is
 * still not a security control — it is extra collision-avoidance margin
 * on the one tier that was never cryptographically strong to begin with,
 * at zero cost and no new dependency.
 */
function generateMathRandomFallbackId(): string {
  const timeMs = Date.now()
  const subMs = typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : 0
  // Sub-millisecond fraction as extra hex digits, independent of Math.random().
  const subMsHex = Math.floor((subMs % 1) * 0xffff)
    .toString(16)
    .padStart(4, "0")
    .slice(-4)
  const timeHex = timeMs.toString(16).padStart(8, "0").slice(-8)
  const randomPart = randomHexString(20)

  return formatAsUuidShape(timeHex + subMsHex + randomPart)
}

/**
 * Preferred path first, falling through only on absence or a thrown
 * exception at each tier — never lets a browser API surprise abort id
 * generation. See the FASE 7C / FASE 7C.1 reports for the full rationale
 * of each tier.
 */
function generateSessionId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID()
    }
  } catch {
    // Fall through to tier 2.
  }

  try {
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      return generateUuidFromRandomValues()
    }
  } catch {
    // Fall through to tier 3.
  }

  return generateMathRandomFallbackId()
}

/**
 * Identità tecnica stabile di UNA compilazione del funnel per un dato
 * interventionSlug. Non è un identificatore di sessione browser generico,
 * non è collegato in alcun modo al consenso cookie (nessun import da
 * site/shell/cookie-consent-storage qui, di proposito — vedi FASE 6B) e non
 * contiene alcun dato dell'utente: solo un UUID casuale opaco.
 *
 * Creato: al primo mount di RequestStepper per questo interventionSlug in
 * questa scheda, se né sessionStorage né il carrier window.name hanno già
 * un valore per lo stesso slug.
 * Riusato: refresh, back/forward, cambio step, e qualunque nuovo ingresso su
 * /richiesta/<stesso slug> nella STESSA scheda, finché non viene
 * esplicitamente rimosso da clearFunnelSessionId — nessun timeout/scadenza,
 * a differenza di resolve-funnel-query.ts: qui non c'è testo libero
 * dell'utente che possa "invecchiare male", solo un identificatore opaco
 * che resta valido finché quella compilazione non si conclude.
 * Eliminato: solo dopo una Request realmente creata con successo (vedi
 * request-stepper.tsx, submitDraft) — mai su un submit fallito, un errore
 * di rete o una validazione respinta: lo stesso tentativo deve poter essere
 * ritentato con lo stesso id.
 *
 * Scoped per interventionSlug (non globale): una compilazione su un
 * intervento diverso è una compilazione realmente distinta e ottiene un id
 * proprio, indipendente da quello di un'altra eventualmente abbandonata.
 *
 * Ritorna null solo durante il render lato server (nessuna sessionStorage
 * disponibile): il valore reale nasce al primo render lato client, dentro
 * lo stesso useState(() => resolveFunnelSessionId(...)) — stesso pattern
 * SSR-safe già usato da resolveFunnelQuery.
 *
 * FASE 7C: sessionStorage e la generazione dell'id sono fault-tolerant —
 * un id viene SEMPRE restituito, anche se sessionStorage è del tutto
 * indisponibile/lancia o se crypto.randomUUID manca/lancia.
 *
 * FASE 7C.1: quando sessionStorage non ha (o non può fornire) un id già
 * esistente, viene consultato anche il carrier window.name — sopravvive a
 * un hard refresh della stessa scheda esattamente come sessionStorage
 * quando funziona, ma non dipende dalla Storage API. In pratica: la
 * continuità cross-refresh di UNA compilazione si perde solo se ENTRAMBI
 * i meccanismi falliscono nella stessa scheda, non appena sessionStorage
 * da solo fallisce — vedi report FASE 7C.1, "Hard refresh" e
 * "Semantica della submission".
 */
export function resolveFunnelSessionId(
  interventionSlug: string,
): string | null {
  if (typeof window === "undefined") {
    return null
  }

  const key = storageKeyFor(interventionSlug)
  const fromSessionStorage = safeSessionStorageGet(key)

  if (fromSessionStorage) {
    // Mirror opportunistico nel carrier window.name: se sessionStorage
    // dovesse smettere di funzionare più avanti nella vita di questa
    // stessa scheda, la continuità resta comunque disponibile. Best-effort,
    // non asserito.
    writeToWindowNameCarrier(interventionSlug, fromSessionStorage)

    return fromSessionStorage
  }

  const fromWindowName = readFromWindowNameCarrier(interventionSlug)

  if (fromWindowName) {
    // sessionStorage non aveva nulla (vuoto per davvero, o la lettura è
    // fallita silenziosamente) ma il carrier window.name sì: stessa
    // compilazione, sessionStorage era il pezzo mancante. Ritenta anche di
    // riscriverlo lì — innocuo se fallisce di nuovo.
    safeSessionStorageSet(key, fromWindowName)

    return fromWindowName
  }

  const generated = generateSessionId()

  safeSessionStorageSet(key, generated)
  writeToWindowNameCarrier(interventionSlug, generated)

  return generated
}

/**
 * Rimuove il funnelSessionId di questo interventionSlug. Chiamare SOLO dopo
 * una Request realmente creata con successo (vedi request-stepper.tsx) —
 * mai su un submit fallito o un errore di rete, altrimenti un nuovo
 * tentativo della STESSA compilazione perderebbe l'identificatore che la
 * lega al tentativo precedente.
 *
 * FASE 7C/7C.1: best-effort su entrambi i carrier (sessionStorage e
 * window.name) — un fallimento su uno o entrambi non deve mai trasformare
 * un successo in errore, bloccare la schermata di successo, o impedire
 * GA4/Ads. Se la rimozione fallisce silenziosamente su uno dei due, l'unico
 * effetto è che una FUTURA compilazione dello stesso interventionSlug in
 * questa stessa scheda potrebbe ritrovare il vecchio id — innocuo (il
 * server lo riconoscerebbe come un retry idempotente della Request già
 * creata, non come un errore, vedi FASE 7B), mai un blocco.
 */
export function clearFunnelSessionId(interventionSlug: string): void {
  if (typeof window === "undefined") {
    return
  }

  safeSessionStorageRemove(storageKeyFor(interventionSlug))
  removeFromWindowNameCarrier(interventionSlug)
}
