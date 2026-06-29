# Frozen Taxonomy Governance

Questo documento e vincolante per ogni modifica alla taxonomy frozen.
Serve a evitare che il catalogo cresca per brainstorming, duplicazioni o
intuizioni non validate.

## 1. Scopo della taxonomy frozen

La taxonomy frozen definisce cosa esiste nel catalogo Esigenta.

Include:

- `ProjectGroup`: gruppi tecnici o editoriali di interventi.
- `Category`: categorie professionali o di discovery.
- `Intervention`: lavori o bisogni richiedibili dal cliente.
- Alias: sinonimi, modi comuni di cercare o nominare gli interventi.
- Relazioni tra gruppi, categorie e interventi.

La taxonomy frozen non deve contenere logica runtime del funnel.

Non deve contenere:

- preset runtime;
- capability legacy;
- regole di step, validazione o branching del funnel;
- logica di preventivazione;
- logica DB o migration.

Il funnel risolve il proprio modello tramite
`resolveFunnelModel(interventionSlug)`.

## 2. Regola madre

**Non aggiungere interventi perche potrebbero esistere. Aggiungere pochi
interventi per volta, solo quando sono riconoscibili dal cliente, distinti
dagli esistenti e utili al preventivo.**

Un intervento nuovo e una nuova superficie di catalogo, funnel, DB, ricerca,
matching, richieste salvate e UX. Va trattato come una decisione di prodotto,
non come un semplice dato.

## 3. Filtri obbligatori prima di aggiungere un intervento

Ogni nuovo intervento deve passare questi quattro filtri.

1. Il cliente lo riconosce come lavoro o bisogno reale?
2. E abbastanza diverso dagli interventi gia presenti?
3. Cambia davvero preventivo, materiali, complessita o tipo di professionista?
4. Richiede domande proprie utili nel funnel?

Se non passa questi filtri, non va aggiunto come intervento separato.

## 4. Variante vs intervento separato

Prima di aggiungere un intervento, decidere se il caso e:

- una variante di un intervento esistente;
- un lavoro distinto;
- un tema tecnico, normativo o delicato.

Regole:

- Se e una variante di un intervento esistente, va coperta con chip/opzioni
  nel modello funnel.
- Se e davvero un lavoro distinto, puo diventare intervento.
- Se e tecnico, normativo o delicato, va prima in backlog.

Esempi dal gruppo Cartongesso:

- `realizzare-struttura-in-cartongesso-su-misura`: intervento separato valido.
- `riparare-o-modificare-cartongesso`: intervento separato valido.
- Insonorizzazione: per ora meglio come chip acustico dentro parete,
  controparete o controsoffitto.
- Isolamento termico/muffa: tema delicato; non promettere soluzione
  automatica.
- Cartongesso antincendio: backlog tecnico/normativo.

## 5. Batch piccoli

Le modifiche taxonomy devono procedere a batch piccoli.

Regole:

- massimo 1-2 nuovi interventi per batch;
- prima audit;
- poi implementazione;
- poi test browser, se la modifica tocca superfici utente;
- poi eventuale sync DB locale, solo se approvato;
- solo dopo si passa a un altro gruppo.

Non ampliare piu gruppi insieme senza una decisione esplicita.

## 6. Slug

Gli slug sono contratti stabili tra taxonomy, DB, funnel e richieste salvate.

Regole:

- Non cambiare slug esistenti senza decisione esplicita.
- Usare slug leggibili, stabili e coerenti.
- Prima di creare uno slug, cercare se esiste gia un intervento simile.
- Non creare slug quasi duplicati.
- Non usare slug troppo tecnici se il cliente non riconosce quel lavoro.

Cambiare uno slug puo rompere:

- richieste salvate;
- route funnel;
- search;
- DB locale o produzione;
- modelli funnel bespoke;
- report o log storici.

## 7. Relazione taxonomy / funnel

Ogni intervento puo avere un modello bespoke in:

`packages/funnel/src/intervention-models`

Regole:

- Se un intervento e attivo nella taxonomy e richiede domande specifiche, deve
  avere un modello funnel coerente.
- Evitare modelli funnel registrati per interventi non presenti nella taxonomy
  attiva.
- Evitare interventi taxonomy senza strategia funnel, salvo scelta esplicita di
  usare il modello default.
- Non reintrodurre preset.
- Non spostare logica runtime dentro la taxonomy.

La taxonomy decide cosa esiste. Il funnel decide come raccogliere le risposte.

### Regola funnel per interventi attivi

Ogni intervento attivo nella taxonomy deve avere una strategia funnel esplicita.

La strategia può essere:

1. modello bespoke dedicato, se l’intervento richiede domande specifiche;
2. modello default, solo se l’intervento è davvero semplice/generico e la scelta è dichiarata;
3. backlog, se l’intervento non è ancora pronto per essere esposto.

Non lasciare interventi attivi “per dopo” senza decidere come verranno raccolte le informazioni nel funnel.

Prima di chiudere una modifica taxonomy, verificare sempre:

- quale modello funnel usa ogni intervento;
- se cade nel default generico;
- se servono step specifici;
- se `answerDisplay` produce label leggibili lato impresa;
- se foto, nota, timing e contact sono coerenti;
- se le domande non obbligano il cliente a sapere cose tecniche.

Un intervento attivo senza strategia funnel chiara è incompleto.

## 8. Sync DB

Non fare sync DB senza approvazione.

Il sync frozen puo creare o aggiornare interventi, gruppi e alias nel DB. Se non
esiste un concetto di `hidden`, tutto cio che resta nella taxonomy attiva puo
diventare visibile nelle superfici DB-driven.

Prima dello sync:

- controllare cosa e stato aggiunto;
- controllare cosa e stato rimosso;
- controllare alias e slug;
- verificare che i modelli funnel siano coerenti;
- chiarire se lo sync e solo locale o anche di produzione.

Regole:

- In locale, sync solo dopo audit e approvazione.
- In produzione, sync solo con cautela, backup e piano di rollback.
- Non usare lo sync per "vedere cosa succede".

## 9. Generated

I file generated riflettono il source.

Regole:

- Dopo una modifica approvata alla taxonomy source, rigenerare i generated.
- Non modificare generated a mano.
- Se generated e source divergono, il source e la fonte da correggere.
- Non rigenerare generated durante un audit descrittivo.

## 10. Cose vietate

E vietato:

- reintrodurre preset;
- aggiungere interventi da brainstorming senza filtro;
- fare sync DB automaticamente;
- fare migration DB durante una modifica taxonomy normale;
- creare interventi duplicati o troppo simili;
- usare termini troppo tecnici se il cliente non li capisce;
- promettere risultati tecnici o normativi non garantiti;
- cambiare slug esistenti senza decisione esplicita;
- modificare generated a mano;
- trattare la taxonomy come luogo per logica runtime.

## 11. Checklist prima di chiudere una modifica taxonomy

Prima di chiudere una modifica taxonomy, verificare:

- [ ] Gli interventi nuovi passano i quattro filtri.
- [ ] Non ci sono duplicati o quasi duplicati.
- [ ] Gli slug sono coerenti e stabili.
- [ ] Il source e aggiornato.
- [ ] I generated sono aggiornati, se la modifica e approvata.
- [ ] Il modello funnel e coerente, se necessario.
- [ ] `pnpm -r typecheck` e ok, se sono stati toccati source o funnel.
- [ ] `pnpm build` e ok, se la modifica impatta superfici applicative.
- [ ] Sync DB non eseguito, salvo approvazione esplicita.
- [ ] Test browser pianificato o eseguito, se serve.

## 12. Cartongesso come esempio

Cartongesso e il primo gruppo usato come esempio domain-driven.

Mappa attiva finale:

- `realizzare-parete-cartongesso`
- `realizzare-controsoffitto`
- `realizzare-controparete`
- `realizzare-struttura-in-cartongesso-su-misura`
- `riparare-o-modificare-cartongesso`

Backlog:

- isolamento acustico autonomo;
- isolamento termico/muffa;
- cartongesso antincendio.

Questi backlog non devono essere riaggiunti automaticamente alla taxonomy
attiva. Devono passare da audit, decisione prodotto e modello funnel coerente.
