# Monorepo Cleanup Report

Data audit: 2026-06-24

Scope: audit tecnico controllato del monorepo Esigenta con `pnpm lint`,
`pnpm typecheck`, `pnpm build`, Knip, Dependency Cruiser e Madge.

Non sono stati eliminati file. Non sono stati fatti refactor funzionali. Non e'
stato modificato codice applicativo.

## 1. Stato strumenti

Strumenti installati e verificati:

- `knip` presente in `package.json` root.
- `dependency-cruiser` presente in `package.json` root.
- `madge` presente in `package.json` root.
- `.dependency-cruiser.js` presente e usato da `depcruise`.

Script audit aggiunti al `package.json` root:

- `audit:knip`: `knip`
- `audit:deps`: `depcruise apps/web/src packages`
- `audit:madge`: `madge "apps/web/src" --extensions "ts,tsx" --ts-config apps/web/tsconfig.json --circular`
- `audit:clean`: `pnpm lint && pnpm typecheck && pnpm build && pnpm audit:knip && pnpm audit:deps`

Nota Madge: in PowerShell il comando non quotato `--extensions ts,tsx` viene
letto da Madge come una singola estensione malformata `ts tsx`; per questo
processava `0` file. Il comando corretto usa `--extensions "ts,tsx"`.

## 2. Risultato `pnpm lint`

Comando eseguito:

```powershell
pnpm lint
```

Esito: FAIL.

Errore principale:

- `apps/web/src/site/home/explosion.tsx:69`
- Regola: `react-hooks/set-state-in-effect`
- Dettaglio: `setResults(preloadedResults)` viene chiamato sincronicamente
  dentro un effect.

Il problema e' preesistente rispetto al fix audit applicato in questa fase. Non
e' stato corretto perche' richiede modifica di codice applicativo.

## 3. Risultato `pnpm typecheck`

Comando eseguito:

```powershell
pnpm typecheck
```

Esito: PASS.

Risultato reale:

- Turbo ha eseguito il typecheck su 12 task.
- `apps/web`, `apps/admin` e i package coinvolti passano `tsc --noEmit`.

## 4. Risultato `pnpm build`

Comando eseguito:

```powershell
pnpm build
```

Esito finale: PASS.

Risultato reale:

- `@esigenta/database`: `prisma generate` PASS.
- `admin`: `next build` PASS, 6 pagine statiche generate.
- `web`: `next build` PASS, 50 pagine statiche generate.

Warning non bloccante:

- Next.js segnala che la convenzione `middleware` e' deprecata e suggerisce
  `proxy`.

Nota: un tentativo intermedio post-modifica e' fallito per lock transitorio:
`Another next build process is already running`. Dopo la terminazione del build
appeso, il retry e' passato.

## 5. Risultato Knip

Comando eseguito:

```powershell
pnpm exec knip
pnpm audit:knip
```

Esito: FAIL, per issue reali o da verificare.

Stato aggiornato dopo i fix applicati:

- `server-only` non compare piu' tra le dipendenze non dichiarate.
- `madge` non compare piu' tra le devDependency inutilizzate, perche' ora esiste
  `audit:madge`.

### 5.1 Codice morto vero

Candidati reali, da verificare con owner prima di cancellare:

- `packages/funnel/src/compiler/infer-presets.ts`
- `packages/funnel/src/types/request-answer.ts`
- `packages/funnel/src/types/runtime-step.ts`
- `packages/config/eslint/base.mjs`

Classificazione:

- `packages/funnel/*`: `NEEDS_DOMAIN_REVIEW`, possibile `DELETE_CANDIDATE`.
- `packages/config/eslint/base.mjs`: `POSSIBLE_FALSE_POSITIVE` se previsto come
  config condivisa futura, altrimenti `DELETE_CANDIDATE`.

### 5.2 File backup/patch candidati a eliminazione

Knip segnala 11 file sotto `reports/perf-patches/...`.

Candidati a rimozione in sprint dedicato, non rimossi ora:

- `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/backup/apps/web/src/components/funnel/funnel-ui.tsx`
- `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/backup/apps/web/src/components/funnel/photo-upload-step.tsx`
- `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/backup/apps/web/src/components/layout/footer.tsx`
- `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/backup/apps/web/src/components/navigation/navbar.tsx`
- `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/backup/apps/web/src/components/privacy/cookie-consent.tsx`
- `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/backup/apps/web/src/components/funnel/funnel-ui.tsx`
- `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/backup/apps/web/src/components/funnel/photo-upload-step.tsx`
- `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/backup/apps/web/src/components/layout/footer.tsx`
- `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/backup/apps/web/src/components/navigation/navbar.tsx`
- `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/backup/apps/web/src/components/privacy/cookie-consent.tsx`
- `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/patch-6i1-shared-prefetch.cjs`

Classificazione: `DELETE_CANDIDATE`, dopo conferma che non servano come audit
storico.

### 5.3 Dipendenze inutilizzate

Unused dependencies:

- `@esigenta/config` in `apps/admin/package.json`
- `@better-auth/prisma-adapter` in `packages/auth/package.json`
- `dotenv` in `packages/domain/package.json`
- `class-variance-authority` in `packages/ui/package.json`

Unused devDependencies:

- `@types/react` in `package.json` root
- `playwright` in `package.json` root
- `vercel` in `package.json` root
- `tsx` in `packages/domain/package.json`
- `@types/react-dom` in `packages/ui/package.json`

Classificazione:

- `@esigenta/config` admin: `POSSIBLE_FALSE_POSITIVE` o `DELETE_CANDIDATE`
  dopo verifica config admin.
- `@better-auth/prisma-adapter`: `NEEDS_DOMAIN_REVIEW`, perche' auth e
  adapter Better Auth sono sensibili.
- `dotenv` in domain: `DELETE_CANDIDATE` se confermato non importato.
- `class-variance-authority`: `DELETE_CANDIDATE` se UI non usa piu' CVA.
- Root `playwright`/`vercel`: `NEEDS_DOMAIN_REVIEW`, possono essere tool manuali
  o deploy/local QA non agganciati agli script.
- `tsx` in domain: `DELETE_CANDIDATE` se nessuno script domain lo usa.
- `@types/react-dom` in packages/ui: `POSSIBLE_FALSE_POSITIVE` o
  `DELETE_CANDIDATE` dopo verifica type surface.

### 5.4 Dipendenze usate ma non dichiarate

Stato iniziale:

- `server-only` importato da
  `apps/web/src/area-impresa/monitoring/area-impresa-monitoring.server.ts`
- `server-only` importato da
  `apps/web/src/area-impresa/private/shell/shell-counts-cache.ts`

Fix applicato:

- Aggiunto `server-only` a `apps/web/package.json`.

Stato finale:

- Nessuna `unlisted dependency` residua da Knip.

### 5.5 Export inutilizzati

Knip segnala 59 unused exports.

Gruppi principali:

- Adapter auth admin: `getCurrentAdmin`, `getCurrentUser`, `requireUser`,
  `requireSuperAdmin` in `apps/admin/src/auth/server.ts`.
- Adapter auth web: `requireCompanyMember`, `requireCompanyOwner` in
  `apps/web/src/auth/server.ts`.
- Monitoring web: `measureAreaPhase`, `getAreaTraceId` in
  `apps/web/src/platform/monitoring/area-monitoring.ts`.
- Export `dynamic` in feature modules sotto `apps/web/src/richiesta/**`.
- SEO/GEO: `resolveCityPriceRange`, `cities`, `listCities`,
  `listSupportedCities`, `costGuidePriceNote`.
- Catalogo pubblico site/services e public-navigation.
- Validator/selftest catalogo pubblico.
- `COOKIE_CONSENT_STORAGE_KEY`.
- `validateFrozenTaxonomySource`.

Classificazione:

- Auth/monitoring adapter: `LEGACY_ACTIVE` o `DELETE_CANDIDATE`, da verificare
  con owner prima di rimuovere export pubblici.
- `dynamic` nei feature module: `NEEDS_DOMAIN_REVIEW`. Next.js consuma
  `dynamic` nei route file sotto `app`; questi export sono in moduli feature e
  non risultano re-exportati dalle route.
- SEO/site catalog/public-navigation: `NEEDS_DOMAIN_REVIEW`, possibile API
  interna futura o barrel troppo largo.
- Validator/selftest: `DELETE_CANDIDATE` se non esiste workflow di self-test.

### 5.6 Types inutilizzati

Knip segnala 39 unused exported types.

Gruppi principali:

- Area Impresa UI types: `ConversationThreadKind`, `CustomerContactDetail`,
  `RefundRequestDetail`, `CompanyLeadCategoryOption`, `RequestCardBadge`,
  `RequestCardSeats`.
- Legal/SEO types: `LegalMode`, `SeoFamily`, `PriceRow`, `SizeExample`,
  `CityPriceModifier`, `CityPageQualityStatus`,
  `CityPageUniquenessLevel`, `CostGuideHubCategory`, `SeoBreadcrumbItem`,
  `SeoFaqItem`.
- Site services/public-navigation types and barrel exports.
- Domain/taxonomy/ui types: `AttachedRequestPhoto`,
  `RequestVisibilityGrants`, `FrozenAliasOwnerType`, `ContainerGutter`.

Classificazione: `NEEDS_DOMAIN_REVIEW`, molti possono essere type-only API
pubbliche o barrel non consumati internamente. Da non cancellare in blocco.

### 5.7 Possibili falsi positivi Next.js o framework-level

- Export `dynamic` in moduli feature: non e' un falso positivo Next puro se non
  e' re-exportato dal route file, ma va verificato prima di toccare.
- Package barrel in `site/services/index.ts` e
  `site/services/public-navigation/index.ts`: possono essere API pubbliche
  interne non consumate oggi.
- Root tool come `playwright` e `vercel`: possono essere usati manualmente fuori
  dagli script.
- Tipi React in package UI: possono servire alla superficie TypeScript anche se
  Knip non vede uso diretto.

## 6. Risultato Dependency Cruiser

Comandi eseguiti:

```powershell
pnpm exec depcruise apps/web/src packages
pnpm audit:deps
```

Esito iniziale: FAIL, 24 violazioni, 5 errori e 19 warning.

Esito finale dopo fix `server-only`: FAIL, 22 violazioni, 3 errori e 19 warning.

### 6.1 Errori residui

- `packages/database/prisma.config.ts -> prisma/config.d.ts`
  - Regola: `not-to-dev-dep`
  - Classificazione: `POSSIBLE_FALSE_POSITIVE`
  - Nota: file config Prisma, non runtime applicativo. Non spostare `prisma`
    senza review config.

- `packages/database/prisma.config.ts -> dotenv/lib/main.d.ts`
  - Regola: `not-to-dev-dep`
  - Classificazione: `POSSIBLE_FALSE_POSITIVE`
  - Nota: file config Prisma. Possibile eccezione di Dependency Cruiser, non
    fix automatico.

- `packages/auth/src/identity/admin/bootstrap-super-admin.ts -> dotenv/lib/main.d.ts`
  - Regola: `not-to-dev-dep`
  - Classificazione: `LEGACY_ACTIVE` / `NEEDS_DOMAIN_REVIEW`
  - Nota: script bootstrap admin (`packages/auth` ha `admin:bootstrap`). Non
    spostare `dotenv` senza decidere se lo script e' runtime operativo o tooling.

### 6.2 Warning classificati

- `packages/ui/src/components/input.tsx -> react`
  - Regola: `peer-deps-used`
  - Classificazione: `POSSIBLE_FALSE_POSITIVE`
  - Nota: `packages/ui` dichiara `react` come peer dependency, coerente con un
    package UI.

- `packages/taxonomy/src/shared/types.ts`
  - Regola: `no-orphans`
  - Classificazione: `NEEDS_DOMAIN_REVIEW`

- `packages/taxonomy/src/frozen/source/types/source.ts`
  - Regola: `no-orphans`
  - Classificazione: `NEEDS_DOMAIN_REVIEW`

- `packages/taxonomy/src/frozen/source/types/project-group.ts`
  - Regola: `no-orphans`
  - Classificazione: `NEEDS_DOMAIN_REVIEW`

- `packages/taxonomy/src/frozen/source/types/intervention.ts`
  - Regola: `no-orphans`
  - Classificazione: `NEEDS_DOMAIN_REVIEW`

- `packages/taxonomy/src/frozen/source/types/category.ts`
  - Regola: `no-orphans`
  - Classificazione: `NEEDS_DOMAIN_REVIEW`

- `packages/taxonomy/src/frozen/source/types/alias.ts`
  - Regola: `no-orphans`
  - Classificazione: `NEEDS_DOMAIN_REVIEW`

- `packages/funnel/src/types/runtime-step.ts`
  - Regola: `no-orphans`
  - Classificazione: `DELETE_CANDIDATE` dopo review funnel.

- `packages/funnel/src/types/runtime-profile.ts`
  - Regola: `no-orphans`
  - Classificazione: `NEEDS_DOMAIN_REVIEW`

- `packages/funnel/src/types/request-draft.ts`
  - Regola: `no-orphans`
  - Classificazione: `NEEDS_DOMAIN_REVIEW`

- `packages/funnel/src/types/request-answer.ts`
  - Regola: `no-orphans`
  - Classificazione: `DELETE_CANDIDATE` dopo review funnel.

- `packages/funnel/src/types/capability.ts`
  - Regola: `no-orphans`
  - Classificazione: `NEEDS_DOMAIN_REVIEW`

- `packages/funnel/src/compiler/infer-presets.ts`
  - Regola: `no-orphans`
  - Classificazione: `DELETE_CANDIDATE` dopo review funnel.

- `packages/domain/src/internal/request/dispatch/types.ts`
  - Regola: `no-orphans`
  - Classificazione: `NEEDS_DOMAIN_REVIEW`

- `packages/config/eslint/base.mjs`
  - Regola: `no-orphans`
  - Classificazione: `POSSIBLE_FALSE_POSITIVE` o `DELETE_CANDIDATE`

- `apps/web/src/site/services/types.ts`
  - Regola: `no-orphans`
  - Classificazione: `NEEDS_DOMAIN_REVIEW`

- `apps/web/src/site/services/public-navigation/types.ts`
  - Regola: `no-orphans`
  - Classificazione: `NEEDS_DOMAIN_REVIEW`

- `apps/web/src/site/seo/pages/interventi/types.ts`
  - Regola: `no-orphans`
  - Classificazione: `NEEDS_DOMAIN_REVIEW`

- `apps/web/src/site/seo/pages/costi/types.ts`
  - Regola: `no-orphans`
  - Classificazione: `NEEDS_DOMAIN_REVIEW`

## 7. Stato Madge

Comando richiesto, riprodotto:

```powershell
pnpm exec madge "apps/web/src" --extensions ts,tsx --ts-config apps/web/tsconfig.json --circular
```

Esito: PASS formale ma inutile, `Processed 0 files`.

Causa verificata:

- In PowerShell `ts,tsx` non quotato viene passato a Madge come valore
  malformato.
- Debug Madge mostrava `fileExtensions: [ 'ts tsx' ]`.
- Il path `apps/web/src` esiste e contiene 205 file `ts/tsx`.
- Il tsconfig include `**/*.ts` e `**/*.tsx`.

Comando corretto:

```powershell
pnpm exec madge "apps/web/src" --extensions "ts,tsx" --ts-config apps/web/tsconfig.json --circular --warning
```

Esito corretto:

- `Processed 206 files`
- `12 warnings`
- `No circular dependency found`

Warning Madge:

- Skipped workspace/package/CSS imports:
  `@esigenta/auth`, `@esigenta/billing`, `@esigenta/funnel/server`,
  `@esigenta/funnel`, `@esigenta/domain`, `@esigenta/taxonomy`,
  `@esigenta/uploads`, `@esigenta/ui`, `@esigenta/shared`,
  `@esigenta/uploads/server`, `tailwindcss`, `@esigenta/ui/globals.css`.

Valutazione:

- Madge e' utile come controllo cicli locale su `apps/web/src` se il comando e'
  quotato correttamente.
- Dependency Cruiser resta lo strumento principale per regole architetturali e
  dipendenze package.

## 8. Fix sicuri applicati

Fix applicati:

- Aggiunto `server-only` in `apps/web/package.json`.
- Aggiornato `pnpm-lock.yaml` tramite `pnpm --filter web add server-only@0.0.1`.
- Aggiunti script audit root.
- Creato questo report.

Motivazione `server-only`:

- Import reale confermato in due file sotto `apps/web/src`.
- Il package corretto e' `apps/web`, non root e non un package condiviso.
- Dopo il fix, Knip non segnala piu' `server-only` come unlisted e Dependency
  Cruiser non segnala piu' i due `not-to-unresolvable`.

Verifiche post-fix:

- `pnpm lint`: FAIL, stesso errore preesistente in `explosion.tsx`.
- `pnpm typecheck`: PASS.
- `pnpm build`: PASS.
- `pnpm audit:madge`: PASS, 206 file processati, zero cicli.
- `pnpm audit:deps`: FAIL per 3 errori residui Prisma/dotenv.
- `pnpm audit:knip`: FAIL per cleanup residuo.

## 9. Errori ancora aperti

- Lint fail in `apps/web/src/site/home/explosion.tsx:69`.
- Dependency Cruiser fail per 3 `not-to-dev-dep` su Prisma/dotenv in config o
  bootstrap.
- Knip fail per unused files, dependencies, devDependencies, exports e types.
- Warning Next.js build: convenzione `middleware` deprecata.

## 10. Codice morto candidato

Priorita' alta, ma solo con review owner:

- `packages/funnel/src/compiler/infer-presets.ts`
- `packages/funnel/src/types/request-answer.ts`
- `packages/funnel/src/types/runtime-step.ts`
- `packages/config/eslint/base.mjs`

Priorita' media:

- Export e types sotto `apps/web/src/site/services/**` e
  `apps/web/src/site/services/public-navigation/**`, da verificare contro la
  roadmap SEO/site.
- Validator catalogo pubblico e selftest non agganciati a script.

## 11. Backup/patch candidati a rimozione

La directory `reports/perf-patches/` contiene backup e patch storiche segnalate
da Knip come unused files.

Classificazione: `DELETE_CANDIDATE`.

Regola consigliata:

- Se vanno conservati come storico, spostarli fuori dal grafo sorgenti o
  configurarli come esclusione Knip/Dependency Cruiser.
- Se non servono piu', rimuoverli in sprint cleanup dedicato con diff separato.

## 12. Codice legacy ancora attivo

- `packages/auth/src/identity/admin/bootstrap-super-admin.ts` usa `dotenv` ed e'
  uno script bootstrap, non runtime standard.
- `apps/admin/src/auth/server.ts` espone adapter auth non usati internamente
  secondo Knip, ma possono essere API di app.
- `apps/web/src/auth/server.ts` espone helper company member/owner non usati
  internamente secondo Knip.
- `apps/web/src/richiesta/**` espone `dynamic` in moduli feature, mentre le
  route `app` hanno proprie config o non re-exportano questi valori.

## 13. Export/types inutilizzati da verificare

Batch consigliati:

- Batch auth/monitoring:
  `apps/admin/src/auth/server.ts`, `apps/web/src/auth/server.ts`,
  `apps/web/src/platform/monitoring/area-monitoring.ts`.
- Batch richiesta/Next config:
  `apps/web/src/richiesta/comunicazioni/*`, `apps/web/src/richiesta/stato/*`,
  `apps/web/src/richiesta/verifica/*`.
- Batch SEO/site catalog:
  `apps/web/src/site/seo/**`, `apps/web/src/site/services/**`.
- Batch domain/taxonomy/ui types:
  `packages/domain/src/company/requests/**`,
  `packages/taxonomy/src/frozen/**`, `packages/ui/src/layout/container.tsx`.

## 14. Possibili falsi positivi

- `react` peer dependency in `packages/ui`: Dependency Cruiser lo segnala come
  warning, ma e' normale per un package UI.
- `prisma`/`dotenv` in `packages/database/prisma.config.ts`: file config, non
  runtime app.
- `dotenv` in bootstrap auth: script admin manuale o operativo, da classificare
  prima di cambiare dependency section.
- Barrel exports e type exports: Knip vede uso interno, non necessariamente API
  pubbliche future.
- Root `playwright` e `vercel`: possibili tool manuali non agganciati a script.

## 15. Dipendenze mancanti o dichiarate male

Risolto:

- `server-only` aggiunto in `apps/web/package.json`.

Da verificare:

- `dotenv` in `packages/domain/package.json`: non risultano import reali nel
  package domain.
- `tsx` in `packages/domain/package.json`: non risultano script domain che lo
  usano.
- `class-variance-authority` in `packages/ui/package.json`: non risultano import
  reali.
- `@better-auth/prisma-adapter` in `packages/auth/package.json`: non risultano
  import reali, ma auth va trattato con review specifica.
- `@esigenta/config` in `apps/admin/package.json`: non risultano import reali.

Non modificato:

- `prisma` e `dotenv` in `packages/database/package.json`.
- `dotenv` in `packages/auth/package.json`.

Motivo: i file coinvolti sono config o bootstrap; spostarli tra
`dependencies`/`devDependencies` senza decisione di dominio sarebbe prematuro.

## 16. Warning architetturali per dominio

- I type file orphan in `packages/funnel` e `packages/taxonomy` suggeriscono una
  superficie types non piu' allineata agli export reali.
- `packages/config/eslint/base.mjs` sembra un residuo di config condivisa non
  consumata.
- `site/services` e `public-navigation` hanno molte API non usate: possibile
  catalogo pubblico troppo largo o pezzi preparatori non agganciati.
- `dynamic` in feature modules `richiesta` va riallineato con il pattern
  App Router: le route sotto `app` sono il punto che Next legge per le config.
- Il warning build Next su `middleware` indica un adeguamento futuro a `proxy`.

## 17. Proposta sprint successiva

Sprint consigliato: `Phase 15.x - Monorepo cleanup controllato`.

Ordine proposto:

1. Fix lint mirato in `apps/web/src/site/home/explosion.tsx`, senza cambiare UX.
2. Decisione config Dependency Cruiser:
   aggiungere eccezioni per `prisma.config.ts` e bootstrap script, oppure
   riclassificare le relative dipendenze dopo review.
3. Cleanup backup `reports/perf-patches/` con decisione esplicita: conservare
   fuori dal grafo sorgenti o eliminare.
4. Review `packages/funnel` orphan: confermare se `infer-presets`,
   `request-answer` e `runtime-step` sono eliminabili.
5. Review dipendenze inutilizzate per package: `packages/domain`,
   `packages/ui`, `apps/admin`, `packages/auth`.
6. Review export/types in batch piccoli, partendo da auth/monitoring e
   `dynamic` in `richiesta`.
7. Configurare Knip/Dependency Cruiser per distinguere API pubbliche deliberate,
   config file e veri residui.

Comando di audit consigliato dopo il fix lint:

```powershell
pnpm audit:clean
pnpm audit:madge
```

## 18. Sprint cleanup 1 - Audit Pipeline Stabilization

Data sprint: 2026-06-24

Obiettivo: rendere stabile la pipeline audit senza cleanup distruttivo, senza
refactor funzionali e senza spostare dipendenze `prisma`/`dotenv` tra sezioni
di `package.json`.

### File modificati

- `apps/web/src/site/home/explosion.tsx`
- `.dependency-cruiser.js`
- `docs/audit/MONOREPO_CLEANUP_REPORT.md`
- `docs/architetture/04_DEFERRED_ITEMS.md`

### Lint prima/dopo

Prima:

- `pnpm lint`: FAIL.
- Errore unico:
  `apps/web/src/site/home/explosion.tsx:69`
  `react-hooks/set-state-in-effect`.

Dopo:

- `pnpm lint`: PASS.

Decisione tecnica:

- `preloadedResults` non viene piu' scritto nello state dentro `useEffect`.
- I risultati mostrati sono derivati:
  `query.trim() ? results : preloadedResults`.
- Lo state `results` resta dedicato ai risultati fetchati dalla ricerca.
- Nessun comportamento runtime intenzionale e' cambiato: a query vuota il
  dropdown mostra ancora i risultati precaricati.

### Typecheck prima/dopo

Prima:

- `pnpm typecheck`: PASS.

Dopo:

- `pnpm typecheck`: PASS.

### Build prima/dopo

Prima:

- `pnpm build`: PASS.

Dopo:

- `pnpm build`: PASS.
- Warning non bloccanti ancora presenti:
  convenzione Next `middleware` deprecata; warning finale su symlink diagnostico
  `.next/diagnostics/route-bundle-stats.json` durante una build, senza exit code
  fallito.

### Dependency Cruiser prima/dopo

Prima:

- `pnpm audit:deps`: FAIL.
- 3 errori residui:
  `packages/database/prisma.config.ts -> prisma/config`,
  `packages/database/prisma.config.ts -> dotenv`,
  `packages/auth/src/identity/admin/bootstrap-super-admin.ts -> dotenv`.

Dopo:

- `pnpm audit:deps`: PASS come exit code.
- Output residuo: 19 warning, 0 errori.

Classificazione dei 3 errori:

- `packages/database/prisma.config.ts -> prisma/config`: `CONFIG_EXCEPTION`.
- `packages/database/prisma.config.ts -> dotenv`: `CONFIG_EXCEPTION`.
- `packages/auth/src/identity/admin/bootstrap-super-admin.ts -> dotenv`:
  `SCRIPT_EXCEPTION`.

Decisione su `prisma`/`dotenv`:

- Nessuna dipendenza e' stata spostata tra `dependencies` e
  `devDependencies`.
- `packages/database/prisma.config.ts` e' un file di configurazione eseguito
  dal tooling Prisma, non runtime applicativo.
- `packages/auth/src/identity/admin/bootstrap-super-admin.ts` e' uno script
  bootstrap esplicito eseguito via package script, non un modulo runtime
  importato dall'app.
- `.dependency-cruiser.js` e' stato aggiornato con eccezioni esplicite e
  commentate per questi due file nel rule `not-to-dev-dep`.

### Stato Madge

- `pnpm audit:madge`: PASS.
- 206 file processati.
- 0 cicli.
- Restano 12 warning di moduli workspace/CSS/NPM saltati da Madge, gia'
  documentati sopra.

### Stato Knip

- `pnpm audit:knip`: FAIL.
- Nessun cleanup Knip eseguito in questo sprint, per regola esplicita.
- Restano unused files/dependencies/devDependencies/exports/types gia'
  documentati nelle sezioni precedenti.

### Problemi rimasti

- `pnpm audit:knip` resta FAIL per cleanup residuo.
- `pnpm audit:deps` passa ma conserva 19 warning `no-orphans` /
  `peer-deps-used`.
- `pnpm build` passa ma mostra warning Next su `middleware` deprecato.
- Madge passa ma segnala 12 skipped modules.

### Prossimo sprint consigliato

Sprint consigliato: `Sprint cleanup 2 - Knip triage non distruttivo`.

Ordine proposto:

1. Non cancellare ancora file.
2. Classificare i 15 unused files Knip in `KEEP_WITH_EXCEPTION`,
   `MOVE_OUT_OF_GRAPH`, `DELETE_CANDIDATE_CONFIRMED`.
3. Decidere se `reports/perf-patches/**` deve essere escluso dal grafo audit o
   rimosso in uno sprint separato.
4. Verificare le unused dependencies senza toccare auth/config/billing.
5. Configurare eccezioni Knip solo per API pubbliche deliberate o tooling
   manuale confermato.

## 19. Sprint cleanup 2 - Knip triage non distruttivo

Data sprint: 2026-06-24

Obiettivo: classificare tutti gli item Knip senza eliminare file, export, types
o dipendenze. Questo sprint non modifica codice applicativo, dipendenze,
package.json, Knip config o Dependency Cruiser config.

### 19.1 Stato iniziale `pnpm audit:knip`

Comandi eseguiti:

```powershell
git status --short
pnpm exec knip --help
pnpm audit:knip
pnpm exec knip --reporter json --no-exit-code
```

Esito iniziale:

- `pnpm audit:knip`: FAIL atteso.
- Unused files: 15.
- Unused dependencies: 4.
- Unused devDependencies: 5.
- Unlisted dependencies: 0.
- Unused exports: 59.
- Unused exported types: 39.
- Totale item classificati: 122.

Nota working tree:

- Restano modifiche preesistenti/non toccate in
  `apps/web/src/area-impresa/public/auth/auth-shell.tsx` e
  `apps/web/src/area-impresa/public/marketing/marketing-glyphs.tsx`.

### 19.2 Tabella `Unused files`

| Path/item | Categoria | Dominio | Motivazione | Rischio | Azione proposta | Auto |
|---|---|---|---|---|---|---|
| `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/patch-6i1-shared-prefetch.cjs` | `BACKUP_OR_PATCH_ARTIFACT` | audit/perf-patches | Patch storico sotto `reports`, non sorgente runtime. | Perdita di traccia storica se cancellato subito. | Decidere se spostare fuori grafo, escludere da Knip o rimuovere in sprint dedicato. | No |
| `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/backup/apps/web/src/components/funnel/funnel-ui.tsx` | `BACKUP_OR_PATCH_ARTIFACT` | audit/perf-patches | Backup storico sotto `reports`, non sorgente runtime. | Perdita di traccia storica se cancellato subito. | Decidere se spostare fuori grafo, escludere da Knip o rimuovere in sprint dedicato. | No |
| `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/backup/apps/web/src/components/funnel/photo-upload-step.tsx` | `BACKUP_OR_PATCH_ARTIFACT` | audit/perf-patches | Backup storico sotto `reports`, non sorgente runtime. | Perdita di traccia storica se cancellato subito. | Decidere se spostare fuori grafo, escludere da Knip o rimuovere in sprint dedicato. | No |
| `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/backup/apps/web/src/components/layout/footer.tsx` | `BACKUP_OR_PATCH_ARTIFACT` | audit/perf-patches | Backup storico sotto `reports`, non sorgente runtime. | Perdita di traccia storica se cancellato subito. | Decidere se spostare fuori grafo, escludere da Knip o rimuovere in sprint dedicato. | No |
| `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/backup/apps/web/src/components/privacy/cookie-consent.tsx` | `BACKUP_OR_PATCH_ARTIFACT` | audit/perf-patches | Backup storico sotto `reports`, non sorgente runtime. | Perdita di traccia storica se cancellato subito. | Decidere se spostare fuori grafo, escludere da Knip o rimuovere in sprint dedicato. | No |
| `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/backup/apps/web/src/components/navigation/navbar.tsx` | `BACKUP_OR_PATCH_ARTIFACT` | audit/perf-patches | Backup storico sotto `reports`, non sorgente runtime. | Perdita di traccia storica se cancellato subito. | Decidere se spostare fuori grafo, escludere da Knip o rimuovere in sprint dedicato. | No |
| `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/backup/apps/web/src/components/funnel/funnel-ui.tsx` | `BACKUP_OR_PATCH_ARTIFACT` | audit/perf-patches | Backup storico sotto `reports`, non sorgente runtime. | Perdita di traccia storica se cancellato subito. | Decidere se spostare fuori grafo, escludere da Knip o rimuovere in sprint dedicato. | No |
| `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/backup/apps/web/src/components/funnel/photo-upload-step.tsx` | `BACKUP_OR_PATCH_ARTIFACT` | audit/perf-patches | Backup storico sotto `reports`, non sorgente runtime. | Perdita di traccia storica se cancellato subito. | Decidere se spostare fuori grafo, escludere da Knip o rimuovere in sprint dedicato. | No |
| `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/backup/apps/web/src/components/layout/footer.tsx` | `BACKUP_OR_PATCH_ARTIFACT` | audit/perf-patches | Backup storico sotto `reports`, non sorgente runtime. | Perdita di traccia storica se cancellato subito. | Decidere se spostare fuori grafo, escludere da Knip o rimuovere in sprint dedicato. | No |
| `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/backup/apps/web/src/components/navigation/navbar.tsx` | `BACKUP_OR_PATCH_ARTIFACT` | audit/perf-patches | Backup storico sotto `reports`, non sorgente runtime. | Perdita di traccia storica se cancellato subito. | Decidere se spostare fuori grafo, escludere da Knip o rimuovere in sprint dedicato. | No |
| `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/backup/apps/web/src/components/privacy/cookie-consent.tsx` | `BACKUP_OR_PATCH_ARTIFACT` | audit/perf-patches | Backup storico sotto `reports`, non sorgente runtime. | Perdita di traccia storica se cancellato subito. | Decidere se spostare fuori grafo, escludere da Knip o rimuovere in sprint dedicato. | No |
| `packages/funnel/src/compiler/infer-presets.ts` | `DOMAIN_REVIEW_REQUIRED` | packages/funnel | File non importato, ma in owner funnel runtime/compiler. | Rimozione cieca puo rompere evoluzioni funnel o tooling non cablato. | Owner funnel deve confermare dead code o API futura. | No |
| `packages/funnel/src/types/request-answer.ts` | `DOMAIN_REVIEW_REQUIRED` | packages/funnel | Tipo non importato, ma in owner funnel runtime. | Rimozione cieca puo rompere contratti funnel futuri. | Owner funnel deve confermare dead code o API futura. | No |
| `packages/funnel/src/types/runtime-step.ts` | `DOMAIN_REVIEW_REQUIRED` | packages/funnel | Tipo non importato, ma in owner funnel runtime. | Rimozione cieca puo rompere contratti funnel futuri. | Owner funnel deve confermare dead code o API futura. | No |
| `packages/config/eslint/base.mjs` | `CONFIG_EXCEPTION` | packages/config | Config ESLint condivisa non agganciata da consumer attuali. | Cancellarla puo perdere base config riusabile. | Decidere se collegarla, documentarla come eccezione o rimuoverla dopo review. | No |

### 19.3 Tabella `Unused dependencies`

| Path/item | Categoria | Dominio | Motivazione | Rischio | Azione proposta | Auto |
|---|---|---|---|---|---|---|
| `apps/admin/package.json -> @esigenta/config` | `DEPENDENCY_REVIEW` | apps/admin | Dipendenza dichiarata ma non vista da Knip come usata. | Rimozione automatica puo rompere config admin futura/manuale. | Verificare con owner admin/config prima di modificare package.json. | No |
| `packages/domain/package.json -> dotenv` | `DEPENDENCY_REVIEW` | packages/domain | Dipendenza dichiarata ma non importata dal package domain secondo Knip. | Rimozione automatica puo rompere script non tracciati o bootstrap futuri. | Verificare script reali e owner domain. | No |
| `packages/auth/package.json -> @better-auth/prisma-adapter` | `DEPENDENCY_REVIEW` | packages/auth | Dipendenza auth sensibile non vista come usata. | Rimozione puo rompere Better Auth o config auth non rilevata. | Review auth obbligatoria prima di ogni modifica. | No |
| `packages/ui/package.json -> class-variance-authority` | `DEPENDENCY_REVIEW` | packages/ui | Dipendenza UI non vista come usata. | Rimozione puo rompere componenti futuri o API DS non cablate. | Owner UI decide se rimuovere o tenere con eccezione. | No |

### 19.4 Tabella `Unused devDependencies`

| Path/item | Categoria | Dominio | Motivazione | Rischio | Azione proposta | Auto |
|---|---|---|---|---|---|---|
| `packages/domain/package.json -> tsx` | `DEPENDENCY_REVIEW` | packages/domain | Dev tool dichiarato ma non richiamato da script domain. | Rimozione automatica puo rompere script manuali non tracciati. | Verificare script e workflow owner domain. | No |
| `packages/ui/package.json -> @types/react-dom` | `DEPENDENCY_REVIEW` | packages/ui | Type package non visto come usato direttamente. | Rimozione puo rompere type surface package UI. | Owner UI verifica se serve alla compilazione o API. | No |
| `package.json -> @types/react` | `DEPENDENCY_REVIEW` | root/tooling | Type package root non visto come usato direttamente. | Rimozione puo impattare tooling root o editor assumptions. | Verificare se i workspace coprono gia i tipi React. | No |
| `package.json -> playwright` | `DEPENDENCY_REVIEW` | root/tooling | Tool QA manuale non agganciato a script root. | Rimozione puo rompere test/smoke manuali. | Decidere se aggiungere script, documentare o rimuovere in sprint dedicato. | No |
| `package.json -> vercel` | `DEPENDENCY_REVIEW` | root/tooling | Tool deploy manuale non agganciato a script root. | Rimozione puo rompere workflow deploy locale. | Verificare workflow deploy prima di ogni modifica. | No |

### 19.5 Tabella `Unlisted dependencies`

| Path/item | Categoria | Dominio | Motivazione | Rischio | Azione proposta | Auto |
|---|---|---|---|---|---|---|
| Nessun item | n/a | n/a | `server-only` e' gia stato risolto; Knip non segnala unlisted dependencies. | n/a | Nessuna azione. | n/a |

### 19.6 Tabella `Unused exports`

| Path/item | Categoria | Dominio | Motivazione | Rischio | Azione proposta | Auto |
|---|---|---|---|---|---|---|
| `apps/admin/src/auth/server.ts -> getCurrentAdmin` | `LEGACY_ACTIVE` | apps/admin/auth | Helper auth infrastrutturale non consumato oggi. | Rimozione puo rompere route/action admin future o non viste da Knip. | Review auth admin; ridurre export solo in batch dedicato. | No |
| `apps/admin/src/auth/server.ts -> getCurrentUser` | `LEGACY_ACTIVE` | apps/admin/auth | Helper auth infrastrutturale non consumato oggi. | Rimozione puo rompere route/action admin future o non viste da Knip. | Review auth admin; ridurre export solo in batch dedicato. | No |
| `apps/admin/src/auth/server.ts -> requireUser` | `LEGACY_ACTIVE` | apps/admin/auth | Helper auth infrastrutturale non consumato oggi. | Rimozione puo rompere route/action admin future o non viste da Knip. | Review auth admin; ridurre export solo in batch dedicato. | No |
| `apps/admin/src/auth/server.ts -> requireSuperAdmin` | `LEGACY_ACTIVE` | apps/admin/auth | Helper auth infrastrutturale non consumato oggi. | Rimozione puo rompere route/action admin future o non viste da Knip. | Review auth admin; ridurre export solo in batch dedicato. | No |
| `apps/web/src/platform/monitoring/area-monitoring.ts -> measureAreaPhase` | `LEGACY_ACTIVE` | apps/web/platform | Helper monitoring non consumato oggi. | Rimozione puo ridurre osservabilita o rompere tracing futuro. | Review platform/monitoring prima di ridurre export. | No |
| `apps/web/src/platform/monitoring/area-monitoring.ts -> getAreaTraceId` | `LEGACY_ACTIVE` | apps/web/platform | Helper monitoring non consumato oggi. | Rimozione puo ridurre osservabilita o rompere tracing futuro. | Review platform/monitoring prima di ridurre export. | No |
| `apps/web/src/richiesta/verifica/request-verification-page.tsx -> dynamic` | `FRAMEWORK_FALSE_POSITIVE` | apps/web/richiesta | Export con nome convenzione Next `dynamic` in modulo feature. | Rimozione cieca puo cambiare intent caching/dynamic se re-exportato in futuro. | Verificare route app; decidere se spostare config nel bridge o rimuovere export. | No |
| `apps/web/src/richiesta/comunicazioni/customer-conversation-page.tsx -> dynamic` | `FRAMEWORK_FALSE_POSITIVE` | apps/web/richiesta | Export con nome convenzione Next `dynamic` in modulo feature. | Rimozione cieca puo cambiare intent caching/dynamic se re-exportato in futuro. | Verificare route app; decidere se spostare config nel bridge o rimuovere export. | No |
| `apps/web/src/richiesta/comunicazioni/customer-requests-page.tsx -> dynamic` | `FRAMEWORK_FALSE_POSITIVE` | apps/web/richiesta | Export con nome convenzione Next `dynamic` in modulo feature. | Rimozione cieca puo cambiare intent caching/dynamic se re-exportato in futuro. | Verificare route app; decidere se spostare config nel bridge o rimuovere export. | No |
| `apps/web/src/richiesta/stato/request-status-page.tsx -> dynamic` | `FRAMEWORK_FALSE_POSITIVE` | apps/web/richiesta | Export con nome convenzione Next `dynamic` in modulo feature. | Rimozione cieca puo cambiare intent caching/dynamic se re-exportato in futuro. | Verificare route app; decidere se spostare config nel bridge o rimuovere export. | No |
| `apps/web/src/auth/server.ts -> requireCompanyMember` | `LEGACY_ACTIVE` | apps/web/auth | Helper auth web non consumato oggi. | Rimozione puo rompere guard future o action non viste da Knip. | Review auth web; ridurre export solo se owner conferma. | No |
| `apps/web/src/auth/server.ts -> requireCompanyOwner` | `LEGACY_ACTIVE` | apps/web/auth | Helper auth web non consumato oggi. | Rimozione puo rompere guard future o action non viste da Knip. | Review auth web; ridurre export solo se owner conferma. | No |
| `apps/web/src/richiesta/comunicazioni/customer-request-detail-page.tsx -> dynamic` | `FRAMEWORK_FALSE_POSITIVE` | apps/web/richiesta | Export con nome convenzione Next `dynamic` in modulo feature. | Rimozione cieca puo cambiare intent caching/dynamic se re-exportato in futuro. | Verificare route app; decidere se spostare config nel bridge o rimuovere export. | No |
| `packages/taxonomy/src/frozen/index.ts -> validateFrozenTaxonomySource` | `DOMAIN_REVIEW_REQUIRED` | packages/taxonomy | Export taxonomy frozen non consumato internamente. | Puo essere validator/manual tooling del catalogo. | Owner taxonomy decide keep, eccezione o cleanup. | No |
| `apps/web/src/site/shell/cookie-consent-storage.ts -> COOKIE_CONSENT_STORAGE_KEY` | `PUBLIC_API_KEEP` | apps/web/site-shell | Costante shell esportata come API di storage. | Rimozione export puo rompere consumer futuri o test manuali. | Tenere o documentare eccezione se API intenzionale. | No |
| `apps/web/src/site/seo/pages/costi/index.ts -> costGuidePriceNote` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-seo | Export SEO/costi non consumato oggi. | Puo essere parte del modello editoriale SEO. | Owner SEO decide keep, eccezione o riduzione export. | No |
| `apps/web/src/site/services/catalog.ts -> listServiceCatalogItems` | `PUBLIC_API_KEEP` | apps/web/site-services | API catalogo pubblico intenzionale. | Knip puo non rappresentare API futura controllata. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/catalog.ts -> getServiceCatalogItemBySlug` | `PUBLIC_API_KEEP` | apps/web/site-services | API catalogo pubblico intenzionale. | Knip puo non rappresentare API futura controllata. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/catalog.ts -> listServiceCatalogItemsByCategory` | `PUBLIC_API_KEEP` | apps/web/site-services | API catalogo pubblico intenzionale. | Knip puo non rappresentare API futura controllata. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/catalog.ts -> isPubliclyLinkable` | `PUBLIC_API_KEEP` | apps/web/site-services | API catalogo pubblico intenzionale. | Knip puo non rappresentare API futura controllata. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/catalog.ts -> listPubliclyLinkableServiceCatalogItems` | `PUBLIC_API_KEEP` | apps/web/site-services | API catalogo pubblico intenzionale. | Knip puo non rappresentare API futura controllata. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/catalog.ts -> listVisibleServiceCatalogItemsByCategory` | `PUBLIC_API_KEEP` | apps/web/site-services | API catalogo pubblico intenzionale. | Knip puo non rappresentare API futura controllata. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> interventionCoverage` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel/API public-navigation intenzionale. | Rimozione puo rompere consumer futuri del catalogo pubblico. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> listPublicServiceMacroAreas` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel/API public-navigation intenzionale. | Rimozione puo rompere consumer futuri del catalogo pubblico. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> getPublicServiceMacroAreaBySlug` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel/API public-navigation intenzionale. | Rimozione puo rompere consumer futuri del catalogo pubblico. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> buildSeoPageMap` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel/API public-navigation intenzionale. | Rimozione puo rompere consumer futuri del catalogo pubblico. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> getSeoLandingSlugForIntervention` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel/API public-navigation intenzionale. | Rimozione puo rompere consumer futuri del catalogo pubblico. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> buildCostGuideMap` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel/API public-navigation intenzionale. | Rimozione puo rompere consumer futuri del catalogo pubblico. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> getCostGuidePathForIntervention` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel/API public-navigation intenzionale. | Rimozione puo rompere consumer futuri del catalogo pubblico. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> buildInterventionCoverageDecisions` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel/API public-navigation intenzionale. | Rimozione puo rompere consumer futuri del catalogo pubblico. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> buildPublicServiceCards` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel/API public-navigation intenzionale. | Rimozione puo rompere consumer futuri del catalogo pubblico. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> validatePublicCatalog` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel/API validator intenzionale. | Rimozione puo rompere validazioni future del catalogo. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> assertValidPublicCatalog` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel/API validator intenzionale. | Rimozione puo rompere validazioni future del catalogo. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/area-impresa/private/opportunita/view-models/request-detail-view-model.ts -> getUnlockError` | `DELETE_CANDIDATE` | apps/web/area-impresa | Export puntuale apparentemente non consumato. | Possibile uso futuro non tracciato; non rimuovere senza owner. | Nel cleanup successivo valutare rimozione export/funzione con test. | No |
| `apps/web/src/site/services/categories.ts -> serviceCategories` | `PUBLIC_API_KEEP` | apps/web/site-services | API catalogo categorie intenzionale. | Rimozione puo rompere consumer futuri del catalogo. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/categories.ts -> listServiceCategories` | `PUBLIC_API_KEEP` | apps/web/site-services | API catalogo categorie intenzionale. | Rimozione puo rompere consumer futuri del catalogo. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/public-navigation/validators.selftest.ts -> runPublicCatalogSelfTest` | `DELETE_CANDIDATE` | apps/web/site-services | Selftest non agganciato a script o consumer. | Rimozione puo perdere check manuale se usato fuori grafo. | Confermare owner; poi rimuovere o cablare come script. | No |
| `apps/web/src/site/services/public-navigation/validators.ts -> findVisibleWithoutMacroArea` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-services | Validator catalogo pubblico non consumato direttamente. | Puo essere diagnostica utile non ancora cablata. | Owner site decide cablaggio, eccezione o cleanup. | No |
| `apps/web/src/site/services/public-navigation/validators.ts -> findHiddenWithoutReason` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-services | Validator catalogo pubblico non consumato direttamente. | Puo essere diagnostica utile non ancora cablata. | Owner site decide cablaggio, eccezione o cleanup. | No |
| `apps/web/src/site/services/public-navigation/validators.ts -> findUnknownMacroAreaReferences` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-services | Validator catalogo pubblico non consumato direttamente. | Puo essere diagnostica utile non ancora cablata. | Owner site decide cablaggio, eccezione o cleanup. | No |
| `apps/web/src/site/services/public-navigation/validators.ts -> findRealSeoPagesNotMarkedSeoPageNow` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-services | Validator catalogo pubblico non consumato direttamente. | Puo essere diagnostica utile non ancora cablata. | Owner site decide cablaggio, eccezione o cleanup. | No |
| `apps/web/src/site/services/public-navigation/validators.ts -> findDuplicateInterventionAcrossMacroAreas` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-services | Validator catalogo pubblico non consumato direttamente. | Puo essere diagnostica utile non ancora cablata. | Owner site decide cablaggio, eccezione o cleanup. | No |
| `apps/web/src/site/services/public-navigation/validators.ts -> validatePublicCatalog` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-services | Validator catalogo pubblico non consumato direttamente. | Puo essere diagnostica utile non ancora cablata. | Owner site decide cablaggio, eccezione o cleanup. | No |
| `apps/web/src/site/services/public-navigation/macro-areas.ts -> publicServiceMacroAreas` | `PUBLIC_API_KEEP` | apps/web/site-services | API dati macro-aree del catalogo pubblico. | Rimozione puo rompere consumer futuri del catalogo. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/public-navigation/seo-page-map.ts -> getSeoLandingSlugForIntervention` | `PUBLIC_API_KEEP` | apps/web/site-services | API mapping SEO pubblico intenzionale. | Rimozione puo rompere consumer futuri del catalogo. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/public-navigation/cost-guide-map.ts -> getCostGuidePathForIntervention` | `PUBLIC_API_KEEP` | apps/web/site-services | API mapping guide costi intenzionale. | Rimozione puo rompere consumer futuri del catalogo. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/area-impresa/private/opportunita/components/request-commercial-display.ts -> getCommercialStatusLabel` | `DELETE_CANDIDATE` | apps/web/area-impresa | Export puntuale apparentemente non consumato. | Possibile uso futuro non tracciato; non rimuovere senza owner. | Nel cleanup successivo valutare rimozione export/funzione con test. | No |
| `apps/web/src/site/services/index.ts -> listServiceCategories` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel `site/services` intenzionale. | Rimozione puo rompere import futuri centralizzati. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/index.ts -> getServiceCategoryBySlug` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel `site/services` intenzionale. | Rimozione puo rompere import futuri centralizzati. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/index.ts -> listServiceCatalogItems` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel `site/services` intenzionale. | Rimozione puo rompere import futuri centralizzati. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/index.ts -> getServiceCatalogItemBySlug` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel `site/services` intenzionale. | Rimozione puo rompere import futuri centralizzati. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/index.ts -> listServiceCatalogItemsByCategory` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel `site/services` intenzionale. | Rimozione puo rompere import futuri centralizzati. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/index.ts -> listVisibleServiceCatalogItemsByCategory` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel `site/services` intenzionale. | Rimozione puo rompere import futuri centralizzati. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/index.ts -> isPubliclyLinkable` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel `site/services` intenzionale. | Rimozione puo rompere import futuri centralizzati. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/services/index.ts -> listPubliclyLinkableServiceCatalogItems` | `PUBLIC_API_KEEP` | apps/web/site-services | Barrel `site/services` intenzionale. | Rimozione puo rompere import futuri centralizzati. | Tenere o documentare eccezione se confermata. | No |
| `apps/web/src/site/seo/geo/cities.ts -> cities` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-seo | Registry SEO/GEO non consumato direttamente. | Rimozione puo rompere fondazione SEO futura. | Owner SEO decide keep, eccezione o uso effettivo. | No |
| `apps/web/src/site/seo/geo/cities.ts -> listCities` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-seo | API SEO/GEO non consumata direttamente. | Rimozione puo rompere fondazione SEO futura. | Owner SEO decide keep, eccezione o uso effettivo. | No |
| `apps/web/src/site/seo/geo/supported-cities.ts -> listSupportedCities` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-seo | API SEO/GEO non consumata direttamente. | Rimozione puo rompere fondazione SEO futura. | Owner SEO decide keep, eccezione o uso effettivo. | No |
| `apps/web/src/site/seo/engine/pricing-resolver.ts -> resolveCityPriceRange` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-seo | Resolver SEO/market-data non consumato direttamente. | Rimozione puo rompere evoluzione city pricing. | Owner SEO decide keep, eccezione o uso effettivo. | No |

### 19.7 Tabella `Unused exported types`

| Path/item | Categoria | Dominio | Motivazione | Rischio | Azione proposta | Auto |
|---|---|---|---|---|---|---|
| `apps/web/src/site/seo/pages/costi/index.ts -> CityPageQualityStatus` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-seo | Tipo modello SEO/citta non consumato internamente. | Puo essere contratto editoriale o API futura. | Owner SEO decide keep, eccezione o tipo locale. | No |
| `apps/web/src/site/seo/pages/costi/index.ts -> CityPageUniquenessLevel` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-seo | Tipo modello SEO/citta non consumato internamente. | Puo essere contratto editoriale o API futura. | Owner SEO decide keep, eccezione o tipo locale. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> CoverageState` | `PUBLIC_API_KEEP` | apps/web/site-services | Tipo esportato dal barrel public-navigation. | Rimozione export puo rompere consumer futuri. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> VisibilityPolicy` | `PUBLIC_API_KEEP` | apps/web/site-services | Tipo esportato dal barrel public-navigation. | Rimozione export puo rompere consumer futuri. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> DestinationType` | `PUBLIC_API_KEEP` | apps/web/site-services | Tipo esportato dal barrel public-navigation. | Rimozione export puo rompere consumer futuri. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> SeoStatus` | `PUBLIC_API_KEEP` | apps/web/site-services | Tipo esportato dal barrel public-navigation. | Rimozione export puo rompere consumer futuri. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> CostGuideStatus` | `PUBLIC_API_KEEP` | apps/web/site-services | Tipo esportato dal barrel public-navigation. | Rimozione export puo rompere consumer futuri. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> InterventionCoverageInput` | `PUBLIC_API_KEEP` | apps/web/site-services | Tipo esportato dal barrel public-navigation. | Rimozione export puo rompere consumer futuri. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> InterventionCoverageDecision` | `PUBLIC_API_KEEP` | apps/web/site-services | Tipo esportato dal barrel public-navigation. | Rimozione export puo rompere consumer futuri. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> PublicServiceMacroArea` | `PUBLIC_API_KEEP` | apps/web/site-services | Tipo esportato dal barrel public-navigation. | Rimozione export puo rompere consumer futuri. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> PublicServiceMacroAreaWithItems` | `PUBLIC_API_KEEP` | apps/web/site-services | Tipo esportato dal barrel public-navigation. | Rimozione export puo rompere consumer futuri. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/site/services/public-navigation/index.ts -> PublicCatalogValidationIssue` | `PUBLIC_API_KEEP` | apps/web/site-services | Tipo esportato dal barrel public-navigation. | Rimozione export puo rompere consumer futuri. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/site/services/public-navigation/validators.ts -> PublicCatalogValidationIssue` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-services | Tipo validator non consumato direttamente. | Puo essere contratto diagnostico del catalogo. | Owner site decide keep, eccezione o tipo locale. | No |
| `apps/web/src/site/services/index.ts -> ServiceCatalogItem` | `PUBLIC_API_KEEP` | apps/web/site-services | Tipo esportato dal barrel `site/services`. | Rimozione export puo rompere consumer futuri. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/site/services/index.ts -> ServiceCatalogStatus` | `PUBLIC_API_KEEP` | apps/web/site-services | Tipo esportato dal barrel `site/services`. | Rimozione export puo rompere consumer futuri. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/site/services/index.ts -> ServiceCategory` | `PUBLIC_API_KEEP` | apps/web/site-services | Tipo esportato dal barrel `site/services`. | Rimozione export puo rompere consumer futuri. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/site/services/index.ts -> ServiceHomeFeature` | `PUBLIC_API_KEEP` | apps/web/site-services | Tipo esportato dal barrel `site/services`. | Rimozione export puo rompere consumer futuri. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/area-impresa/private/comunicazioni/conversazione/conversation-page.tsx -> ConversationThreadKind` | `DELETE_CANDIDATE` | apps/web/area-impresa | Tipo componente esportato ma non consumato esternamente. | Basso: potrebbe bastare renderlo locale, ma serve owner review. | Valutare rimozione solo dell'export type nel cleanup successivo. | No |
| `packages/taxonomy/src/frozen/source/types/alias.ts -> FrozenAliasOwnerType` | `DOMAIN_REVIEW_REQUIRED` | packages/taxonomy | Tipo taxonomy frozen non consumato internamente. | Puo essere contratto del modello frozen. | Owner taxonomy decide keep, eccezione o cleanup. | No |
| `packages/ui/src/layout/container.tsx -> ContainerGutter` | `PUBLIC_API_KEEP` | packages/ui | Tipo della superficie package UI. | Rimozione export puo rompere consumer futuri del design system. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/area-impresa/public/marketing/company-lead-form.tsx -> CompanyLeadCategoryOption` | `DELETE_CANDIDATE` | apps/web/area-impresa | Tipo componente esportato ma non consumato esternamente. | Basso: potrebbe bastare renderlo locale, ma serve owner review. | Valutare rimozione solo dell'export type nel cleanup successivo. | No |
| `apps/web/src/area-impresa/public/marketing/request-card.tsx -> RequestCardBadge` | `DELETE_CANDIDATE` | apps/web/area-impresa | Tipo componente esportato ma non consumato esternamente. | Basso: potrebbe bastare renderlo locale, ma serve owner review. | Valutare rimozione solo dell'export type nel cleanup successivo. | No |
| `apps/web/src/area-impresa/public/marketing/request-card.tsx -> RequestCardSeats` | `DELETE_CANDIDATE` | apps/web/area-impresa | Tipo componente esportato ma non consumato esternamente. | Basso: potrebbe bastare renderlo locale, ma serve owner review. | Valutare rimozione solo dell'export type nel cleanup successivo. | No |
| `apps/web/src/site/legal/legal-profile.ts -> LegalMode` | `PUBLIC_API_KEEP` | apps/web/site-legal | Tipo profilo legal esportato come contratto del modulo. | Rimozione export puo rompere consumer futuri o test. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/site/seo/templates/seo-breadcrumb.tsx -> SeoBreadcrumbItem` | `PUBLIC_API_KEEP` | apps/web/site-seo | Tipo prop/template SEO esportato come API template. | Rimozione export puo rompere consumer futuri dei template. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/site/seo/templates/seo-faq.tsx -> SeoFaqItem` | `PUBLIC_API_KEEP` | apps/web/site-seo | Tipo prop/template SEO esportato come API template. | Rimozione export puo rompere consumer futuri dei template. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/area-impresa/private/opportunita/components/request-detail-card.tsx -> CustomerContactDetail` | `DELETE_CANDIDATE` | apps/web/area-impresa | Tipo componente esportato ma non consumato esternamente. | Basso: potrebbe bastare renderlo locale, ma serve owner review. | Valutare rimozione solo dell'export type nel cleanup successivo. | No |
| `apps/web/src/area-impresa/private/opportunita/components/request-detail-card.tsx -> RefundRequestDetail` | `DELETE_CANDIDATE` | apps/web/area-impresa | Tipo componente esportato ma non consumato esternamente. | Basso: potrebbe bastare renderlo locale, ma serve owner review. | Valutare rimozione solo dell'export type nel cleanup successivo. | No |
| `packages/domain/src/company/requests/get-request-detail-page.ts -> AttachedRequestPhoto` | `DOMAIN_REVIEW_REQUIRED` | packages/domain | Tipo domain/read-model non consumato internamente. | Puo essere contratto dati company requests. | Owner domain decide keep, eccezione o cleanup. | No |
| `apps/web/src/site/seo/pages/costi/types.ts -> CostGuideHubCategory` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-seo | Tipo SEO/costi non consumato internamente. | Puo essere contratto editoriale della pagina costi. | Owner SEO decide keep, eccezione o cleanup. | No |
| `apps/web/src/site/services/types.ts -> ServiceCatalogStatus` | `PUBLIC_API_KEEP` | apps/web/site-services | Tipo del catalogo servizi esportato come API. | Rimozione export puo rompere consumer futuri. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/site/services/types.ts -> ServiceHomeFeature` | `PUBLIC_API_KEEP` | apps/web/site-services | Tipo del catalogo servizi esportato come API. | Rimozione export puo rompere consumer futuri. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/site/services/public-navigation/types.ts -> SeoStatus` | `PUBLIC_API_KEEP` | apps/web/site-services | Tipo public-navigation esportato come API. | Rimozione export puo rompere consumer futuri. | Tenere o documentare eccezione se API confermata. | No |
| `apps/web/src/site/services/public-navigation/types.ts -> CostGuideStatus` | `PUBLIC_API_KEEP` | apps/web/site-services | Tipo public-navigation esportato come API. | Rimozione export puo rompere consumer futuri. | Tenere o documentare eccezione se API confermata. | No |
| `packages/domain/src/company/requests/request-visibility.ts -> RequestVisibilityGrants` | `DOMAIN_REVIEW_REQUIRED` | packages/domain | Tipo policy/domain non consumato internamente. | Puo essere contratto della visibilita richieste. | Owner domain decide keep, eccezione o cleanup. | No |
| `apps/web/src/site/seo/engine/canonical.ts -> SeoFamily` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-seo | Tipo engine SEO non consumato internamente. | Puo essere contratto engine/family SEO. | Owner SEO decide keep, eccezione o cleanup. | No |
| `apps/web/src/site/seo/market-data/base-price-ranges.ts -> PriceRow` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-seo | Tipo market-data SEO non consumato internamente. | Puo essere contratto prezzi SEO. | Owner SEO decide keep, eccezione o cleanup. | No |
| `apps/web/src/site/seo/market-data/base-price-ranges.ts -> SizeExample` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-seo | Tipo market-data SEO non consumato internamente. | Puo essere contratto prezzi SEO. | Owner SEO decide keep, eccezione o cleanup. | No |
| `apps/web/src/site/seo/market-data/city-price-index.ts -> CityPriceModifier` | `DOMAIN_REVIEW_REQUIRED` | apps/web/site-seo | Tipo market-data SEO non consumato internamente. | Puo essere contratto city pricing. | Owner SEO decide keep, eccezione o cleanup. | No |

### 19.8 Possibili falsi positivi framework

- Export `dynamic` sotto `apps/web/src/richiesta/**`: classificati come
  `FRAMEWORK_FALSE_POSITIVE` perche' usano una convenzione Next. Prima di
  toccarli va verificato se il bridge in `app` deve possedere la config.
- Nessuna unlisted dependency residua: il precedente caso `server-only` e'
  risolto.

### 19.9 Backup/patch artifact

- 11 item sotto `reports/perf-patches/**` sono `BACKUP_OR_PATCH_ARTIFACT`.
- Non sono sorgente runtime.
- Decisione rinviata: spostarli fuori dal grafo, escluderli da Knip o eliminarli
  in uno sprint separato dopo conferma storica.

### 19.10 Item da tenere

Da tenere o documentare con eccezione se confermati dagli owner:

- API/barrel `apps/web/src/site/services/**`.
- API/barrel `apps/web/src/site/services/public-navigation/**`.
- Costante shell in `apps/web/src/site/shell/**`.
- Tipi template SEO (`SeoBreadcrumbItem`, `SeoFaqItem`).
- Tipo package UI `ContainerGutter`.

### 19.11 Item da verificare per dominio

Richiedono owner review prima di ogni cleanup:

- `packages/funnel/**` unused files.
- `packages/taxonomy/src/frozen/**`.
- `packages/domain/src/company/requests/**`.
- `apps/web/src/site/seo/**`.
- Validator public-navigation.
- Dipendenze auth/domain/ui/admin/root segnalate da Knip.

### 19.12 Item candidati alla rimozione nel prossimo sprint

Candidati solo dopo owner review e test:

- Export puntuali Area Impresa:
  `getUnlockError`, `getCommercialStatusLabel`.
- Selftest non cablato:
  `runPublicCatalogSelfTest`.
- Exported types locali Area Impresa:
  `ConversationThreadKind`, `CompanyLeadCategoryOption`, `RequestCardBadge`,
  `RequestCardSeats`, `CustomerContactDetail`, `RefundRequestDetail`.
- Artifact `reports/perf-patches/**`, se non vanno conservati come storico.

### 19.13 Rischi

- Rimuovere dependency senza owner review puo rompere auth, deploy, type surface
  o script manuali.
- Rimuovere export site/SEO puo rompere API future o contract editoriali non
  ancora cablati.
- Rimuovere artifact `reports/perf-patches/**` senza decisione puo perdere
  contesto storico operativo.
- Ridurre export `dynamic` nel posto sbagliato puo cambiare caching/rendering
  se la config doveva vivere nei bridge App Router.

### 19.14 Proposta di batch cleanup successivi

1. `Batch A - reports/perf-patches`: decidere conservazione fuori grafo,
   eccezione Knip o rimozione.
2. `Batch B - dependency review`: verificare solo package.json segnalati, senza
   toccare auth/config/billing nello stesso batch.
3. `Batch C - Area Impresa export surface`: ridurre export/type locali solo se
   owner conferma.
4. `Batch D - site services API`: decidere cosa e' API pubblica deliberata e
   configurare eccezioni Knip.
5. `Batch E - SEO/funnel/taxonomy/domain`: review con owner e cleanup in batch
   separati.

### 19.15 Conteggi per categoria

| Categoria | Conteggio |
|---|---:|
| `DELETE_CANDIDATE` | 9 |
| `BACKUP_OR_PATCH_ARTIFACT` | 11 |
| `FRAMEWORK_FALSE_POSITIVE` | 5 |
| `PUBLIC_API_KEEP` | 54 |
| `DOMAIN_REVIEW_REQUIRED` | 25 |
| `LEGACY_ACTIVE` | 8 |
| `CONFIG_EXCEPTION` | 1 |
| `DEPENDENCY_REVIEW` | 9 |

## 20. Sprint cleanup 3 - Batch A reports/perf-patches

Data sprint: 2026-06-24

Scope:

- Solo artifact sotto `reports/perf-patches/**`.
- Nessun codice applicativo toccato.
- Nessun export/type/dipendenza modificato.
- Nessuna directory rimossa: sono stati eliminati solo file esplicitamente
  classificati da Knip come unused e da Sprint cleanup 2 come
  `BACKUP_OR_PATCH_ARTIFACT`.

Checkpoint:

- Creato backup patch fuori dal repo:
  `%USERPROFILE%\Desktop\esigenta-backups\before-sprint-cleanup-3-perf-patches.patch`.

### 20.1 Stato iniziale

Comandi eseguiti:

```powershell
git status --short
pnpm audit:knip
rg --files reports/perf-patches
rg -n "perf-patches|patch-6i1|sprint-6i1" .
rg -n "funnel-ui|photo-upload-step|cookie-consent|patch-6i1-shared-prefetch|sprint-6i1-shared-prefetch" .
rg -n "reports/perf-patches|perf-patches|patch-6i1|sprint-6i1" --glob "!reports/perf-patches/**" .
rg -n "funnel-ui|photo-upload-step|navbar\.tsx|footer\.tsx|cookie-consent\.tsx|patch-6i1-shared-prefetch" --glob "!reports/perf-patches/**" .
```

Esito iniziale `pnpm audit:knip`:

- FAIL atteso.
- Unused files: 15.
- Unused files sotto `reports/perf-patches/**`: 11.
- Nessun riferimento operativo trovato in codice, script o package.json.
- Riferimenti fuori da `reports/perf-patches/**`: solo report/documentazione e
  D-023 in `docs/architetture/04_DEFERRED_ITEMS.md`.
- Riferimenti interni a `reports/perf-patches/**`: solo file storici
  `git-diff`, `verify-links`, `patch-summary`, `git-status`.

### 20.2 Artifact analizzati ed eliminati

| Path/item | Decisione | Motivazione | Riferimenti trovati | Rischio | Azione |
|---|---|---|---|---|---|
| `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/backup/apps/web/src/components/funnel/funnel-ui.tsx` | `DELETE` | Backup sorgente storico, non runtime, segnalato da Knip. | Solo report audit e riferimenti interni allo storico. | Basso; possibile perdita di copia storica gia descritta dai report rimasti. | Eliminato. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/backup/apps/web/src/components/funnel/photo-upload-step.tsx` | `DELETE` | Backup sorgente storico, non runtime, segnalato da Knip. | Solo report audit e riferimenti interni allo storico. | Basso; possibile perdita di copia storica gia descritta dai report rimasti. | Eliminato. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/backup/apps/web/src/components/layout/footer.tsx` | `DELETE` | Backup sorgente storico, non runtime, segnalato da Knip. | Solo report audit e riferimenti interni allo storico. | Basso; possibile perdita di copia storica gia descritta dai report rimasti. | Eliminato. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/backup/apps/web/src/components/navigation/navbar.tsx` | `DELETE` | Backup sorgente storico, non runtime, segnalato da Knip. | Solo report audit e riferimenti interni allo storico. | Basso; possibile perdita di copia storica gia descritta dai report rimasti. | Eliminato. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/backup/apps/web/src/components/privacy/cookie-consent.tsx` | `DELETE` | Backup sorgente storico, non runtime, segnalato da Knip. | Solo report audit e riferimenti interni allo storico. | Basso; possibile perdita di copia storica gia descritta dai report rimasti. | Eliminato. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/backup/apps/web/src/components/funnel/funnel-ui.tsx` | `DELETE` | Backup sorgente storico, non runtime, segnalato da Knip. | Solo report audit e riferimenti interni allo storico. | Basso; possibile perdita di copia storica gia descritta dai report rimasti. | Eliminato. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/backup/apps/web/src/components/funnel/photo-upload-step.tsx` | `DELETE` | Backup sorgente storico, non runtime, segnalato da Knip. | Solo report audit e riferimenti interni allo storico. | Basso; possibile perdita di copia storica gia descritta dai report rimasti. | Eliminato. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/backup/apps/web/src/components/layout/footer.tsx` | `DELETE` | Backup sorgente storico, non runtime, segnalato da Knip. | Solo report audit e riferimenti interni allo storico. | Basso; possibile perdita di copia storica gia descritta dai report rimasti. | Eliminato. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/backup/apps/web/src/components/navigation/navbar.tsx` | `DELETE` | Backup sorgente storico, non runtime, segnalato da Knip. | Solo report audit e riferimenti interni allo storico. | Basso; possibile perdita di copia storica gia descritta dai report rimasti. | Eliminato. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/backup/apps/web/src/components/privacy/cookie-consent.tsx` | `DELETE` | Backup sorgente storico, non runtime, segnalato da Knip. | Solo report audit e riferimenti interni allo storico. | Basso; possibile perdita di copia storica gia descritta dai report rimasti. | Eliminato. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/patch-6i1-shared-prefetch.cjs` | `DELETE` | Script operativo di patch storica, non runtime, segnalato da Knip. | Solo report audit e riferimenti interni allo storico. | Basso; i report `git-diff`/`patch-summary` rimangono come traccia. | Eliminato. |

Totale eliminati: 11.

### 20.3 Artifact mantenuti

Questi file sotto `reports/perf-patches/**` non erano tra gli 11 item Knip
classificati e sono stati mantenuti come storico testuale del batch:

| Path/item | Decisione | Motivazione |
|---|---|---|
| `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/git-diff.txt` | `KEEP_DOCUMENTED` | Report storico, non segnalato da Knip. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/git-status.txt` | `KEEP_DOCUMENTED` | Report storico, non segnalato da Knip. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/patch-summary.txt` | `KEEP_DOCUMENTED` | Report storico, non segnalato da Knip. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/typecheck.txt` | `KEEP_DOCUMENTED` | Report storico, non segnalato da Knip. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-20260610-111930/verify-links.txt` | `KEEP_DOCUMENTED` | Report storico, non segnalato da Knip. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/git-diff.txt` | `KEEP_DOCUMENTED` | Report storico, non segnalato da Knip. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/git-status.txt` | `KEEP_DOCUMENTED` | Report storico, non segnalato da Knip. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/patch-summary.json` | `KEEP_DOCUMENTED` | Report storico, non segnalato da Knip. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/typecheck.txt` | `KEEP_DOCUMENTED` | Report storico, non segnalato da Knip. |
| `reports/perf-patches/sprint-6i1-shared-prefetch-node-20260610-112137/verify-links.txt` | `KEEP_DOCUMENTED` | Report storico, non segnalato da Knip. |

### 20.4 Artifact rinviati

Nessuno.

### 20.5 Differenza Knip prima/dopo

| Categoria Knip | Prima | Dopo | Differenza |
|---|---:|---:|---:|
| Unused files | 15 | 4 | -11 |
| Unused files sotto `reports/perf-patches/**` | 11 | 0 | -11 |
| Unused dependencies | 4 | 4 | 0 |
| Unused devDependencies | 5 | 5 | 0 |
| Unused exports | 59 | 59 | 0 |
| Unused exported types | 39 | 39 | 0 |

Gli unused files residui sono:

- `packages/config/eslint/base.mjs`
- `packages/funnel/src/compiler/infer-presets.ts`
- `packages/funnel/src/types/request-answer.ts`
- `packages/funnel/src/types/runtime-step.ts`

### 20.6 Pipeline finale

Comandi eseguiti dopo il cleanup:

```powershell
pnpm lint
pnpm typecheck
pnpm build
pnpm audit:deps
pnpm audit:madge
pnpm audit:knip
```

Esito:

- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm build`: PASS.
- `pnpm audit:deps`: PASS con 0 errori e 19 warning.
- `pnpm audit:madge`: PASS, 206 file processati, 0 cicli, 12 warning.
- `pnpm audit:knip`: FAIL atteso, ma senza piu' artifact
  `reports/perf-patches/**`.

Warning non bloccante:

- Next.js segnala ancora la convenzione `middleware` deprecata verso `proxy`.

### 20.7 Rischi residui

- I report testuali/JSON sotto `reports/perf-patches/**` restano nel repo come
  storico. Non sono segnalati da Knip oggi.
- D-023 resta OPEN: rimangono item Knip su funnel/config, dipendenze, export e
  types.
- Nessun rischio runtime introdotto: solo file sotto `reports/perf-patches/**`
  sono stati eliminati.

### 20.8 Prossimo batch consigliato

`Sprint cleanup 4 - Batch B dependency review`.

Scope consigliato:

- Verificare una dipendenza alla volta tra quelle segnalate da Knip.
- Non toccare auth/config/billing nello stesso batch senza owner review.
- Trattare `@better-auth/prisma-adapter`, `dotenv`, `tsx`, `vercel` e
  `playwright` come casi da confermare contro script reali e workflow manuali.

## 21. Sprint cleanup 4 — Batch B dependency review

Data sprint: 2026-06-24

Scope:

- Solo dipendenze/devDependencies segnalate da Knip.
- Nessun codice applicativo modificato.
- Nessun file sorgente, export o type eliminato.
- Rimozioni applicate solo a dipendenze classificate `REMOVE_SAFE` e verificate
  una alla volta.

Checkpoint:

- Creato backup patch fuori dal repo:
  `%TEMP%\esigenta-pre-sprint4-dependency-review.patch`.

### 21.1 Stato iniziale

Comandi iniziali eseguiti:

```powershell
git status --short
pnpm audit:knip
pnpm exec knip --reporter json --no-exit-code
```

Esito iniziale `pnpm audit:knip`:

- FAIL atteso.
- Unused files: 4.
- Unused dependencies: 4.
- Unused devDependencies: 5.
- Unlisted dependencies: 0.
- Unused exports: 59.
- Unused exported types: 39.

Dipendenze Knip analizzate in questo sprint:

- `@esigenta/config` in `apps/admin/package.json`
- `@better-auth/prisma-adapter` in `packages/auth/package.json`
- `dotenv` in `packages/domain/package.json`
- `class-variance-authority` in `packages/ui/package.json`
- `@types/react` in `package.json`
- `playwright` in `package.json`
- `vercel` in `package.json`
- `tsx` in `packages/domain/package.json`
- `@types/react-dom` in `packages/ui/package.json`

### 21.2 Analisi e decisioni

| Dependency | Package.json | Categoria | Evidenza trovata | Decisione | Azione eseguita | Verifiche | Rischio residuo |
|---|---|---|---|---|---|---|---|
| `@esigenta/config` | `apps/admin/package.json` | `REMOVE_SAFE` | Nessun import package; `apps/admin/tsconfig.json` estende la config via path relativo `../../packages/config/typescript/base.json`. `apps/web` usa lo stesso pattern senza dipendenza package. | Rimuovere. | Rimossa da `apps/admin/package.json`. | `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm audit:deps`, `pnpm audit:madge`, `pnpm audit:knip`: ok, con Knip ancora FAIL atteso. | Basso; relazione tooling resta via path relativo. |
| `@better-auth/prisma-adapter` | `packages/auth/package.json` | `DEFER` | Nessun import diretto del package. `packages/auth/src/auth/core.ts` usa `prismaAdapter` da `better-auth/adapters/prisma`. Package auth sensibile e fuori scope rimozioni auth senza review. | Rinviare a owner auth. | Nessuna rimozione. | Non applicabile. | Medio; possibile dipendenza storica o duplicata, ma va confermata nel dominio auth. |
| `dotenv` | `packages/domain/package.json` | `MOVE_SCOPE_REVIEW` | Nessun import `dotenv` in `packages/domain`; `dotenv` e' invece vivo in `packages/auth`, `packages/database` e `packages/taxonomy`. Regola sprint: non spostare/rimuovere `dotenv` senza analisi motivata. | Rinviare a review domain/config. | Nessuna rimozione. | Non applicabile. | Medio-basso; probabile residuo di script domain storico, ma `dotenv` resta critico in altri package. |
| `class-variance-authority` | `packages/ui/package.json` | `REMOVE_SAFE` | Nessun import e nessun uso `cva(` nel repo; `packages/ui/src/lib/cn.ts` usa `clsx` + `tailwind-merge`. | Rimuovere. | Rimossa da `packages/ui/package.json`. | `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm audit:deps`, `pnpm audit:madge`, `pnpm audit:knip`: ok, con Knip ancora FAIL atteso. | Basso; nessuna API UI corrente usa CVA. |
| `@types/react-dom` | `packages/ui/package.json` | `REMOVE_SAFE` | Nessun import `react-dom`/`createPortal` in `packages/ui/src`; componenti UI usano tipi React/HTML da `react`. | Rimuovere. | Rimossa da `packages/ui/package.json`. | `packages/ui` ricontrollato da `pnpm typecheck`; pipeline completa ok. | Basso; `react-dom` resta peer dependency, ma i suoi tipi non sono usati dalla superficie UI attuale. |
| `tsx` | `packages/domain/package.json` | `REMOVE_SAFE` | `packages/domain/package.json` ha solo script `typecheck`; nessun file/script domain usa `tsx`. I casi vivi di `tsx` restano in auth/taxonomy. | Rimuovere. | Rimossa da `packages/domain/package.json`. | `packages/domain` ricontrollato da `pnpm typecheck`; pipeline completa ok. | Basso; eventuali script manuali domain non tracciati dovranno dichiararlo esplicitamente se reintrodotti. |
| `@types/react` | `package.json` root | `REMOVE_SAFE` | Nessun tsconfig root; `apps/web`, `apps/admin` e `packages/ui` dichiarano gia' i propri `@types/react`. | Rimuovere. | Rimossa da `package.json` root. | Typecheck completo senza cache: PASS; pipeline completa ok. | Basso; i workspace React continuano a possedere i propri tipi. |
| `playwright` | `package.json` root | `KEEP_TOOLING` | Dichiarato solo a root; non agganciato a script. E' tool QA/test manuale e lo sprint vieta rimozioni test/deploy non certe. | Tenere per ora. | Nessuna rimozione. | Non applicabile. | Medio-basso; Knip continuera' a segnalarlo finche' non viene documentato, scriptato o escluso. |
| `vercel` | `package.json` root | `KEEP_TOOLING` | Dichiarato solo a root; non agganciato a script. E' CLI deploy/tooling, e `pnpm why tsx` mostra anche catene transitive Vercel. | Tenere per ora. | Nessuna rimozione. | Non applicabile. | Medio-basso; Knip continuera' a segnalarlo finche' non viene documentato, scriptato o escluso. |

### 21.3 Rimozioni applicate

Dipendenze rimosse:

- `@esigenta/config` da `apps/admin/package.json`
- `class-variance-authority` da `packages/ui/package.json`
- `@types/react-dom` da `packages/ui/package.json`
- `tsx` da `packages/domain/package.json`
- `@types/react` da `package.json` root

File modificati dalle rimozioni:

- `apps/admin/package.json`
- `packages/ui/package.json`
- `packages/domain/package.json`
- `package.json`
- `pnpm-lock.yaml`

Nessuna rimozione applicata a:

- `@better-auth/prisma-adapter`
- `dotenv`
- `playwright`
- `vercel`

### 21.4 Verifiche per micro-batch

Per ogni rimozione e' stato eseguito:

```powershell
pnpm install
pnpm lint
pnpm typecheck
pnpm build
pnpm audit:deps
pnpm audit:madge
pnpm audit:knip
```

Tutti i micro-batch hanno mantenuto:

- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm build`: PASS.
- `pnpm audit:deps`: PASS con 0 errori e 19 warning.
- `pnpm audit:madge`: PASS, 206 file processati, 0 cicli, 12 warning.
- `pnpm audit:knip`: FAIL atteso.

### 21.5 Differenza Knip prima/dopo

| Categoria Knip | Prima | Dopo osservato nel worktree finale | Differenza |
|---|---:|---:|---:|
| Unused files | 4 | 4 | 0 |
| Unused dependencies | 4 | 2 | -2 |
| Unused devDependencies | 5 | 2 | -3 |
| Unlisted dependencies | 0 | 0 | 0 |
| Unused exports | 59 | 60 | +1 |
| Unused exported types | 39 | 39 | 0 |

Residui dependency-level dopo il batch:

- `@better-auth/prisma-adapter` in `packages/auth/package.json`
- `dotenv` in `packages/domain/package.json`
- `playwright` in `package.json`
- `vercel` in `package.json`

Nota: l'aumento `Unused exports` da 59 a 60 non deriva dal dependency cleanup.
Durante la verifica finale erano presenti modifiche fuori scope in area-impresa,
incluso il nuovo file `apps/web/src/area-impresa/private/opportunita/components/request-refund-disclosure.tsx`;
Knip segnala `refundReasonOptions` da quel file.

### 21.6 Pipeline finale sprint

Esito finale dopo aggiornamento dependency graph e dopo le modifiche area-impresa
fuori scope presenti nel worktree:

- `pnpm lint`: FAIL su
  `apps/web/src/area-impresa/private/opportunita/components/request-detail-card.tsx`.
  Errori principali: `Select`, `Textarea`, `Checkbox`, `Input` non definiti;
  warning su `RequestRefundDisclosure`, `StatusRow`, `getRefundRequestStatusRow`,
  `balanceAfterUnlock`, `creditDeficit` inutilizzati.
- `pnpm typecheck`: FAIL sullo stesso file. Errori principali:
  `Select`, `Textarea`, `Checkbox`, `Input`, `refundReasonOptions` non definiti;
  parametro `option` implicitamente `any`.
- `pnpm build`: FAIL nel build web durante il typecheck Next, stesso errore
  `Select` non definito in `request-detail-card.tsx`.
- `pnpm audit:deps`: PASS con 0 errori e 19 warning.
- `pnpm audit:madge`: PASS, 207 file processati, 0 cicli, 12 warning.
- `pnpm audit:knip`: FAIL atteso; ora restano 2 unused dependencies e 2
  unused devDependencies.

Warning non bloccante:

- Next.js segnala ancora la convenzione `middleware` deprecata verso `proxy`.

### 21.7 Rischi residui

- `@better-auth/prisma-adapter` richiede owner review auth prima di una rimozione:
  la codebase usa `better-auth/adapters/prisma`, ma il dominio auth e' sensibile.
- `dotenv` in `packages/domain` sembra non usato localmente, ma `dotenv` e' vivo in
  config/bootstrap di altri package e non va spostato in blocco.
- `playwright` e `vercel` sono tool root non scriptati: decidere se tenerli con
  script/nota operativa, escluderli da Knip o rimuoverli in un batch tooling.
- Gli export/types Knip non sono stati toccati in questo sprint.
- La pipeline finale e' attualmente bloccata da modifiche applicative
  area-impresa fuori scope: `request-detail-card.tsx`,
  `request-detail-page.tsx` e il nuovo `request-refund-disclosure.tsx`.
  Non sono state corrette per rispettare la regola "non toccare codice
  applicativo" di questo sprint.

### 21.8 Prossimo sprint consigliato

`Sprint cleanup 5 - Export/types e framework false positives`.

Scope consigliato:

- Non toccare ancora `@better-auth/prisma-adapter` o `dotenv` senza owner review.
- Prima normalizzare i possibili falsi positivi Next.js (`dynamic`) e i barrel
  pubblici `site/services/**`.
- Separare i type locali chiaramente non pubblici dai tipi intenzionalmente API.

## 22. Sprint cleanup Knip - batch eseguito

- Batch scelto: `CONFIG_EXCEPTION` Knip su config condivisa non cablata.
- Gruppi iniziali: files 4, dependencies 2, devDependencies 2, exports 60, exported types 38.
- Configurato `knip.json` con ignore per `packages/config/eslint/base.mjs`.
- Nessun file sorgente/export/type/dipendenza rimosso.
- Differenza Knip: unused files 4 -> 3; dependencies 2 -> 2; devDependencies 2 -> 2; exports 60 -> 60; types 38 -> 38.
- `pnpm audit:knip`: FAIL atteso, ridotto di 1 unused file.
- `pnpm lint`: PASS.
- `pnpm typecheck`: FAIL fuori batch su `apps/web/src/area-impresa/private/billing/crediti/credits-page.tsx` (`Badge` non definito).
- `pnpm build`: FAIL fuori batch sullo stesso file, parse error JSX a riga 345.
- Prossimo batch: decidere con owner funnel i 3 unused files `packages/funnel/**`, oppure batch tooling su `playwright`/`vercel`.

## 23. Sprint cleanup Knip - batch eseguito

- Blocker pipeline: `pnpm typecheck` PASS; `pnpm build` PASS dopo rerun, nessun fix codice necessario.
- Batch scelto: 3 unused files vuoti sotto `packages/funnel/**`.
- Rimosso: `infer-presets.ts`, `request-answer.ts`, `runtime-step.ts`.
- Configurato/rinviato: nulla.
- Knip prima/dopo: unused files 3 -> 0; deps 2 -> 2; devDeps 2 -> 2; exports 60 -> 60; types 38 -> 38.
- Stato finale: lint PASS, typecheck PASS, build PASS, knip FAIL atteso.
- Prossimo batch: dependency/tooling review su `@better-auth/prisma-adapter`, `dotenv`, `playwright`, `vercel`.

## 24. Sprint cleanup Knip - batch dependency/tooling

- Dipendenze rimosse: nessuna.
- Tenute come eccezione Knip: `@better-auth/prisma-adapter`, `dotenv`, `playwright`, `vercel`.
- Rinviate: review auth/config per `@better-auth/prisma-adapter` e `dotenv`; tooling decision per `playwright`/`vercel`.
- Knip prima/dopo: dependencies 2 -> 0; devDependencies 2 -> 0.
- Knip finale: FAIL atteso solo per unused exports 60 e unused exported types 38.
- Pipeline finale: lint PASS, typecheck PASS, build PASS.

## 25. Sprint cleanup Knip - exports/types keep

- Gruppi gestiti: Next/framework `dynamic`; public API/barrel `site/seo`, `site/services`, `packages/ui/layout/container`.
- Eccezioni aggiunte in `knip.json`: `apps/web/src/richiesta/**/*.tsx`, `apps/web/src/site/seo/**`, `apps/web/src/site/services/**`, `packages/ui/src/layout/container.tsx`.
- Knip prima/dopo: exports 60 -> 13; exported types 38 -> 9.
- Resta: auth/admin helper, area-impresa/domain/taxonomy/shell/legal exports/types da review.
- Non toccato codice applicativo; nessun export/type eliminato.
- Stato finale: lint PASS, typecheck PASS, build PASS; Knip FAIL atteso sui residui.
- Prossimo batch: review dominio sui 13 exports + 9 types residui.

## 26. Sprint cleanup Knip - final residue classification

- Gruppi gestiti: auth/admin, area-impresa, domain/taxonomy, shell/legal/platform.
- Configurato `knip.json` con `ignoreIssues` mirato a `exports`/`types`, senza ignorare file interi.
- Rimosso: nulla; codice applicativo/export/type non toccati.
- Tenuto/classificato: auth helper, package/domain taxonomy, shell/legal/platform API interne.
- Rinviato: area-impresa a review dominio, ma escluso da Knip come gruppo gia classificato.
- Knip prima/dopo: exports 13 -> 0; exported types 9 -> 0.
- Stato finale: `pnpm audit:knip`, lint, typecheck, build PASS.
