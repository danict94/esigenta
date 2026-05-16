# FixPro Taxonomy Architecture — Operational Foundation

# Obiettivo

Questo documento definisce la struttura ufficiale della taxonomy FixPro.

Serve per:

* evitare collasso architetturale
* mantenere separazione dei layer
* scalare senza caos
* evitare runtime semantico fragile
* costruire un marketplace capability-first
* evitare category-first architecture

Questo documento è la source of truth operativa della taxonomy.

---

# Principio Fondamentale

FixPro NON è:

* un CMS tassonomico
* una directory categorie
* un sistema SEO-first
* un marketplace category-first

FixPro è:

```txt
capability-first
```

---

# Principio Architetturale Centrale

La taxonomy organizza.

Le capability matchano.

La search interpreta.

Le notifiche filtrano.

L’esplorazione resta libera.

---

# Regola Critica

## CATEGORY != CAPABILITY

Categoria NON significa capability operativa.

---

# Regola Critica

## SEO != RUNTIME

SEO e navigation NON devono guidare:

* matching
* notifiche
* runtime filtering

---

# Regola Critica

## SEARCH != MATCHING

Search interpreta.

Matching filtra.

Ranking ordinerà in futuro.

---

# Layer Ufficiali

La taxonomy è divisa in 4 layer.

---

# 1. SOURCE LAYER

Responsabilità:

authoring umano.

Posizione:

```txt
packages/db/taxonomy/source
```

Qui vengono definiti:

* servizi
* interventi
* categorie
* domains

Questo layer NON è runtime.

---

# 2. BUILD LAYER

Responsabilità:

* validazione
* integrità graph
* generazione artifacts
* prevenzione collasso

Posizione:

```txt
packages/db/taxonomy/orchestrator
```

Script:

```txt
build-taxonomy.ts
generate-taxonomy.ts
seed-taxonomy.ts
```

---

# 3. GENERATED LAYER

Responsabilità:

runtime-safe artifacts.

Posizione:

```txt
packages/db/taxonomy/generated
```

Questo layer NON si modifica manualmente.

Mai.

---

# 4. RUNTIME LAYER

Responsabilità:

consumo.

Il runtime deve leggere SOLO:

* DB
  oppure
* generated artifacts

Il runtime NON deve leggere:

```txt
taxonomy/source/*
```

---

# Struttura Ufficiale

```txt
packages/db
  /prisma
  /seed
  /src

  /taxonomy

    /source
      /services
      /interventions
      /categories
      /domains
      index.ts

    /shared
      types.ts
      validators.ts
      guards.ts
      constants.ts

    /generated

    /orchestrator
      build-taxonomy.ts
      generate-taxonomy.ts
      seed-taxonomy.ts
```

---

# Definizioni Ufficiali

# SETTORE

Macro organizzazione.

Serve per:

* menu
* onboarding
* analytics
* organization

NON per matching.

---

# CATEGORIA

Identità professionale.

Esempi:

* Idraulico
* Elettricista
* Impresa edile

Serve per:

* trust
* onboarding
* organization

NON è capability operativa.

---

# SERVIZIO

Capability reale.

Questo è il cuore runtime.

Esempi:

* ristrutturazione-bagno
* demolizioni
* posa-piastrelle

Il matching usa:

```txt
requiredServices
VS
selectedServices
```

---

# INTERVENTO

Intent del cliente.

Esempi:

* rifare-bagno
* perdita-acqua
* montare-climatizzatore

L’intervento definisce:

```txt
intent -> capabilities
```

---

# DOMAIN

SEO/navigation cluster.

Serve per:

* landing pages
* SEO hubs
* discovery
* navigation

NON deve guidare runtime.

---

# ALIAS

Varianti linguistiche.

Esempi:

* rifacimento bagno
* bagno nuovo
* rifare il bagno

Gli alias NON sono capability.

Servono per:

* search
* autocomplete
* query understanding

---

# Runtime Reale

Il runtime ufficiale di FixPro è:

```txt
RequestRequiredService
VS
CompanyService
```

Fine.

---

# Pipeline Ufficiale

# SOURCE

```txt
taxonomy/source/*
```

↓

# BUILD VALIDATION

```txt
build-taxonomy.ts
```

↓

# GENERATED ARTIFACTS

```txt
taxonomy/generated/*
```

↓

# SEED DATABASE

```txt
seed-taxonomy.ts
```

↓

# RUNTIME

matching + notifications

---

# Runtime Flow Ufficiale

```txt
query utente
↓
alias resolution
↓
intervention resolution
↓
services resolution
↓
requiredServices snapshot
↓
matching
```

---

# Snapshot Principle

CRITICO.

Le richieste NON devono dipendere dal graph futuro.

Quando nasce una request:

```txt
requiredServices
```

deve essere persistito come snapshot.

---

# Runtime NON deve fare

Mai:

```txt
runtime semantic reconstruction
```

Mai:

* graph traversal complessi
* inferenza semantica runtime
* ricostruzione capability runtime
* SEO runtime inference

Il runtime deve consumare:

```txt
resolved capabilities
```

---

# Regole di Scalabilità

# 1. No Service Explosion

Un servizio rappresenta:

una capability reale.

NON una keyword SEO.

---

# SBAGLIATO

```txt
posa-gres-lucido
posa-gres-opaco
posa-gres-scuro
```

---

# CORRETTO

```txt
posa-piastrelle
```

---

# 2. Alias != Capability

Gli alias NON entrano nel matching runtime.

---

# 3. SEO != Runtime

Le landing SEO NON influenzano:

* matching
* notifiche
* routing

---

# 4. Visibility != Notification

Le aziende possono:

* vedere tutto
* cercare tutto
* esplorare tutto

Ma:

le notifiche devono essere restrittive.

---

# Come Aggiungere un Nuovo Servizio

Esempio:

```txt
impermeabilizzazione
```

Passi:

1.

Aprire:

```txt
taxonomy/source/services/edilizia.ts
```

2.

Aggiungere:

```ts
{
  slug: "impermeabilizzazione",
  name: "Impermeabilizzazione",
}
```

3.

Eseguire:

```txt
build-taxonomy.ts
```

4.

Rigenerare artifacts.

Fine.

---

# Come Aggiungere un Nuovo Intervento

Esempio:

```txt
sistemare-infiltrazione
```

Aprire:

```txt
taxonomy/source/interventions/bagno.ts
```

Aggiungere:

```ts
{
  slug: "sistemare-infiltrazione",

  name: "Sistemare infiltrazione",

  services: [
    "impermeabilizzazione",
  ],

  aliases: [
    "muro umido",
    "infiltrazione bagno",
  ],
}
```

---

# Come Aggiungere una Categoria

Esempio:

```txt
impermeabilizzatore
```

Aprire:

```txt
taxonomy/source/categories/edilizia.ts
```

Aggiungere:

```ts
{
  slug: "impermeabilizzatore",

  name: "Impermeabilizzatore",

  services: [
    "impermeabilizzazione",
  ],
}
```

---

# Come Aggiungere un Domain

Esempio:

```txt
infiltrazioni
```

Aprire:

```txt
taxonomy/source/domains/infiltrazioni.ts
```

Aggiungere:

```ts
{
  slug: "infiltrazioni",

  name: "Infiltrazioni",

  interventions: [
    "sistemare-infiltrazione",
  ],
}
```

---

# Build Validation

Il build deve controllare:

* slug duplicati
* alias duplicati
* servizi mancanti
* interventi orfani
* references invalide
* semantic duplicates

---

# Regola Critica

SE IL BUILD FALLISCE:

```txt
process.exit(1)
```

Sempre.

Mai deployare taxonomy invalida.

---

# Cosa NON Fare

NON aggiungere subito:

* AI matching
* embeddings
* vector DB
* semantic runtime
* ontology systems
* probabilistic routing
* graph engines
* ML ranking

Prima servono:

* dati reali
* runtime stabile
* capability corrette

---

# Obiettivo Reale

FixPro NON deve diventare:

```txt
mega taxonomy system
```

FixPro deve diventare:

```txt
resolved capability infrastructure
```

---

# Principio Finale

FixPro NON deve essere:

```txt
category-first
```

FixPro deve essere:

```txt
capability-first
```
