# Esigenta — SEO Navigation Schema

Versione: 1.0
Stato: APPROVATO COME BASE DI LAVORO
Ambito: `apps/web` pubblico, SEO, home, servizi, costi, funnel
Ultimo aggiornamento: 2026-06-18
Aggiornamento Phase 19.6F: vedi sezione 20 — Modello /servizi: Conversion Hub
Taxonomy-Backed. Sostituisce/estende il modello a 4 stati della sezione 8 (mantenuta
per storico, vedi nota lì).

---

## 1. Scopo del documento

Questo documento definisce lo schema ufficiale per la navigazione SEO e commerciale di Esigenta.

L’obiettivo principale di Esigenta è acquisire clienti tramite traffico organico Google, senza dipendere da ADV nella fase iniziale.

Questo schema serve a evitare:

* sezioni pubbliche incomplete;
* link morti;
* guide promesse ma inesistenti;
* pagine SEO duplicate o sottili;
* confusione tra servizi, interventi, guide costo e funnel;
* mismatch tra home, SEO registry, taxonomy e funnel.

Questo documento è vincolante per ogni fase futura che tocca:

* home;
* servizi;
* interventi;
* guide ai costi;
* funnel richiesta;
* internal linking;
* SEO landing pages;
* route pubbliche.

---

## 2. Principio madre

Esigenta non deve sembrare un sito con “6 interventi e basta”.

La home mostra solo una selezione di servizi in evidenza.

Il catalogo completo deve vivere in un hub servizi.

Le guide ai costi devono vivere in un hub editoriale separato.

Il funnel resta il sistema operativo per raccogliere richieste.

Schema mentale:

```txt
Home = vetrina e smistamento
/servizi = catalogo servizi ampio
/interventi/[slug] = pagina servizio/intervento SEO attuale
/costi = hub editoriale prezzi
/costi/[slug] = guida costo nazionale
/costi/[slug]/[citySlug] = guida costo locale
/richiesta/[funnelSlug] = funnel operativo
```

---

## 3. Route pubbliche ufficiali

### 3.1 Home

Route:

```txt
/
```

Ruolo:

```txt
Vetrina principale.
Introduce Esigenta.
Mostra i servizi più richiesti.
Guida verso catalogo servizi, guide costi e funnel.
```

La home non è:

```txt
un catalogo completo;
una lista di tutte le pagine SEO;
un hub costi completo;
una copia di /servizi;
una copia di /costi.
```

La home deve contenere solo elementi reali, cliccabili e coerenti.

---

### 3.2 Hub servizi

Route target:

```txt
/servizi
```

Ruolo:

```txt
Catalogo pubblico ampio dei servizi disponibili su Esigenta.
```

L’hub servizi deve far capire che Esigenta copre più dei 6 servizi in evidenza nella home.

Esempi di categorie:

```txt
Ristrutturazioni
Impianti
Energia
Pratiche edilizie
Tecnici e progettazione
Finiture
Manutenzione
```

Esempi di servizi o voci mostrate:

```txt
Ristrutturare bagno
Rifare tetto
Installare fotovoltaico
Installare climatizzatore
Rifare impianto elettrico
Cartongesso e finiture
Pratica CILA
SCIA
APE
Geometra
Architetto
Direzione lavori
Computo metrico
Sanatoria edilizia
```

L’hub servizi può mostrare voci che non hanno ancora pagina SEO dedicata, ma solo se hanno una destinazione reale.

Destinazioni ammesse:

```txt
pagina SEO reale;
funnel reale pre-orientato;
voce non cliccabile chiaramente informativa;
voce nascosta.
```

Destinazioni vietate:

```txt
href="#";
pagina inesistente;
card apparentemente cliccabile senza azione;
route futura non ancora implementata.
```

---

### 3.3 Pagine servizio/intervento attuali

Route attuale:

```txt
/interventi/[interventoSlug]
```

Ruolo:

```txt
Pagina SEO service intent.
Risponde a “voglio fare questo lavoro/servizio”.
Porta al funnel tramite funnelSlug.
```

Esempi attuali:

```txt
/interventi/ristrutturare-bagno
/interventi/rifare-impianto-elettrico
/interventi/installare-fotovoltaico
/interventi/rifare-tetto
/interventi/installare-climatizzatore
/interventi/cartongesso-e-finiture
```

Questa route resta valida nel breve periodo perché esiste già e funziona.

Non va migrata a `/servizi/[slug]` durante una fase di cleanup o release readiness, salvo decisione esplicita dedicata.

---

### 3.4 Possibile route futura servizio

Route futura possibile:

```txt
/servizi/[serviceSlug]
```

Ruolo futuro:

```txt
Pagina canonica servizio.
Sostituisce o affianca /interventi/[slug].
```

Questa route non è obbligatoria per la release iniziale.

Una migrazione da `/interventi/[slug]` a `/servizi/[slug]` richiede una fase dedicata con:

```txt
redirect strategy;
canonical strategy;
sitemap update;
link interni aggiornati;
test 404/301;
verifica Search Console post-release.
```

Fino a nuova decisione, `/interventi/[slug]` resta la route servizio SEO attiva.

---

### 3.5 Hub costi

Route target:

```txt
/costi
```

Ruolo:

```txt
Hub editoriale delle guide ai costi.
```

Questo hub è obbligatorio per release pulita.

Motivo:

```txt
Le guide costi reali non devono essere orfane.
La home non deve promettere “vedi tutte le guide” se /costi non esiste.
Google e utenti devono poter raggiungere le guide tramite navigazione interna.
```

L’hub `/costi` non deve essere una gallery fotografica.

Formato consigliato:

```txt
lista editoriale;
piccola tabella;
gruppi per categoria quando ci sono abbastanza guide;
nessuna categoria vuota;
nessuna guida inesistente.
```

Con una sola guida pubblicata, `/costi` può essere una lista piatta.

Le categorie vanno introdotte solo quando esiste massa critica.

---

### 3.6 Guida costo nazionale

Route:

```txt
/costi/[costSlug]
```

Ruolo:

```txt
Pagina informational intent.
Risponde a “quanto costa X”.
```

Esempio:

```txt
/costi/ristrutturare-bagno
```

Questa pagina deve contenere:

```txt
range prezzo chiaro;
fattori che influenzano il costo;
esempi concreti;
FAQ;
CTA verso funnel;
link alla pagina servizio/intervento collegata;
eventuale link alle varianti città.
```

---

### 3.7 Guida costo locale

Route:

```txt
/costi/[costSlug]/[citySlug]
```

Ruolo:

```txt
Pagina local informational intent.
Risponde a “quanto costa X a città”.
```

Esempi:

```txt
/costi/ristrutturare-bagno/catania
/costi/ristrutturare-bagno/milano
```

Regole:

```txt
Non creare pagine città thin.
Non creare pagine città solo cambiando il nome città.
Ogni pagina locale indicizzabile deve avere contenuto locale sufficiente.
Le città devono passare da geo registry e policy indexability.
```

---

### 3.8 Funnel richiesta

Route:

```txt
/richiesta/[funnelSlug]
```

Ruolo:

```txt
Conversione.
Raccoglie la richiesta dell’utente.
```

Il funnel resta operativo e basato su `funnelSlug`.

Il funnel può ricevere in futuro un task o sotto-servizio selezionato, per esempio:

```txt
/richiesta/rifare-bagno?task=sostituzione-vasca-con-doccia
```

La forma esatta del parametro va decisa tecnicamente nella fase dedicata.

---

## 4. Concetti ufficiali

### 4.1 ServiceCategory

Una categoria di servizi.

Esempi:

```txt
Ristrutturazioni
Impianti
Energia
Pratiche edilizie
Tecnici e progettazione
Finiture
Manutenzione
```

Serve per organizzare `/servizi`.

Non coincide necessariamente con taxonomy interna.

---

### 4.2 ServicePage

Una pagina servizio/intervento pubblica.

Esempi:

```txt
Ristrutturare bagno
Rifare tetto
Installare fotovoltaico
Installare climatizzatore
Rifare impianto elettrico
Cartongesso e finiture
Pratica CILA
APE
Geometra
```

Nel breve periodo una `ServicePage` può vivere su:

```txt
/interventi/[slug]
```

Nel futuro può vivere su:

```txt
/servizi/[slug]
```

---

### 4.3 ServiceTask

Un sotto-servizio o lavoro specifico selezionabile.

Esempi per bagno:

```txt
sostituzione vasca con doccia
rifacimento piastrelle bagno
installazione sanitari
rifacimento impianto idraulico bagno
rifacimento impianto elettrico bagno
demolizione bagno
posa pavimento bagno
```

Questi task non diventano pagine SEO adesso.

Devono poter essere mostrati dentro una pagina servizio o dentro `/servizi`, ma il click deve portare a una destinazione reale.

Destinazione ideale iniziale:

```txt
funnel pre-orientato
```

Esempio concettuale:

```txt
/interventi/ristrutturare-bagno
→ click “sostituzione vasca con doccia”
→ /richiesta/rifare-bagno?task=sostituzione-vasca-con-doccia
```

Un `ServiceTask` può diventare in futuro una pagina SEO solo se ha:

```txt
volume di ricerca;
intento chiaro;
valore commerciale;
contenuto utile sufficiente;
funnel coerente.
```

---

### 4.4 FunnelIntent

Il mapping operativo tra pagina pubblica e funnel.

Esempi:

```txt
public slug: ristrutturare-bagno
funnelSlug: rifare-bagno

public slug: rifare-impianto-elettrico
funnelSlug: impianto-elettrico-nuovo

public slug: cartongesso-e-finiture
funnelSlug: fare-lavori-cartongesso
```

Lo slug pubblico e lo slug funnel non devono per forza coincidere.

Lo slug pubblico serve a SEO e utenti.

Il `funnelSlug` serve al sistema operativo di richiesta.

---

### 4.5 CostGuide

Una guida ai costi.

Esempi:

```txt
Quanto costa ristrutturare un bagno
Costo intonaco al mq
Costo posa piastrelle al mq
Costo punto luce
Costo pratica CILA
```

Una `CostGuide` può avere:

```txt
pagina nazionale;
pagine città;
link a servizio collegato;
CTA verso funnel;
FAQ;
prezzi base;
eventuali dati locali.
```

---

## 5. Relazione tra SEO, taxonomy e funnel

### 5.1 Taxonomy

La taxonomy definisce il dominio operativo dei servizi e dei funnel.

Risponde a:

```txt
Quali richieste può gestire Esigenta?
Quali servizi esistono nel dominio prodotto?
Quale funnel/preset usare?
```

La taxonomy non deve diventare fonte di immagini marketing, copy home o contenuti SEO editoriali.

---

### 5.2 SEO registry

Il registry SEO definisce le pagine pubbliche indicizzabili.

Risponde a:

```txt
Quali pagine pubbliche esistono?
Quali URL sono pubblicati?
Quali slug SEO usiamo?
Quali pagine sono featured?
Quali pagine hanno guida costo collegata?
```

Il registry SEO può leggere/mappare verso taxonomy tramite `funnelSlug`.

Non deve duplicare logiche operative del funnel.

---

### 5.3 Home

La home non deve inventare slug isolati.

La home deve mostrare contenuto derivato da una fonte verificabile.

Obiettivo futuro:

```txt
featured services derivati dal registry SEO/servizi
```

Non da array scollegati dentro il componente React.

---

## 6. Stato delle 6 card attuali

Le 6 card attuali in home sono tecnicamente funzionanti ma strutturalmente fragili.

Stato:

```txt
READY_FOR_RELEASE come comportamento utente attuale.
DA_RIALLINEARE come architettura.
```

Motivo:

```txt
Sono hardcoded dentro il componente home.
Non derivano da taxonomy.
Non derivano dal registry SEO.
Funzionano perché gli slug coincidono manualmente con pagine SEO reali.
```

Decisione:

```txt
Non riscrivere di corsa le 6 card durante il cleanup guide costi.
Non considerarle però come modello definitivo.
Migrare in una fase dedicata verso featured services/homeFeature.
```

---

## 7. Home schema ufficiale

La home deve seguire questo schema:

```txt
Hero / ricerca / CTA principale
→ Servizi più richiesti
→ CTA “Esplora tutti i servizi”
→ Come funziona
→ CTA professionisti o fiducia
→ Guide ai costi compatte
→ CTA finale richiesta preventivi
```

### 7.1 Servizi più richiesti

Formato:

```txt
card visuali con foto;
massimo 6-8 voci;
solo servizi reali;
link reali;
nessun placeholder.
```

Questa sezione non rappresenta tutto il catalogo.

Rappresenta solo i servizi più importanti o più richiesti.

Label preferita:

```txt
Servizi più richiesti
```

Da evitare come label principale:

```txt
Interventi più richiesti
```

Motivo:

```txt
“Servizi” include anche pratiche, tecnici, progettazione, geometri, APE, CILA, SCIA.
“Interventi” è troppo stretto e fisico.
```

---

### 7.2 Guide ai costi in home

Formato:

```txt
lista editoriale compatta;
no card fotografiche grandi;
solo guide reali;
link reali;
CTA verso /costi solo se /costi esiste.
```

La home non deve mostrare guide non pubblicate.

Vietato:

```txt
guide finte;
card non cliccabili;
href="#";
immagini per micro-guide;
sezione duplicata visivamente rispetto ai servizi.
```

Esempio corretto:

```txt
Guide ai costi
- Quanto costa ristrutturare un bagno
  Range sintetico + link a /costi/ristrutturare-bagno

Vedi tutte le guide
→ /costi
```

---

## 8. Hub servizi schema ufficiale

> **NOTA (Phase 19.6F):** il modello a 4 stati (SEO_PAGE/FUNNEL_ONLY/PLANNED/HIDDEN)
> descritto in questa sezione è quello implementato in Phase 19.6 con 6 voci curate a
> mano. Resta storicamente corretto per descrivere cosa esiste oggi nel codice, ma è
> **superato** come modello target dalla sezione 20 (modello a 7 stati,
> taxonomy-backed, conversion hub). Non implementare nulla di nuovo basandosi su
> questa sezione: usare la sezione 20.

Route:

```txt
/servizi
```

Ruolo:

```txt
Mostrare il catalogo ampio di ciò che Esigenta può gestire.
```

L’hub servizi deve includere sia servizi con pagina SEO sia servizi funnel-only.

Ogni voce deve avere uno stato.

Stati ammessi:

```txt
SEO_PAGE
FUNNEL_ONLY
PLANNED
HIDDEN
```

### 8.1 SEO_PAGE

Voce con pagina pubblica reale.

Esempio:

```txt
Ristrutturare bagno
→ /interventi/ristrutturare-bagno
```

### 8.2 FUNNEL_ONLY

Voce senza pagina SEO, ma con funnel reale.

Esempio:

```txt
Sostituzione vasca con doccia
→ /richiesta/rifare-bagno?task=sostituzione-vasca-con-doccia
```

### 8.3 PLANNED

Voce prevista ma non ancora pubblica.

Non deve essere cliccabile in produzione.

Può essere tenuta nel registry come pianificazione, ma non mostrata se crea aspettativa falsa.

### 8.4 HIDDEN

Voce non visibile.

---

## 9. Pagina servizio/intervento schema ufficiale

Una pagina servizio/intervento deve diventare un nodo SEO e conversione.

Esempio:

```txt
/interventi/ristrutturare-bagno
```

Sezioni consigliate:

```txt
Hero servizio
CTA richiesta preventivi
Cosa include il servizio
Lavori o sotto-servizi disponibili
Quanto costa
Link alla guida costo
Servizi correlati
FAQ
CTA finale
```

### 9.1 Sotto-servizi

I sotto-servizi devono poter essere cliccabili verso il funnel.

Esempio bagno:

```txt
Sostituzione vasca con doccia
Rifacimento piastrelle bagno
Installazione sanitari
Rifacimento impianto idraulico bagno
Rifacimento impianto elettrico bagno
Demolizione bagno
Posa pavimento bagno
```

Questi non diventano pagine SEO nella fase iniziale.

Diventano task funnel-only.

---

## 10. Hub costi schema ufficiale

Route:

```txt
/costi
```

Formato iniziale:

```txt
titolo chiaro;
descrizione breve;
lista guide pubblicate;
nessuna categoria vuota;
nessuna immagine obbligatoria;
link reali.
```

Con una sola guida pubblicata, usare lista piatta.

Quando ci saranno più guide, introdurre categorie.

Categorie possibili:

```txt
Bagno
Tetto e coperture
Impianti
Energia
Finiture
Pratiche edilizie
Tecnici e progettazione
```

Regola:

```txt
Una categoria appare solo se contiene almeno una guida pubblicata.
```

---

## 11. Micro-guide costo

Esempi:

```txt
Costo intonaco al mq
Costo pittura al mq
Costo posa piastrelle al mq
Costo cartongesso al mq
Costo punto luce
```

Regole:

```txt
Non usare card fotografiche grandi.
Non creare pagine se non c’è contenuto utile.
Non mostrarle in home se non sono pubblicate.
Non creare hub caotici pieni di micro-link.
```

Formato ideale:

```txt
lista;
tabella;
categoria;
link testuale.
```

---

## 12. Professionisti registrati

Il modello “professionisti disponibili per questo servizio” può essere utile, ma non è parte della release iniziale se non ci sono dati reali sufficienti.

Stato:

```txt
POST_RELEASE
```

Prima di mostrare professionisti specifici servono dati reali:

```txt
aziende registrate;
copertura territoriale;
categorie abilitate;
stato verifica;
recensioni o segnali fiducia;
eventuali lavori/foto;
disponibilità per servizio/città.
```

Fino ad allora, usare solo copy prudente.

Esempio ammesso:

```txt
Con Esigenta puoi confrontare professionisti e imprese disponibili nella tua zona.
```

Esempio vietato se non supportato da dati:

```txt
I migliori professionisti per ristrutturare il bagno a Catania
```

---

## 13. Regole anti-figuraccia

Queste regole sono vincolanti.

### 13.1 Nessun link morto

Vietato:

```txt
href="#"
```

Vietato anche:

```txt
card apparentemente cliccabile senza link;
CTA che non porta da nessuna parte;
link a route non implementata.
```

---

### 13.2 Nessuna pagina promessa ma inesistente

La home, `/servizi` e `/costi` non devono mostrare voci che promettono pagine inesistenti.

Se una guida non esiste, non appare come guida pubblicata.

Se un servizio non ha pagina, può apparire solo come funnel-only o voce informativa chiara.

---

### 13.3 Niente contenuti finti

Vietato:

```txt
guide costo finte;
categorie vuote;
professionisti finti;
recensioni finte;
pagine locali senza contenuto locale;
placeholder pubblici.
```

---

### 13.4 Card fotografiche solo per servizi principali

Le card grandi con immagini sono adatte a:

```txt
servizi principali;
interventi principali;
categorie ad alto valore.
```

Non sono adatte a:

```txt
micro-guide costo;
costo intonaco al mq;
costo punto luce;
piccole voci editoriali.
```

---

### 13.5 Ogni cosa pubblica deve avere una destinazione reale

Ogni voce pubblica deve essere una di queste:

```txt
link a pagina SEO reale;
link a funnel reale;
testo informativo non cliccabile;
nascosta.
```

---

## 14. Source of truth target

### 14.1 Servizi featured in home

Target futuro:

```txt
Le card home devono derivare da registry SEO/servizi con campo homeFeature.
```

Esempio concettuale:

```txt
SeoInterventionLanding {
  slug
  title
  funnelSlug
  homeFeature?: {
    title
    description
    image
    priority
  }
}
```

La home legge solo pagine pubbliche reali con `homeFeature`.

Questo elimina slug duplicati a mano.

---

### 14.2 Servizi catalogo

Target:

```txt
registry servizi/categorie che distingue SEO_PAGE, FUNNEL_ONLY, PLANNED, HIDDEN.
```

Questo registry non deve rompere taxonomy.

Deve collegarsi al funnel tramite `funnelSlug`.

---

### 14.3 Cost guides

Target:

```txt
/costi legge solo CostGuide pubblicate.
```

Una guida costo può comparire in home o hub solo se esiste realmente.

---

## 15. Cosa è release blocker

Sono release blocker:

```txt
sezione Guide ai costi in home con guide inesistenti;
CTA href="#";
assenza di /costi se la home linka “vedi tutte le guide”;
guide reali orfane senza navigazione;
card o CTA pubbliche che sembrano cliccabili ma non funzionano.
```

Non sono release blocker immediati:

```txt
migrazione /interventi/[slug] → /servizi/[slug];
hub /interventi;
professionisti registrati visibili;
nuove guide costo;
micro-guide;
source of truth perfetta delle 6 card;
cleanup why-choose se non renderizzato.
```

---

## 16. Decisioni approvate

### 16.1 Home

La home deve usare il concetto:

```txt
Servizi più richiesti
```

non come catalogo completo, ma come vetrina.

---

### 16.2 /servizi

`/servizi` è il catalogo ampio e deve esistere nella roadmap pre-release o release-readiness.

Può linkare a pagine esistenti e/o funnel reali.

Non deve creare pagine finte.

---

### 16.3 /costi

`/costi` è obbligatorio per release pulita.

Anche con una sola guida, è meglio un hub onesto che una guida orfana o una sezione home finta.

---

### 16.4 /interventi/[slug]

Resta la route servizio attuale nel breve periodo.

Non migrare senza fase dedicata.

---

### 16.5 ServiceTask

I sotto-servizi, come quelli del bagno, non diventano pagine SEO adesso.

Diventano task funnel-only o blocchi interni alle pagine servizio.

---

## 17. Stato attuale noto

### 17.1 Home card servizi/interventi

Stato:

```txt
funzionanti;
hardcoded;
da riallineare in fase dedicata.
```

### 17.2 Guide ai costi home

Stato:

```txt
da riscrivere;
release blocker nella forma attuale.
```

### 17.3 /costi

Stato:

```txt
mancante;
release blocker.
```

### 17.4 /servizi

Stato:

```txt
mancante;
necessario per comunicare ampiezza catalogo.
```

### 17.5 Funnel

Stato:

```txt
operativo;
da preservare;
mapping tramite funnelSlug.
```

---

## 18. Regola di esecuzione per AI

Ogni fase futura che tocca SEO/navigation deve:

```txt
leggere questo documento prima di operare;
non cambiare schema senza aggiornare questo documento;
non implementare più livelli insieme se non esplicitamente previsto;
aggiornare la roadmap dopo ogni fase;
dichiarare cosa è stato fatto e cosa resta.
```

Ogni output fase deve indicare:

```txt
STATUS
PHASE
FILES_CHANGED
FILES_CREATED
FILES_DELETED
ROUTES_CHANGED
RELEASE_BLOCKERS_RESOLVED
RELEASE_BLOCKERS_REMAINING
TYPECHECK_RESULT
BUILD_RESULT
NEXT_STEP
```

---

## 19. Sintesi finale

Lo schema ufficiale è:

```txt
Home
→ Servizi più richiesti
→ /servizi

/servizi
→ catalogo categorie + servizi + task funnel-only

/interventi/[slug]
→ pagina servizio/intervento SEO attuale

/costi
→ hub guide prezzo

/costi/[slug]
→ guida costo nazionale

/costi/[slug]/[citySlug]
→ guida costo locale

/richiesta/[funnelSlug]
→ funnel operativo, eventualmente con task selezionato
```

Principio finale:

```txt
Nessuna cosa pubblica deve essere finta.
Nessuna voce deve portare a nulla.
Non tutto deve avere una pagina SEO subito.
Tutto ciò che si mostra deve avere uno scopo reale: informare, linkare, convertire o orientare il funnel.
```

---

## 20. Modello `/servizi`: Conversion Hub Taxonomy-Backed (Phase 19.6F)

Questa sezione recepisce gli audit Phase 19.6D (Taxonomy Source Structure Audit) e
Phase 19.6E (Services Hub Conversion Page Model Audit) e ridefinisce ufficialmente il
modello target di `/servizi`. È vincolante per qualunque fase futura che tocchi
`/servizi` o `site/services/**`.

### 20.1 Regola madre

```txt id="s20-madre"
/servizi non è la taxonomy tecnica.
/servizi è un conversion hub pubblico costruito sopra la taxonomy.
```

La taxonomy (`packages/taxonomy`) risponde a "cosa esiste davvero nel dominio
operativo". `/servizi` risponde a "cosa deve vedere e cliccare un cliente per
arrivare a una richiesta preventivo". Sono due domande diverse, rispondono due
livelli diversi, e non vanno mai confusi nello stesso file/componente.

### 20.2 Concetti ufficiali

**Concetti di dominio (packages/taxonomy, invariati, definiti in
`packages/taxonomy/src/shared/types.ts`):**

```txt id="s20-domain-concepts"
TaxonomySector       = settore (oggi: edilizia, impianti)
TaxonomyCategory      = ruolo professionale (es. "Cartongessista", "Elettricista") —
                         NON è navigazione pubblica, è raggruppamento per mestiere
TaxonomyDomain        = cluster tematico interno/SEO (es. "Tetti", "Ristrutturazione")
                         — utile per organizzare il dominio, NON 1:1 con una macro-
                         area pubblica (vedi 20.3)
TaxonomyService       = voce di catalogo interna, granulare, mai mostrata 1:1 al
                         pubblico come voce cliccabile
TaxonomyIntervention  = l'unica entità realmente "richiedibile" (è quella che la
                         query del funnel risolve, `prisma.intervention.findUnique`)
                         — è l'unità di conversione
```

**Concetti pubblici (site/services, nuovi, da implementare in Phase 19.6H):**

```txt id="s20-public-concepts"
PublicServiceMacroArea = {
  slug, label, description, order,
  taxonomyDomainSlugs: string[],       // 0+ domini taxonomy raggruppati qui
  extraInterventionSlugs?: string[],   // interventi cross-domain aggiunti a mano
                                        // (es. "Piscine" pesca da 3 domini diversi)
  excludeInterventionSlugs?: string[], // interventi esclusi con motivo in commento
}

PublicServiceCard = {
  slug,                       // == TaxonomyIntervention.slug, mai un id parallelo
  label,                      // nome pubblico (di norma TaxonomyIntervention.name)
  macroAreaSlug,
  destinationType: DestinationType,
  href: string,
  priority: number,
  visibility: VisibilityPolicy,
}

DestinationType = "SEO_PAGE" | "FUNNEL_DIRECT" | "NONE"

VisibilityPolicy = "FEATURED" | "VISIBLE" | "COLLAPSED" | "HIDDEN"

SeoPageMapping = ReadonlyMap<taxonomyInterventionSlug, seoLandingSlug>
  // DERIVATO da site/seo/pages/interventi (listSeoInterventionLandings()), mai
  // scritto a mano: landing.funnelSlug è già lo slug taxonomy reale (Phase 19.3)

FunnelDestination = `/richiesta/${taxonomyInterventionSlug}`
  // mai un funnelSlug parallelo: è sempre lo stesso slug dell'intervention taxonomy
```

### 20.3 Decisione architetturale: TaxonomyDomain ≠ macro-area pubblica

```txt id="s20-decisione"
TaxonomyDomain NON deve essere trasformato direttamente in macro-area pubblica.
TaxonomyDomain resta cluster interno/SEO/dominio.
PublicServiceMacroArea è un layer pubblico/editoriale sopra taxonomy.
```

**Motivazione:** i domini reali sono utili per organizzare il dominio dati, ma non
sempre corrispondono al modo in cui un cliente ragiona quando cerca un servizio.

Esempi concreti (verificati in Phase 19.6E sui dati reali):
- I domini `tetti`, `facciate` e `impermeabilizzazioni` possono essere presentati
  insieme come macro-area pubblica "Tetti e facciate" (l'utente che cerca "rifare il
  tetto" e quello che cerca "rifare la facciata" hanno un'intenzione affine).
- Le 11 varianti cartongesso del domain `ristrutturazione` e le 3 varianti
  tinteggiatura (2 nello stesso domain, 1 nel domain `facciate`) richiedono
  raggruppamenti editoriali diversi dal domain tecnico ("Cartongesso e pareti",
  "Imbianchini e finiture") per restare leggibili.
- "Piscine" è una macro-area pubblica legittima anche se non esiste come
  TaxonomyDomain dedicato: le sue interventions sono sparse in 3 domini diversi
  (costruzione, ristrutturazione, impermeabilizzazioni).

Questa mappatura macro-area↔domini/interventi vive in `macro-areas.ts` (editoriale,
piccolo, dichiarativo — mai duplica nome/descrizione delle entità taxonomy, solo le
referenzia per slug).

### 20.4 Modello ufficiale della pagina `/servizi`

```txt id="s20-page-model"
/servizi
→ hero catalogo (titolo + sottotitolo onesto sull'ampiezza reale del catalogo)
→ macro aree pubbliche (indice di navigazione interna, anchor scroll)
→ servizi più richiesti (le card SEO_PAGE_NOW, stesso registry della home)
→ sezioni per macro area (una per PublicServiceMacroArea con almeno 1 card)
→ card/interventi reali (TaxonomyIntervention, non Service/Category/Domain)
→ link a /interventi/[seoSlug] se SEO_PAGE_NOW
→ link a /richiesta/[taxonomyInterventionSlug] se REQUEST_NOW
→ CTA finale ("non hai trovato quello che cercavi?")
```

### 20.5 Stati ufficiali degli item

```txt id="s20-states"
SEO_PAGE_NOW              = esiste landing /interventi/[slug] → linkare alla landing
REQUEST_NOW                = TaxonomyIntervention reale, nessuna SEO page → link a
                              /richiesta/[taxonomyInterventionSlug]
SHOW_IN_COLLAPSED_LIST     = reale ma troppo granulare per card principale (va dietro
                              "vedi altre varianti")
HIDE_FOR_NOW                = reale ma non pubblicabile ora per scelta prodotto/
                              editoriale esplicita (non per dimenticanza)
SEO_PAGE_FUTURE             = candidato futuro a landing SEO, richiede fase dedicata
                              e keyword research — non implementare senza quella fase
HIDE_UNTIL_TAXONOMY_EXISTS  = non esiste in taxonomy → non mostrare, non linkare, non
                              promettere "presto disponibile"
NEEDS_TAXONOMY_FIX          = esiste ma con anomalia (orphan da domain, naming
                              inconsistente) → non pubblicare finché non verificato
                              con chi cura la taxonomy
```

### 20.6 Macro aree pubbliche raccomandate (modello iniziale, non implementazione obbligatoria)

```txt id="s20-macro-areas"
Ristrutturazioni
Cartongesso e pareti
Imbianchini e finiture
Opere murarie
Pavimenti e piastrelle
Tetti e facciate
Impianti elettrici
Idraulica
Clima ed energia
Nuove costruzioni e ampliamenti
Impermeabilizzazioni
Piscine
```

```txt id="s20-macro-areas-excluded"
Giardinaggio                                  → HIDE_UNTIL_TAXONOMY_EXISTS
Pratiche e tecnici (CILA/SCIA/APE/geometra/
  architetto/direzione lavori)                → HIDE_UNTIL_TAXONOMY_EXISTS
Sicurezza / antifurto / videosorveglianza     → NEEDS_TAXONOMY_FIX finché gli
                                                  interventi restano orphan da domain
```

Questo elenco è il punto di partenza verificato dagli audit, non un vincolo
immutabile: una fase di implementazione può affinarlo, ma deve sempre verificare la
copertura taxonomy reale prima di aggiungere o rimuovere una macro-area (vedi 20.9).

### 20.7 Regole link

```txt id="s20-link-rules"
SEO_PAGE_NOW                → /interventi/[seoSlug]
REQUEST_NOW                  → /richiesta/[taxonomyInterventionSlug]
SHOW_IN_COLLAPSED_LIST       → /richiesta/[taxonomyInterventionSlug] se cliccato
TaxonomyService/Category/
  Domain                     → mai una CTA diretta, solo etichetta di raggruppamento
Voce fuori taxonomy          → non mostrare
Macro area vuota              → non mostrare (filtrata automaticamente dal builder)
```

### 20.8 Regole UX

```txt id="s20-ux-rules"
/servizi non deve sembrare povero (oggi mostra solo 6 voci su 81 reali disponibili).
/servizi non deve sembrare un database (non è una vista tecnica sulla taxonomy).
Niente lista piatta di 81 interventi.
Sopra la piega: massimo 6-8 card visibili in totale.
Per macro area: massimo 2-3 card principali, il resto dietro "Vedi altri servizi".
Le varianti granulari (es. le 10 sotto-varianti cartongesso) vanno sempre in lista/
  collasso, mai tutte come card fotografiche grandi.
Le categorie professionali (TaxonomyCategory) tipo "Cartongessista" o "Impiantista"
  non sono navigazione principale per il cliente finale: sono etichette di mestiere,
  non di intento di ricerca.
```

### 20.9 Regole SEO

```txt id="s20-seo-rules"
Non creare una pagina SEO per ogni TaxonomyIntervention (81 pagine sottili sarebbero
  l'esatto anti-pattern già vietato per le guide costo, qui applicato ai servizi).
SEO_PAGE_FUTURE richiede una fase dedicata, contenuto editoriale reale e keyword
  research — non un'estensione automatica di /servizi.
/servizi supporta conversione e internal linking, non è un asset SEO primario.
/interventi e /costi restano gli asset SEO principali.
Eventuali future macro-hub SEO (es. landing per macro-area) richiedono una fase
  separata e dedicata, non vanno dedotte implicitamente da questo modello.
```

### 20.10 Scalable Services Model

```txt id="s20-scalability"
taxonomySource (packages/taxonomy) è la fonte per sapere quali interventions
  esistono — mai duplicato come dato in site/services.
site/services contiene SOLO il layer editoriale pubblico (raggruppamento, priorità,
  visibilità) — mai una seconda lista di "cosa esiste".
Non duplicare manualmente 81 interventions in catalog.ts (o nel suo successore
  taxonomy-derived): chi le elenca è sempre taxonomySource.interventions.
Le macro aree possono essere editoriali (raggruppamenti cross-domain, split di un
  domain in più aree pubbliche) ma devono sempre referenziare interventions reali
  per slug, mai inventarne.
Builders e validators (site/services/public-navigation/{builders,validators}.ts)
  devono costruire il modello pubblico a partire da taxonomy + file editoriali, e
  validarlo a module-load time (stesso pattern già in uso da Phase 19.3): build
  fallisce con errore esplicito se uno slug referenziato non esiste, se una macro
  area resta vuota dopo i filtri, o se un intervento compare in due macro-aree.
Se una nuova SEO page viene creata (nuova landing in
  site/seo/pages/interventi/index.ts), l'item passa da REQUEST_NOW a SEO_PAGE_NOW
  automaticamente: il mapping SEO (seo-page-map.ts) è derivato da
  listSeoInterventionLandings(), non va mai aggiornato a mano in site/services.
Se una nuova area/domain viene aggiunto in taxonomy, NON appare automaticamente in
  /servizi: va decisa esplicitamente l'assegnazione a una PublicServiceMacroArea
  (una riga in macro-areas.ts) — comportamento voluto, non un bug, per evitare che
  un dato di dominio appena introdotto si auto-pubblichi con un nome tecnico non
  pensato per il pubblico.
Se un item non esiste in taxonomy, non entra nel catalogo pubblico in nessuna forma
  (non come PLANNED cliccabile, non come placeholder "in arrivo").
```
