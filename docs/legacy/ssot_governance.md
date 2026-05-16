````md
# FIXPRO V2 — ARCHITETTURA FONDATIVA

## Visione

FixPro NON deve essere un “gestionale con pagine pubbliche”.

FixPro deve essere:
- un marketplace moderno
- orientato al consumatore
- editoriale
- veloce
- minimal
- fluido
- mobile-first
- trust-first

L’esperienza deve sembrare:
- semplice lato cliente
- professionale lato impresa
- invisibile lato infrastruttura

---

# PRINCIPI ASSOLUTI

## 1. Public-first architecture

La parte pubblica è il core del prodotto.

NON l’area dashboard.

Il valore principale nasce da:
- SEO
- funnel richieste
- matching
- profili imprese
- conversione
- fiducia

---

## 2. Cliente ≠ gestionale

Il cliente NON usa FixPro come software.

Il cliente vuole:
- inviare richiesta
- seguire richiesta
- parlare con professionisti
- lasciare recensione

Fine.

Quindi:
- NO sidebar cliente
- NO dashboard pesante
- NO pannelli enterprise
- NO UX da SaaS gestionale

Cliente = light account.

---

## 3. Professionista = workspace

L’area impresa è il vero workspace operativo.

Deve essere:
- pulita
- larga
- moderna
- continua
- editoriale
- content-first

NON:
- box-heavy
- sidebar-heavy
- dashboard enterprise vecchio stile

Target UX:
- Stripe
- Linear
- Shopify
- Notion light

---

## 4. Admin completamente separato

Admin NON deve condividere:
- layout
- shell
- UX
- componenti business

con il prodotto pubblico.

Admin = strumento interno operativo.

---

# STRUTTURA APPLICATIVA

## Monorepo unico

Repository unico con separazione chiara.

```txt
/apps
  /web
  /admin

/packages
  /ui
  /db
  /api
  /shared
  /config
````

---

# APPS

## apps/web

Contiene:

* pubblico
* cliente light
* area impresa

NON contiene:

* admin interno
* moderazione
* gestione sistema

---

## apps/admin

Contiene:

* moderazione
* taxonomy
* antifrode
* audit
* supporto
* billing
* utenti
* gestione piattaforma

Completamente separata.

---

# PACKAGES

## packages/ui

Single Source Of Truth for shared UI primitives.

Contiene:

* design tokens
* layout primitives
* reusable UI primitives
* UI utilities
* spacing system

NESSUNA duplicazione UI.

NON contiene:

* shell applicative
* navigazione prodotto
* flow business
* composizione marketplace

---

## packages/db

SSOT Prisma/database.

Contiene:

* schema
* migration
* query shared
* model types

---

## packages/api

SSOT backend business logic.

Contiene:

* tRPC
* auth guards
* matching
* taxonomy
* services
* mail
* permissions

NO logica sparsa nelle app.

---

## packages/shared

Costanti e helper condivisi:

* enums
* config
* static maps
* validators
* utility pure

---

## packages/config

Configurazioni condivise:

* eslint
* typescript
* prettier
* tailwind
* env validation

---

# DESIGN SYSTEM

## Tailwind CSS v4

Tailwind v4 è lo standard.

Regole:

* utility-first
* no CSS legacy sparso
* no style inline casuali
* no componenti hardcoded

---

# GLOBAL LAYOUT SYSTEM

Esiste UN SOLO sistema layout globale.

Definito nel design system.

Deve controllare:

* container widths
* spacing scale
* section rhythm
* typography rhythm
* responsive behavior
* navigation structure

---

# SHELL SYSTEM

## Public Shell

Esperienza:

* editoriale
* immersiva
* leggera

Include:

* navbar
* mobile navigation
* footer
* section spacing
* typography rhythm

---

## Client Shell

Minimalissima.

Contiene:

* richieste
* messaggi
* recensioni
* tracking

NO sidebar gigante.

---

## Pro Shell

Workspace professionale.

Contiene:

* top navigation
* workspace sections
* content layout
* analytics
* lead management

Sidebar:

* opzionale
* minimale
* non dominante

---

## Admin Shell

Separata completamente.

Può essere più tecnica.

---

# UX PRINCIPLES

## NO dashboard finta

Non creare:

* statistiche decorative
* card inutili
* pannelli riempitivi
* box senza valore

Ogni elemento deve avere:

* funzione
* priorità
* gerarchia

---

## NO UI rumorosa

Evitare:

* gradienti invasivi
* glow
* troppe ombre
* troppe card
* bordi casuali

---

## Typography-first

La UI deve vivere di:

* spaziatura
* ritmo
* tipografia
* gerarchia
* aria

NON di box.

---

## Mobile-first reale

Ogni esperienza nasce mobile-first.

La desktop version:

* espande
* non reinventa

---

# REQUEST SYSTEM

## Guest-first

Le richieste DEVONO poter essere inviate senza registrazione obbligatoria.

Flow:

1. bisogno
2. località
3. dettagli
4. email/telefono
5. invio

Dopo invio:

* magic link
* soft account
* tracking richiesta

---

# AUTH MODEL

## Cliente

Preferire:

* magic link
* account soft
* onboarding progressivo

NON:

* signup aggressivo

---

## Professionista

Auth completa:

* email/password
* business verification
* onboarding strutturato

---

# REVIEW SYSTEM

Le recensioni DEVONO essere:

* collegate a richiesta reale
* collegate a lavoro reale
* anti-spam
* verificabili

NO recensioni libere anonime.

---

# SSOT RULES

## Single Source Of Truth assoluto

Ogni dominio deve avere:

* un owner
* un punto unico
* una logica unica

NO:

* duplicazioni
* fallback silenziosi
* helper clonati
* query duplicate

---

# UI RULES

## Componenti

Ogni componente deve essere:

* riusabile
* minimale
* composabile
* accessibile

---

## Layout

Layout:

* larghi
* fluidi
* respirati

NON:

* compressi
* boxati
* enterprise anni 2015

---

# DEVELOPMENT PRINCIPLES

## Rifondare ≠ rompere

Obiettivo:

* mantenere dominio business valido
* rifondare UX e architettura

---

# PRIORITÀ V2

## PRIORITÀ 1

* design system
* shell system
* navigation architecture
* spacing system
* typography system

---

## PRIORITÀ 2

* funnel richieste
* public experience
* SEO structure
* mobile experience

---

## PRIORITÀ 3

* workspace impresa
* lead management UX
* analytics UX

---

## PRIORITÀ 4

* admin hardening
* moderation tools
* antifrode
* audit

---

# OBIETTIVO FINALE

FixPro deve sembrare:

NON:

* un gestionale

MA:

* una piattaforma moderna
* affidabile
* veloce
* premium
* editoriale
* semplice da usare
* professionale senza pesantezza

```
```
REGOLA FONDATIVA FIXPRO V2

Ogni pagina/componente deve essere:

type-safe
server-safe
Vercel-safe
SSR-safe
hydration-safe
strict-mode-safe

Niente codice “che funziona e basta”.

REGOLE ARCHITETTURALI
1. TypeScript strict sempre

Mai:

any casuali
cast inutili
logica ambigua
2. Server Components di default

Client component SOLO se serve:

state
event handlers
browser APIs
3. Zero logica duplicata

SSOT assoluto:

UI
domain
config
API
4. No componenti monolitici

Separare:

shell
sections
blocks
primitives
5. No CSS casuale

Solo:

Tailwind v4
design tokens
spacing system
PRINCIPIO CENTRALE FIXPRO V2

Ogni decisione deve favorire:

scalabilità
leggibilità
separazione responsabilità
manutenzione
prevedibilità
auditabilità
evoluzione futura

NON velocità momentanea.

REGOLE FONDATIVE
1. UNA RESPONSABILITÀ = UN POSTO

Mai:

logica sparsa
helper duplicati
config duplicate
query duplicate
componenti quasi uguali

Ogni dominio ha:

owner chiaro
cartella chiara
SSOT chiaro
2. NO “SMART COMPONENTS” GIGANTI

Separare:

UI
data
orchestration
business logic
3. NO FILE MOSTRO

Se un file:

cresce troppo
fa troppe cose
diventa difficile da leggere

si divide.

4. NO ARCHITETTURA “MAGICA”

Evitare:

convenzioni oscure
fallback silenziosi
auto-behavior nascosti
helper globali imprevedibili

Il codice deve essere:

esplicito
tracciabile
auditabile
5. DESIGN SYSTEM CENTRALIZZATO

Mai:

spacing random
padding inventati
colori hardcoded
radius casuali

Tutto deve derivare da:

token
layout rules
typography rules
6. SERVER FIRST

Di default:

Server Components
fetch server-side
rendering prevedibile

Client solo quando necessario.

7. DOMAIN FIRST

Prima:

lifecycle
entità
relazioni
responsabilità

DOPO:

UI
feature
8. EVITARE RIDONDANZE

Mai:

stessa query in 4 posti
stessi tipi in 3 file
stessa UI copiata
stessa validazione duplicata
9. STRUTTURA PREVEDIBILE

Ogni sviluppatore deve poter capire:

dove sta una cosa
perché esiste
chi la usa
cosa rompe

in pochi minuti.

10. MAI OTTIMIZZARE PRESTO

Prima:

architettura corretta

Poi:

performance
caching
micro ottimizzazioni
FILOSOFIA FIXPRO V2

NON:

“fare feature”

MA:

costruire una piattaforma mantenibile 5+ anni
