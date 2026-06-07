# Esigenta / esigenta — SEO System 2026 definitivo

## Scopo del documento

Questo documento è la sorgente operativa unica per la strategia SEO 2026 di Esigenta / esigenta.

Serve a evitare confusione tra:

- homepage
- landing SEO interventi
- catalogo interventi
- domain / macro-aree
- categorie professionali
- servizi tecnici
- guide
- pagine costi
- geo dinamica
- funnel richiesta preventivo

L'obiettivo è costruire traffico organico scalabile senza dipendere subito da ADV e senza generare migliaia di pagine deboli, duplicate o difficili da mantenere.

---

# 1. Decisione strategica definitiva

## Strategia principale

Esigenta / esigenta deve scalare con un sistema SEO ordinato:

```txt
Homepage
→ landing interventi forti
→ catalogo interventi
→ categorie professionali
→ guide / costi
→ funnel
```

La piattaforma non deve scalare creando pagine infinite.

Deve scalare creando:

```txt
poche pagine forti
+ contenuti specifici
+ collegamenti interni
+ taxonomy coerente
+ geo dinamica
+ dati reali della piattaforma
```

---

# 2. Regola mentale definitiva

## Il cliente parte dall'intervento

La logica corretta è:

```txt
Cliente → lavoro da fare → intervento → professionisti adatti → funnel
```

Non:

```txt
Cliente → categoria professionale generica → scelta confusa → funnel
```

Quindi il sito deve essere **intervento-first**.

Esempi:

```txt
Ristrutturare bagno
Riparare perdita acqua
Rifare impianto elettrico
Installare climatizzatore
Apertura CILA
Trasloco casa
```

Le categorie professionali aiutano, ma non devono dominare la navigazione cliente.

---

# 3. Architettura URL definitiva

## Homepage

```txt
/
```

Contiene:

- hero con search bar
- 6 card SEO principali
- sezione "Quanto costa" collegata alle landing
- CTA "Esplora tutti gli interventi"
- categorie professionali disponibili
- guide/costi se previste
- CTA per professionisti

---

## Landing interventi SEO

```txt
/interventi/[slug]
```

Esempi iniziali:

```txt
/interventi/ristrutturare-bagno
/interventi/rifare-impianto-elettrico
/interventi/installare-fotovoltaico
/interventi/rifare-tetto
/interventi/installare-climatizzatore
/interventi/cartongesso-e-finiture
```

Queste sono le landing principali collegate alle 6 card homepage.

---

## Catalogo interventi

```txt
/interventi
```

Mostra tutti gli interventi disponibili divisi per domain / macro-area.

Non deve essere una lista piatta.

---

## Categorie professionali

```txt
/professionisti
/professionisti/[slug]
```

Esempi:

```txt
/professionisti/idraulici
/professionisti/elettricisti
/professionisti/geometri
/professionisti/architetti
/professionisti/imprese-edili
/professionisti/giardinieri
/professionisti/traslocatori
/professionisti/imbianchini
/professionisti/cartongessisti
```

---

## Funnel

```txt
/richiesta/[slug]
/richiesta/verifica
```

Il funnel è conversione.

Non è la parte principale della SEO.

Regola consigliata:

```txt
/richiesta/[slug] = noindex
```

Le pagine funnel possono essere raggiunte da:

- search bar
- CTA nelle landing intervento
- CTA nelle guide
- CTA nelle pagine costo
- CTA nel catalogo

---

## Guide

```txt
/guide/[slug]
```

Esempi:

```txt
/guide/come-ristrutturare-bagno
/guide/come-scegliere-un-geometra
/guide/videosorveglianza-casa-cosa-sapere
/guide/come-organizzare-un-trasloco
```

Le guide servono per traffico informazionale.

Devono sempre collegare una landing intervento o un funnel.

---

## Costi

```txt
/costi/[slug]
```

Esempi futuri:

```txt
/costi/ristrutturare-bagno
/costi/impianto-elettrico
/costi/rifare-tetto
/costi/installare-climatizzatore
/costi/fotovoltaico
/costi/trasloco-casa
```

Le pagine costo non vanno create per ogni micro-servizio.

Si creano solo quando c'è abbastanza domanda e contenuto.

---

# 4. Flusso definitivo homepage

## Hero

La hero mantiene la search bar come punto principale di conversione.

Microcopy possibile:

```txt
Di che lavoro hai bisogno?
```

La search bar cerca tra:

- interventi
- alias taxonomy
- servizi tecnici
- categorie professionali
- sinonimi

Risultato click search:

```txt
/richiesta/[slug]
```

La search bar può andare direttamente al funnel perché l'utente ha già espresso un'intenzione attiva.

---

## 6 card SEO principali

Titolo sezione consigliato:

```txt
Interventi più richiesti
```

Sottotitolo consigliato:

```txt
Scegli un lavoro e scopri come ricevere preventivi da professionisti qualificati.
```

Card iniziali:

1. Ristrutturare bagno
2. Rifare impianto elettrico
3. Installare fotovoltaico
4. Rifare tetto
5. Installare climatizzatore
6. Cartongesso e finiture

Regola:

```txt
Le card homepage non aprono direttamente il funnel.
Le card homepage aprono landing SEO pubbliche.
```

Esempio:

```txt
Ristrutturare bagno
→ /interventi/ristrutturare-bagno
```

Non:

```txt
Ristrutturare bagno
→ /richiesta/rifare-bagno
```

La CTA dentro la landing porterà al funnel.

---

## Sezione "Quanto costa"

La homepage può avere una sezione costi leggera.

Esempio:

```txt
Quanto costa ristrutturare un bagno?
```

Regola importante:

```txt
Il link può puntare alla sezione interna della landing intervento.
```

Esempio:

```txt
/interventi/ristrutturare-bagno#quanto-costa
```

Non è obbligatorio creare subito:

```txt
/costi/ristrutturare-bagno
```

La pagina costo dedicata si crea solo quando c'è abbastanza contenuto e domanda SEO.

---

## CTA "Esplora tutti gli interventi"

Dopo le 6 card:

```txt
Esplora tutti gli interventi
→ /interventi
```

La pagina `/interventi` mostra il catalogo completo diviso per domain.

---

## Categorie disponibili

Titolo consigliato:

```txt
Professionisti disponibili
```

oppure:

```txt
Categorie disponibili
```

Categorie iniziali consigliate:

1. Idraulici
2. Elettricisti
3. Imprese edili
4. Geometri
5. Architetti
6. Giardinieri
7. Traslocatori
8. Serramentisti
9. Imbianchini
10. Cartongessisti

Regole:

- sezione compatta
- niente immagini pesanti
- card leggere
- icone semplici
- descrizione breve
- link a `/professionisti/[slug]`
- non deve competere con gli interventi più richiesti

---

# 5. Landing intervento SEO

## Route

```txt
/interventi/[slug]
```

## Obiettivo

La landing intervento deve:

- posizionarsi su keyword commerciali
- spiegare il lavoro
- mostrare cosa si può richiedere
- collegare professionisti adatti
- collegare interventi correlati
- integrare una sezione costi
- portare al funnel

---

## Template definitivo

Ogni landing intervento deve avere:

```txt
1. Breadcrumb
2. Hero testuale
3. CTA primaria verso funnel
4. Trust microcopy
5. Cosa puoi richiedere
6. Quando richiedere questo intervento
7. Professionisti collegati
8. Sezione "Quanto costa"
9. Fattori che influenzano il prezzo
10. Interventi correlati
11. Guide/costi collegati
12. Come funziona
13. FAQ brevi visibili
14. CTA finale
```

---

## Sezione costi interna

Ogni landing forte dovrebbe avere una sezione:

```txt
<section id="quanto-costa">
```

Contenuto minimo:

```txt
Quanto costa [intervento]?
- fascia indicativa
- fattori che cambiano il prezzo
- cosa incide sul preventivo
- quando serve sopralluogo
- modulo geo dinamico
- CTA preventivo
```

Esempio URL:

```txt
/interventi/ristrutturare-bagno#quanto-costa
```

Questa sezione può ricevere link dalla homepage.

---

## Esempio landing: ristrutturare bagno

URL:

```txt
/interventi/ristrutturare-bagno
```

H1:

```txt
Ristrutturare bagno: trova professionisti qualificati nella tua zona
```

CTA:

```txt
/richiesta/rifare-bagno
```

Cosa puoi richiedere:

```txt
- rifacimento completo bagno
- sostituzione sanitari
- sostituzione vasca con doccia
- posa piastrelle
- impianto idraulico bagno
- arredo bagno
```

Professionisti collegati:

```txt
- idraulici
- piastrellisti
- imprese edili
- muratori
```

Interventi correlati:

```txt
- ristrutturare casa
- ristrutturare cucina
- posare pavimenti
- rifare impianto idraulico
```

Sezione costi:

```txt
/interventi/ristrutturare-bagno#quanto-costa
```

Pagina costo futura, solo se serve:

```txt
/costi/ristrutturare-bagno
```

---

# 6. Pagine costo

## Regola definitiva

Le pagine costo non sono obbligatorie subito.

Prima si mette una sezione "Quanto costa" dentro la landing intervento.

Solo quando il tema ha abbastanza contenuto e domanda SEO si crea una pagina dedicata:

```txt
/costi/[slug]
```

---

## Quando creare `/costi/[slug]`

Creare una pagina costo solo se almeno una condizione è vera:

1. keyword prezzo forte
2. alta domanda commerciale
3. contenuto sufficiente
4. molte variabili di costo
5. possibilità di esempi concreti
6. collegamento forte al funnel
7. collegamento con landing intervento
8. geo dinamica utile

---

## Template pagina costo

```txt
1. Breadcrumb
2. H1: Quanto costa [intervento] nel 2026?
3. Sintesi prezzo / fascia indicativa
4. Tabella fattori di costo
5. Prezzi per tipologia lavoro
6. Esempi preventivo
7. Cosa incide sul prezzo
8. Errori da evitare
9. Quando serve sopralluogo
10. Modulo geo dinamico
11. Link alla landing intervento
12. CTA preventivo
13. FAQ visibili
```

---

## Esempi pagine costo prioritarie

```txt
/costi/ristrutturare-bagno
/costi/impianto-elettrico
/costi/rifare-tetto
/costi/installare-climatizzatore
/costi/fotovoltaico
/costi/trasloco-casa
/costi/geometra
```

Non creare subito pagine costo per micro-interventi come:

```txt
/costi/sostituire-rubinetto
/costi/montare-lampadario
/costi/pulire-vetri
/costi/tagliare-prato
```

Questi possono vivere nel catalogo o nel funnel.

---

# 7. Geo dinamica

## Regola fondamentale

La geo deve essere dinamica, non deve generare migliaia di pagine.

Non fare:

```txt
/costi/ristrutturare-bagno-catania
/costi/ristrutturare-bagno-milano
/costi/ristrutturare-bagno-roma
/interventi/ristrutturare-bagno-catania
/interventi/ristrutturare-bagno-milano
```

Fare:

```txt
/interventi/ristrutturare-bagno
/costi/ristrutturare-bagno
```

Con modulo dinamico interno:

```txt
Prezzi e professionisti disponibili nella tua zona
```

---

## Come funziona il modulo geo

Il modulo geo può cambiare in base a:

- città inserita dall'utente
- posizione scelta nel funnel
- parametro controllato non indicizzabile
- disponibilità reale dei professionisti
- dati interni futuri della piattaforma

Esempio:

```txt
Stai cercando professionisti per ristrutturare un bagno a Catania?
Descrivi il lavoro e confronta preventivi da imprese disponibili nella tua zona.
```

Ma l'URL canonical resta:

```txt
/interventi/ristrutturare-bagno
```

oppure:

```txt
/costi/ristrutturare-bagno
```

---

## Parametri geo

Se si usa un parametro:

```txt
/costi/ristrutturare-bagno?city=catania
```

Regole:

```txt
canonical → /costi/ristrutturare-bagno
no sitemap per URL parametrizzate
no indicizzazione di combinazioni city/intervento
no generazione automatica di pagine statiche per città
```

---

## Quando una pagina locale può esistere in futuro

Solo se ci sono contenuti locali reali.

Esempio accettabile futuro:

```txt
/professionisti/idraulici/roma
```

Solo se contiene:

- professionisti reali disponibili
- recensioni locali
- dati locali reali
- contenuto non duplicato
- domanda SEO forte
- manutenzione sostenibile

Non ora come priorità.

---

# 8. Catalogo `/interventi`

## Obiettivo

La pagina `/interventi` è il catalogo pubblico di tutti gli interventi disponibili.

Serve a:

- organizzare l'offerta
- migliorare linking interno
- aiutare l'utente a scoprire interventi
- collegare domain, categorie e funnel

---

## Struttura consigliata

```txt
/interventi

Hero:
Tutti gli interventi disponibili
Trova il lavoro di cui hai bisogno e scopri i professionisti più adatti.

Search/filter interno:
Cerca intervento...

Sezioni domain:
- Ristrutturazioni
- Impianti
- Idraulica
- Tetti e coperture
- Facciate
- Pavimenti
- Muratura e costruzione
- Impermeabilizzazioni
- Giardinaggio
- Pratiche edilizie
- Traslochi e sgomberi
- Pulizie
- Serramenti e infissi
- Sicurezza
```

---

## Regola click

Ogni intervento decide il link in modo deterministico:

```txt
se seoEnabled = true
→ /interventi/[slug]

se seoEnabled = false
→ /richiesta/[funnelSlug]
```

Esempio:

```txt
Ristrutturare bagno
→ /interventi/ristrutturare-bagno
```

```txt
Potare siepi
→ /richiesta/potare-siepi
```

Non è obbligatorio creare una landing SEO per ogni voce.

---

# 9. Domain / macro-aree

## Ruolo dei domain

I domain sono contenitori semantici.

Servono per organizzare gli interventi.

Non devono diventare automaticamente pagine SEO.

Regola:

```txt
domain = struttura organizzativa
domain ≠ pagina SEO automatica
```

---

## Domain attuali da mantenere e raffinare

```txt
packages/db/src/taxonomy/source/domains/costruzione.ts
packages/db/src/taxonomy/source/domains/facciate.ts
packages/db/src/taxonomy/source/domains/idraulica.ts
packages/db/src/taxonomy/source/domains/impermeabilizzazioni.ts
packages/db/src/taxonomy/source/domains/muratura.ts
packages/db/src/taxonomy/source/domains/pavimenti.ts
packages/db/src/taxonomy/source/domains/ristrutturazione.ts
packages/db/src/taxonomy/source/domains/tetti.ts
```

---

## Domain da aggiungere o valutare

```txt
packages/db/src/taxonomy/source/domains/impianti.ts
packages/db/src/taxonomy/source/domains/giardinaggio.ts
packages/db/src/taxonomy/source/domains/pratiche-edilizie.ts
packages/db/src/taxonomy/source/domains/traslochi.ts
packages/db/src/taxonomy/source/domains/pulizie.ts
packages/db/src/taxonomy/source/domains/serramenti.ts
packages/db/src/taxonomy/source/domains/sicurezza.ts
packages/db/src/taxonomy/source/domains/clima-energia.ts
packages/db/src/taxonomy/source/domains/piscine-esterni.ts
```

---

## Tipo concettuale domain

```ts
type DomainSource = {
  slug: string;
  name: string;
  description: string;
  groups: {
    title: string;
    interventionSlugs: string[];
  }[];
  categorySlugs: string[];
  guideSlugs?: string[];
  costSlugs?: string[];
  seoHubEnabled?: boolean;
};
```

---

## Domain hub futuri

Solo alcuni domain potranno diventare hub SEO futuri.

Esempi possibili:

```txt
/ristrutturazioni
/impianti
/tetti-e-coperture
```

Ma non devono essere priorità ora.

Si creano solo se:

- hanno domanda SEO forte
- hanno contenuto sufficiente
- non duplicano `/interventi`
- hanno struttura editoriale propria
- hanno collegamenti interni forti

---

# 10. Categorie professionali

## Ruolo

Le categorie professionali rappresentano chi può svolgere il lavoro.

Esempi:

```txt
Idraulici
Elettricisti
Geometri
Architetti
Imprese edili
Giardinieri
Traslocatori
Serramentisti
Imbianchini
Cartongessisti
Piastrellisti
Muratori
Termoidraulici
Falegnami
Imprese di pulizie
```

Non sostituiscono gli interventi.

---

## Route

```txt
/professionisti
/professionisti/[slug]
```

---

## Template pagina categoria

```txt
1. Breadcrumb
2. H1 categoria
3. Descrizione breve
4. Cosa può fare questo professionista
5. Interventi principali
6. Domain collegati
7. Guide/costi collegati
8. CTA cliente
9. CTA professionista
10. FAQ brevi
```

---

## Esempio: idraulici

URL:

```txt
/professionisti/idraulici
```

H1:

```txt
Idraulici: riparazioni, impianti e interventi per bagno e cucina
```

Interventi:

```txt
- riparare perdita acqua
- rifare impianto idraulico
- installare sanitari
- sostituire rubinetto
- installare scaldabagno
- sturare scarico
```

CTA cliente:

```txt
Richiedi preventivi
→ /richiesta/idraulico
```

CTA professionista:

```txt
Sei un idraulico? Iscriviti gratis
→ /area-impresa/iscriviti
```

---

# 11. Guide

## Ruolo

Le guide servono per intercettare ricerche informative.

Non devono sostituire landing e costi.

Esempi:

```txt
/guide/come-ristrutturare-bagno
/guide/cila-scia-differenze
/guide/come-scegliere-un-geometra
/guide/videosorveglianza-casa-cosa-sapere
/guide/come-organizzare-un-trasloco
```

---

## Template guida

```txt
1. Breadcrumb
2. H1 informativo
3. Risposta breve iniziale
4. Spiegazione completa
5. Quando serve un professionista
6. Errori da evitare
7. Checklist pratica
8. Link a interventi collegati
9. Link a pagina costo se esiste
10. CTA preventivo
11. FAQ visibili
```

---

## Regola guide

Ogni guida deve collegare almeno una di queste:

```txt
/interventi/[slug]
/costi/[slug]
/richiesta/[slug]
```

Niente guide isolate.

---

# 12. Indexing, canonical e sitemap

## Pagine indexabili

Mettere in sitemap solo pagine con contenuto forte:

```txt
/
/interventi
/interventi/[slug] se seoEnabled = true
/professionisti
/professionisti/[slug] se contenuto completo
/costi/[slug] se contenuto forte
/guide/[slug] se contenuto forte
```

---

## Pagine noindex

Consigliate noindex:

```txt
/richiesta/[slug]
/richiesta/verifica
risultati search interna
URL con parametri city
URL con filtri catalogo
area impresa protetta
admin
login
unauthorized
```

---

## Canonical

Ogni pagina SEO deve avere canonical chiara.

Esempi:

```txt
/interventi/ristrutturare-bagno
canonical → /interventi/ristrutturare-bagno
```

```txt
/costi/ristrutturare-bagno?city=catania
canonical → /costi/ristrutturare-bagno
```

---

## Faceted/filter URLs

Il catalogo non deve generare URL infinite.

Se ci sono filtri:

```txt
/interventi?domain=idraulica
/interventi?city=catania
/interventi?sort=popolari
```

Regole:

- non inserirli in sitemap
- noindex se necessario
- evitare combinazioni infinite
- usare stato client o hash quando possibile
- permettere crawl solo delle pagine principali utili

---

# 13. Structured data

## Priorità

Implementare solo structured data coerenti con contenuto visibile.

Priorità:

```txt
1. BreadcrumbList
2. Organization
3. WebSite / SearchAction se utile
4. Article per guide vere
5. Service solo se coerente e non forzato
```

---

## FAQ

Le FAQ sono utili per UX e contenuto.

Ma il markup FAQPage non deve essere una priorità tecnica.

Regola:

```txt
FAQ visibili sì.
FAQPage schema solo se davvero serve.
```

Non basare la strategia SEO sui rich result FAQ.

---

## Da evitare

Non usare LocalBusiness su pagine generiche se non ci sono vere entità locali.

Non usare structured data non coerenti con contenuto visibile.

---

# 14. Data model SEO consigliato

## SEO intervention landing

```ts
type SeoInterventionLanding = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  funnelSlug: string;
  domainSlug: string;
  relatedInterventionSlugs: string[];
  professionalCategorySlugs: string[];
  guideSlugs?: string[];
  costSlug?: string;
  requestItems: string[];
  costSection?: {
    title: string;
    summary: string;
    priceRange?: string;
    factors: string[];
    examples?: string[];
  };
  faq: {
    question: string;
    answer: string;
  }[];
};
```

---

## Intervention catalog item

```ts
type InterventionCatalogItem = {
  slug: string;
  label: string;
  domainSlug: string;
  group: string;
  seoEnabled: boolean;
  seoPath?: string;
  funnelSlug: string;
  professionalCategorySlugs: string[];
};
```

---

## Professional category SEO

```ts
type ProfessionalCategorySeo = {
  slug: string;
  name: string;
  h1: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  interventionSlugs: string[];
  domainSlugs: string[];
  funnelSlug: string;
  guideSlugs?: string[];
  costSlugs?: string[];
  faq: {
    question: string;
    answer: string;
  }[];
};
```

---

## Cost guide

```ts
type CostGuide = {
  slug: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  interventionSlug: string;
  funnelSlug: string;
  intro: string;
  priceSummary: string;
  factors: string[];
  priceRows: {
    label: string;
    range: string;
    note?: string;
  }[];
  examples: string[];
  geoModuleEnabled: boolean;
  faq: {
    question: string;
    answer: string;
  }[];
};
```

---

# 15. Content layer e taxonomy

## Regola importante

La taxonomy resta l'autorità semantica.

Il content SEO non deve diventare una seconda taxonomy incoerente.

Schema corretto:

```txt
taxonomy source
→ definisce interventi, servizi, categorie, domain, alias

content SEO
→ arricchisce solo le pagine pubbliche
```

---

## Layer temporaneo accettabile

Se non è ancora comodo derivare tutto dalla taxonomy server-safe, si può creare un layer temporaneo:

```txt
apps/web/src/content/seo/intervention-landings.ts
apps/web/src/content/seo/intervention-catalog.ts
apps/web/src/content/seo/professional-categories.ts
apps/web/src/content/seo/domain-catalog.ts
apps/web/src/content/seo/cost-guides.ts
```

Regole:

- piccolo
- leggibile
- type-safe
- allineato alla taxonomy
- niente duplicazioni inutili
- niente logica business dentro `packages/ui`

---

# 16. File da creare o modificare

## Homepage

```txt
apps/web/src/components/home/professional-areas.tsx
```

Possibile rename futuro:

```txt
apps/web/src/components/home/popular-interventions.tsx
apps/web/src/components/home/home-intervention-areas.tsx
```

Per ora si può modificare internamente senza rinominare se il rename crea troppo rumore.

---

## Route landing intervento

```txt
apps/web/src/app/(public)/interventi/[slug]/page.tsx
apps/web/src/app/(public)/interventi/[slug]/not-found.tsx
```

---

## Route catalogo interventi

```txt
apps/web/src/app/(public)/interventi/page.tsx
```

---

## Route categorie professionali

```txt
apps/web/src/app/(public)/professionisti/page.tsx
apps/web/src/app/(public)/professionisti/[slug]/page.tsx
apps/web/src/app/(public)/professionisti/[slug]/not-found.tsx
```

---

## Route costi future

```txt
apps/web/src/app/(public)/costi/[slug]/page.tsx
apps/web/src/app/(public)/costi/[slug]/not-found.tsx
```

Solo quando il contenuto è pronto.

---

## Route guide future

```txt
apps/web/src/app/(public)/guide/[slug]/page.tsx
apps/web/src/app/(public)/guide/[slug]/not-found.tsx
```

---

## Componenti SEO app-owned

```txt
apps/web/src/components/seo/intervention-landing-page.tsx
apps/web/src/components/seo/interventions-index-page.tsx
apps/web/src/components/seo/professional-category-page.tsx
apps/web/src/components/seo/seo-breadcrumb.tsx
apps/web/src/components/seo/related-interventions.tsx
apps/web/src/components/seo/related-professional-categories.tsx
apps/web/src/components/seo/seo-faq.tsx
apps/web/src/components/seo/seo-cta.tsx
apps/web/src/components/seo/geo-cost-module.tsx
```

Regola:

```txt
components/seo = business UI app-owned
packages/ui = primitive UI only
```

---

# 17. Design system rules

Rispettare sempre:

- usare `PageShell` e `Container`
- usare `Button`, `Card`, `Badge`, `Input`
- niente HEX hardcoded
- niente radius/shadow locali inventati
- niente componenti duplicati
- `className` solo per layout contestuale
- `packages/ui` deve restare primitivo/presentation-only
- business logic e contenuti SEO restano in `apps/web` o taxonomy/content layer

Non creare:

```txt
button custom nella pagina
card custom una tantum
token locali
colori hardcoded
layout duplicati
```

---

# 18. Roadmap implementazione

## Step 1 — Fondazione SEO interventi

Fare:

1. creare route `/interventi/[slug]`
2. creare content per 6 landing SEO
3. aggiornare card homepage verso `/interventi/[slug]`
4. creare template landing riutilizzabile
5. CTA verso `/richiesta/[slug]`
6. breadcrumb
7. metadata
8. sezione `#quanto-costa`
9. typecheck

Non fare ancora:

- tutte le landing
- pagine geo
- domain hub SEO
- pagine costi separate
- pagine servizio singole

---

## Step 2 — Catalogo `/interventi`

Fare:

1. creare route `/interventi`
2. usare domain come macro-aree
3. mostrare interventi divisi per gruppi
4. search/filter interno semplice
5. link deterministico landing/funnel
6. CTA verso richiesta

---

## Step 3 — Raffinare domain taxonomy

Fare:

1. audit domain esistenti
2. eliminare duplicazioni concettuali
3. aggiungere domain mancanti
4. collegare interventi reali
5. collegare categorie professionali
6. non creare hub SEO automatici

---

## Step 4 — Categorie professionali

Fare:

1. creare `/professionisti`
2. creare `/professionisti/[slug]`
3. iniziare con 8/10 categorie principali
4. collegare interventi/domain
5. CTA cliente
6. CTA professionista

---

## Step 5 — Prime pagine costo dedicate

Solo dopo le landing principali.

Fare:

1. scegliere 4/6 keyword costo forti
2. creare `/costi/[slug]`
3. collegare da landing
4. integrare modulo geo dinamico
5. CTA funnel
6. canonical pulita

---

## Step 6 — Guide editoriali

Fare:

1. creare prime guide informative
2. collegarle a landing e costi
3. evitare guide isolate
4. trasformare le guide in supporto al funnel

---

## Step 7 — Dati reali piattaforma

Quando la piattaforma avrà richieste e professionisti reali, usare dati aggregati per rendere i contenuti non copiabili:

- zone più richieste
- fasce prezzo osservate
- tempi medi di risposta
- professionisti disponibili
- interventi più richiesti
- esempi richieste
- recensioni
- foto lavori

Questa è la parte che può creare vantaggio reale rispetto ai competitor.

---

# 19. Criteri per decidere se creare una nuova pagina

Una nuova pagina SEO si crea solo se ha:

1. intento reale
2. contenuto specifico
3. valore diverso dalle altre pagine
4. collegamenti interni sensati
5. CTA verso funnel
6. canonical chiara
7. metadata curati
8. schema coerente se utile
9. manutenzione sostenibile

Non creare pagine solo perché esiste uno slug.

---

# 20. Criteri di accettazione

La struttura è corretta se:

- le 6 card homepage non aprono più direttamente il funnel
- le 6 card aprono landing SEO pubbliche
- ogni landing ha CTA verso funnel
- ogni landing ha sezione `#quanto-costa`
- la homepage può linkare a `#quanto-costa`
- `/interventi` mostra catalogo completo diviso per domain
- i domain non generano pagine automatiche inutili
- le categorie professionali esistono ma non dominano la navigazione cliente
- search bar continua ad aprire il funnel
- funnel consigliato noindex
- guide/costi sono pensate per ranking informazionale
- geo è dinamica e non genera migliaia di URL
- nessuna pagina sottile viene generata automaticamente
- non ci sono duplicazioni tra taxonomy, domain, categorie e servizi
- il design usa primitive condivise
- typecheck passa

---

# 21. Comandi finali

## Typecheck web

```txt
pnpm --filter web typecheck
```

Oppure, se serve root:

```txt
pnpm typecheck
```

---

## Diff da controllare

```txt
git diff -- apps/web packages/ui packages/db docs
```

Controllare:

- href homepage
- route nuove
- metadata
- canonical
- noindex dove serve
- sitemap
- assenza HEX hardcoded
- assenza componenti duplicati
- coerenza taxonomy/domain
- nessuna pagina generata senza contenuto reale

---

# 22. Prompt operativo per AI / Codex

Usare questo prompt quando si passa all'implementazione.

```txt
Devi implementare la fondazione SEO 2026 di Esigenta / esigenta seguendo il documento "Esigenta / esigenta — SEO System 2026 definitivo".

Obiettivo:
- creare landing SEO per i 6 interventi principali
- aggiornare le card homepage perché vadano a /interventi/[slug]
- mantenere la search bar verso /richiesta/[slug]
- aggiungere sezione #quanto-costa dentro ogni landing
- non creare pagine costo separate ora
- non creare pagine geo
- non generare pagine automatiche per tutti gli interventi

Regole architetturali:
- taxonomy source resta autorità semantica
- content SEO può vivere temporaneamente in apps/web/src/content/seo
- packages/ui resta solo primitive UI
- business UI resta in apps/web
- usare PageShell, Container, Button, Card, Badge, Input
- niente HEX hardcoded
- niente componenti duplicati
- className solo per layout contestuale
- Server Components di default
- TypeScript strict
- niente any casuali
- niente logica ambigua

File attesi:
- apps/web/src/app/(public)/interventi/[slug]/page.tsx
- apps/web/src/app/(public)/interventi/[slug]/not-found.tsx
- apps/web/src/content/seo/intervention-landings.ts
- apps/web/src/components/seo/intervention-landing-page.tsx
- eventuali componenti SEO piccoli e riutilizzabili
- update di apps/web/src/components/home/professional-areas.tsx

Criteri di accettazione:
- /interventi/ristrutturare-bagno funziona
- le altre 5 landing funzionano
- metadata presenti
- breadcrumb presente
- CTA funnel presente
- sezione #quanto-costa presente
- card homepage linkano alle landing
- search bar non viene cambiata se già porta al funnel
- pnpm --filter web typecheck passa
- git diff controllabile
```

---

# 23. Sintesi finale

La soluzione definitiva è:

```txt
Homepage
→ 6 card SEO forti
→ landing intervento
→ sezione quanto costa
→ CTA funnel

Homepage
→ Esplora tutti gli interventi
→ /interventi
→ domain raffinati con interventi disponibili

Homepage / sezione dedicata
→ categorie disponibili
→ /professionisti/[slug]

Search bar
→ funnel diretto

Guide e costi
→ ranking informazionale
→ landing/funnel

Geo
→ modulo dinamico
→ nessuna esplosione di URL locali
```

Questa struttura permette di ottenere traffico organico nel tempo senza ADV iniziale, evitando il rischio di migliaia di pagine duplicate e mantenendo la piattaforma scalabile, leggibile e coerente con la taxonomy.

# Addendum — Revisione Claude e correzioni SEO 2026

## Sintesi

La revisione di Claude è utile, ma va filtrata.

Da integrare:

- authority building
- link earning con asset dati
- AI-first writing
- osservatorio / preventivo index futuro
- profili professionisti futuri solo se completi
- widget preventivo come idea futura
- AI context per Codex
- sitemap con `lastmod` reale

Da correggere:

- non puntare su FAQPage schema come leva principale 2026
- non creare profili pubblici vuoti
- non usare `priority` e `changefreq` della sitemap come leva SEO

---

# 1. Authority building e link earning

## Problema

Le landing SEO da sole possono faticare a posizionarsi se il dominio non ha ancora autorevolezza.

Non bisogna comprare link o fare link building artificiale.

Bisogna creare asset che meritano citazioni naturali.

## Strategia corretta

Creare contenuti pubblici difficili da copiare, utili anche a blog, giornalisti, siti casa, forum e media locali.

Esempi futuri:

```txt
/prezzi/ristrutturazioni-italia-2026
/prezzi/costi-casa-italia
/osservatorio/ristrutturazioni
/osservatorio/interventi-casa
```

Questi asset possono mostrare:

- fasce prezzo aggregate
- interventi più richiesti
- differenze per tipologia immobile
- stagionalità delle richieste
- dati anonimi da preventivi
- trend per macro-area geografica
- tempi medi di risposta
- categorie professionali più richieste

## Regola importante

All'inizio non inventare dati.

Se non ci sono ancora dati reali della piattaforma, usare:

- fonti pubbliche citate
- range indicativi dichiarati come stime
- contenuto editoriale trasparente
- nessuna falsa precisione

Quando arrivano dati interni, creare un vero osservatorio.

---

# 2. AI Search / AI Overviews readiness

## Regola

Le pagine devono essere scritte anche per rispondere bene a query lunghe e conversazionali.

Non basta scrivere articoli lunghi.

Serve una struttura a blocchi brevi, chiari e citabili.

## Pattern contenuto consigliato

Ogni landing, guida o pagina costo dovrebbe avere:

```txt
Risposta breve subito
Spiegazione pratica
Lista dei fattori principali
Quando serve un professionista
Errori da evitare
Esempio concreto
CTA coerente
```

## Esempio

Invece di iniziare con testo generico:

```txt
La ristrutturazione del bagno è un intervento importante...
```

Usare apertura diretta:

```txt
Ristrutturare un bagno significa rifare o aggiornare sanitari, rivestimenti, impianto idraulico e finiture. Il costo cambia soprattutto in base a dimensioni, materiali, demolizioni e necessità di modificare gli impianti.
```

## Regola contenuto AI-first

Ogni pagina deve avere almeno 3 blocchi risposta:

```txt
Che cos'è / cosa include
Quanto costa / da cosa dipende
Quando richiedere un professionista
```

Questi blocchi devono essere leggibili anche fuori contesto.

---

# 3. FAQ: uso corretto nel 2026

## Decisione

Le FAQ restano utili per UX, contenuto e conversione.

Ma non devono essere considerate una leva principale di rich result.

Regola definitiva:

```txt
FAQ visibili sì.
FAQ utili sì.
FAQPage schema non prioritario.
```

## Quando usare FAQ schema

Usarlo solo se:

- le FAQ sono realmente visibili nella pagina
- sono specifiche e non generiche
- non duplicano FAQ uguali su decine di pagine
- il markup è coerente con il contenuto visibile
- non diventa un lavoro tecnico prioritario rispetto a contenuto e linking

## Componente consigliato

Il componente può chiamarsi:

```txt
SeoFaq
```

Ma deve essere prudente:

```txt
- renderizza FAQ visibili
- può opzionalmente generare JSON-LD
- JSON-LD disattivabile
- nessuna promessa di rich result
```

---

# 4. Profili pubblici professionisti e UGC

## Idea corretta, ma non subito indicizzabile

Preparare in futuro profili pubblici può essere molto utile.

Ma non bisogna creare profili vuoti o sottili.

Route futura possibile:

```txt
/professionisti/[categorySlug]/[professionalSlug]
```

Esempio:

```txt
/professionisti/idraulici/mario-rossi-idraulico-roma
```

## Quando un profilo può essere index

Solo se contiene contenuto reale:

- nome o brand professionista
- categoria
- zone servite
- servizi/interventi
- descrizione reale
- foto lavori
- recensioni verificate
- informazioni di contatto controllate
- disponibilità o segnali aggiornati

## Stato iniziale consigliato

All'inizio:

```txt
profilo pubblico esiste solo se completo
profilo incompleto = noindex
profilo senza recensioni/foto = valutare noindex
profilo duplicato = non pubblicare
```

## Structured data profili

Possibili schema futuri:

```txt
ProfilePage
LocalBusiness
Review / AggregateRating
```

Regole:

- usare LocalBusiness solo quando rappresenta un'attività reale
- usare Review solo per recensioni realmente raccolte
- niente recensioni finte
- niente markup nascosto
- niente stelline autocelebrative non valide

---

# 5. Preventivo Index / Osservatorio preventivi

## Idea

Creare in futuro una sezione pubblica con richieste e preventivi anonimizzati.

Esempio:

```txt
/preventivi
/preventivi/ristrutturazioni
/preventivi/ristrutturare-bagno
```

Esempio contenuto:

```txt
Ristrutturazione bagno 8 mq
Zona: Roma
Preventivi ricevuti: 3
Fascia osservata: 4.200 € - 6.800 €
Interventi inclusi: demolizione, impianto idraulico, piastrelle, sanitari
```

## Perché è potente

Questo crea contenuto:

- unico
- aggiornabile
- basato su esperienza reale
- utile all'utente
- difficile da copiare
- adatto a guide costo e AI Search

## Regole privacy

Non mostrare mai:

- nome cliente
- indirizzo preciso
- telefono
- email
- descrizioni identificabili
- foto private non autorizzate

Usare solo dati aggregati o anonimizzati.

## Quando attivarlo

Non subito.

Attivarlo quando ci sono abbastanza richieste reali per evitare pagine vuote.

Stato iniziale:

```txt
preparare modello dati
non indicizzare finché non c'è massa critica
```

---

# 6. Widget embeddabile stima preventivo

## Idea futura

Creare un widget leggero embeddabile da blog, siti casa o partner.

Esempio:

```txt
Stima il costo del tuo intervento
```

Il widget può portare traffico referral e brand awareness.

## Priorità

Non è priorità iniziale.

Prima:

1. landing SEO
2. catalogo
3. categorie
4. costi principali
5. dati reali

Poi valutare widget.

## Regole

Il widget non deve essere spam.

Deve dare valore reale:

- stima utile
- link brand naturale
- CTA chiara
- niente forzature SEO manipolative

---

# 7. Sitemap avanzata

## Correzione importante

Non basare la sitemap su `priority` e `changefreq`.

Regola:

```txt
Google può ignorare priority e changefreq.
```

Usare invece:

```txt
lastmod reale e verificabile
```

## Sitemap corretta

Inserire solo URL indexabili e utili:

```txt
/
/interventi
/interventi/[slug] se seoEnabled
/professionisti
/professionisti/[slug] se contenuto completo
/costi/[slug] se contenuto forte
/guide/[slug] se contenuto forte
```

## lastmod

Aggiornare `lastmod` solo quando cambia contenuto significativo:

- testo principale
- prezzi
- FAQ
- structured data
- link interni importanti
- dati osservatorio
- dati profilo professionista

Non aggiornare `lastmod` per:

- cambio copyright
- micro-refactor layout
- cambio CSS
- modifiche non visibili

---

# 8. AI context per implementazione

## Problema

Un prompt generico può non bastare.

L'AI deve conoscere il monorepo e le regole concrete del progetto.

## File consigliato

Creare:

```txt
docs/AI_CONTEXT_ESIGENTA.md
```

Contenuto minimo:

```txt
1. struttura monorepo
2. app principali
3. packages disponibili
4. regole design system
5. regole taxonomy
6. pattern route Next.js
7. pattern Server Components
8. esempi componenti UI
9. comandi typecheck
10. cose vietate
```

## Uso

Ogni task Codex/AI importante deve iniziare con:

```txt
Leggi prima docs/AI_CONTEXT_ESIGENTA.md
Leggi poi docs/ESIGENTA_esigenta_SEO_SYSTEM_2026.md
Non modificare file fuori scope.
```

---

# 9. Decisione finale sulla revisione Claude

## Da integrare

Integrare:

- authority building
- link earning con asset dati
- AI-first writing
- osservatorio / preventivo index futuro
- profili professionisti futuri solo se completi
- widget preventivo come idea futura
- AI context per Codex
- sitemap con `lastmod` reale

## Da correggere

Non accettare alla lettera:

```txt
FAQPage schema come leva principale 2026
```

Meglio:

```txt
FAQ visibili utili
schema opzionale
non prioritario
```

Non accettare alla lettera:

```txt
creare route profili pubblici anche vuote
```

Meglio:

```txt
preparare architettura futura
pubblicare/indexare solo profili completi
```

Non accettare alla lettera:

```txt
sitemap priority calcolata
```

Meglio:

```txt
sitemap pulita con URL utili e lastmod reale
```

---

# 10. Prompt operativo aggiornato per AI / Codex

```txt
Devi implementare la fondazione SEO 2026 di Esigenta / esigenta.

Prima di modificare codice:
1. leggi docs/AI_CONTEXT_ESIGENTA.md
2. leggi docs/ESIGENTA_esigenta_SEO_SYSTEM_2026.md
3. verifica taxonomy source prima di creare nuovi slug
4. verifica componenti UI esistenti prima di creare nuovi componenti

Obiettivo fase 1:
- creare landing SEO per i 6 interventi principali
- aggiornare le card homepage perché vadano a /interventi/[slug]
- mantenere la search bar verso /richiesta/[slug]
- aggiungere sezione #quanto-costa dentro ogni landing
- non creare pagine costo separate ora
- non creare pagine geo
- non creare profili professionisti pubblici ora
- non generare pagine automatiche per tutti gli interventi
- non indicizzare funnel o parametri

Regole architetturali:
- taxonomy source resta autorità semantica
- content SEO può vivere temporaneamente in apps/web/src/content/seo
- packages/ui resta solo primitive UI
- business UI resta in apps/web
- usare PageShell, Container, Button, Card, Badge, Input
- niente HEX hardcoded
- niente componenti duplicati
- className solo per layout contestuale
- Server Components di default
- TypeScript strict
- niente any casuali
- niente logica ambigua

File attesi:
- apps/web/src/app/(public)/interventi/[slug]/page.tsx
- apps/web/src/app/(public)/interventi/[slug]/not-found.tsx
- apps/web/src/content/seo/intervention-landings.ts
- apps/web/src/components/seo/intervention-landing-page.tsx
- apps/web/src/components/seo/seo-faq.tsx
- apps/web/src/components/seo/geo-cost-module.tsx
- update di apps/web/src/components/home/professional-areas.tsx

Criteri di accettazione:
- /interventi/ristrutturare-bagno funziona
- le altre 5 landing funzionano
- metadata presenti
- breadcrumb presente
- CTA funnel presente
- sezione #quanto-costa presente
- card homepage linkano alle landing
- search bar non viene cambiata se già porta al funnel
- funnel resta noindex se toccato
- nessuna pagina geo viene creata
- nessun profilo pubblico vuoto viene creato
- pnpm --filter web typecheck passa
- git diff controllabile
```

---

# 11. Sintesi aggiornata

La strategia definitiva diventa:

```txt
Fase 1:
landing interventi forti + #quanto-costa + funnel

Fase 2:
catalogo interventi + categorie professionali

Fase 3:
pagine costo forti + guide informative

Fase 4:
authority building con asset linkabili

Fase 5:
dati reali piattaforma / osservatorio

Fase 6:
profili pubblici professionisti completi

Fase 7:
widget / strumenti embeddabili / partnership
```

Regola finale:

```txt
SEO non significa creare pagine.
SEO significa costruire un sistema di pagine utili, collegate, aggiornabili e difficili da copiare.
```

---

# 36. Open Graph, social metadata e preview link

## Problema

Le landing SEO non devono essere pensate solo per Google.

Nel 2026 molte prime visite arrivano da link condivisi su:

- WhatsApp
- Telegram
- LinkedIn
- Facebook
- chat private
- strumenti AI/browser che generano preview

Ogni pagina SEO pubblica deve avere metadata completi anche per la condivisione.

---

## Regola definitiva

Ogni pagina SEO pubblica deve avere:

```txt
title
description
canonical
openGraph.title
openGraph.description
openGraph.url
openGraph.type
openGraph.images
twitter.card se utile
```

---

## Priorità implementativa

### Fase 1

Usare una immagine Open Graph default brand.

Esempio:

```txt
/public/og/default.png
```

oppure immagine già presente nel progetto.

### Fase 2 futura

Creare immagini OG specifiche per le landing principali:

```txt
og-ristrutturare-bagno.png
og-rifare-impianto-elettrico.png
og-installare-fotovoltaico.png
og-rifare-tetto.png
og-installare-climatizzatore.png
og-cartongesso-finiture.png
```

---

## Regola anti-caos

Non bloccare l'implementazione SEO se non ci sono ancora immagini OG perfette.

Prima:

```txt
metadata corretti + OG default
```

Poi:

```txt
OG specifiche per intervento
```

---

## Next.js

Usare i pattern ufficiali Next.js App Router:

```txt
generateMetadata()
metadata object
opengraph-image.tsx solo se serve davvero
```

Non creare logica duplicata.

I metadata devono derivare dal content layer SEO quando possibile.

---

# 37. Robots.txt, noindex e crawling

## Regola fondamentale

Robots.txt controlla principalmente il crawling.

Non è lo strumento principale per togliere una pagina dall'indice.

Per togliere una pagina dall'indice usare:

```txt
meta robots noindex
```

oppure protezione/auth per contenuti privati.

---

## Funnel `/richiesta/[slug]`

Le pagine funnel sono conversione, non SEO.

Regola consigliata:

```txt
/richiesta/[slug]
→ meta robots: noindex, follow
→ fuori dalla sitemap
→ NON bloccare via robots.txt se Google deve leggere il noindex
```

Motivo:

Se una pagina è bloccata da robots.txt, Google potrebbe non riuscire a leggere il meta `noindex`.

Quindi questa combinazione è sbagliata:

```txt
Disallow: /richiesta/
+ meta noindex nella pagina
```

Perché il crawler può non vedere il noindex.

---

## Robots.txt consigliato

Esempio prudente:

```txt
User-agent: *
Disallow: /admin/
Disallow: /api/
Disallow: /_next/

Allow: /
Allow: /interventi/
Allow: /professionisti/
Allow: /guide/
Allow: /costi/

Sitemap: https://www.esempio.it/sitemap.xml
```

---

## Nota su `/area-impresa/`

Valutare con attenzione.

Se tutta l'area impresa è protetta/login, può essere disallowata.

Se invece esistono pagine pubbliche utili come:

```txt
/area-impresa/iscriviti
```

allora non bloccare tutta `/area-impresa/`.

Meglio bloccare solo aree private effettive, se esistono pattern separati.

Esempio:

```txt
Disallow: /area-impresa/richieste/
Disallow: /area-impresa/configura-servizi/
```

ma lasciare libera:

```txt
/area-impresa/iscriviti
```

se è pagina pubblica di acquisizione professionisti.

---

## Robots.txt non è sicurezza

Robots.txt non protegge dati privati.

Admin, API e aree private devono essere protette da:

- autenticazione
- autorizzazione
- middleware/server checks
- controlli lato server

Non affidarsi mai a robots.txt per la sicurezza.

---

# 38. Structured data: versione prudente definitiva

## Priorità reale

Implementare structured data solo se coerenti con il contenuto visibile.

Priorità:

```txt
1. BreadcrumbList
2. Organization
3. WebSite / SearchAction se utile
4. Article per guide vere
5. ProfilePage per profili professionisti completi futuri
6. LocalBusiness solo per attività reali complete
```

---

## FAQPage

Le FAQ restano utili come contenuto visibile.

Ma FAQPage schema non è una priorità.

Regola:

```txt
FAQ visibili sì
FAQPage schema opzionale
nessuna promessa di rich result
```

---

## HowTo

Le sezioni "come funziona" sono utili nella pagina.

Ma HowTo schema non è una priorità SEO.

Regola:

```txt
HowTo come contenuto visibile → sì
HowTo JSON-LD → non prioritario
```

---

## Service schema

`Service` può essere valutato in futuro come markup semantico.

Ma non deve essere trattato come leva magica di ranking.

Regola:

```txt
Service schema opzionale
solo se coerente con contenuto visibile
solo se non crea markup artificiale
solo dopo metadata, breadcrumb e contenuti forti
```

---

## Da evitare

Non usare structured data per contenuti non visibili.

Non usare LocalBusiness su pagine generiche.

Non usare Review/AggregateRating senza recensioni reali.

Non duplicare JSON-LD identico su decine di pagine.

---

# 39. Dynamic trust signals: disponibilità, richieste e dati reali

## Idea

Le landing possono mostrare segnali dinamici basati su dati reali della piattaforma.

Esempi:

```txt
Professionisti disponibili nella tua zona
Richieste simili ricevute di recente
Tempo medio di risposta
Imprese attive per questo tipo di intervento
Preventivi ricevuti per lavori simili
```

Esempi futuri più specifici:

```txt
12 professionisti disponibili questa settimana
47 richieste simili ricevute questo mese
Tempo medio di risposta: entro 24 ore
```

---

## Regola fondamentale

Usare solo dati veri.

Non inventare numeri.

Non creare falsa scarsità.

Non mostrare "12 disponibili questa settimana" se non esiste una vera logica di disponibilità settimanale.

---

## Copy prudente iniziale

Se i dati non sono ancora solidi, usare copy generico:

```txt
Professionisti disponibili nella tua zona
```

oppure:

```txt
Confronta professionisti attivi per questo tipo di intervento.
```

Evitare:

```txt
12 disponibili questa settimana
```

finché non è verificabile.

---

## Lastmod e freshness

Non aggiornare `lastmod` solo perché cambia un contatore volatile.

Aggiornare `lastmod` solo quando cambia contenuto sostanziale:

```txt
testo principale
range prezzi
FAQ
dati osservatorio stabili
link interni importanti
sezioni nuove
```

Non aggiornare `lastmod` per:

```txt
contatore da 12 a 13
micro-variazione settimanale
cambio puramente dinamico
dato volatile non editoriale
```

---

## Dove usare questi segnali

Possibili punti:

```txt
hero landing intervento
modulo geo dinamico
sezione #quanto-costa
CTA finale
pagine costo future
profili professionisti futuri
```

---

## Regola anti-duplicazione

I trust signals non devono creare URL nuove.

Non fare:

```txt
/interventi/ristrutturare-bagno?available=12
/interventi/ristrutturare-bagno/catania/12-disponibili
```

Fare:

```txt
/interventi/ristrutturare-bagno
```

con modulo dati dinamico interno.

---

# 40. Prompt operativo Codex aggiornato — Step 0

```txt
Devi preparare il repository per l'implementazione SEO 2026 di Esigenta / esigenta.

Scope unico di questo step:
documentazione e contesto AI.

Leggi il documento SEO 2026 fornito e crea/aggiorna solo:

- docs/ESIGENTA_esigenta_SEO_SYSTEM_2026.md
- docs/AI_CONTEXT_ESIGENTA.md

Nel file docs/ESIGENTA_esigenta_SEO_SYSTEM_2026.md inserisci il documento SEO completo v3.

Nel file docs/AI_CONTEXT_ESIGENTA.md crea un contesto operativo per AI/Codex con:

1. struttura monorepo
2. app principali: apps/web e apps/admin
3. packages principali: packages/ui, packages/db, eventuali altri package rilevanti
4. regole design system
5. regole taxonomy
6. regole SEO appena definite
7. Server Components di default
8. TypeScript strict
9. comandi typecheck
10. cose vietate

Regole:
- non modificare codice applicativo
- non modificare route
- non modificare componenti
- non modificare database
- non modificare taxonomy
- non creare pagine
- non creare file fuori da docs

Output richiesto:
- elenco file creati/modificati
- breve sintesi di cosa hai inserito
- git diff -- docs

Non fare altri step.
```

---

# 41. Prompt operativo Codex aggiornato — Step 1 audit

```txt
Fai solo audit, senza modificare file.

Prima leggi:

- docs/ESIGENTA_esigenta_SEO_SYSTEM_2026.md
- docs/AI_CONTEXT_ESIGENTA.md

Poi analizza:

- apps/web/src/components/home/professional-areas.tsx
- apps/web/src/app/(public)/page.tsx
- apps/web/src/app/(public)/richiesta/[slug]/page.tsx se esiste
- apps/web/src/app se necessario per capire routing pubblico
- packages/db/src/taxonomy/source
- packages/db/src/taxonomy/source/domains
- eventuale sitemap/robots/metadata già presenti

Obiettivo:
capire come implementare in modo sicuro:

- landing /interventi/[slug]
- content layer SEO
- componenti SEO app-owned
- homepage card verso landing
- search bar verso funnel
- catalogo /interventi
- categorie /professionisti
- robots/noindex/sitemap/canonical

Output richiesto:
1. file esistenti rilevanti
2. file da modificare nei prossimi step
3. file da NON toccare
4. slug esistenti da riusare
5. pattern metadata già presenti
6. pattern UI già presenti
7. rischi tecnici
8. piano esecutivo aggiornato in massimo 10 punti

Non modificare codice.
Non proporre implementazione ancora.
```

---

# 42. Sintesi v3

La v3 aggiunge:

```txt
Open Graph e social preview
robots.txt corretto senza bloccare il noindex del funnel
structured data prudente
dynamic trust signals solo con dati reali
prompt Codex Step 0 e Step 1 aggiornati
```

Regola finale:

```txt
Il traffico organico si costruisce con pagine forti, metadata puliti, crawling controllato, dati reali e nessuna duplicazione artificiale.
```
