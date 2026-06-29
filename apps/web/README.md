# Esigenta Web

`apps/web` is the public Esigenta application plus the company area.

It owns:

- public site routes, SEO pages, cost guides, service navigation, and request funnels;
- customer request status, verification, and messaging surfaces;
- the private `area-impresa` product for companies;
- thin Next.js route, page, layout, action, and UI composition code.

It does not own business logic. Domain decisions, write flows, marketplace
rules, billing behavior, request lifecycle logic, and notification orchestration
belong in workspace packages.

## Boundaries

- Keep `app/**` route files thin: read params, resolve auth/actor, call a package
  or page model, render or redirect.
- Put business logic in `packages/domain`.
- Put auth and identity policy in `packages/auth`.
- Put billing and Stripe behavior in `packages/billing`.
- Put Prisma client, schema, and migrations in `packages/database`.
- Use `@esigenta/ui` for shared UI primitives and `apps/web/src/**` for
  web-specific composition.

Do not add direct Prisma/database orchestration to `apps/web` when an owning
package can hold the rule.

## Docs To Read First

Before structural work, read the binding architecture documents:

- `docs/architetture/01_ARCHITECTURE.md`
- `docs/architetture/02_GUARDS.md`
- `docs/architetture/03_ROADMAP.md`
- `docs/architetture/04_DEFERRED_ITEMS.md`

For package and Area Impresa rewrite work, also read:

- `docs/architetture/PACKAGES_REWRITE_REFACTOR_CONTRACT.md`
- `docs/architetture/PACKAGES_MIGRATION_ROADMAP.md`

`AGENTS.md` contains local agent guidance for the Next.js version in use.
`CLAUDE.md` points Claude-compatible tooling back to the same guidance.

## Commands

From the repository root:

```bash
pnpm --filter web dev
pnpm --filter web typecheck
pnpm --filter web lint
pnpm --filter web build
```
