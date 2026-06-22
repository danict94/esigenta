TAXONOMY MODEL — FROZEN v2

Obiettivo

Ridurre la complessità della taxonomy eliminando matrici di compatibilità, relazioni inutili e duplicazioni.

Il sistema deve essere:

- semplice da mantenere
- semplice da comprendere
- scalabile a migliaia di interventi
- SEO friendly
- UX friendly

---

Entità

Category

Identità professionale.

Esempi:

- Impresa Edile
- Idraulico
- Elettricista
- Architetto
- Geometra

Risponde alla domanda:

«Chi sei?»

---

ProjectGroup

Macro area di lavoro.

ProjectGroup è un'entità di prima classe e persistita (v2). Non è più una
struttura puramente source/generated: esiste come tabella reale perché è
responsabile di:

- organizzazione del catalogo
- navigazione pubblica
- hub SEO
- discovery
- analytics
- reporting

ProjectGroup resta NON operativo: non partecipa mai a matching, dispatch,
notifiche, request o funnel routing. La sua persistenza serve solo a
sostenere i punti sopra, non a introdurre relazioni di matching.

Esempi:

- Ristrutturazioni
- Tetti
- Nuove Costruzioni
- Fotovoltaico
- Pavimenti
- Pratiche Edilizie

Risponde alla domanda:

«In quale area lavori?»

---

Intervention

Lavoro specifico.

Intervention è l'unico punto di integrazione tra taxonomy e funnel: porta
con sé `runtimePresetSlugs`, un elenco di identificatori opachi di preset
funnel. La taxonomy non conosce la logica delle capability del funnel,
porta solo il riferimento.

Esempi:

- Ristrutturare bagno
- Ristrutturare cucina
- Rifare tetto
- Installare fotovoltaico
- Presentare CILA

Risponde alla domanda:

«Quale lavoro vuoi ricevere?»

---

Alias

Sinonimi e varianti linguistiche.

Alias resta source/generated only — non esiste come tabella persistita.
Vive embedded sull'Intervention proprietario e viene normalizzato in un
artefatto generato (`aliases.generated.json`).

Utilizzati per:

- SEO
- ricerca
- matching testuale
- AI search

---

Relazioni

Schema ufficiale (v2):

Category
↓
defaultProjectGroups (UX bootstrap only)

ProjectGroup
1 → N
Intervention

Intervention
N → 1
ProjectGroup

ProjectGroup
↓
Intervention
↓
Alias

---

Regole

Category → ProjectGroup

Le Category definiscono soltanto i ProjectGroup preattivati di default
(`defaultProjectGroups`).

Esempio:

Impresa Edile

- Ristrutturazioni
- Tetti
- Nuove Costruzioni
- Pavimenti

`defaultProjectGroups` sono SOLO:

- suggerimenti di onboarding
- bootstrap UX
- raccomandazioni di default

Non sono MAI:

- permessi
- regole di compatibilità
- regole di matching
- regole di autorizzazione

Selezionare o deselezionare un ProjectGroup durante l'onboarding non crea
mai un'assegnazione di ProjectGroup da nessuna parte: si traduce sempre e
solo in selezioni di Intervention.

---

ProjectGroup → Intervention

ProjectGroup è il contenitore ufficiale e persistito degli Intervention.

Relazione: ProjectGroup 1 → N Intervention, Intervention N → 1 ProjectGroup.

Gli Intervention non esistono come file autonomi nel source tree: vivono
annidati dentro il file del loro ProjectGroup.

---

Selezione massiva (bulk selection) — UX ufficiale

ProjectGroup supporta nella UI di configurazione azienda:

- Select all interventions
- Unselect all interventions

Esempio:

▼ Ristrutturazioni

☑ Select all

☑ Ristrutturare bagno
☑ Ristrutturare cucina
☑ Ristrutturare appartamento

Importante:

Selezionare un intero ProjectGroup dalla UI NON crea un'assegnazione di
ProjectGroup. La UI espande sempre la selezione in singole Intervention.
Il dato persistito resta sempre e solo:

{
  "categoryIds": [...],
  "interventionIds": [...]
}

Mai:

{
  "projectGroupIds": [...]
}

---

Source Tree

packages/taxonomy/src/source/

categories/
├── impresa-edile.ts
├── idraulico.ts
├── elettricista.ts
├── architetto.ts
├── geometra.ts

project-groups/
├── ristrutturazioni.ts
├── tetti.ts
├── nuove-costruzioni.ts
├── fotovoltaico.ts
├── pavimenti.ts
├── pratiche-edilizie.ts

types/
├── category.ts
├── project-group.ts
├── intervention.ts
├── alias.ts

index.ts

---

Esempio Category

export const impresaEdile = {
  id: "impresa-edile",

  slug: "impresa-edile",

  name: "Impresa Edile",

  defaultProjectGroups: [
    "ristrutturazioni",
    "tetti",
    "nuove-costruzioni",
    "pavimenti"
  ]
}

---

Esempio ProjectGroup

export const ristrutturazioni = {
  id: "ristrutturazioni",

  slug: "ristrutturazioni",

  name: "Ristrutturazioni",

  interventions: [
    {
      id: "ristrutturare-bagno",

      slug: "ristrutturare-bagno",

      name: "Ristrutturare bagno",

      runtimePresetSlugs: [
        "bathroom-renovation"
      ],

      aliases: [
        "rifare bagno",
        "rifacimento bagno"
      ]
    },

    {
      id: "ristrutturare-cucina",

      slug: "ristrutturare-cucina",

      name: "Ristrutturare cucina",

      aliases: [
        "rifare cucina"
      ]
    }
  ]
}

---

UX Professionista

Step 1

Chi sei?

- Impresa Edile
- Idraulico
- Elettricista
- Architetto

---

Step 2

Caricamento automatico dei ProjectGroup di default (`defaultProjectGroups`).
Solo un suggerimento di partenza: l'utente può deselezionare liberamente
qualsiasi ProjectGroup o singola Intervention.

Esempio:

Project Group attivi:

- Ristrutturazioni
- Tetti
- Nuove Costruzioni
- Pavimenti

---

Step 3

Configurazione interventi, con selezione massiva per ProjectGroup.

Ristrutturazioni

☑ Select all

- ☑ Ristrutturare bagno
- ☑ Ristrutturare cucina
- ☐ Ristrutturare casa

Tetti

☐ Select all

- ☑ Rifare tetto
- ☐ Isolare tetto

---

Step 4

Altri ProjectGroup disponibili.

- Fotovoltaico
- Pratiche Edilizie
- Climatizzazione
- Sicurezza

L'utente può attivarli liberamente, con la stessa selezione massiva per
ProjectGroup descritta sopra.

---

Persistenza

Salvataggio azienda:

{
  "categoryIds": [
    "impresa-edile"
  ],

  "interventionIds": [
    "ristrutturare-bagno",
    "ristrutturare-cucina",
    "rifare-tetto"
  ]
}

Non salvare ProjectGroup come assegnazione azienda.

ProjectGroup è (v2) un'entità persistita per organizzazione del catalogo,
navigazione, SEO, discovery, analytics e reporting — ma resta NON
operativo: non viene mai salvato come selezione dell'azienda e non
partecipa mai al matching. La UI lo usa solo per raggruppare/espandere la
selezione di Intervention.

---

Matching

Cliente
→ Intervention

Professionista
→ Intervention

MATCH

Implementazione di riferimento:

Request.interventionId
∩
CompanyIntervention.interventionId

La Category non partecipa al matching.

Il ProjectGroup non partecipa al matching.

L'Intervention è l'unica unità di matching del sistema.

---

Target Model — entità persistite

Persistite:

- Category
- ProjectGroup
- Intervention

Source/generated only (nessuna tabella):

- Alias

Relazioni target:

ProjectGroup 1 → N Intervention
Intervention N → 1 ProjectGroup

---

Principio Finale

Category

Identità professionale

ProjectGroup

Organizzazione del catalogo, navigazione, SEO, discovery, analytics,
reporting — persistito, non operativo

Intervention

Unità centrale del sistema. Unica unità di matching. Unico punto di
integrazione con il funnel (runtimePresetSlugs)

Alias

Ricerca e SEO — source/generated only

Company

Interventi realmente attivati

{
  "categoryIds": [...],
  "interventionIds": [...]
}

Nota: valutare se salvare anche `enabledProjectGroupIds` come pura
ottimizzazione UX (per riaprire la configurazione senza doverli
ricostruire dagli interventi selezionati). Per il matching non servono in
nessun caso.
