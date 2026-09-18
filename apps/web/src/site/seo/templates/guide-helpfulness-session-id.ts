const SESSION_ID_STORAGE_PREFIX = "esigenta:guide-helpfulness-session:";
const RESPONSE_STORAGE_PREFIX = "esigenta:guide-helpfulness-response:";
const WINDOW_NAME_CARRIER_PREFIX = "esigenta:guide-helpfulness-carrier:";
const UUID_SHAPE_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function safeGet(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Best effort: the in-memory value still lets the current vote proceed.
  }
}

function readCarrier(): Record<string, string> {
  try {
    const value = window.name;
    if (!value.startsWith(WINDOW_NAME_CARRIER_PREFIX)) return {};

    const parsed: unknown = JSON.parse(value.slice(WINDOW_NAME_CARRIER_PREFIX.length));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? Object.fromEntries(
          Object.entries(parsed).filter(([, entry]) => typeof entry === "string"),
        )
      : {};
  } catch {
    return {};
  }
}

function writeCarrier(carrier: Record<string, string>): void {
  try {
    const currentWindowName = window.name;

    // Il funnel usa già window.name come fallback. Non sovrascriviamo il suo
    // carrier (né un valore impostato da un'altra superficie): sessionStorage
    // resta il meccanismo principale per questo voto.
    if (
      currentWindowName &&
      !currentWindowName.startsWith(WINDOW_NAME_CARRIER_PREFIX)
    ) {
      return;
    }

    window.name = WINDOW_NAME_CARRIER_PREFIX + JSON.stringify(carrier);
  } catch {
    // Best effort, like sessionStorage.
  }
}

function createUuid(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // Fall back to a UUID-shaped opaque identifier.
  }

  const hex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function resolveGuideHelpfulnessSessionId(guideSlug: string): string | null {
  if (typeof window === "undefined") return null;

  const storageKey = SESSION_ID_STORAGE_PREFIX + guideSlug;
  const stored = safeGet(storageKey);
  if (stored && UUID_SHAPE_PATTERN.test(stored)) {
    writeCarrier({ ...readCarrier(), [guideSlug]: stored });
    return stored;
  }

  const carried = readCarrier()[guideSlug];
  if (carried && UUID_SHAPE_PATTERN.test(carried)) {
    safeSet(storageKey, carried);
    return carried;
  }

  const id = createUuid();
  safeSet(storageKey, id);
  writeCarrier({ ...readCarrier(), [guideSlug]: id });
  return id;
}

export function readGuideHelpfulnessResponse(guideSlug: string): "yes" | "no" | null {
  if (typeof window === "undefined") return null;

  const value = safeGet(RESPONSE_STORAGE_PREFIX + guideSlug);
  return value === "yes" || value === "no" ? value : null;
}

export function writeGuideHelpfulnessResponse(
  guideSlug: string,
  response: "yes" | "no",
): void {
  if (typeof window !== "undefined") {
    safeSet(RESPONSE_STORAGE_PREFIX + guideSlug, response);
  }
}
