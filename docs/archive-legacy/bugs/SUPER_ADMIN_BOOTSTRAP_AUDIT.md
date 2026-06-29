# SUPER ADMIN BOOTSTRAP AUDIT

Date: 2026-06-21
Scope: audit only. No source code changes.

## A. Required Env Variables

Current bootstrap file:

- `packages/auth/src/identity/admin/bootstrap-super-admin.ts`

Explicitly required by the script:

- `ESIGENTA_SUPER_ADMIN_EMAIL`

Implicitly required at runtime:

- `DATABASE_URL`, required by `@esigenta/database` when Prisma is first used.

Present but not consumed by the current bootstrap:

- `ESIGENTA_SUPER_ADMIN_PASSWORD`
- `ESIGENTA_SUPER_ADMIN_NAME`

Important env loading finding:

- The current script tries to load dotenv from `resolve(packageDir, "../../.env")`.
- In the current file, `packageDir` resolves to `packages/auth/src`.
- Therefore the dotenv path resolves to `packages/.env`, not the repository root `.env`.
- `packages/.env` does not currently exist.
- A fresh clone that follows `.env.example` into root `.env` will not have that file loaded by this script unless the values are also present in the process environment.

## B. Execution Path

Current package script:

```bash
pnpm --filter @esigenta/auth admin:bootstrap
```

Defined in:

- `packages/auth/package.json`

Root `package.json` does not expose a shortcut for this command.

The script is not a full account seed. It only promotes an already existing `User` row to admin. If the user does not exist, it exits with:

```txt
Create/login the user first, then run bootstrap.
```

Current practical execution requires:

1. A configured database.
2. `DATABASE_URL` available to the process.
3. A pre-existing Better Auth `User` with the target email.
4. `ESIGENTA_SUPER_ADMIN_EMAIL` available to the process.
5. Running `pnpm --filter @esigenta/auth admin:bootstrap`.

Because of the dotenv path issue, relying only on root `.env` is not sufficient for the current script.

## C. Database Effects

Tables read:

- `User`
- `AdminProfile`

Records created:

- Creates one `AdminProfile` record with `role = "SUPER_ADMIN"` for the existing user when no admin profile exists.

Records updated:

- Updates an existing `AdminProfile.role` to `SUPER_ADMIN` when the profile exists with another role, currently `ADMIN`.

Records not created or updated:

- Does not create `User`.
- Does not create `Account`.
- Does not store or update a password.
- Does not create `Session`.
- Does not use `ESIGENTA_SUPER_ADMIN_PASSWORD`.
- Does not use `ESIGENTA_SUPER_ADMIN_NAME`.

Idempotency:

- Idempotent for normal repeated execution after the `AdminProfile` exists.
- If the profile already has `SUPER_ADMIN`, it performs no write and returns `changed: false`.
- If the profile exists as `ADMIN`, it promotes it to `SUPER_ADMIN`.
- If the profile is missing, it creates it once.
- It is not a full concurrent upsert, so simultaneous first-time runs could still race on the unique `AdminProfile.userId` constraint.

## D. Historical Comparison

Earlier FixPro/Esigenta history shows two different mechanisms.

Initial promote-only bootstrap:

- Commit `7fe55f5` had `packages/db/src/identity/bootstrap-super-admin.ts`.
- It required `FIXPRO_SUPER_ADMIN_EMAIL`.
- It promoted an existing user only.
- Package command was `pnpm --filter @fixpro/db admin:bootstrap`.

Full auth seed path:

- Commit `91673f5` added the operational bootstrap entries to `.env.example`.
- `packages/db/seed/seed_auth.ts` required:
  - `FIXPRO_SUPER_ADMIN_EMAIL`
  - `FIXPRO_SUPER_ADMIN_PASSWORD`
  - optional `FIXPRO_SUPER_ADMIN_NAME`
- That seed created the Better Auth user through `auth.api.signUpEmail` when missing.
- It then upserted `AdminProfile` with `role = "SUPER_ADMIN"`.
- It documented the command in the file comment:

```bash
pnpm --filter @fixpro/db seed:auth
```

Esigenta rename:

- Commit `96a98c9` renamed the variables and docs from `FIXPRO_*` to `ESIGENTA_*`.
- At that point `packages/db/seed/seed_auth.ts` still existed and consumed `ESIGENTA_SUPER_ADMIN_PASSWORD`.

Identity package extraction:

- Commit `ce30a80` removed `packages/db`, including `packages/db/seed/seed_auth.ts`.
- The complete `seed:auth` command was removed.
- `@esigenta/auth` was introduced with only `admin:bootstrap`, using the promote-only behavior.
- `.env.example` still kept `ESIGENTA_SUPER_ADMIN_PASSWORD` and `ESIGENTA_SUPER_ADMIN_NAME`.
- `turbo.json` still kept `ESIGENTA_SUPER_ADMIN_PASSWORD`.

Documentation cleanup:

- Commit `64d34cd` deleted `docs/istruzioni.md`.
- That removed the only current human-readable setup instructions found for:
  - `ESIGENTA_SUPER_ADMIN_EMAIL`
  - `ESIGENTA_SUPER_ADMIN_PASSWORD`
  - optional `ESIGENTA_SUPER_ADMIN_NAME`
  - `pnpm --filter @esigenta/db seed:auth`

## E. Missing Documentation

Current tree has:

- `.env.example` entries for the operational bootstrap variables.
- `packages/auth/package.json` with `admin:bootstrap`.
- `turbo.json` env allowlist entries for email and password.

Current tree does not have:

- A runbook explaining how to create the first admin user.
- A doc explaining that the current bootstrap only promotes an existing `User`.
- A doc explaining how to create that existing user.
- A root script for admin bootstrap.
- A replacement for the removed `seed:auth` account-creation command.
- Documentation explaining why `ESIGENTA_SUPER_ADMIN_PASSWORD` and `ESIGENTA_SUPER_ADMIN_NAME` remain in `.env.example`.
- Documentation warning that root `.env` is not actually loaded by the current bootstrap script.

## F. Regression Analysis

This is a regression.

Why:

- The previous `seed:auth` path was a complete first-super-admin flow.
- The current `admin:bootstrap` path is only a promotion flow.
- The package rewrite removed `seed_auth.ts` and `seed:auth` without replacing the account-creation behavior in `@esigenta/auth`.
- The docs cleanup removed the old bootstrap instructions.
- `.env.example` and `turbo.json` still preserve variables from the removed seed path, especially `ESIGENTA_SUPER_ADMIN_PASSWORD`.
- The current bootstrap also has a dotenv path issue that prevents normal root `.env` loading.

Why `ESIGENTA_SUPER_ADMIN_EMAIL` is only referenced in `turbo.json` and the bootstrap script in normal searches:

- Plain `rg` skips dotfiles by default, so `.env.example` is easy to miss.
- With `rg --hidden`, `.env.example` also contains the variable.
- The active code only needs the email because it no longer creates the user.

Why `ESIGENTA_SUPER_ADMIN_PASSWORD` is only referenced in `turbo.json` and `.env.example`:

- It was used by the removed `packages/db/seed/seed_auth.ts`.
- No current script consumes it.
- It is now stale unless a full auth-user bootstrap is restored.

Intentional or regression:

- The promote-only script itself appears intentional.
- The loss of the full first-admin creation path, stale password/name env contract, missing docs, and wrong dotenv path are regressions.

## G. Recommended Fix

Recommended fix: restore a complete, documented first-super-admin path in `@esigenta/auth`.

Concrete repair plan:

1. Add or restore a full seed command in `packages/auth`, for example `seed:auth` or `admin:seed-super`.
2. The full seed should:
   - load the repository root `.env` correctly,
   - require `ESIGENTA_SUPER_ADMIN_EMAIL`,
   - require `ESIGENTA_SUPER_ADMIN_PASSWORD`,
   - accept optional `ESIGENTA_SUPER_ADMIN_NAME`,
   - create the Better Auth user when missing,
   - upsert `AdminProfile` as `SUPER_ADMIN`,
   - remain idempotent.
3. Keep the existing promote-only bootstrap only if it is renamed or documented as promotion-only.
4. Update `.env.example` so every listed super-admin variable is actually consumed by a documented path.
5. Update `turbo.json` to include only variables still needed by active scripts.
6. Add a short setup doc with the fresh-clone command sequence.
7. Consider a root script alias so the command is discoverable from `package.json`.

Current operational path from a fresh clone, with the repo as-is:

There is no supported, documented, single-command first-super-admin path today.

The nearest workable path is:

1. Install dependencies:

```bash
pnpm install
```

2. Create root `.env` from `.env.example` and fill at least:
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `ESIGENTA_SUPER_ADMIN_EMAIL`
   - `ESIGENTA_SUPER_ADMIN_PASSWORD`
   - optional `ESIGENTA_SUPER_ADMIN_NAME`

3. Apply/generate the database:

```bash
pnpm --filter @esigenta/database exec prisma migrate dev
pnpm --filter @esigenta/database db:generate
```

4. Make the same values available to the shell process, because the current bootstrap does not load root `.env`.

5. Create the Better Auth user. There is no current documented admin sign-up UI and no current CLI seed that creates the user. The least invasive workaround is an ad hoc `auth.api.signUpEmail` execution from `@esigenta/auth`, using the same email/password env values.

6. Promote the existing user:

```bash
pnpm --filter @esigenta/auth admin:bootstrap
```

This path is not clear enough for fresh-clone setup because user creation is undocumented, not idempotent as a repo command, and the root `.env` file is not loaded by the current bootstrap.

## Final Answers

```txt
SUPER_ADMIN_BOOTSTRAP_EXISTS = YES
SUPER_ADMIN_BOOTSTRAP_WORKING = NO
SUPER_ADMIN_BOOTSTRAP_DOCUMENTED = NO
SUPER_ADMIN_SETUP_REGRESSION = YES
ADMIN_CREATION_PATH_CLEAR = NO
```
