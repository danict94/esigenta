import type { BasePriceRange } from "../../shared/types";

export const ristrutturareBagnoPricing: BasePriceRange = {
  nationalRange: "da 4.500 € a 8.000 €",
  pricePerSquareMeter: "da 800 € a 1.200 € al mq",
  sourceLabel: "Prezzari regionali ufficiali e confronto di mercato nazionale",
  sourceYear: "2025–2026",
  sourceType: "mixed",
  priceRows: [
    {
      // Scope 2B.4: role corretto da "alternative" a "scenario". Rinnovo
      // leggero e ristrutturazione completa NON sono lo stesso lavoro
      // calcolato con un metodo di prezzo diverso (quello è "alternative",
      // riservato a casi come impianto idraulico ↔ punto acqua): sono due
      // scenari di intervento diversi per ampiezza. Rimossa la relation
      // alternativeTo per lo stesso motivo — non era una vera alternativa
      // economica, avrebbe sporcato il significato del modello. "complete"
      // invariato: il pacchetto mescola elementi opzionali senza separare
      // manodopera e fornitura non sono scorporate per singola voce.
      id: "bagno-rinnovo-leggero",
      label: "Rinnovo leggero bagno",
      category: "Rinnovo leggero",
      unit: "a corpo",
      range: "da 1.500 € a 4.000 €",
      note: "",
      confidence: "media",
      costType: "complete",
      role: "scenario",
    },
    {
      // Scope 2B.2 (audit Scope 2A): perimetro chiarito senza toccare
      // prezzo/range. (1) "quando previsti dal preventivo" era l'unica
      // clausola condizionale di un elenco altrimenti sempre affermativo,
      // decisione 2 la rende incondizionata (vedi "Smaltimento macerie"
      // qui sopra). (2) "adeguamento ordinario delle tubazioni" riformulato
      // per nominare esplicitamente l'impianto idraulico e allineare il
      // linguaggio a "Impianto idraulico bagno" qui sopra (decisione 3).
      // (3) "sanitari standard" reso esplicito come fornitura+installazione
      // (decisione 6), con "di fascia premium" aggiunto agli esclusi per
      // coerenza con la stessa logica già usata per rubinetteria/piastrelle
      // pregiate.
      // Scope 2B.3: chiude i due blocker lasciati aperti dallo Scope 2B.2.
      // (1) Rubinetteria: la posa/collegamento ordinario della rubinetteria
      // scelta dal cliente rientra nella normale lavorazione (nuovo item
      // negli includes), ma la FORNITURA resta sempre una voce separata,
      // qualunque sia la fascia — "rubinetteria di fascia alta" sostituito
      // con "fornitura della rubinetteria (qualunque fascia)" negli
      // excludes: non è più una questione di fascia economica/alta, è una
      // questione di fornitura vs posa (vedi "Rubinetteria" qui sotto).
      // (2) Elettrico: "collegamenti elettrici essenziali" precisato con
      // un inciso (collegamento di punti/prese previsti, senza modifiche
      // significative) e aggiunto un item esplicito negli excludes per il
      // caso opposto — confine ora certo, vedi "Adeguamento elettrico del
      // bagno" qui sotto.
      id: "bagno-ristrutturazione-completa",
      label: "Ristrutturazione completa",
      category: "Ristrutturazione completa standard (circa 5–6 mq)",
      unit: "a corpo",
      range: "da 4.500 € a 8.000 €",
      note: "",
      confidence: "media",
      costType: "complete",
      role: "primary",
    },
    {
      // Scope 2B.3: stessa struttura di "Ristrutturazione completa" (unit
      // "a corpo", range reale, non un mero riferimento) applicata a un
      // bagno fuori dallo standard 5–6 mq.
      // Scope 2B.4: role corretto da "alternative" a "scenario" — non è lo
      // stesso lavoro della ristrutturazione completa calcolato con un
      // metodo di prezzo diverso, è la stessa NATURA di intervento
      // (nucleo identico) su un'estensione/configurazione maggiore.
      // "alternative" resta riservato alle vere alternative economiche
      // (impianto idraulico ↔ punto acqua) — relation alternativeTo
      // rimossa per lo stesso motivo. Perimetro proprio scritto qui sotto:
      // stesso nucleo di "Ristrutturazione completa" qui sopra (demolizione
      // → smaltimento → impianto interno → impermeabilizzazione → posa →
      // sanitari standard installati → finiture), scalato per maggiore
      // superficie/complessità; restano fuori gli stessi extra già
      // separati altrove nella tabella (spostamento importante scarichi,
      // rubinetteria, box doccia, materiali premium, adeguamento elettrico
      // esteso, opere strutturali, imprevisti) — così lo Scope 3 confronta
      // lo stesso perimetro della fascia standard, a una scala diversa.
      id: "bagno-ristrutturazione-complessa",
      label: "Bagno più grande o complesso",
      simpleLabel: "Bagno più grande o più complesso",
      category: "Ristrutturazione complessa o di fascia alta",
      unit: "a corpo",
      range: "da 8.000 € a 12.000 €",
      note: "",
      confidence: "media",
      costType: "complete",
      role: "scenario",
    },
    {
      // Scope 2B.3: "oltre 12.000 €, senza un massimo definito" non è un
      // prezzo determinato (né uno scenario a sé, né un extra quantificato
      // da sommare): è una soglia/avviso su cosa fa salire il costo oltre
      // la fascia complessa qui sopra. role "reference" — non un totale
      // alternativo né un extra sommabile. Nessun costType (non descrive
      // la composizione di UNA lavorazione, coerente con "Costo indicativo
      // al mq" qui sotto, stesso trattamento). Nessuna relation aggiunta:
      // la contiguità con la riga precedente è già chiara dalla categoria
      // condivisa, una relation qui sarebbe ridondante.
      id: "bagno-forniture-pregiate-imprevisti",
      label: "Forniture pregiate, modifiche importanti o imprevisti",
      category: "Ristrutturazione complessa o di fascia alta",
      range: "oltre 12.000 €, senza un massimo definito",
      note: "Può comprendere spostamento importante degli scarichi, doccia a filo pavimento complessa, sanitari sospesi con telai incassati, nicchie, piastrelle di grande formato, arredi su misura, materiali di pregio, modifiche distributive, impianti deteriorati da rifare o imprevisti scoperti dopo la demolizione.",
      role: "reference",
    },
    {
      // Scope 2B.3: già "riferimento secondario" per costruzione (vedi
      // category e note) — role "reference" lo rende esplicito nel
      // modello. Nessuna relation alternativeTo preesisteva da correggere.
      // Nessun costType: non descrive la composizione di una singola
      // lavorazione ma una lettura aggregata dell'intero progetto al mq.
      id: "bagno-costo-al-mq",
      label: "Costo indicativo al mq",
      category: "Prezzo al mq (riferimento secondario)",
      unit: "al mq",
      range: "da 800 € a 1.200 € al mq",
      note: "Riferimento secondario, utile solo per confrontare preventivi già ricevuti: in un bagno piccolo il costo al mq può essere più alto, perché sanitari, scarichi e collegamenti pesano quasi allo stesso modo indipendentemente dalla metratura. Il totale non è una semplice moltiplicazione tra superficie e questo valore.",
      includes: "demolizioni, impianti, posa e manodopera con materiali di fascia media",
      confidence: "media",
      role: "reference",
    },
    {
      // Scope 2B.2: demolizione ordinaria di pavimento/rivestimenti è
      // esplicitamente compresa negli includes di "Ristrutturazione
      // completa" qui sotto — includedIn, resta comunque autonoma per
      // lavori parziali e come riferimento al mq.
      // Chiusura Scope 3: range corretto a 20-40 €/mq. La tariffa al mq
      // incorporava anche la rimozione dei vecchi sanitari (un elemento
      // non areale) sotto la stessa tariffa di pavimento/rivestimenti —
      // segnalato dall'audit Scope 3A.1 come rischio di confronto con
      // fonti esterne. La riga copre ora solo pavimenti e rivestimenti:
      // la rimozione dei sanitari resta dov'era già dichiarata, dentro gli
      // includes di "Ristrutturazione completa" ("rimozione dei sanitari
      // esistenti"), non qui — nessuna nuova PriceRow creata. costType,
      // role e relations invariati.
      id: "bagno-demolizione-pavimenti-rivestimenti",
      label: "Demolizione pavimenti e rivestimenti",
      category: "Demolizione e smaltimento",
      unit: "al mq",
      range: "da 20 € a 40 € al mq",
      note: "sola rimozione di pavimenti e rivestimenti, prima del conferimento in discarica (vedi la voce smaltimento qui sotto); la rimozione dei sanitari è compresa nella ristrutturazione completa, non in questa tariffa al mq",
      includes: "rimozione di pavimenti e rivestimenti",
      excludes: "smaltimento delle macerie, demolizione del massetto quando necessaria, rimozione dei sanitari",
      confidence: "media",
      costType: "work",
      role: "primary",
      relations: [{ type: "includedIn", target: "bagno-ristrutturazione-completa" }],
    },
    {
      // Scope 2B.2: il precedente "quando previsti dal preventivo" negli
      // includes della ristrutturazione completa era l'unica clausola
      // condizionale in un elenco altrimenti sempre affermativo — letta
      // insieme alla nota della demolizione qui sopra ("prima del
      // conferimento in discarica", le due righe già presentate come le
      // due fasi dello stesso processo) risolta come: il trasporto e lo
      // smaltimento ORDINARI sono compresi nella ristrutturazione
      // completa, come la demolizione che li precede. includedIn, resta
      // comunque autonoma per lavori parziali.
      // Chiusura Scope 3: range corretto a 300-600 € per rappresentare la
      // situazione ordinaria (1-2 mc, bagno standard); i fattori che
      // possono farlo salire restano in nota, non nel range. costType,
      // role e relations invariati.
      id: "bagno-smaltimento-macerie",
      label: "Smaltimento macerie",
      category: "Demolizione e smaltimento",
      unit: "a corpo",
      range: "da 300 € a 600 €",
      plainExplanation: "È il trasporto e lo smaltimento autorizzato dei materiali demoliti in un impianto apposito (il conferimento in discarica).",
      note: "la fascia rappresenta la situazione ordinaria: un bagno standard produce circa 1-2 metri cubi di macerie. Il costo può salire con un volume maggiore, un accesso difficoltoso al cantiere, piani alti o logistica complessa e una maggiore distanza dal centro di conferimento",
      confidence: "media",
      costType: "work",
      role: "primary",
      relations: [{ type: "includedIn", target: "bagno-ristrutturazione-completa" }],
    },
    {
      // Scope 2B.2: "distribuzione acqua e scarichi interni al bagno" con
      // "opere murarie estese e colonne condominiali" escluse è la stessa
      // lavorazione descritta come "impianto idraulico interno ordinario"
      // negli includes della ristrutturazione completa qui sotto (stesso
      // confine ordinario/interno vs esteso/condominiale) — includedIn,
      // resta comunque autonoma per chi rifà solo l'impianto. L'alternativa
      // di calcolo verso le righe "punto acqua" qui sotto resta dichiarata
      // solo lì (relazione simmetrica, vedi isAlternativeTo): nessuna
      // relation ridondante aggiunta qui.
      // Chiusura Scope 3: nota riformulata. La vecchia formulazione ("due
      // modi di leggere lo stesso lavoro, a corpo o punto per punto")
      // poteva far intendere che il prezzo a corpo fosse la somma
      // matematica dei prezzi a punto — l'audit Scope 3A.1 aveva mostrato
      // che non torna nemmeno per un bagno minimo (3 punti completi =
      // 450-840 €, sotto il floor del pacchetto a corpo). Il prezzo a
      // punto resta utile per interventi puntuali; il prezzo a corpo
      // resta il riferimento per il rifacimento completo perché comprende
      // anche la distribuzione complessiva interna, non solo la somma dei
      // singoli punti. Prezzo, perimetro e relations invariati.
      id: "bagno-impianto-idraulico",
      label: "Impianto idraulico bagno",
      category: "Impianti",
      unit: "a corpo",
      range: "da 1.000 € a 2.500 €",
      note: "vale come pacchetto per rifare tutti i punti del bagno insieme, dal bagno piccolo con impianto semplice al bagno grande con più punti. Il prezzo a punto qui sotto è utile per interventi puntuali o per leggere singole voci del preventivo: per il rifacimento completo dell'impianto è più significativo questo prezzo a corpo, che comprende anche la distribuzione complessiva interna e non va sommato punto per punto",
      includes: "distribuzione acqua e scarichi interni al bagno",
      excludes: "opere murarie estese e colonne condominiali",
      confidence: "media",
      costType: "complete",
      role: "primary",
      relations: [{ type: "includedIn", target: "bagno-ristrutturazione-completa" }],
    },
    {
      // Scope 2B.2: alternativeTo dichiarata una sola volta (simmetrica per
      // costruzione, vedi isAlternativeTo) verso "Impianto idraulico
      // bagno". Nessun includedIn diretto verso la ristrutturazione
      // completa: sarebbe ridondante e semanticamente confuso, dato che
      // "Impianto idraulico bagno" è già includedIn quella riga — modello
      // minimo, non transitivo automaticamente ma non serve duplicarlo.
      id: "bagno-punto-acqua-semplice",
      label: "Punto acqua semplice",
      category: "Impianti",
      unit: "a punto",
      range: "da 75 € a 150 €",
      plainExplanation: "È l'allaccio di un singolo elemento, per esempio la lavatrice, alla tubazione che porta l'acqua (l'adduzione) e allo scarico, quando il punto è già pronto e serve poca opera muraria.",
      note: "singola adduzione (es. lavatrice) o punto già predisposto, con poca muratura da aprire",
      includes: "attacco di carico o scarico del singolo elemento",
      confidence: "media",
      costType: "complete",
      // Scope 2B.3: role assente equivaleva silenziosamente a "primary",
      // impreciso per una riga che è per definizione un modo alternativo
      // di leggere lo stesso lavoro di "Impianto idraulico bagno" — non un
      // prezzo principale a sé stante. relation invariata.
      role: "alternative",
      relations: [{ type: "alternativeTo", target: "bagno-impianto-idraulico" }],
    },
    {
      // Scope 2B.2: alternativeTo verso "Impianto idraulico bagno".
      // Scope 2B.3: idem correzione di role, vedi commento sopra.
      id: "bagno-punto-acqua-completo",
      label: "Punto acqua completo",
      category: "Impianti",
      unit: "a punto",
      range: "da 150 € a 280 €",
      plainExplanation: "È l'allaccio completo di un sanitario — lavabo, WC, bidet o doccia — all'acqua calda e fredda e allo scarico, comprese le aperture nel muro o nel pavimento necessarie per far passare i tubi.",
      note: "carico acqua calda e fredda più scarico per lo stesso elemento (lavabo, wc, bidet, doccia), con tracce e posa",
      includes: "carico caldo/freddo, scarico e opere murarie localizzate per il punto",
      confidence: "alta",
      costType: "complete",
      role: "alternative",
      relations: [{ type: "alternativeTo", target: "bagno-impianto-idraulico" }],
    },
    {
      // Scope 2B.1: classificata come extra condizionale (role "extra"),
      // coerente con la nota della trasformazione vasca-doccia qui sotto
      // ("aggiungi anche questa voce") e con l'esclusione esplicita dello
      // spostamento importante degli scarichi negli excludes della
      // ristrutturazione completa più sotto — relations verso entrambe.
      // Chiusura Scope 3: label e plainExplanation chiariscono che la riga
      // rappresenta lo spostamento di UN SOLO scarico, non un numero
      // indefinito. Prezzo, costType, role e relations invariati.
      id: "bagno-spostamento-scarichi",
      label: "Spostamento di uno scarico",
      category: "Impianti",
      unit: "a corpo",
      range: "da 200 € a 800 €",
      plainExplanation: "La fascia riguarda il riposizionamento di un singolo scarico valutato separatamente, per esempio quello della doccia o della vasca. Se lo spostamento è già considerato nello scenario complesso o nel preventivo complessivo, non va sommato una seconda volta.",
      note: "il range è ampio perché dipende dalla distanza dalla posizione originale: uno spostamento minimo resta nella parte bassa, un nuovo tracciato esteso su pavimento o muratura sale verso la parte alta",
      confidence: "media",
      costType: "complete",
      role: "extra",
    },
    {
      // Scope 2B.2: la posa "di fascia standard" descritta negli includes
      // della ristrutturazione completa qui sotto è questa stessa
      // lavorazione — includedIn, resta comunque autonoma per lavori
      // parziali e come riferimento al mq (invariato). Fornitura piastrelle
      // resta sempre esclusa ed è un'altra cosa, invariato.
      id: "bagno-posa-piastrelle-rivestimenti",
      label: "Posa piastrelle e rivestimenti",
      category: "Posa e finiture",
      unit: "al mq",
      range: "da 25 € a 80 € al mq",
      note: "formati grandi, mosaici o pose complesse stanno nella parte alta",
      includes: "sola posa in opera",
      excludes: "fornitura delle piastrelle",
      confidence: "alta",
      costType: "work",
      role: "primary",
      relations: [{ type: "includedIn", target: "bagno-ristrutturazione-completa" }],
    },
    {
      // Scope 2B.2: "sanitari standard" nel pacchetto completo qui sotto
      // significa fornitura E installazione (vedi il commento sulla
      // ristrutturazione completa) — il montaggio descritto qui è quindi
      // già compreso quando si tratta di sanitari standard. includedIn,
      // resta comunque autonoma per sostituzioni/lavori parziali fuori dal
      // pacchetto. Fornitura sanitario e predisposizione punto acqua
      // restano sempre escluse, invariato.
      id: "bagno-montaggio-sanitari",
      label: "Montaggio sanitari",
      category: "Posa e finiture",
      unit: "a elemento",
      range: "da 40 € a 150 €",
      note: "per wc, bidet o lavabo; i modelli sospesi richiedono più lavorazione (staffe e cassetta incassata) dei modelli a terra",
      includes: "solo montaggio e allaccio del singolo elemento agli attacchi già predisposti",
      excludes: "fornitura del sanitario, opere di predisposizione del punto acqua",
      confidence: "media",
      costType: "work",
      role: "primary",
      relations: [{ type: "includedIn", target: "bagno-ristrutturazione-completa" }],
    },
    {
      // Scope 2B.1 (audit Scope 2A): la fascia precedente (1.000-3.500 €)
      // mescolava sola lavorazione e fornitura del piatto doccia sotto lo
      // stesso prezzo — "piatto doccia standard" negli includes lasciava
      // credere che la fornitura fosse compresa. Ridefinita come SOLA
      // LAVORAZIONE (fascia e perimetro approvati in sede di decisione
      // editoriale, non ridiscussi qui): la fornitura del piatto doccia,
      // del box e della rubinetteria resta sempre a parte; il costType "work"
      // è coerente con le esclusioni di fornitura dichiarate qui sotto.
      id: "bagno-trasformazione-vasca-doccia",
      label: "Trasformazione vasca in doccia",
      category: "Posa e finiture",
      unit: "a corpo",
      range: "da 500 € a 1.000 €",
      plainExplanation: "È la sola lavorazione per sostituire la vasca con un piatto doccia: rimozione della vasca, adattamenti locali e posa del piatto. Il piatto doccia, il box doccia e la rubinetteria sono forniture separate, non comprese in questo prezzo; il montaggio del box doccia ha una voce propria qui sotto.",
      note: "Se lo scarico va spostato in modo importante rispetto alla posizione della vasca, aggiungi anche la voce \"Spostamento di uno scarico\" qui sopra. Per un rifacimento più esteso dei rivestimenti della zona doccia, vedi la voce \"Posa piastrelle e rivestimenti\". Una doccia a filo pavimento che richiede lavorazione del massetto, nuove pendenze, impermeabilizzazione specifica o una modifica significativa dello scarico non rientra in questa fascia: il prezzo specifico sarà verificato in un audit economico successivo.",
      includes: "rimozione della vasca esistente, preparazione della zona, adattamento localizzato dei collegamenti idraulici e dello scarico quando resta sostanzialmente nella stessa posizione, posa del piatto doccia fornito a parte, piccoli ripristini localizzati",
      excludes: "fornitura del piatto doccia, del box doccia, della rubinetteria o colonna doccia e dei rivestimenti o materiali decorativi, montaggio del box doccia, modifica importante della posizione dello scarico, rifacimento esteso dei rivestimenti, demolizioni estese, interventi importanti sul massetto o sul sottofondo e doccia a filo pavimento complessa",
      confidence: "media",
      costType: "work",
      role: "primary",
    },
    {
      // Scope 2B.1: chiarita esplicitamente come sola fornitura, per
      // rimuovere l'ambiguità con "piatto doccia standard" che compariva
      // negli includes della trasformazione vasca-doccia prima di questa
      // revisione. Range invariato (non oggetto di revisione economica in
      // questo Scope).
      id: "bagno-box-doccia-fornitura",
      label: "Box doccia (fornitura)",
      category: "Posa e finiture",
      unit: "a elemento",
      range: "da 250 € a 1.500 €",
      plainExplanation: "È la sola fornitura del box doccia: il prezzo del box, non compreso nella \"Trasformazione vasca in doccia\" qui sopra. Il montaggio ha una voce propria qui sotto.",
      note: "scorrevoli base in fascia bassa, cristallo temperato in fascia media, walk-in in fascia alta",
      excludes: "montaggio",
      confidence: "media",
      costType: "supply",
      role: "primary",
    },
    {
      // Scope 2B.1: nuova riga, colma il buco individuato nello Scope 2A
      // ("manca una voce montaggio box doccia" — necessità ALTA). Sola
      // installazione: fornitura del box, piatto doccia, spostamento
      // scarichi, rivestimenti e opere murarie estese restano sempre
      // fuori, così come smontaggio/smaltimento di un vecchio box, mai
      // dato per incluso di default.
      id: "bagno-montaggio-box-doccia",
      label: "Montaggio box doccia",
      category: "Posa e finiture",
      unit: "a elemento",
      range: "da 150 € a 500 €",
      plainExplanation: "È la sola installazione del box doccia già acquistato, con il piatto doccia già posato e il punto pronto per il montaggio: la fascia bassa riguarda box standard con montaggio semplice, la fascia alta box più grandi, con più lati, vetri pesanti, sistemi complessi o pareti fuori squadra che richiedono adattamenti.",
      note: "Non comprende la fornitura del box doccia (vedi la voce \"Box doccia\" qui sopra) né il piatto doccia. Lo smontaggio e lo smaltimento di un vecchio box, quando servono, non sono dati per inclusi: vanno verificati a parte.",
      includes: "montaggio del box su un piatto doccia già posato e un punto già predisposto, regolazioni e fissaggi ordinari",
      excludes: "fornitura del box doccia, fornitura e posa del piatto doccia, spostamento degli scarichi, rifacimento dei rivestimenti, opere murarie estese, smontaggio e smaltimento di un vecchio box",
      confidence: "media",
      costType: "work",
      role: "primary",
    },
    {
      // Scope 2B.3: chiude il blocker editoriale lasciato aperto dallo
      // Scope 2B.2. Decisione applicata: la fornitura della rubinetteria
      // (qualunque fascia) resta sempre una voce separata dal pacchetto
      // standard — coerente con l'excludes riformulato di "Ristrutturazione
      // completa" qui sopra ("fornitura della rubinetteria (qualunque
      // fascia)", non più "solo di fascia alta"). La posa/collegamento
      // ordinario, quando la rubinetteria è fornita a parte, rientra
      // invece nella normale lavorazione (vedi includes della
      // ristrutturazione completa). category invariata ("Da valutare con
      // il professionista" è letta dal template per il rendering
      // qualitativo, cost-page-template.tsx). Nessun range inventato.
      id: "bagno-rubinetteria",
      label: "Rubinetteria",
      category: "Da valutare con il professionista",
      range: "variabile per marca e finitura",
      plainExplanation: "Il prezzo riguarda la sola fornitura dei miscelatori e degli accessori scelti: il collegamento e la posa, quando la rubinetteria è fornita a parte, rientrano nella normale lavorazione del pacchetto o della voce di posa.",
      note: "la differenza tra fascia economica e design è troppo ampia per un range affidabile: chiedi la fornitura come voce separata del preventivo",
      costType: "supply",
      role: "primary",
      priceStatus: "quoteRequired",
    },
    {
      // Scope 2B.3: chiude la relazione lasciata NON DECIDIBILE dallo
      // Scope 2B.2, riscrivendo il confine (vedi anche l'inciso aggiunto a
      // "collegamenti elettrici essenziali" negli includes della
      // ristrutturazione completa qui sopra): questa riga rappresenta
      // interventi elettrici ulteriori rispetto ai collegamenti essenziali
      // già compresi nel pacchetto standard — role "extra" + addsTo.
      // priceStatus "quoteRequired": nessun numero affidabile, invariato
      // (range qualitativo). costType volutamente NON compilato: il testo
      // non permette di stabilire se il prezzo di questi interventi sia
      // "work" (sola posa, materiali già presenti) o "complete" (materiali
      // e manodopera non scorporabili, es. una nuova linea dedicata che
      // comprende sia il cavo sia la posa) — nessun includes/excludes lo
      // separa con certezza, a differenza di altre righe di questo Scope.
      id: "bagno-adeguamento-elettrico",
      label: "Adeguamento elettrico del bagno",
      category: "Da valutare con il professionista",
      range: "da valutare con sopralluogo",
      plainExplanation: "Riguarda eventuali interventi elettrici necessari nel bagno, come aggiunta o spostamento di punti luce e prese, nuove linee dedicate o interventi su quadro e protezioni. Sono lavorazioni da valutare separatamente in base all’impianto esistente e al progetto.",
      note: "incidono numero di punti luce e prese, stato dell'impianto esistente ed eventuale nuova linea dedicata",
      role: "extra",
      priceStatus: "quoteRequired",
    },
  ],
  sizeExamples: [
    {
      label: "Bagno da 4 mq",
      sizeRange: "4 mq",
      range: "da 3.200 € a 5.000 €",
      note: "Bagno piccolo: WC, lavabo e doccia pesano quasi come in un bagno più grande, per questo il costo al mq resta alto.",
    },
    {
      label: "Bagno da 6 mq",
      sizeRange: "6 mq",
      range: "da 4.500 € a 8.000 €",
      note: "La metratura più comune per un bagno completo: coincide con la fascia standard di questa guida.",
    },
    {
      label: "Bagno da 8 mq",
      sizeRange: "8 mq",
      range: "da 6.000 € a 10.000 €",
      note: "Più spazio per rivestimenti e finiture, ma sanitari e impianti restano lo stesso costo di base visto nei bagni più piccoli.",
    },
    {
      label: "Bagno da 10 mq",
      sizeRange: "10 mq",
      range: "da 7.500 € a 12.000 €",
      note: "Bagno grande: la superficie in più incide meno del previsto, perché il costo resta guidato soprattutto da sanitari, impianti e finiture.",
    },
  ],
};
