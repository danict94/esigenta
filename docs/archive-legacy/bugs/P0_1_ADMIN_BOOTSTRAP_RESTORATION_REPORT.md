# P0.1 ADMIN BOOTSTRAP RESTORATION REPORT

Date: 2026-06-21
Status: implemented and validated

## A. Files Changed

- `packages/auth/src/identity/admin/bootstrap-super-admin.ts`
- `.env.example`
- `docs/setup/SUPER_ADMIN_BOOTSTRAP.md`
- `docs/archive-legacy/bugs/P0_1_ADMIN_BOOTSTRAP_RESTORATION_REPORT.md`

## B. Root Env Fix

Fixed `bootstrap-super-admin.ts` so it resolves:

```txt
packages/auth/src/identity/admin -> packages/auth -> repo root -> .env
```

The bootstrap now loads root `.env` before importing auth/database modules.

Real execution verified:

```bash
pnpm --filter @esigenta/auth admin:bootstrap
```

The command loaded `..\..\.env` from `packages/auth`, which is the repository root `.env`.

## C. User Creation Flow

Restored full bootstrap behavior:

- Requires `ESIGENTA_SUPER_ADMIN_EMAIL`.
- Requires `ESIGENTA_SUPER_ADMIN_PASSWORD`.
- Uses optional `ESIGENTA_SUPER_ADMIN_NAME`.
- Normalizes email to lowercase.
- Looks up an existing `User`.
- If missing, creates the Better Auth user with `auth.api.signUpEmail`.
- If existing, reuses the user.
- Does not rotate or overwrite credentials for existing users.
- Never logs the password.

Expected database effects for a missing user:

- Creates `User`.
- Creates Better Auth `Account` with provider `credential`.
- Creates or updates `AdminProfile` with `role = SUPER_ADMIN`.

## D. Idempotency Validation

Admin profile writes now use `prisma.adminProfile.upsert`.

Repeated runs were validated against a real database:

- No duplicate users.
- No duplicate accounts.
- No duplicate admin profiles.
- Existing `SUPER_ADMIN` remains `SUPER_ADMIN`.
- Existing credentials are not changed by the bootstrap path.

## E. Documentation Restored

`.env.example` now documents the super-admin bootstrap variables:

- `ESIGENTA_SUPER_ADMIN_EMAIL`
- `ESIGENTA_SUPER_ADMIN_PASSWORD`
- `ESIGENTA_SUPER_ADMIN_NAME`

Created setup runbook:

- `docs/setup/SUPER_ADMIN_BOOTSTRAP.md`

The runbook documents:

- fresh clone install,
- required root `.env` values,
- database preparation,
- exact bootstrap command,
- expected database result,
- admin login URL.

## F. Real Database Validation

Validation used the configured real `DATABASE_URL`.

Configured environment bootstrap:

```bash
pnpm --filter @esigenta/auth admin:bootstrap
```

Result:

```json
{
  "userExists": true,
  "accountCount": 1,
  "accountProviders": ["credential"],
  "adminProfileRole": "SUPER_ADMIN"
}
```

Scenario A: missing user -> bootstrap

```json
{
  "userCount": 1,
  "accountCount": 1,
  "accountProviders": ["credential"],
  "adminProfileCount": 1,
  "adminProfileRoles": ["SUPER_ADMIN"]
}
```

Scenario B: existing user without admin profile -> bootstrap

Before:

```json
{
  "userCount": 1,
  "accountCount": 1,
  "accountProviders": ["credential"],
  "adminProfileCount": 0,
  "adminProfileRoles": []
}
```

After:

```json
{
  "userCount": 1,
  "accountCount": 1,
  "accountProviders": ["credential"],
  "adminProfileCount": 1,
  "adminProfileRoles": ["SUPER_ADMIN"]
}
```

Scenario C: existing `SUPER_ADMIN` -> bootstrap repeat

```json
{
  "userCount": 1,
  "accountCount": 1,
  "accountProviders": ["credential"],
  "adminProfileCount": 1,
  "adminProfileRoles": ["SUPER_ADMIN"]
}
```

Validation cleanup:

- Temporary validation users used the `p0-bootstrap-*@example.test` pattern.
- Those temporary users were removed after validation.
- Follow-up check confirmed:

```json
{
  "leftoverValidationUsers": 0
}
```

Typecheck:

```bash
pnpm --filter @esigenta/auth typecheck
```

Result: pass.

## Final Answers

```txt
ROOT_ENV_LOADING_FIXED = YES
BOOTSTRAP_CREATES_USER = YES
BOOTSTRAP_IDEMPOTENT = YES
FRESH_CLONE_PATH_WORKING = YES
ADMIN_BOOTSTRAP_RESTORED = YES
```

