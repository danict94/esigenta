// Revisione 2026-08 (Scope 4): FAQ interamente riscritte per allinearsi al
// modello a 18 PriceRow implementato nello Scope 3 (3 scenari 40-60/55-90/
// 80-110 €/mq, punto luce/presa completi con traccia inclusa, comando
// aggiuntivo, punto su predisposizione, 2 circuiti, 3 fasce quadro
// completo, 2 tracce, equipotenziale, 3 costi da valutare). Nessun vecchio
// numero (Hero 45-80, punto luce 26,85 €, presa 49,72/56,07 € come risposta
// PRINCIPALE) è rimasto: i valori ufficiali storici compaiono SOLO come
// confronto tecnico esplicitamente contestualizzato (FAQ 5), mai come
// risposta diretta a "quanto costa". 12 FAQ (accorpate dalle 16 domande
// richieste, nessuna sovrapposizione), copre esplicitamente anche
// Dichiarazione di conformità e progetto — la vecchia omissione normativa.
// Micro-fix chiusura finale: la risposta sulla DiCo diceva "non è una
// prestazione aggiuntiva a pagamento" — troppo assoluta, poteva far
// leggere la DiCo come sempre gratuita per definizione invece di un
// obbligo dell'impresa comunque da verificare nel preventivo. Sostituita
// con "non è un optional del rifacimento... nel preventivo è bene
// verificare che la documentazione finale prevista sia compresa nel
// prezzo", riferimento D.M. 37/2008 art. 7 invariato.
export const rifareImpiantoElettricoFaq = [
  {
    question: "Quanto costa rifare un impianto elettrico al mq?",
    answer:
      "Indicativamente da 55 € a 90 € al mq per il rifacimento completo standard: normali tracce e chiusura grezza comprese, finitura estetica della parete esclusa. È una fascia editoriale Esigenta, non il prezzo di un singolo prezzario: il preventivo reale dipende soprattutto da quanto delle canalizzazioni esistenti è riutilizzabile, dal numero di punti e circuiti richiesti e dall'articolazione del quadro elettrico. Un rifacimento più leggero, con canalizzazioni in buona parte riutilizzabili, costa indicativamente meno (40–60 €/mq); un impianto più articolato, con molte linee dedicate, costa indicativamente di più (80–110 €/mq).",
  },
  {
    question: "Quanto costa rifare l'impianto elettrico di un appartamento da 50, 100 o 150 mq?",
    answer:
      "Applicando la fascia 55–90 €/mq del rifacimento completo standard: un appartamento da 50 mq indicativamente 2.750–4.500 €, da 80 mq 4.400–7.200 €, da 100 mq 5.500–9.000 € e da 150 mq 8.250–13.500 €. Sono calcoli — superficie moltiplicata per la fascia orientativa, finitura estetica delle pareti esclusa — non preventivi: negli appartamenti più piccoli il costo al mq può risultare più alto, perché quadro, nuova uscita e verifiche non diminuiscono in proporzione alla superficie. Per uno scenario più leggero o più articolato il totale cambia di conseguenza.",
  },
  {
    question: "Cosa comprende il rifacimento completo standard, e cosa resta escluso?",
    answer:
      "Comprende nuovo impianto interno, distribuzione e circuiti ordinari, punti luce/prese/comandi standard, quadro generale completo, protezioni, le normali tracce necessarie con la loro chiusura grezza, verifiche finali e la Dichiarazione di conformità rilasciata dall'impresa abilitata al termine del lavoro. Resta escluso: la finitura estetica della parete (rasatura e tinteggiatura diffuse), la domotica avanzata, l'aumento della potenza contrattuale, il montante contatore-quadro quando va rifatto e l'adeguamento generale dell'impianto di terra quando necessario. \"Tracce comprese\" non significa \"parete pronta da pitturare\".",
  },
  {
    question: "Quando conviene lo scenario da 40–60 €/mq, e quando serve invece l'impianto più articolato da 80–110 €/mq?",
    answer:
      "Il rifacimento con canalizzazioni riutilizzabili (40–60 €/mq) si applica quando un sopralluogo conferma che buona parte di corrugati, scatole e percorsi esistenti è ancora idonea: resta comunque un rifacimento dell'impianto, non una semplice sostituzione di prese e interruttori. L'impianto più articolato (80–110 €/mq) si applica invece quando servono molte linee dedicate, un quadro più suddiviso, nuove tracce diffuse o più punti: non significa automaticamente un impianto di lusso, ma più lavoro tecnico da eseguire. I tre scenari sono configurazioni alternative in base all'ampiezza del lavoro: non vanno sommati tra loro.",
  },
  {
    question: "Quanto costa un punto luce completo? E una presa?",
    answer:
      "Un punto luce completo con un comando costa indicativamente da 70 € a 110 € cad: comprende l'uscita luce, il comando standard, il corrugato, i conduttori, le scatole, il frutto/placca, i collegamenti e la normale traccia locale con la sua chiusura grezza. Una presa elettrica completa standard costa da 60 € a 90 € cad, con lo stesso principio (traccia locale e chiusura grezza comprese). In entrambi i casi restano esclusi il corpo illuminante, una linea dedicata lunga dal quadro, la rasatura e la tinteggiatura: non è \"70–110 € = parete già rasata e pitturata\". I prezzari regionali ufficiali quotano voci di solo punto (26,85–31,88 € per il punto luce, 49,72–56,07 € per la presa) che escludono sempre la traccia: hanno un perimetro diverso, non sono direttamente confrontabili con queste fasce.",
  },
  {
    question:
      "Che differenza c'è tra un comando aggiuntivo e un nuovo punto luce, o tra un punto nuovo e uno su predisposizione esistente?",
    answer:
      "Il comando aggiuntivo (deviato/invertito, 45–70 € cad) riguarda l'aggiunta di un secondo punto di comando a una luce già cablata, per esempio per accenderla da due posizioni diverse: non crea un nuovo punto luce. Il punto su predisposizione esistente (25–45 € cad) si applica invece solo quando scatola, corrugato e percorso sono già presenti e utilizzabili: comprende solo apparecchio, collegamento, posa e verifica, non la creazione della predisposizione. Se invece serve un punto luce completamente nuovo, con traccia inclusa, la voce corretta è \"punto luce completo\" qui sopra.",
  },
  {
    question: "Quanto costa rifare il quadro elettrico completo? Cosa significa \"quadro da 4/6/8–10 circuiti\"?",
    answer:
      "Un quadro generale completo costa indicativamente da 500 a 800 € per una configurazione con circa 4 circuiti protetti, da 650 a 1.000 € per circa 6 circuiti, da 850 a 1.400 € per circa 8–10 circuiti — materiale e posa comprese: centralino, dispositivi di protezione, cablaggio interno, morsetti, identificazione dei circuiti e verifica finale. Sono ordini di grandezza per orientarsi, non un'architettura fissa valida per ogni casa: la configurazione reale (numero di magnetotermici, differenziali, eventuali protezioni aggiuntive) dipende dal progetto. Le tre fasce sono alternative in base al numero di circuiti: non vanno sommate tra loro.",
  },
  {
    question: "I moduli del centralino sono la stessa cosa dei circuiti dell'abitazione?",
    answer:
      "No. Il numero di moduli indica lo spazio fisico disponibile nel centralino, non il numero di circuiti protetti dell'abitazione: un contenitore da 12 moduli, per esempio, può ospitare un numero di circuiti reali inferiore a 12, perché interruttore generale, differenziali e magnetotermici occupano moduli propri. Le fasce del quadro completo qui sopra sono organizzate per numero di circuiti, non per numero di moduli.",
  },
  {
    question: "Quanto costa aggiungere una nuova linea/circuito? E il montante è la stessa cosa?",
    answer:
      "Un circuito interno standard, per illuminazione e prese di uso ordinario, costa indicativamente da 200 a 300 € cad; un circuito dedicato a un carico specifico (forno, climatizzazione, un grande elettrodomestico), con sezione maggiore, costa da 250 a 400 € cad. La sezione del cavo viene dimensionata dal professionista in base al carico, non è una scelta libera del cliente. Il montante è un'altra cosa: è il collegamento tra il punto di consegna/contatore e il quadro dell'abitazione, a monte di tutti i circuiti interni. Il suo costo dipende da percorso, lunghezza, sezione, piano, parti comuni e condizioni del cavidotto esistente: richiede sempre una valutazione dedicata, senza una fascia standard.",
  },
  {
    question: "Quanto costa adeguare la messa a terra? Cos'è invece il collegamento equipotenziale?",
    answer:
      "L'adeguamento o rifacimento generale dell'impianto di terra (dispersore, conduttore di protezione principale, collegamenti) dipende dall'impianto esistente, dal tipo di edificio e dalle verifiche necessarie: richiede una valutazione dedicata, senza una fascia standard. Il collegamento equipotenziale locale o di un vano (tipicamente il bagno) è invece una lavorazione più circoscritta, che costa 188,81 € cad: collega tra loro le parti conduttrici di un locale, ma non equivale al rifacimento dell'impianto di terra dell'abitazione.",
  },
  {
    question: "La Dichiarazione di conformità è compresa nel prezzo?",
    answer:
      "La Dichiarazione di conformità non è un optional del rifacimento: al termine dei lavori, dopo le verifiche previste, l'impresa installatrice abilitata deve rilasciarla al committente (D.M. 37/2008, art. 7). Nel preventivo è bene verificare che la documentazione finale prevista sia compresa nel prezzo dell'intervento. Diverso è il caso della Dichiarazione di Rispondenza (DiRi), che riguarda impianti preesistenti in situazioni specifiche disciplinate dallo stesso decreto, non un rifacimento nuovo come quello descritto in questa guida.",
  },
  {
    question: "Serve sempre un progetto per rifare l'impianto?",
    answer:
      "Il rifacimento dell'impianto deve essere accompagnato dalla documentazione tecnica prevista dal D.M. 37/2008. Nei casi ordinari il progetto può rientrare nella documentazione predisposta dal responsabile tecnico dell'impresa; quando vengono superate le soglie previste dalla normativa (per un'utenza domestica, indicativamente potenza impegnata superiore a 6 kW o superficie superiore a 400 mq) o ricorrono altre condizioni specifiche, il progetto deve essere redatto da un professionista iscritto all'albo, con un costo ulteriore rispetto al rifacimento. Progetto non significa quindi automaticamente un costo professionale esterno: dipende dal caso.",
  },
];
