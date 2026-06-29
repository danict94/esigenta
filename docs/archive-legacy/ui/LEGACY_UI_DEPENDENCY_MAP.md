# LEGACY_UI_DEPENDENCY_MAP

Migration impact audit — maps every legacy `packages/ui` design-system dependency to the exact files, pages, and app areas that break if it is removed.

Reference system excluded throughout (already approved, not legacy): Homepage (`apps/web/src/site/home/**`), Navbar/Footer (`apps/web/src/site/shell/{navbar,footer}.tsx`), `apps/web/src/site/shell/palette.ts`, `tokens.cantiere.*` in `packages/ui/src/styles/tokens.ts`.

Methodology note: "Pages" means page-level/template-level files (`*-page.tsx`, `*-page-template.tsx`, `app/**/page.tsx`, `app/**/not-found.tsx`). Files like `notification-card.tsx`, `request-list-card.tsx`, `impresa-sidebar.tsx`, `message-thread.tsx` are shared sub-components consumed by one or more of the pages listed — they are flagged but not separately traced, since the owning page breaks either way.

## Component Dependencies

### Button
`packages/ui/src/components/button.tsx`

Files:
- `apps/admin/src/components/admin-shell.tsx`
- `apps/admin/src/app/(protected)/crediti/pacchetti/page.tsx`
- `apps/admin/src/app/(protected)/crediti/rimborsi/richieste/page.tsx`
- `apps/admin/src/app/(protected)/imprese/modifiche-contatto/page.tsx`
- `apps/admin/src/app/(protected)/imprese/page.tsx`
- `apps/admin/src/app/(protected)/requests/[id]/page.tsx`
- `apps/admin/src/app/(protected)/support/[conversationId]/page.tsx`
- `apps/admin/src/app/(protected)/support/_components/admin-message-form.tsx`
- `apps/admin/src/app/(public)/accedi/admin-login-form.tsx`
- `apps/admin/src/app/(public)/admin/recupera-password/page.tsx`
- `apps/admin/src/app/(public)/admin/reimposta-password/page.tsx`
- `apps/web/src/area-impresa/private/account/notifiche/notification-card.tsx`
- `apps/web/src/area-impresa/private/account/notifiche/notifications-page.tsx`
- `apps/web/src/area-impresa/private/account/profilo/deactivate-account-form.tsx`
- `apps/web/src/area-impresa/private/account/profilo/profile-page.tsx`
- `apps/web/src/area-impresa/private/account/servizi/category-interventions-selector.tsx`
- `apps/web/src/area-impresa/private/billing/crediti/credits-page.tsx`
- `apps/web/src/area-impresa/private/comunicazioni/assistenza/support-page.tsx`
- `apps/web/src/area-impresa/private/opportunita/components/request-detail-card.tsx`
- `apps/web/src/area-impresa/private/opportunita/components/request-filters-panel.tsx`
- `apps/web/src/area-impresa/private/opportunita/components/request-pending-controls.tsx`
- `apps/web/src/area-impresa/private/shell/impresa-sidebar.tsx`
- `apps/web/src/area-impresa/public/auth/components/impresa-login-form.tsx`
- `apps/web/src/area-impresa/public/auth/components/impresa-signup-form.tsx`
- `apps/web/src/area-impresa/public/auth/recover-password-page.tsx`
- `apps/web/src/area-impresa/public/auth/reset-password-page.tsx`
- `apps/web/src/area-impresa/public/marketing/area-impresa-marketing-page.tsx`
- `apps/web/src/area-impresa/public/marketing/company-lead-form.tsx`
- `apps/web/src/richiesta/comunicazioni/customer-requests-access-page.tsx`
- `apps/web/src/richiesta/flow/components/request-flow-shell.tsx`
- `apps/web/src/richiesta/flow/components/request-photo-upload.tsx`
- `apps/web/src/richiesta/flow/components/request-step-ui.tsx`
- `apps/web/src/site/seo/templates/geo-request-form.tsx`
- `apps/web/src/site/shell/cookie-consent.tsx`
- `apps/web/src/ui/location/city-autocomplete.tsx`
- `apps/web/src/ui/messaging/send-message-form.tsx`

Pages:
- All Admin pages listed above, plus `admin-shell.tsx`
- `profile-page`, `notifications-page`, `credits-page`, `support-page`, `area-impresa-marketing-page`, `recover-password-page`, `reset-password-page`
- `customer-requests-access-page`
- `geo-request-form` (SEO)

Areas:
- Admin
- Area Impresa
- Richiesta
- SEO
- Shell

### Card (+ CardHeader / CardContent / CardTitle / CardDescription)
`packages/ui/src/components/card.tsx`

Files:
- `apps/admin/src/app/(protected)/crediti/pacchetti/page.tsx`
- `apps/admin/src/app/(protected)/crediti/rimborsi/richieste/page.tsx`
- `apps/admin/src/app/(protected)/imprese/modifiche-contatto/page.tsx`
- `apps/admin/src/app/(protected)/requests/[id]/page.tsx`
- `apps/admin/src/app/(protected)/requests/non-verificate/page.tsx`
- `apps/admin/src/app/(protected)/requests/page.tsx`
- `apps/admin/src/app/(protected)/support/[conversationId]/page.tsx`
- `apps/admin/src/app/(protected)/support/_components/support-channel-list.tsx`
- `apps/admin/src/app/(protected)/support/_components/support-thread.tsx`
- `apps/admin/src/app/(protected)/support/page.tsx`
- `apps/admin/src/app/(public)/accedi/page.tsx`
- `apps/admin/src/app/(public)/admin/recupera-password/page.tsx`
- `apps/admin/src/app/(public)/admin/reimposta-password/page.tsx`
- `apps/admin/src/app/(public)/unauthorized/page.tsx`
- `apps/web/src/app/interventi/[interventoSlug]/not-found.tsx`
- `apps/web/src/app/professionisti/[categorySlug]/not-found.tsx`
- `apps/web/src/area-impresa/private/account/notifiche/notification-card.tsx`
- `apps/web/src/area-impresa/private/account/notifiche/notifications-list.tsx`
- `apps/web/src/area-impresa/private/account/profilo/profile-page.tsx`
- `apps/web/src/area-impresa/private/account/servizi/services-configuration-page.tsx`
- `apps/web/src/area-impresa/private/billing/crediti/credit-checkout-status-banner.tsx`
- `apps/web/src/area-impresa/private/billing/crediti/credits-page.tsx`
- `apps/web/src/area-impresa/private/comunicazioni/assistenza/support-page.tsx`
- `apps/web/src/area-impresa/private/comunicazioni/contatti/contacts-list.tsx`
- `apps/web/src/area-impresa/private/comunicazioni/contatti/contacts-page.tsx`
- `apps/web/src/area-impresa/private/comunicazioni/conversazione/conversation-page.tsx`
- `apps/web/src/area-impresa/private/opportunita/components/company-request-list.tsx`
- `apps/web/src/area-impresa/private/opportunita/components/request-detail-card.tsx`
- `apps/web/src/area-impresa/private/opportunita/components/request-list-card.tsx`
- `apps/web/src/area-impresa/private/opportunita/richieste/requests-page.tsx`
- `apps/web/src/area-impresa/private/shell/impresa-sidebar.tsx`
- `apps/web/src/area-impresa/public/auth/login-page.tsx`
- `apps/web/src/area-impresa/public/auth/recover-password-page.tsx`
- `apps/web/src/area-impresa/public/auth/reset-password-page.tsx`
- `apps/web/src/area-impresa/public/auth/select-company-page.tsx`
- `apps/web/src/area-impresa/public/auth/signup-page.tsx`
- `apps/web/src/area-impresa/public/marketing/area-impresa-marketing-page.tsx`
- `apps/web/src/area-impresa/public/marketing/company-lead-form.tsx`
- `apps/web/src/richiesta/comunicazioni/customer-conversation-page.tsx`
- `apps/web/src/richiesta/comunicazioni/customer-requests-access-page.tsx`
- `apps/web/src/richiesta/flow/components/request-photo-upload.tsx`
- `apps/web/src/site/legal/cookie-policy-page.tsx`
- `apps/web/src/site/legal/legal-section.tsx`
- `apps/web/src/site/legal/privacy-page.tsx`
- `apps/web/src/site/legal/termini-page.tsx`
- `apps/web/src/site/professions/profession-page-template.tsx`
- `apps/web/src/ui/messaging/message-thread.tsx`

Pages:
- All Admin protected/public pages listed above
- `profile-page`, `services-configuration-page`, `credits-page`, `support-page`, `contacts-page`, `conversation-page`, `requests-page`, `login-page`, `recover-password-page`, `reset-password-page`, `select-company-page`, `signup-page`, `area-impresa-marketing-page`
- `customer-conversation-page`, `customer-requests-access-page`
- **`cookie-policy-page`, `privacy-page`, `termini-page` (all 4 Legal pages, 100%)**
- `profession-page-template`
- web `not-found.tsx` (interventi, professionisti)

Areas:
- Admin
- Area Impresa
- Richiesta
- **Legal (100%)**
- SEO

### Badge
`packages/ui/src/components/badge.tsx`

Files:
- `apps/admin/src/app/(protected)/crediti/pacchetti/page.tsx`
- `apps/admin/src/app/(protected)/crediti/rimborsi/richieste/page.tsx`
- `apps/admin/src/app/(protected)/imprese/modifiche-contatto/page.tsx`
- `apps/admin/src/app/(protected)/imprese/page.tsx`
- `apps/admin/src/app/(protected)/page.tsx`
- `apps/admin/src/app/(protected)/requests/[id]/page.tsx`
- `apps/admin/src/app/(protected)/requests/non-verificate/page.tsx`
- `apps/admin/src/app/(protected)/requests/page.tsx`
- `apps/admin/src/app/(protected)/support/_components/support-channel-list.tsx`
- `apps/admin/src/app/(protected)/support/_components/support-thread.tsx`
- `apps/admin/src/app/(protected)/support/page.tsx`
- `apps/admin/src/components/admin-shell.tsx`
- `apps/web/src/area-impresa/private/account/notifiche/notification-card.tsx`
- `apps/web/src/area-impresa/private/account/profilo/profile-page.tsx`
- `apps/web/src/area-impresa/private/account/servizi/category-interventions-selector.tsx`
- `apps/web/src/area-impresa/private/account/servizi/services-configuration-page.tsx`
- `apps/web/src/area-impresa/private/billing/crediti/credits-page.tsx`
- `apps/web/src/area-impresa/private/comunicazioni/assistenza/support-page.tsx`
- `apps/web/src/area-impresa/private/comunicazioni/contatti/contacts-list.tsx`
- `apps/web/src/area-impresa/private/opportunita/components/request-detail-card.tsx`
- `apps/web/src/area-impresa/private/opportunita/components/request-filters-panel.tsx`
- `apps/web/src/area-impresa/private/opportunita/components/request-list-card.tsx`
- `apps/web/src/area-impresa/private/shell/impresa-sidebar.tsx`
- `apps/web/src/area-impresa/public/auth/components/impresa-signup-form.tsx`
- `apps/web/src/area-impresa/public/marketing/area-impresa-marketing-page.tsx`
- `apps/web/src/richiesta/flow/components/request-photo-upload.tsx`
- `apps/web/src/site/legal/cookie-policy-page.tsx`
- `apps/web/src/site/legal/privacy-page.tsx`
- `apps/web/src/site/legal/termini-page.tsx`
- `apps/web/src/site/professions/profession-page-template.tsx`
- `apps/web/src/site/seo/templates/cost-city-page-template.tsx`
- `apps/web/src/site/seo/templates/cost-page-template.tsx`
- `apps/web/src/site/seo/templates/geo-cost-module.tsx`
- `apps/web/src/ui/messaging/message-thread.tsx`

Pages:
- Same Admin set as above
- `profile-page`, `services-configuration-page`, `credits-page`, `support-page`, `contacts-page`, `area-impresa-marketing-page`
- `cookie-policy-page`, `privacy-page`, `termini-page` (3 of 4 Legal pages)
- `profession-page-template`, `cost-city-page-template`, `cost-page-template`

Areas:
- Admin
- Area Impresa
- Richiesta
- Legal
- SEO

### Input / Textarea / Checkbox / Select
`packages/ui/src/components/{input,textarea,checkbox,select}.tsx`

Files (Input, 20):
- `apps/admin/src/app/(protected)/crediti/pacchetti/page.tsx`
- `apps/admin/src/app/(protected)/requests/[id]/page.tsx`
- `apps/admin/src/app/(public)/accedi/admin-login-form.tsx`
- `apps/admin/src/app/(public)/admin/recupera-password/page.tsx`
- `apps/admin/src/app/(public)/admin/reimposta-password/page.tsx`
- `apps/web/src/area-impresa/private/account/notifiche/notification-card.tsx`
- `apps/web/src/area-impresa/private/account/profilo/company-location-fields.tsx`
- `apps/web/src/area-impresa/private/account/profilo/deactivate-account-form.tsx`
- `apps/web/src/area-impresa/private/account/profilo/profile-page.tsx`
- `apps/web/src/area-impresa/private/account/servizi/category-interventions-selector.tsx`
- `apps/web/src/area-impresa/private/opportunita/components/request-detail-card.tsx`
- `apps/web/src/area-impresa/private/opportunita/components/request-filters-panel.tsx`
- `apps/web/src/area-impresa/public/auth/components/impresa-login-form.tsx`
- `apps/web/src/area-impresa/public/auth/components/impresa-signup-form.tsx`
- `apps/web/src/area-impresa/public/auth/recover-password-page.tsx`
- `apps/web/src/area-impresa/public/auth/reset-password-page.tsx`
- `apps/web/src/richiesta/comunicazioni/customer-requests-access-page.tsx`
- `apps/web/src/richiesta/flow/components/request-step-ui.tsx`
- `apps/web/src/site/seo/templates/geo-request-form.tsx`
- `apps/web/src/ui/location/city-autocomplete.tsx`

Files (Textarea, 8): `crediti/pacchetti`, `crediti/rimborsi/richieste`, `imprese/modifiche-contatto`, `requests/[id]/page` (admin); `request-detail-card.tsx`, `request-step-ui.tsx`, `ui/messaging/send-message-form.tsx`; `support/_components/admin-message-form.tsx`

Files (Checkbox, 2): `category-interventions-selector.tsx`, `request-detail-card.tsx`

Files (Select, 5): `profile-page.tsx`, `request-detail-card.tsx`, `request-filters-panel.tsx`, `impresa-signup-form.tsx`, `company-lead-form.tsx`

Pages:
- Admin login/password/credit pages
- `profile-page`, `category-interventions-selector` (feeds `services-configuration-page`), `impresa-login-form`/`impresa-signup-form` (feed `login-page`/`signup-page`), `recover-password-page`, `reset-password-page`
- `customer-requests-access-page`, `request-step-ui` (feeds `request-flow-page`)
- `geo-request-form` (SEO)

Areas:
- Admin
- Area Impresa
- Richiesta
- SEO

### Container
`packages/ui/src/layout/container.tsx`

Files:
- `apps/admin/src/components/admin-shell.tsx`
- `apps/web/src/area-impresa/private/shell/area-impresa-private-layout.tsx`
- `apps/web/src/area-impresa/private/shell/impresa-sidebar.tsx`
- `apps/web/src/area-impresa/public/auth/login-page.tsx`
- `apps/web/src/area-impresa/public/auth/recover-password-page.tsx`
- `apps/web/src/area-impresa/public/auth/reset-password-page.tsx`
- `apps/web/src/area-impresa/public/auth/select-company-page.tsx`
- `apps/web/src/area-impresa/public/marketing/business-how-it-works.tsx`
- `apps/web/src/richiesta/comunicazioni/customer-conversation-page.tsx`
- `apps/web/src/richiesta/comunicazioni/customer-request-detail-page.tsx`
- `apps/web/src/richiesta/comunicazioni/customer-requests-access-page.tsx`
- `apps/web/src/richiesta/comunicazioni/customer-requests-page.tsx`
- `apps/web/src/richiesta/flow/request-flow-page.tsx`
- `apps/web/src/richiesta/stato/request-status-page.tsx`
- `apps/web/src/richiesta/verifica/request-verification-page.tsx`
- `apps/web/src/site/legal/cookie-policy-page.tsx`
- `apps/web/src/site/legal/privacy-page.tsx`
- `apps/web/src/site/legal/termini-page.tsx`

Pages:
- **Every Richiesta page (7 of 7, 100%)**
- `login-page`, `recover-password-page`, `reset-password-page`, `select-company-page`
- `cookie-policy-page`, `privacy-page`, `termini-page` (3 of 4 Legal)

Areas:
- Admin
- Area Impresa
- **Richiesta (100%)**
- Legal

### PageShell
`packages/ui/src/layout/page-shell.tsx`

Files:
- Admin: `crediti/pacchetti`, `crediti/rimborsi/richieste`, `imprese/modifiche-contatto`, `imprese/page`, `(protected)/page`, `requests/[id]/page`, `requests/non-verificate/page`, `requests/page`, `support/[conversationId]/page`, `support/page`
- Web not-found: `costi/[costSlug]/[citySlug]`, `costi/[costSlug]`, `interventi/[interventoSlug]`, `professionisti/[categorySlug]`
- Area Impresa: `notifications-page`, `profile-page`, `services-configuration-page`, `credits-page`, `support-page`, `contacts-page`, `conversation-page`, `request-detail-page`, `purchased-requests-page`, `saved-requests-page`, `requests-page`
- SEO: `profession-page-template`, `cost-city-page-template`, `cost-hub-template`, `cost-page-template`, `intervention-page-template`, `services-hub-page`

Pages: as listed (all page-level files directly)

Areas:
- Admin
- Area Impresa
- SEO

### HeroSurface / MarketingSurface
`packages/ui/src/layout/{hero-surface,marketing-surface}.tsx`

Files: `apps/web/src/area-impresa/public/auth/signup-page.tsx`, `apps/web/src/area-impresa/public/marketing/area-impresa-marketing-page.tsx`
(`MarketingSurface`: 0 direct files — consumed only internally by `hero-surface.tsx`)

Pages: `signup-page`, `area-impresa-marketing-page`

Areas:
- Area Impresa only

## Token Dependencies

### tokens.radius
Files: `admin/(protected)/page.tsx`; `impresa-signup-form.tsx`, `login-page.tsx`; `customer-requests-access-page.tsx`, `request-flow-shell.tsx`, `request-photo-upload.tsx`, `request-step-ui.tsx`, `request-status-page.tsx`, `request-verification-page.tsx`; `cost-city-page-template.tsx`, `cost-hub-template.tsx`, `cost-page-template.tsx`, `geo-cost-module.tsx`, `geo-request-form.tsx`, `intervention-page-template.tsx`, `related-funnel-work.tsx`, `seo-faq.tsx`; `services-hub-page.tsx`; `cookie-consent.tsx`; `city-autocomplete.tsx`

Pages: `admin/(protected)/page`; `login-page`; `customer-requests-access-page`, `request-status-page`, `request-verification-page`, `request-flow-page` (via `request-flow-shell`); all 5 SEO templates; `services-hub-page`

Areas:
- Admin
- Area Impresa
- Richiesta
- SEO
- Shell

### tokens.typography
Files: `impresa-sidebar.tsx`, `impresa-signup-form.tsx`, `select-company-page.tsx`, `area-impresa-marketing-page.tsx`, `business-how-it-works.tsx`, `customer-request-detail-page.tsx`, `customer-requests-page.tsx`, `request-status-page.tsx`, `request-verification-page.tsx`

Pages: `select-company-page`, `area-impresa-marketing-page`; `customer-request-detail-page`, `customer-requests-page`, `request-status-page`, `request-verification-page`

Areas:
- Area Impresa
- Richiesta

### tokens.shadows
Files: `admin/(protected)/page.tsx`; `request-flow-shell.tsx`, `request-step-ui.tsx`, `request-status-page.tsx`, `request-verification-page.tsx`; `cookie-consent.tsx`

Pages: `admin/(protected)/page`; `request-flow-page`, `request-status-page`, `request-verification-page`

Areas:
- Admin
- Richiesta
- Shell

### tokens.spacing
Files: `business-how-it-works.tsx`, `customer-request-detail-page.tsx`, `customer-requests-page.tsx`, `request-status-page.tsx`, `request-verification-page.tsx`

Pages: same as files (all page-level)

Areas:
- Area Impresa
- Richiesta

### tokens.layout
Files: `admin/support/_components/support-thread.tsx`, `ui/messaging/message-thread.tsx`

Pages: `admin/support/[conversationId]/page`; any page using `message-thread` (`customer-conversation-page`, `conversation-page`)

Areas:
- Admin
- shared (Richiesta + Area Impresa messaging)

### tokens.interactive.variants.{warm, brandOutline}
Files (100% concentrated): `cost-city-page-template.tsx`, `cost-page-template.tsx`, `geo-cost-module.tsx`, `intervention-page-template.tsx`, `services-hub-page.tsx`

Pages: same 5 files — note these bypass the `Button` component entirely; `warm`/`brandOutline` are not in `Button`'s exported variant type

Areas:
- SEO only

### tokens.home.nav
Files: `apps/admin/src/components/admin-shell.tsx`

Pages: every admin page rendered inside the admin shell (all protected admin routes)

Areas:
- Admin only — sole remaining consumer of homepage-named nav tokens; dead in `apps/web`

### tokens.funnel
Files: `request-step-ui.tsx`, `request-flow-page.tsx`

Pages: `request-flow-page` (the entire quote-request submission funnel)

Areas:
- Richiesta only — smallest file count in this map, highest severity-per-file (sits directly on the money path)

## CSS Variables

Direct grep for `--fp-` across all app/package source (excluding `.next/` build output):

```
packages/ui/src/styles/globals.css
packages/ui/src/styles/tokens.ts
```

Zero application source files reference `--fp-*` directly. Every `--fp-*` CSS variable is fully encapsulated inside `packages/ui`'s own two files and reached only through `tokens.ts`'s exported `tokens` object. There is no `--fp-` leak into `apps/web` or `apps/admin` — the variables themselves are not a migration concern; everything that depends on their values does so exclusively through the token families mapped above.

Areas: N/A — no direct app dependency exists.

## Rebuild Impact

### Area Impresa
Dependencies: Button, Input, Textarea, Checkbox, Select, Card(+subparts), Badge, Container, PageShell, HeroSurface, `tokens.radius`, `tokens.typography`

Files: ~35 — all of `private/account/**`, `private/billing/**`, `private/comunicazioni/**`, `private/opportunita/**`, `private/shell/**`, `public/auth/**`, `public/marketing/**`

### Richiesta
Dependencies: Button, Input, Textarea, Card, Container (100% of richiesta pages), PageShell (via shared layout), `tokens.funnel` (request-submission funnel), `tokens.radius`, `tokens.typography`, `tokens.shadows`, `tokens.spacing`

Files: ~12 — `comunicazioni/**` (4 pages), `flow/**` (request-flow-page + 3 shared components), `stato/request-status-page.tsx`, `verifica/request-verification-page.tsx`

### SEO
Dependencies: Badge, PageShell, `tokens.radius`, `tokens.interactive.variants.{warm,brandOutline}` (100% concentrated here, not reachable via the Button component)

Files: 9 — `profession-page-template.tsx`, `cost-city-page-template.tsx`, `cost-hub-template.tsx`, `cost-page-template.tsx`, `intervention-page-template.tsx`, `geo-cost-module.tsx`, `geo-request-form.tsx`, `related-funnel-work.tsx`, `seo-faq.tsx`, `services-hub-page.tsx`, plus 4 `not-found.tsx` route files (costi×2, interventi, professionisti)

### Legal
Dependencies: Card(+subparts), Badge, Container

Files: 4 — `cookie-policy-page.tsx`, `privacy-page.tsx`, `termini-page.tsx`, `legal-section.tsx` — all 4 share the exact same component set (Card used by every one, 100%)

### Admin
Dependencies: Button, Input, Textarea, Card(+subparts), Badge, Container, PageShell, `tokens.home.nav` (sole consumer anywhere in the codebase), `tokens.radius`, `tokens.shadows`, `tokens.layout`

Files: ~19 — `admin-shell.tsx` plus all `(protected)/**` and `(public)/**` pages listed under Button/Card/Badge above. Separate Next.js app; can migrate independently of `apps/web`, but `admin-shell.tsx` is the one file still wired to homepage-named tokens that web no longer uses.

### Ranked by workload
1. **Area Impresa** — largest file count and broadest component surface (all 10 legacy components in use).
2. **Richiesta** — fewer files, but `tokens.funnel` sits directly on the request-submission path in only 2 files, making it the highest-severity-per-file dependency in the system.
3. **Legal** — small (4 files) but all-or-nothing: every page shares the same Card-based shell.
4. **SEO** — the only area where component replacement alone won't fix the dependency; `warm`/`brandOutline` require a file-by-file token rewrite.
5. **Admin** — self-contained in its own app; carries the only remaining homepage-token leak (`tokens.home.nav`).
