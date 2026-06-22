# ADMIN BOOTSTRAP RESTORATION PLAN

Date: 2026-06-21
Status: design only. No implementation in this pass.

## A. Current State

Current file:

- `packages/auth/src/identity/admin/bootstrap-super-admin.ts`

Current command:

```bash
pnpm --filter @esigenta/auth admin:bootstrap
```

Current behavior:

- Reads `ESIGENTA_SUPER_ADMIN_EMAIL`.
- Imports `@esigenta/database`.
- Looks up an existing `User` by email.
- Fails if the user does not already exist.
- Creates an `AdminProfile` with `role = "SUPER_ADMIN"` if no profile exists.
- Updates an existing `AdminProfile.role` to `SUPER_ADMIN` when the user already has a non-super admin profile.
- Does nothing when the existing profile is already `SUPER_ADMIN`.

Current assumptions:

- A database already exists and `DATABASE_URL` is available.
- A Better Auth `User` already exists for `ESIGENTA_SUPER_ADMIN_EMAIL`.
- The user can already authenticate through some path outside the bootstrap script.

Current gaps:

- It does not create the `User`.
- It does not create the Better Auth credential/account record.
- It does not use `ESIGENTA_SUPER_ADMIN_PASSWORD`.
- It does not use `ESIGENTA_SUPER_ADMIN_NAME`.
- It tries to load `packages/.env`, not root `.env`.
- It is not a complete fresh-clone setup path.

## B. Historical State

The previous full bootstrap path lived in:

- `packages/db/seed/seed_auth.ts`

Historical command:

```bash
pnpm --filter @esigenta/db seed:auth
```

Historical required env:

- `ESIGENTA_SUPER_ADMIN_EMAIL`
- `ESIGENTA_SUPER_ADMIN_PASSWORD`

Historical optional env:

- `ESIGENTA_SUPER_ADMIN_NAME`

Historical behavior:

- Loaded env before importing Prisma/Auth.
- Normalized the email.
- Looked for an existing `User`.
- If the user did not exist, called `auth.api.signUpEmail` with email, password, and name.
- If the user already existed, reused that user id.
- Upserted `AdminProfile` to `role = "SUPER_ADMIN"`.
- Did not log the password.
- Was intended to be idempotent for repeated runs.

Historical documentation:

- `docs/istruzioni.md` documented the P0 seed-admin task and the command.
- `.env.example` contained the super-admin env contract.

Removal path:

- `ce30a80` removed `packages/db`, including `packages/db/seed/seed_auth.ts`.
- `@esigenta/auth` kept only a promote-only `admin:bootstrap` script.
- `64d34cd` removed `docs/istruzioni.md`, deleting the setup instructions.
- `.env.example` and `turbo.json` kept the old password variable even though the active script no longer consumes it.

## C. Root Cause

The regression came from splitting package responsibilities without preserving the operational seed workflow.

The old system had two concepts:

- promote an existing user to admin,
- create the first auth user and promote it.

After the package rewrite, the first concept survived as `admin:bootstrap`, but the second concept was removed. The command name now suggests a full bootstrap, while the implementation only performs promotion.

There is also a separate env-loading bug: the current path calculation treats `packages/auth/src` as the package root, so the script misses root `.env`.

## D. Proposed Workflow

Fresh clone target flow:

1. Install

```bash
pnpm install
```

2. Database

Create root `.env` from `.env.example` and fill at least:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `ESIGENTA_ADMIN_URL`
- `ESIGENTA_SUPER_ADMIN_EMAIL`
- `ESIGENTA_SUPER_ADMIN_PASSWORD`
- optional `ESIGENTA_SUPER_ADMIN_NAME`

Then prepare Prisma:

```bash
pnpm --filter @esigenta/database exec prisma migrate dev
pnpm --filter @esigenta/database db:generate
```

3. Create super admin

The target command should be:

```bash
pnpm --filter @esigenta/auth admin:bootstrap
```

Target behavior for that command:

- Load root `.env` reliably.
- Require `ESIGENTA_SUPER_ADMIN_EMAIL`.
- Require `ESIGENTA_SUPER_ADMIN_PASSWORD`.
- Use `ESIGENTA_SUPER_ADMIN_NAME` when creating a missing user.
- Create the Better Auth user when missing.
- Reuse the existing user when present.
- Upsert `AdminProfile` as `SUPER_ADMIN`.
- Avoid logging secrets.
- Exit successfully when repeated.

4. Login to admin

Start the admin app:

```bash
pnpm --filter admin dev
```

Then login at:

```txt
http://localhost:3001/accedi
```

using `ESIGENTA_SUPER_ADMIN_EMAIL` and `ESIGENTA_SUPER_ADMIN_PASSWORD`.

There should be no hidden prerequisite such as "create/login the user first."

## E. Required Changes

Recommended design decision:

- `bootstrap-super-admin.ts` should become the true bootstrap.
- The external command named `admin:bootstrap` should create the user when missing.
- Promote-only behavior can remain as an internal helper, but it should not be the whole operational command.

Required code changes for a later implementation pass:

1. Fix dotenv loading.
   - Compute the real `packages/auth` root, not `packages/auth/src`.
   - Load root `.env` before importing `@esigenta/database` or `auth`.

2. Restore full auth-user creation.
   - Import `auth` from the auth package internals after env is loaded.
   - Use `auth.api.signUpEmail` when the user is missing.
   - Use the env password only for missing-user creation.

3. Keep idempotent profile promotion.
   - Replace manual find/create/update with `prisma.adminProfile.upsert`.
   - Ensure the final role is always `SUPER_ADMIN`.

4. Define existing-user semantics.
   - If the user already exists, do not silently rotate the password.
   - Log only that the auth user already exists.
   - If password reset support is desired, add a separate explicit future command/flag rather than changing credentials during bootstrap.

5. Normalize and validate env.
   - Trim and lowercase email before lookup/create.
   - Require password for the true bootstrap command.
   - Use a safe default name such as `Esigenta Super Admin`.

6. Update package/docs discoverability.
   - Keep `packages/auth/package.json` script as `admin:bootstrap`.
   - Consider a root alias such as `admin:bootstrap`.
   - Add a short setup doc or update an existing setup doc.
   - Update `.env.example` comments to state the variables are for first-admin bootstrap.
   - Keep `ESIGENTA_SUPER_ADMIN_PASSWORD` because it will again be required.
   - Add `ESIGENTA_SUPER_ADMIN_NAME` to any env allowlist only if the command is run through Turbo.

7. Verification for implementation pass.
   - `pnpm --filter @esigenta/auth typecheck`
   - Fresh DB smoke test: command creates `User`, `Account`, and `AdminProfile`.
   - Repeat-run smoke test: command does not create duplicates.
   - Existing-admin smoke test: command leaves an existing `SUPER_ADMIN` stable.

## F. Risks

Password handling:

- The password must never be logged.
- Existing-user password rotation should not happen implicitly.

Better Auth coupling:

- The script will depend on `auth.api.signUpEmail` behavior and return shape.
- If Better Auth changes that API, bootstrap could fail even when Prisma works.

Production safety:

- Running the command against production creates or promotes a real super admin.
- Documentation should make the target database explicit before execution.

Email casing:

- Historical seed lowercased the email.
- Current promote-only script does not.
- The restored flow should normalize consistently to avoid duplicate or missed users.

Concurrency:

- `AdminProfile` should use upsert to avoid first-run race conditions.
- User creation can still race if two bootstrap processes start simultaneously with the same missing email; the implementation should handle the unique-email failure by re-reading the user.

Env loading:

- Root `.env` loading must happen before importing auth/database modules.
- The current path bug is part of the P0 fix, not only documentation.

Final recommended direction:

- Make `admin:bootstrap` a true bootstrap again.
- Document it as the one fresh-environment super-admin path.
- Do not leave the operator to create the user manually.

## Final Answers

```txt
IS_CURRENT_BOOTSTRAP_SUFFICIENT = NO
SHOULD_BOOTSTRAP_CREATE_USER = YES
IS_PASSWORD_ENV_CURRENTLY_UNUSED = YES
IS_ADMIN_SETUP_BROKEN_FOR_FRESH_CLONES = YES
```

