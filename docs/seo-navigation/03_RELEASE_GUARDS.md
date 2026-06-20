# Esigenta — SEO Navigation Release Guards

Versione: 1.0
Stato: VINCOLANTE
Ambito: Home, servizi, interventi, costi, funnel, SEO navigation
Documento collegato: `docs/seo-navigation/01_SCHEMA.md`
Documento collegato: `docs/seo-navigation/02_ROADMAP.md`
Ultimo aggiornamento: 2026-06-18

---

## 1. Scopo del documento

Questo documento definisce le regole anti-figuraccia per la release pubblica di Esigenta.

Ogni fase che tocca home, servizi, interventi, costi, SEO navigation o funnel deve controllare questo documento prima di modificare codice.

L’obiettivo è impedire:

```txt id="6vz35u"
link morti;
guide finte;
card non cliccabili;
pagine promesse ma inesistenti;
hub vuoti;
categorie vuote;
pagine SEO thin;
professionisti finti;
mismatch tra home, SEO registry, taxonomy e funnel.
```

---

## 2. Regola madre

Una cosa pubblica deve avere sempre uno scopo reale.

Ogni elemento mostrato all’utente deve essere uno di questi:

```txt id="2yuvwn"
1. link a pagina reale;
2. link a funnel reale;
3. testo informativo chiaramente non cliccabile;
4. elemento nascosto.
```

Tutto il resto è vietato.

---

## 3. Guard 1 — Nessun `href="#"`

### Regola

È vietato pubblicare link o CTA con:

```txt id="dgaw5o"
href="#"
```

### Perché

Un `href="#"` comunica all’utente che qualcosa è cliccabile, ma non porta da nessuna parte.

È una figuraccia UX e un segnale di sito incompleto.

### Check obbligatorio

Prima di chiudere ogni fase che tocca UI pubblica, eseguire:

```powershell id="hav8tf"
rg 'href="#"|href=\{["'\'']#["'\'']\}' apps/web/src
```

### Esito atteso

```txt id="y3ssqk"
0 occorrenze in sezioni pubbliche.
```

Eccezioni:

```txt id="v3ucgq"
Nessuna eccezione per home, /servizi, /costi, /interventi o CTA pubbliche.
```

---

## 4. Guard 2 — Nessuna guida costo finta

### Regola

La home e `/costi` possono mostrare solo guide ai costi realmente pubblicate.

Una guida è pubblicata solo se esiste una route reale:

```txt id="v1tcca"
/costi/[costSlug]
```

Esempio ammesso:

```txt id="z0y8w6"
Quanto costa ristrutturare un bagno
→ /costi/ristrutturare-bagno
```

Esempio vietato:

```txt id="26kcdm"
Quanto costa rifare il tetto
→ mostrato in home ma /costi/rifare-tetto non esiste
```

### Check obbligatorio

Ogni voce mostrata in home o `/costi` deve essere verificata contro il registry delle guide costo pubblicate.

### Esito atteso

```txt id="6benx5"
Nessuna guida mostrata se la pagina non esiste.
```

---

## 5. Guard 3 — Nessuna card apparentemente cliccabile senza azione

### Regola

Se un elemento ha aspetto da card cliccabile, hover, cursor, freccia o CTA, deve avere una destinazione reale.

Vietato:

```txt id="d6ggu1"
card con immagine e titolo, ma senza Link;
card con hover, ma non cliccabile;
card che sembra navigare, ma non fa nulla;
card che porta a route inesistente.
```

### Check obbligatorio

Per ogni componente card pubblico controllare:

```txt id="cvwrcg"
è un Link?
ha onClick?
porta a route reale?
oppure è chiaramente informativo e non cliccabile?
```

### Esito atteso

```txt id="n0rx2j"
Nessuna falsa affordance.
```

---

## 6. Guard 4 — Nessuna pagina promessa ma inesistente

### Regola

La UI non deve promettere sezioni o pagine future come se fossero già disponibili.

Vietato:

```txt id="vqjfxh"
“Vedi tutte le guide” se /costi non esiste;
“Esplora tutti i servizi” se /servizi non esiste;
card guida senza pagina;
categoria con link a pagina futura;
CTA verso route non implementata.
```

### Check obbligatorio

Per ogni CTA pubblica verificare:

```txt id="w4n3r3"
route esiste?
route builda?
route non fa notFound?
route non è vuota?
```

### Esito atteso

```txt id="4k4ddm"
Ogni promessa pubblica corrisponde a pagina o funnel reale.
```

---

## 7. Guard 5 — Nessun hub vuoto

### Regola

Un hub pubblico non deve sembrare vuoto, finto o in costruzione.

Route interessate:

```txt id="qx9cg8"
/servizi
/costi
```

### Hub `/costi`

Con una sola guida pubblicata è ammesso un hub minimo.

Formato corretto:

```txt id="nllc7p"
titolo chiaro;
descrizione breve;
lista piatta;
una guida reale;
link reale.
```

Formato vietato:

```txt id="3doadp"
categorie vuote;
blocchi “presto disponibile”;
card finte;
guide future senza pagina;
placeholder visivi.
```

### Hub `/servizi`

Può mostrare servizi SEO page e funnel-only.

Formato corretto:

```txt id="ucie52"
categorie con almeno una voce reale;
link a pagina reale;
link a funnel reale;
voce informativa non cliccabile se dichiarata chiaramente.
```

Formato vietato:

```txt id="nrsh67"
categoria vuota;
voce planned cliccabile;
route futura linkata;
servizio finto.
```

---

## 8. Guard 6 — Nessuna categoria vuota

### Regola

Una categoria appare solo se contiene almeno una voce pubblicabile.

Categorie candidate:

```txt id="2nql41"
Ristrutturazioni
Impianti
Energia
Pratiche edilizie
Tecnici e progettazione
Finiture
Manutenzione
```

Una categoria senza voci non deve essere renderizzata.

### Check obbligatorio

Per ogni categoria:

```txt id="9cv1ii"
count visible items > 0
```

### Esito atteso

```txt id="a88vsy"
Nessuna categoria vuota in produzione.
```

---

## 9. Guard 7 — Card fotografiche solo per servizi principali

### Regola

Le card grandi con foto sono ammesse per service intent, non per micro-guide costo.

Ammesso:

```txt id="1t15z4"
Ristrutturare bagno
Rifare tetto
Installare fotovoltaico
Installare climatizzatore
Rifare impianto elettrico
Cartongesso e finiture
```

Vietato come card fotografica grande:

```txt id="loj3g1"
Costo intonaco al mq
Costo punto luce
Costo posa piastrelle al mq
Costo pittura al mq
Costo cartongesso al mq
```

### Perché

Le micro-guide sono contenuto informativo. Devono stare in liste, tabelle o categorie editoriali, non in gallery fotografiche.

### Esito atteso

```txt id="ul7uu2"
Servizi = visual card.
Guide costo = lista/editoriale.
```

---

## 10. Guard 8 — Nessuna pagina locale thin

### Regola

Le pagine città devono essere create o indicizzate solo se hanno contenuto locale sufficiente.

Route interessate:

```txt id="2xm89e"
/costi/[costSlug]/[citySlug]
```

Vietato:

```txt id="6r37yg"
stesso testo cambiando solo città;
prezzi copiati senza logica;
FAQ duplicate senza motivo;
canonical sbagliato;
pagina city generata senza policy.
```

Obbligatorio:

```txt id="2evno3"
geo registry;
supported cities;
indexability policy;
canonical generato;
local override sufficiente.
```

### Esito atteso

```txt id="eb4p45"
Nessuna città pubblicata solo per moltiplicare URL.
```

---

## 11. Guard 9 — Nessun professionista finto

### Regola

Non mostrare professionisti, imprese, recensioni, rating o disponibilità se non arrivano da dati reali.

Vietato:

```txt id="tid1xp"
“i migliori professionisti a Catania” senza dati;
lista professionisti inventata;
recensioni finte;
rating placeholder;
numero professionisti non verificato;
foto lavori non reali.
```

Ammesso:

```txt id="5lwqsw"
Con Esigenta puoi confrontare professionisti e imprese disponibili nella tua zona.
```

### Stato

Il modulo professionisti è:

```txt id="py9zg3"
POST_RELEASE
```

finché non esistono dati reali sufficienti.

---

## 12. Guard 10 — Non tutto diventa pagina SEO

### Regola

Un servizio o sotto-servizio può essere visibile senza avere pagina SEO.

Stati ammessi:

```txt id="ydxfjl"
SEO_PAGE
FUNNEL_ONLY
PLANNED
HIDDEN
```

### SEO_PAGE

Ha pagina reale.

Esempio:

```txt id="e4p72b"
Ristrutturare bagno
→ /interventi/ristrutturare-bagno
```

### FUNNEL_ONLY

Non ha pagina SEO, ma porta a funnel reale.

Esempio:

```txt id="jwk7ec"
Sostituzione vasca con doccia
→ /richiesta/rifare-bagno?task=sostituzione-vasca-con-doccia
```

### PLANNED

Esiste nel piano, ma non deve apparire come link pubblico.

### HIDDEN

Non visibile.

### Regola finale

Vietato creare pagine SEO sottili solo per dire che il servizio esiste.

---

## 13. Guard 11 — Funnel sempre preservato

### Regola

Il funnel `/richiesta/[funnelSlug]` non deve rompersi durante fasi SEO/navigation.

Ogni pagina servizio o costo deve portare a un funnel reale.

Esempi mapping:

```txt id="gfo909"
ristrutturare-bagno → rifare-bagno
rifare-impianto-elettrico → impianto-elettrico-nuovo
cartongesso-e-finiture → fare-lavori-cartongesso
```

### Check obbligatorio

Per ogni servizio featured o pagina costo pubblicata:

```txt id="uq4y6c"
funnelSlug esiste?
/richiesta/[funnelSlug] risponde?
fallback funnel funziona?
```

### Esito atteso

```txt id="yjcayl"
Nessuna CTA porta a funnel inesistente.
```

---

## 14. Guard 12 — Home non è catalogo completo

### Regola

La home mostra una selezione, non tutto il catalogo.

Label preferita:

```txt id="n4n3zq"
Servizi più richiesti
```

Significato:

```txt id="xv9a4m"
Queste sono voci in evidenza.
Il catalogo completo è /servizi.
```

Obbligatorio quando `/servizi` esiste:

```txt id="2jivx9"
CTA “Esplora tutti i servizi”
→ /servizi
```

Vietato:

```txt id="by51j1"
far sembrare che Esigenta copra solo le 6 card della home.
```

---

## 15. Guard 13 — Guide ai costi home compatte

### Regola

La sezione Guide ai costi in home deve essere compatta, editoriale e reale.

Ammesso:

```txt id="g4koq2"
titolo;
breve testo;
lista 1-6 guide reali;
link a pagina costo;
CTA a /costi se /costi esiste.
```

Vietato:

```txt id="5b0vnx"
card fotografiche grandi;
guide inesistenti;
href="#";
card non cliccabili;
duplicazione visuale della sezione servizi.
```

### Esito atteso

```txt id="qcwh97"
La home distingue visivamente:
servizi = card;
costi = lista/editoriale.
```

---

## 16. Guard 14 — Non mischiare taxonomy e SEO slug senza mapping

### Regola

Gli slug pubblici SEO e gli slug taxonomy/funnel possono essere diversi.

Questo è ammesso.

Esempi:

```txt id="2hnvqq"
SEO slug: ristrutturare-bagno
funnel/taxonomy slug: rifare-bagno

SEO slug: rifare-impianto-elettrico
funnel/taxonomy slug: impianto-elettrico-nuovo

SEO slug: cartongesso-e-finiture
funnel/taxonomy slug: fare-lavori-cartongesso
```

Vietato:

```txt id="iezjlg"
usare taxonomy slug come URL pubblico senza decisione SEO;
duplicare mapping in più file senza validazione;
creare Link pubblici basati su slug operativo se non è una route pubblica.
```

### Esito atteso

```txt id="nejdec"
public slug → pagina SEO;
funnelSlug → richiesta;
mapping esplicito.
```

---

## 17. Guard 15 — Non spostare marketing dentro taxonomy

### Regola

La taxonomy non deve contenere:

```txt id="bva9jd"
immagini home;
copy marketing;
testi SEO editoriali;
descrizioni emozionali;
layout/UI;
priorità home.
```

La taxonomy serve al dominio operativo e al funnel.

La home e il sito pubblico possono leggere/mappare verso taxonomy, ma non devono sporcarla con dati marketing.

---

## 18. Guard 16 — Source of truth verificabile

### Regola

La home non deve inventare slug isolati.

Target:

```txt id="74ik96"
featured services derivati da registry SEO/servizi;
homeFeature o modello equivalente;
link verificabili.
```

Stato attuale delle 6 card:

```txt id="qebmr4"
funzionanti ma hardcoded;
non blocker immediato;
da riallineare in fase dedicata.
```

Finché non sono riallineate, non aggiungere nuove card hardcoded.

---

## 19. Guard 17 — Niente mega fase

### Regola

È vietato accorpare troppe modifiche in una fase.

Esempio vietato:

```txt id="zkwkdy"
creare /costi;
riscrivere home;
creare /servizi;
aggiungere task funnel;
migrare /interventi a /servizi;
creare nuove guide costo;
```

in una singola fase.

Ogni fase deve avere uno scope piccolo.

Motivo:

```txt id="kyvoqg"
ridurre regressioni;
rendere il report leggibile;
permettere rollback;
tenere la roadmap aggiornata.
```

---

## 20. Guard 18 — Roadmap sempre aggiornata

### Regola

Ogni fase deve aggiornare:

```txt id="bg3109"
docs/seo-navigation/02_ROADMAP.md
```

L’aggiornamento deve includere:

```txt id="sobcwl"
stato fase;
file creati;
file modificati;
file eliminati;
release blocker risolti;
release blocker rimasti;
rischi;
prossimo step.
```

Vietato completare una fase senza aggiornare la roadmap.

---

## 21. Guard 19 — Report finale obbligatorio

Ogni fase deve produrre report con questo formato minimo:

```txt id="wwkudj"
STATUS:
PHASE:

FILES_CHANGED:
FILES_CREATED:
FILES_DELETED:
ROUTES_CHANGED:
PACKAGES_CHANGED:

WHAT_WAS_DONE:
WHAT_WAS_NOT_DONE:
RELEASE_BLOCKERS_RESOLVED:
RELEASE_BLOCKERS_REMAINING:

SCHEMA_CHANGES:
ROADMAP_UPDATED:
GUARDS_CHECKED:

TYPECHECK_RESULT:
BUILD_RESULT:
ROOT_TYPECHECK_RESULT:
ROOT_BUILD_RESULT:

RISKS:
BLOCKERS:
NEXT_STEP:
```

---

## 22. Guard 20 — Build e typecheck

Ogni fase che modifica codice deve eseguire almeno:

```powershell id="qt8dtl"
pnpm --filter @esigenta/web typecheck
pnpm --filter @esigenta/web build
```

Se la fase tocca packages condivisi, eseguire anche:

```powershell id="n4pe6m"
pnpm typecheck
pnpm build
```

Se una verifica fallisce:

```txt id="kbbokx"
la fase non è COMPLETED;
la roadmap deve segnare BLOCKED o PARTIALLY_COMPLETED;
non procedere alla fase successiva.
```

---

## 23. Checklist pre-release

La release pubblica è accettabile solo se:

```txt id="rx18yi"
[ ] nessun href="#";
[ ] home senza guide finte;
[ ] Guide ai costi home mostra solo guide reali;
[ ] /costi esiste;
[ ] /costi mostra solo guide reali;
[ ] /servizi esiste o la home comunica chiaramente l’ampiezza catalogo tramite altra soluzione approvata;
[ ] CTA “Esplora tutti i servizi” funziona se presente;
[ ] 6 servizi principali funzionano;
[ ] ogni CTA richiesta preventivo porta a funnel reale;
[ ] nessuna card sembra cliccabile senza esserlo;
[ ] nessuna categoria vuota;
[ ] nessun professionista finto;
[ ] nessuna pagina città thin nuova;
[ ] build PASS;
[ ] typecheck PASS.
```

---

## 24. Release blockers ufficiali

Sono blocker finché non risolti:

```txt id="mhnj9n"
Guide ai costi home con guide inesistenti;
CTA con href="#";
assenza di /costi se esistono guide costo pubblicate;
guide costo orfane non raggiungibili;
home che non permette di capire che esistono più servizi del blocco in evidenza;
link pubblici a route inesistenti.
```

---

## 25. Post-release items

Non sono blocker iniziali, ma devono restare tracciati:

```txt id="8kpvds"
hub /interventi;
migrazione /interventi/[slug] → /servizi/[slug];
professionisti registrati;
nuove guide costo;
micro-guide;
seconda famiglia SEO/GEO;
schema-builder;
sitemap;
internal linking avanzato;
source of truth finale delle 6 card;
professionisti per città/servizio.
```

---

## 26. Esempi pratici

### 26.1 Esempio corretto — sotto-servizio bagno

```txt id="lc74i9"
Pagina:
  /interventi/ristrutturare-bagno

Voce:
  Sostituzione vasca con doccia

Destinazione:
  /richiesta/rifare-bagno?task=sostituzione-vasca-con-doccia

Stato:
  FUNNEL_ONLY
```

Non creare:

```txt id="nltysl"
/interventi/sostituzione-vasca-con-doccia
```

finché non esiste una fase SEO dedicata.

---

### 26.2 Esempio corretto — guida costo reale

```txt id="1dfoxw"
Home:
  Quanto costa ristrutturare un bagno
  → /costi/ristrutturare-bagno

/costi:
  mostra la stessa guida

/costi/ristrutturare-bagno:
  pagina reale
```

---

### 26.3 Esempio vietato — guida costo non esistente

```txt id="whqt0c"
Home:
  Quanto costa rifare il tetto
  → nessuna pagina reale
```

Vietato anche se la card è bella.

---

### 26.4 Esempio corretto — servizi hub

```txt id="64hop8"
/servizi

Pratiche edilizie:
  CILA → funnel reale o pagina reale
  SCIA → funnel reale o pagina reale
  APE → funnel reale o pagina reale

Tecnici e progettazione:
  Geometra → funnel reale o pagina reale
  Architetto → funnel reale o pagina reale
```

Se il funnel non esiste e la pagina non esiste, la voce non deve essere cliccabile o non deve essere mostrata.

---

## 27. Regola finale

Prima di chiudere qualsiasi fase, chiedersi:

```txt id="u9q87l"
Questa modifica rende il sito più reale, più chiaro e più navigabile?
Oppure introduce una promessa che il sito non mantiene?
```

Se introduce una promessa non mantenuta, la fase non va chiusa come completata.

---

## 28. Sintesi operativa

```txt id="l8n3c0"
Niente link morti.
Niente contenuti finti.
Niente pagine promesse.
Niente hub vuoti.
Niente professionisti inventati.
Niente micro-guide con card foto.
Niente task trasformati in pagine SEO senza contenuto.
Niente fasi giganti.
Roadmap sempre aggiornata.
Build e typecheck obbligatori.
```

Questo documento è vincolante fino a nuova revisione esplicita.
