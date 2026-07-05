# Strategia SEO per slug, taxonomy e landing Esigenta

## Scopo

Questo documento definisce la strategia per scegliere, mantenere e rivedere gli slug degli interventi Esigenta.

Gli slug non sono semplici nomi tecnici: sono contratti stabili usati da taxonomy, ricerca interna, funnel, richieste, pagine SEO, URL pubblici e collegamenti tra contenuti.

L'obiettivo è trovare un equilibrio tra:

* coerenza del sistema;
* chiarezza per l'utente;
* forza SEO dell'URL;
* stabilità tecnica;
* possibilità futura di creare landing curate per i money-term più importanti.

---

## Architettura SEO Esigenta

Esigenta ha due layer separati.

### 1. Taxonomy

Percorso:

`packages/taxonomy`

La taxonomy definisce:

* gruppi di progetto;
* interventi;
* slug;
* alias;
* collegamento alle categorie;
* matching nella ricerca interna;
* aggancio al funnel.

Creare un intervento in taxonomy abilita lo slug e lo rende ricercabile nel sistema, ma non crea automaticamente una pagina SEO Google.

### 2. Landing SEO curate

Percorso:

`apps/web/src/site/seo/pages/{interventi,costi}/<slug>/`

Le landing SEO sono curate manualmente.

Contengono:

* meta title;
* H1;
* sezioni costo;
* price rows;
* FAQ;
* funnelSlug;
* relatedFunnelWork;
* eventuali pagine città `/costi/<slug>/<citySlug>`.

Solo gli slug registrati nelle landing SEO esistono come pagine statiche pubbliche.

---

## Principio principale

La taxonomy deve essere costruita con slug SEO-aware, ma la SEO vera si vince soprattutto con:

* title;
* H1;
* contenuto;
* FAQ;
* cost section;
* internal linking;
* pagine città;
* corretto aggancio al funnel.

Lo slug aiuta, ma non deve compromettere la stabilità del sistema.

---

## Strategia slug: modello ibrido

Esigenta usa una strategia ibrida.

Non esiste una regola assoluta “solo verbo” o “solo keyword secca”.

La scelta dipende dall’intento di ricerca.

---

## Quando usare slug verbale

Usare uno slug verbale quando l’utente cerca naturalmente un’azione.

Esempi:

* `rifare-tetto`
* `ristrutturare-bagno`
* `installare-fotovoltaico`
* `riparare-tetto`
* `sostituire-box-doccia`
* `posare-o-rifare-pavimento-interno`

Vantaggi:

* coerente con la convenzione attuale;
* chiaro per funnel e richiesta;
* leggibile per l’utente;
* stabile come contratto applicativo.

---

## Quando usare slug noun-heavy o money-term

Usare uno slug più vicino alla keyword nominale quando la query forte è chiaramente nominale o da pagina costo.

Esempi possibili:

* `demolizioni-interne`
* `piccole-opere-murarie`
* `bonificare-amianto-eternit-tetto`
* `installare-linea-vita`
* `impermeabilizzare-tetto`

In questi casi lo slug può contenere il money-term, ma deve restare leggibile e coerente.

---

## Quando NON creare uno slug nuovo

Non creare uno slug nuovo quando il termine è solo:

* un sotto-caso;
* un alias;
* una risposta del funnel;
* una variante tecnica;
* una parola professionale troppo specifica;
* una keyword che cannibalizza un intervento più forte.

Esempi:

* `ripasso-tegole` resta dentro `riparare-tetto`;
* `cerchiatura-muro-portante` resta branch/alias dentro `aprire-o-chiudere-vano`, almeno inizialmente;
* `scossalina-camino` resta dentro riparazione/impermeabilizzazione tetto;
* `tramezzo-cartongesso` resta nel gruppo cartongesso, non in opere murarie;
* `resina/microcemento` può restare opzione del pavimento interno finché non emerge domanda sufficiente.

---

## Slug e landing SEO

Uno slug taxonomy può esistere senza landing SEO.

Questo significa:

* l’intervento è ricercabile internamente;
* può avere funnel dedicato;
* può essere richiamato come lavoro correlato;
* può ricevere richieste.

Ma non significa che abbia già una pagina Google dedicata.

Le landing SEO vanno create solo per i money-term più forti.

Esempio:

* `aprire-o-chiudere-vano` può essere lo slug/funnel principale;
* `cerchiatura muro portante` può diventare una landing costo dedicata in futuro, agganciata allo stesso funnel.

---

## Regola per i money-term forti

Se una query ha forte valore SEO ma rischia di creare un intervento troppo tecnico, normativo o duplicato, preferire questa struttura:

1. intervento principale ampio ma preciso;
2. alias money-term;
3. branch nel funnel;
4. landing SEO dedicata futura;
5. stesso funnelSlug.

Esempio:

`cerchiatura muro portante`

Non diventa subito intervento separato.

Può vivere così:

* alias di `aprire-o-chiudere-vano`;
* opzione/branch nel funnel;
* landing SEO futura `/costi/cerchiatura-muro-portante`;
* funnel agganciato a `aprire-o-chiudere-vano`.

---

## Alias

Gli alias servono a catturare varianti di ricerca interna.

Devono includere:

* forme verbali;
* forme nominali;
* sinonimi comuni;
* linguaggio del cliente;
* termini professionali cercati davvero.

Esempio per `demolire-parete-o-tramezzo`:

* demolire tramezzo;
* demolizione tramezzi;
* abbattere un muro;
* buttare giù un muro;
* demolire muro non portante.

Gli alias non devono duplicare slug/name normalizzati se il validator li scarta. In quel caso lo slug copre già la query exact.

---

## Cap alias

Ogni intervento deve rispettare il cap massimo alias previsto dal validator.

Se gli alias superano il cap, curare la lista privilegiando:

1. query più cercate;
2. query più chiare;
3. sinonimi non ridondanti;
4. confini utili contro cannibalizzazione.

---

## Rename slug: attenzione massima

Uno slug è un contratto.

Non va rinominato casualmente.

Prima di cambiare uno slug già esistente bisogna verificare:

* richieste collegate;
* funnelSlug;
* relatedFunnelWork;
* pagine SEO;
* pagine costi;
* static params;
* link interni;
* search;
* DB;
* redirect necessari;
* eventuali URL già indicizzati.

Un rename slug richiede piano dedicato.

Non va fatto dentro un micro-batch generico.

---

## Rename name

Il `name` è meno delicato dello slug, ma comunque va gestito bene.

Il sync DB può non aggiornare il name di interventi già esistenti.

Se si corregge un name già presente in DB, può servire update mirato sulla riga dell’intervento.

Esempio:

`ristrutturare-bagno`

Source corretto:

`Ristrutturare bagno`

Se DB resta vecchio, fare update mirato solo su quella riga.

---

## Source, generated e DB

Source, generated e DB possono divergere temporaneamente.

Regola:

1. modificare source;
2. eseguire generate;
3. verificare diff generated;
4. eseguire sync DB se approvato;
5. verificare DB;
6. committare source + generated coerenti.

Non dare per scontato che il regenerate sia automatico.

---

## Spostamento alias tra interventi

Quando un alias viene spostato da un intervento a un altro, il primo sync può non convergere per unicità globale e skipDuplicates.

Regola:

* verificare DB dopo sync;
* se non converge, ripetere sync una volta;
* ricontrollare che l’alias sia sotto l’intervento corretto.

Esempio:

`ristrutturare casa intera`

Spostato da:

`ristrutturare-appartamento`

a:

`ristrutturare-casa`

---

## Funnel e SEO

Il funnel deve rimanere semplice e orientato alla richiesta.

Non deve diventare una landing SEO o un questionario tecnico.

Per i casi complessi:

* usare una domanda principale;
* usare un sotto-step prudente;
* lasciare spazio alla nota;
* non promettere risultati normativi;
* instradare al professionista/tecnico.

Esempi delicati:

* amianto/eternit;
* linea vita;
* muro portante/cerchiatura;
* pratiche edilizie;
* strutture portanti.

---

## Copy prudente

Per lavori normativi, strutturali o sensibili, usare copy non-promissorio.

Esempi:

* “Il professionista valuta cosa serve.”
* “Potrebbero essere necessarie verifiche tecniche.”
* “La richiesta viene inoltrata a specialisti.”
* “Gli obblighi possono variare in base all’edificio, al territorio e al tipo di intervento.”

Evitare:

* “a norma garantito”;
* “certificazione assicurata”;
* “permesso incluso”;
* “puoi farlo senza tecnico”;
* istruzioni operative per lavori pericolosi o regolati.

---

## Strategia futura di revisione slug

Più avanti va eseguito un audit globale degli slug.

Obiettivo:

* rafforzare gli URL SEO;
* individuare slug troppo generici;
* individuare slug troppo tecnici;
* verificare money-term mancanti;
* evitare cannibalizzazioni;
* decidere eventuali redirect.

Audit consigliato per ogni gruppo:

1. lista interventi attuali;
2. query principali;
3. competitor;
4. slug attuale;
5. slug alternativo SEO;
6. rischio rename;
7. presenza pagine SEO;
8. presenza richieste DB;
9. decisione: tenere, rinominare, alias, landing dedicata.

---

## Regola pratica finale

Per ogni nuovo intervento chiedersi:

1. L’utente lo cerca davvero così?
2. È un lavoro autonomo o un sotto-caso?
3. Merita un funnel dedicato?
4. Merita una futura landing SEO?
5. Cannibalizza un intervento esistente?
6. Il nome funziona nel hub pubblico?
7. Lo slug è stabile per anni?

Se la risposta è sì, può diventare intervento.

Se è solo una variante, diventa alias o domanda funnel.

Se è un money-term forte ma tecnico, può diventare landing SEO dedicata agganciata a un funnel più ampio.
