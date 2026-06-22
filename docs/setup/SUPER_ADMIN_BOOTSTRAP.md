# Super Admin Bootstrap

Use this runbook to create the first admin account in a fresh environment.

## 1. Install

```bash
pnpm install
```

## 2. Configure Environment

Create root `.env` from `.env.example`.

Required for the super-admin bootstrap:

```bash
DATABASE_URL=""
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"
ESIGENTA_ADMIN_URL="http://localhost:3001"

ESIGENTA_SUPER_ADMIN_EMAIL=""
ESIGENTA_SUPER_ADMIN_PASSWORD=""
ESIGENTA_SUPER_ADMIN_NAME=""
```

`ESIGENTA_SUPER_ADMIN_NAME` is optional. If omitted, the bootstrap uses `Esigenta Super Admin`.

## 3. Prepare Database

```bash
pnpm --filter @esigenta/database exec prisma migrate dev
pnpm --filter @esigenta/database db:generate
```

## 4. Create Super Admin

```bash
pnpm --filter @esigenta/auth admin:bootstrap
```

Expected result:

- Creates the Better Auth `User` if it does not exist.
- Creates the Better Auth `Account` credential for email/password login when creating the user.
- Creates or updates `AdminProfile` so `role = SUPER_ADMIN`.
- Re-running the command does not create duplicate users or profiles.
- Re-running the command does not rotate an existing user's password.

## 5. Login

Start the admin app:

```bash
pnpm --filter admin dev
```

Open:

```txt
http://localhost:3001/accedi
```

Login with:

- `ESIGENTA_SUPER_ADMIN_EMAIL`
- `ESIGENTA_SUPER_ADMIN_PASSWORD`

