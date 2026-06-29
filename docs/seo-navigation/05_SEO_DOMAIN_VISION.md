# SEO_DOMAIN_VISION.md

# Visione ufficiale del dominio SEO di Esigenta

## Scopo

Questo documento descrive l'architettura funzionale definitiva del dominio SEO di Esigenta.

Qualsiasi refactor, implementazione o modifica dovrà rispettare questa visione.

Non è un documento tecnico: definisce il comportamento del sistema.

---

# Obiettivi

* SEO scalabile.
* Esperienza utente semplice.
* Nessuna duplicazione di responsabilità.
* Dominio amministrabile tramite pannello Admin.
* I template devono essere indipendenti dalla sorgente dati.
* In futuro ogni contenuto dovrà poter essere gestito senza modificare il codice.

---

# Flusso utente

## Percorso 1

Home

↓

Interventi in evidenza

↓

Pagina SEO Intervento

↓

Guida Costi

↓

Funnel

---

## Percorso 2

Home

↓

Esplora tutti i servizi

↓

Group Service (Hub SEO)

↓

Interventi appartenenti al gruppo

Per ogni intervento devono essere disponibili due CTA:

* Approfondisci
* Richiedi preventivo

Approfondisci:

↓

Pagina SEO Intervento

↓

Guida Costi

↓

Funnel

Richiedi preventivo:

↓

Funnel precompilato

---

# Responsabilità delle pagine

## Home

Mostra gli interventi più importanti.

Non è un catalogo completo.

---

## Esplora tutti i servizi

Mostra solamente i Group Service.

Non mostra direttamente tutti gli interventi.

---

## Group Service

Ogni Group Service possiede una propria pagina Hub SEO.

La pagina deve:

* introdurre l'argomento;
* spiegare il servizio;
* elencare gli interventi disponibili;
* collegare guide e contenuti correlati;
* indirizzare l'utente verso gli interventi.

Non sostituisce le pagine degli interventi.

---

## Intervento

È la pagina SEO principale.

È la destinazione delle ricerche specifiche.

Contiene:

* descrizione;
* vantaggi;
* immagini;
* FAQ;
* CTA;
* collegamento alla guida costi;
* accesso al funnel.

---

## Guida Costi

Approfondisce:

* prezzi;
* esempi;
* fattori di costo;
* varianti locali;
* FAQ.

È collegata all'intervento.

---

## Funnel

È esclusivamente dedicato alla conversione.

---

# Entità del dominio

Il dominio SEO dovrà essere costruito attorno a queste entità:

* Group Service
* Intervento
* Guida Costi
* Località
* Media
* SEO

Le pagine sono una conseguenza delle entità, non il contrario.

---

# Visione futura

L'obiettivo finale è rendere il dominio completamente amministrabile tramite il pannello Admin.

L'editor non dovrà creare pagine manualmente.

Dovrà gestire esclusivamente le entità del dominio.

Le pagine, i collegamenti, la sitemap, i metadata e le varianti geografiche dovranno essere generati automaticamente dal sistema.

---

# Strategia di implementazione

Il refactor dovrà essere eseguito in verticale.

Ordine:

1. un solo Group Service;
2. un solo Intervento;
3. una sola Guida Costi;
4. validazione completa del flusso;
5. solo dopo estendere il modello al resto del dominio.

È vietato rifattorizzare contemporaneamente tutte le pagine del progetto.

---

# Principi architetturali del dominio

Questi principi sono stati maturati e approvati durante gli audit del dominio SEO
(Step 1.5 → 1.8). Sono vincolanti: ogni fase futura che tocca dominio, navigazione,
SEO o catalogo deve rispettarli. In caso di conflitto con un altro documento della
cartella `docs/seo-navigation/`, prevale questo documento.

## 1. Una sola fonte di verità

Per ogni concetto del dominio deve esistere una sola fonte di verità.

Non devono esistere modelli paralleli che rappresentano la stessa responsabilità.

Se due modelli descrivono lo stesso concetto, il progetto deve convergere verso
un'unica entità. Mantenere un modello editoriale separato dal modello di business è
ammesso solo se introduce un valore reale e dimostrabile per SEO, UX o contenuti — mai
per comodità implementativa o per residuo storico.

## 2. Il dominio viene prima della SEO

Il dominio rappresenta ciò che Esigenta è realmente in grado di offrire.

La SEO nasce dal dominio.

Il dominio non deve essere modellato in funzione della SEO.

## 3. Group Service

Il Group Service rappresenta un mercato coerente, non un semplice contenitore tecnico.

Ogni Group Service deve essere progettato intenzionalmente.

Non viene creato per comodità.

Non viene creato per esigenze implementative.

## 4. Interventi

Ogni intervento appartiene ad un solo Group Service.

La doppia appartenenza non esiste nel dominio.

Eventuali collegamenti tra interventi sono responsabilità della navigazione o
dell'editorialità, non del modello di dominio.

## 5. Hub

Ogni Group Service genera il proprio Hub.

L'Hub rappresenta tutti gli interventi appartenenti a quel Group Service.

L'Hub è la rappresentazione completa del catalogo per quel mercato.

## 6. SEO degli interventi

Una pagina SEO dedicata ad un intervento è una scelta editoriale.

Non tutti gli interventi devono necessariamente avere una pagina SEO.

L'assenza della pagina SEO non modifica il dominio.

## 7. Evoluzione del dominio

Il dominio non cresce aggiungendo Group Service casualmente.

Ogni nuovo Group Service deve essere progettato con attenzione.

La domanda corretta non è "Dove inseriamo questo intervento?" ma "Il dominio
rappresenta correttamente questo mercato?".

Un Group Service nasce solo quando esiste almeno un intervento reale che lo popola.
Non esistono Hub vuoti né mercati dichiarati in anticipo come "in arrivo": prima
esiste l'entità, poi nasce il gruppo che la rappresenta (coerente con il principio
"Le pagine sono una conseguenza delle entità, non il contrario").

## 8. Metodo di evoluzione

Non verranno più progettati tutti i Group Service contemporaneamente.

Da questo momento il progetto procede un mercato alla volta.

Per ogni Group Service vengono analizzati:

* nome;
* confini;
* interventi;
* comprensione lato cliente;
* comprensione lato impresa;
* valore SEO;
* semplicità futura di amministrazione.

Solo dopo l'approvazione quel Group Service viene considerato definitivo.

---

# Fonte di verità del Group Service

Decisione approvata (audit Step 1.5 → 1.8): la fonte di verità definitiva del
**Group Service** è l'entità di dominio già persistita e relazionata in modo reale
con i propri interventi (il ProjectGroup della taxonomy). Il livello editoriale
parallelo introdotto in precedenza (`PublicServiceMacroArea`) rappresenta lo stesso
concetto senza aggiungere valore reale e va ritirato come sistema parallelo.

Motivazione sintetica:

* i due modelli rappresentano oggi sostanzialmente lo stesso concetto;
* l'unico caso di reale divergenza editoriale (la presentazione unificata di
  fotovoltaico e climatizzazione) è un singolo caso, risolvibile come attributo
  dell'entità di dominio, non come ragione per mantenere due sistemi;
* il modello editoriale parallelo nasceva per un problema (la granularità di una
  vecchia entità di dominio, il TaxonomyDomain) che non esiste più dopo la
  refoundation della taxonomy;
* un'unica entità di dominio scala in modo lineare (un mercato = una riga
  amministrabile da pannello), mentre due sistemi paralleli richiedono per ogni nuovo
  mercato decisioni doppie e guardrail di sincronizzazione che crescono con il
  catalogo.

Questa convergenza è una decisione di modello, non un'implementazione: l'esecuzione
seguirà il metodo "un mercato alla volta" (principio 8) e va eseguita senza lasciare
due sistemi attivi in parallelo, senza codice legacy inutilizzato e senza doppio
flusso.

## Conseguenze sulla documentazione esistente

* `01_SCHEMA.md` sezione 20 (e in particolare 20.3, "TaxonomyDomain ≠ macro-area
  pubblica") descrive il modello a layer editoriale parallelo. Resta valida come
  registrazione storica di ciò che è stato implementato nelle fasi 19.6x, ma è
  **superata** come modello target da questo documento.
* Le fasi storiche in `02_ROADMAP.md` che hanno implementato le 12 macro aree
  pubbliche restano un log di esecuzione veritiero e non vanno riscritte: descrivono
  ciò che era corretto al loro tempo, non il modello target attuale.
