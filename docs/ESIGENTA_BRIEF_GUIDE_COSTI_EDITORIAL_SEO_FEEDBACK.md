# Esigenta — Brief editoriale, SEO e feedback per le guide `/costi`

**Stato:** brief di riferimento / SSOT  
**Focus iniziale:** `/costi/rifare-impianto-elettrico`  
**Principio:** ciò che è condiviso deve vivere nel template/sistema comune; ciò che è specifico di una guida resta nel contenuto della singola guida.  
**Escluso per ora:** redesign finale e immagini illustrative.

---

## 1. Obiettivo

Portare le guide `/costi` di Esigenta da semplici pagine informative a un sistema editoriale strutturato, affidabile e misurabile.

L'obiettivo non è aggiungere testo o keyword in modo artificiale, ma rendere ogni guida:

- più chiara;
- più verificabile;
- più coerente;
- più facile da navigare;
- più semplice da mantenere;
- più utile per l'utente;
- misurabile tramite feedback reali.

Il primo caso di applicazione sarà la guida:

`/costi/rifare-impianto-elettrico`

ma l'architettura deve essere pensata fin dall'inizio per tutte le guide `/costi`.

---

## 2. Principio editoriale Esigenta

Il vantaggio competitivo delle guide Esigenta non deve essere “avere più testo dei competitor”.

Il principio da rendere riconoscibile è:

> **Non ti diamo solo un prezzo: ti aiutiamo a capire cosa stai pagando.**

Le guide devono quindi privilegiare:

- scenari di costo leggibili;
- inclusioni ed esclusioni chiare;
- prezzi contestualizzati;
- metodologia esplicita;
- fonti reali;
- riferimenti tecnici solo quando pertinenti;
- distinzione tra stima editoriale e preventivo reale;
- nessuna ripetizione inutile.

---

## 3. Architettura condivisa

Le responsabilità comuni alle guide `/costi` devono essere centralizzate.

Struttura concettuale suggerita:

```text
apps/web/src/site/seo/
├─ editorial/
│  ├─ authors.ts
│  ├─ publishers.ts
│  └─ cost-guide-contract.ts
│
├─ templates/
│  └─ cost-page-template.tsx
│
├─ structured-data/
│  └─ cost-guide-schema.ts
│
├─ components/
│  ├─ editorial-meta.tsx
│  ├─ guide-toc.tsx
│  ├─ methodology-note.tsx
│  ├─ related-guides.tsx
│  └─ guide-helpfulness.tsx
│
└─ content/
   └─ costs/
      ├─ rifare-impianto-elettrico.ts
      ├─ rifare-tetto.ts
      ├─ rifare-facciata.ts
      └─ ...
```

La struttura reale del repository può differire: prima di implementare bisogna ispezionare quella esistente e rispettarne le convenzioni.

---

## 4. Contratto TypeScript delle guide

Ogni guida dovrebbe essere definita tramite un contratto comune.

Esempio concettuale:

```ts
defineCostGuide({
  slug: "rifare-impianto-elettrico",

  editorial: {
    author: "daniele-sapienza",
    datePublished: "YYYY-MM-DD",
    dateModified: "2026-09-17",
  },

  methodology: {
    sourcesLabel:
      "Prezzari regionali ufficiali e confronto di mercato nazionale",
  },

  technicalReferences: [
    {
      label: "CEI 64-8",
      type: "standard",
    },
    {
      label: "DM 37/08",
      type: "law",
    },
  ],

  feedback: {
    helpfulness: true,
  },

  relatedGuides: [
    // solo collegamenti editorialmente pertinenti
  ],

  // contenuto specifico della guida
})
```

### Regola

I campi che devono esistere per tutte le guide devono essere obbligatori a livello TypeScript.

Se manca un dato fondamentale, la guida non dovrebbe poter essere considerata “completa” senza che il codice lo segnali.

---

## 5. Autore e responsabilità editoriale

Daniele Sapienza può comparire come autore o responsabile editoriale anche se non è elettricista, purché la qualifica mostrata sia vera.

Formati possibili:

### Opzione personale

**A cura di Daniele Sapienza — Esigenta**

### Opzione brand/editoriale

**A cura della redazione Esigenta**  
**Responsabile editoriale: Daniele Sapienza**

Non usare diciture come:

- “esperto elettrico”;
- “revisore tecnico”;
- “elettricista”;

se non corrispondono a qualifiche o revisioni realmente avvenute.

In futuro, quando una guida viene davvero revisionata da un professionista:

**Revisione tecnica: Nome Cognome — impresa abilitata ai sensi del DM 37/08**

La revisione tecnica deve essere separata dall'autore editoriale.

---

## 6. Data di pubblicazione e aggiornamento

Ogni guida deve poter dichiarare:

- `datePublished`
- `dateModified`

La data aggiornata deve essere visibile anche all'utente.

Esempio:

> Pubblicato il … · Aggiornato il 17 settembre 2026

### Regola importante

`dateModified` **non deve cambiare automaticamente a ogni deploy**.

Deve cambiare solo quando il contenuto editoriale della guida viene realmente aggiornato.

---

## 7. Metadata editoriale visibile

Vicino alla hero, senza appesantirla, deve essere presente un piccolo blocco editoriale.

Esempio concettuale:

> A cura di Daniele Sapienza — Esigenta  
> Aggiornato il 17 settembre 2026  
> Fasce elaborate da prezzari regionali ufficiali e confronto di mercato nazionale.

Deve essere discreto, leggibile e coerente con il design system.

---

## 8. Metodologia e fonti

La metodologia deve essere parte del sistema comune.

Ogni guida deve poter spiegare da dove derivano le fasce di prezzo.

Esempio:

> Le fasce riportate derivano dal confronto tra prezzari regionali ufficiali, voci tecniche comparabili e prezzi di mercato. Non rappresentano un preventivo e possono variare in base al sopralluogo, alla zona e alle condizioni reali del lavoro.

Il testo può essere condiviso in parte, ma deve essere possibile aggiungere note specifiche alla singola guida.

### Obiettivo

Rendere chiaro:

- cosa è una fascia editoriale;
- cosa deriva da prezzari;
- cosa è confronto di mercato;
- cosa non deve essere interpretato come preventivo.

---

## 9. Riferimenti tecnici e normativi

Il sistema comune deve supportare riferimenti tecnici opzionali:

```ts
technicalReferences?: TechnicalReference[]
```

Non tutte le guide devono avere gli stessi riferimenti.

### Impianto elettrico

Per `/costi/rifare-impianto-elettrico`:

- CEI 64-8;
- DM 37/08.

Devono essere citati solo nei punti in cui aggiungono informazione utile.

Non trasformare la guida in una raccolta normativa.

### Principio

Il template supporta i riferimenti.  
La singola guida decide quali usare.

---

## 10. Indice / sommario della guida

Le guide lunghe devono avere un indice breve e ancorato.

Esempio:

- Scenari
- Esempi di costo
- Prezzi dettagliati
- Fattori
- Approfondimenti
- FAQ

### Requisiti

- generato dal template o da una configurazione centrale;
- anchor stabili;
- nessun duplicato;
- non deve diventare un secondo menu di navigazione pesante;
- mobile-first;
- accessibile.

L'obiettivo è aiutare l'utente a raggiungere rapidamente la parte che gli interessa.

---

## 11. Structured data

Il sistema deve generare structured data coerenti con il contenuto visibile.

Da valutare/implementare nel sistema comune:

- BreadcrumbList;
- FAQPage quando la guida contiene FAQ;
- Article o altra entità editoriale adeguata;
- `author`;
- `publisher`;
- `datePublished`;
- `dateModified`.

### Regola

Lo structured data non deve contenere informazioni non mostrate o non vere.

Il markup deve riflettere il contenuto reale della pagina.

---

## 12. Internal linking

Le guide devono poter dichiarare collegamenti editorialmente pertinenti.

Non creare blocchi generici “SEO” che collegano pagine senza relazione reale.

Esempi validi:

- una guida collegata a una lavorazione citata;
- una guida correlata alla stessa ristrutturazione;
- una pagina intervento direttamente pertinente;
- un funnel specifico quando l'utente vuole richiedere il lavoro.

`relatedGuides` deve essere opzionale e gestito dal template.

---

## 13. Feedback: “Hai trovato utile questa guida?”

Introdurre un sistema reale di feedback per le guide.

### Prima fase

Mostrare un blocco discreto:

> **Hai trovato utile questa guida?**  
> Sì · No

Il voto deve essere realmente salvato.

Non deve essere un elemento solo estetico.

### Dopo il voto

Se l'utente risponde **Sì**:

> Cosa ti è stato più utile?

Se risponde **No**:

> Cosa mancava o non era chiaro?

Il commento deve essere facoltativo.

### Obiettivo

Capire:

- quali guide funzionano;
- quali guide hanno problemi;
- quali sezioni risultano poco chiare;
- quali informazioni mancano;
- quali pagine meritano priorità di revisione.

---

## 14. Metriche di utilità

Il feedback Sì/No produce metriche reali.

Esempio:

```ts
{
  helpfulYes: 37,
  helpfulNo: 4,
  helpfulTotal: 41,
  helpfulRate: 90.2
}
```

Nell'hub `/costi` si può mostrare in futuro:

> **90% l'ha trovata utile · 41 valutazioni**

Questo dato rappresenta esattamente ciò che è stato raccolto.

### Importante

Non trasformare:

- “Sì” in 5 stelle;
- “No” in 1 stella.

Sono due metriche diverse.

---

## 15. Recensioni a stelle

Le recensioni a stelle sono una possibile **seconda fase**, separata dal helpfulness.

Esempio:

> **Come valuti questa guida?**  
> ★★★★★  
> Commento facoltativo

Solo un voto esplicito a stelle può generare:

```ts
{
  ratingAverage: 4.6,
  ratingCount: 17
}
```

Le recensioni devono poter essere moderate prima della pubblicazione se contengono testo.

### Regola

Non mostrare stelline nell'hub finché non esiste un vero sistema di rating.

---

## 16. Riutilizzo dell'infrastruttura feedback

Esiste già un sistema feedback nel funnel per chiedere perché l'utente sta uscendo.

Non bisogna forzare i due casi nello stesso componente.

### Responsabilità separate

**Funnel exit feedback**

> Perché stai abbandonando la richiesta?

**Guide feedback**

> Questa guida ti è stata utile?

Sono due domini diversi.

### Cosa può essere condiviso

Se l'architettura attuale lo consente:

- repository/database layer;
- server action/API;
- anonymous session id;
- anti-duplicate;
- rate limiting;
- timestamp;
- analytics;
- eventuale dashboard/admin.

Struttura concettuale:

```text
feedback/
├─ core/
│  ├─ submit-feedback
│  ├─ rate-limit
│  ├─ anonymous-session
│  └─ repository
│
├─ funnel-exit/
│  ├─ funnel-exit-feedback.ts
│  └─ FunnelExitSurvey.tsx
│
└─ guides/
   ├─ guide-helpfulness.ts
   ├─ guide-review.ts
   ├─ GuideHelpfulness.tsx
   └─ GuideReviews.tsx
```

Se il riuso rende il sistema più complesso, mantenere implementazioni separate.

La priorità è la responsabilità chiara, non il DRY a tutti i costi.

---

## 17. Feedback nel contratto delle guide

Il template deve poter sapere se una guida usa il sistema feedback.

Esempio:

```ts
feedback: {
  helpfulness: true,
  reviews: false,
}
```

Per la prima fase:

```ts
feedback: {
  helpfulness: true,
}
```

Il sistema recensioni a stelle può essere introdotto più avanti.

---

## 18. Hub `/costi`

L'hub potrà in futuro utilizzare i dati aggregati delle guide.

Esempio card:

```text
Quanto costa rifare un impianto elettrico?
55–90 €/mq

90% utile · 41 valutazioni
```

In seguito, se esisterà un vero sistema di recensioni:

```text
4,6 ★ · 17 recensioni
```

Non mischiare le due metriche.

---

## 19. Dati proprietari Esigenta

In futuro, quando Esigenta avrà abbastanza traffico e richieste reali, le guide potranno mostrare dati proprietari verificabili.

Esempi:

- basato su N richieste;
- basato su N preventivi;
- distribuzione dei prezzi osservati;
- percentuale di utenti che hanno trovato utile la guida.

Non inventare mai questi dati.

Fino a quando il campione non esiste, non mostrare numeri artificiali.

---

## 20. Cosa non fare

- Non aggiungere testo solo per SEO.
- Non duplicare titoli o fasce di prezzo.
- Non inserire keyword artificiosamente.
- Non mostrare revisioni tecniche inesistenti.
- Non usare dati inventati.
- Non aggiornare automaticamente `dateModified` a ogni deploy.
- Non collegare guide irrilevanti solo per internal linking.
- Non trasformare helpfulness in rating a stelle.
- Non creare un unico “mega componente feedback” se aumenta accoppiamento e complessità.
- Non introdurre immagini stock solo per avere immagini.
- Non modificare il redesign in questo scope.

---

## 21. Immagini

Le immagini sono intenzionalmente **rimandate**.

In futuro privilegiare:

- schemi originali Esigenta;
- diagrammi tecnici semplificati;
- visual che spiegano davvero una lavorazione.

Evitare immagini stock decorative.

Per l'impianto elettrico, esempio futuro:

> schema semplificato quadro → circuiti → prese / punti luce

---

## 22. Redesign

Il redesign delle pagine `/costi` resta fuori da questo lavoro.

Prima:

1. sistema editoriale;
2. metadata;
3. metodologia;
4. structured data;
5. feedback;
6. pulizia contenuti delle guide.

Solo dopo verrà finalizzato il nuovo design.

---

## 23. Prima guida pilota

La prima implementazione completa deve avvenire su:

`/costi/rifare-impianto-elettrico`

Serve come pagina pilota per verificare il contratto.

### Specifico della guida elettrica

- autore/editorial meta;
- data pubblicazione/aggiornamento;
- metodologia;
- indice;
- structured data;
- CEI 64-8;
- DM 37/08;
- feedback helpfulness;
- related guides pertinenti;
- contenuto già esistente preservato salvo modifiche editoriali deliberate.

Una volta validata la pagina elettrica, il sistema condiviso viene riutilizzato nelle altre guide.

---

## 24. Sequenza di lavoro

Non implementare tutto con un unico prompt.

### Scope 1 — Fondazione editoriale

- ispezione architettura SEO esistente;
- definizione `CostGuide` / contratto;
- author registry;
- date metadata;
- metodologia;
- supporto technical references;
- structured data condivisi;
- blocco metadata visibile;
- TOC.

Applicazione pilota:
`rifare-impianto-elettrico`.

### Scope 2 — Feedback guide

- audit del feedback funnel esistente;
- decidere cosa riutilizzare;
- storage helpfulness;
- anti-duplicate;
- API/server action;
- UI Sì/No;
- commento opzionale;
- aggregazione;
- nessuna stella per ora.

### Scope 3 — Guida elettrica

- CEI 64-8;
- DM 37/08;
- verifica metodologia;
- related guides;
- audit finale contenuto + metadata + schema.

### Scope 4 — Estensione alle altre guide

Applicare lo standard condiviso alle altre `/costi`.

### Scope successivi

- immagini originali;
- recensioni a stelle;
- dati proprietari;
- dashboard/editorial analytics;
- redesign definitivo.

---

## 25. Definition of Done del sistema comune

Una nuova guida `/costi` deve poter essere creata senza ricordare manualmente ogni requisito.

Il sistema deve rendere naturale o obbligatorio definire:

- autore;
- publisher;
- data pubblicazione;
- data aggiornamento;
- metodologia;
- TOC;
- structured data;
- FAQ schema quando necessario;
- riferimenti tecnici opzionali;
- related guide opzionali;
- helpfulness;
- fonti/note;
- contenuto della guida.

La singola guida deve concentrarsi sul proprio contenuto, non sulla ricostruzione dell'infrastruttura.

---

## 26. Principio finale

**Template comune per il rigore.  
Contenuto specifico per la competenza.  
Feedback reale per capire cosa migliorare.**

La guida elettrica è il primo banco di prova; non deve diventare un'eccezione architetturale.
