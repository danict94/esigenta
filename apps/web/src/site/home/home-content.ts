export type SearchResult = {
  id: string;
  name: string;
  slug: string;
};

export type ScatterTag = {
  label: string;
  dx: string;
  dy: string;
  dr: string;
  gx: string;
  gy: string;
  delay: string;
  floatX: string;
  floatY: string;
  floatR: string;
};

export type FeaturedWork = {
  idx: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  imageSrc: string;
  imageAlt: string;
  fallbackLabel: string;
  tone: "terra" | "cotto" | "salvia";
  reverse?: boolean;
};

export const preloadedResults: SearchResult[] = [
  { id: "preload-1", name: "Ristrutturare bagno", slug: "ristrutturare-bagno" },
  { id: "preload-2", name: "Rifare tetto", slug: "rifare-tetto" },
  {
    id: "preload-3",
    name: "Installare fotovoltaico",
    slug: "installare-fotovoltaico",
  },
];

export const scatterTags: ScatterTag[] = [
  {
    label: "fotovoltaico",
    dx: "-220px",
    dy: "-230px",
    dr: "6deg",
    gx: "-35px",
    gy: "-35px",
    delay: "0ms",
    floatX: "6px",
    floatY: "8px",
    floatR: "1deg",
  },
  {
    label: "bagno",
    dx: "-250px",
    dy: "275px",
    dr: "-7deg",
    gx: "-40px",
    gy: "40px",
    delay: "240ms",
    floatX: "7px",
    floatY: "-8px",
    floatR: "-1deg",
  },
  {
    label: "elettrico",
    dx: "260px",
    dy: "275px",
    dr: "8deg",
    gx: "45px",
    gy: "40px",
    delay: "360ms",
    floatX: "-7px",
    floatY: "-7px",
    floatR: "1deg",
  },
];

export const featuredWorks: FeaturedWork[] = [
  {
    idx: "01 - Bagno",
    title: "Ristrutturazione bagno",
    description:
      "Dal rifacimento completo alla sostituzione di sanitari e rivestimenti: una richiesta chiara per partire con il piede giusto.",
    href: "/interventi/ristrutturare-bagno",
    cta: "SCOPRI IL PERCORSO BAGNO",
    imageSrc: "/assets/images/rifare-bagno.webp",
    imageAlt: "Bagno ristrutturato con rivestimenti chiari e sanitari moderni",
    fallbackLabel: "Foto ristrutturazione bagno",
    tone: "terra",
  },
  {
    idx: "02 - Tetto",
    title: "Rifacimento tetto",
    description:
      "Coperture, infiltrazioni, isolamento e manutenzioni importanti: raccogli i dettagli e raggiungi imprese adatte al lavoro.",
    href: "/interventi/rifare-tetto",
    cta: "SCOPRI IL PERCORSO TETTO",
    imageSrc: "/assets/images/rifacimento-tetto.webp",
    imageAlt: "Operaio al lavoro su un tetto con tegole",
    fallbackLabel: "Foto rifacimento tetto",
    tone: "salvia",
    reverse: true,
  },
  {
    idx: "03 - Impianti",
    title: "Impianto elettrico",
    description:
      "Adeguamenti, rifacimenti e nuove linee domestiche: trasformi un bisogno tecnico in una richiesta comprensibile.",
    href: "/interventi/rifare-impianto-elettrico",
    cta: "SCOPRI IL PERCORSO ELETTRICO",
    imageSrc: "/assets/images/impianto-elettrico.webp",
    imageAlt: "Quadro elettrico domestico durante un intervento tecnico",
    fallbackLabel: "Foto impianto elettrico",
    tone: "cotto",
  },
  {
    idx: "04 - Energia",
    title: "Fotovoltaico",
    description:
      "Impianti solari, sopralluoghi e configurazioni iniziali: parti dai dati utili e confronti proposte coerenti.",
    href: "/interventi/installare-fotovoltaico",
    cta: "SCOPRI IL PERCORSO ENERGIA",
    imageSrc: "/assets/images/installazione-fotovoltaico.webp",
    imageAlt: "Pannelli fotovoltaici installati sul tetto di una casa",
    fallbackLabel: "Foto installazione fotovoltaico",
    tone: "salvia",
    reverse: true,
  },
  {
    idx: "05 - Clima",
    title: "Climatizzazione",
    description:
      "Installazione o sostituzione del climatizzatore: descrivi ambienti, tempi e necessita senza perdere informazioni.",
    href: "/interventi/installare-climatizzatore",
    cta: "SCOPRI IL PERCORSO CLIMA",
    imageSrc: "/assets/images/climatizzazione.webp",
    imageAlt: "Climatizzatore installato in un ambiente domestico",
    fallbackLabel: "Foto climatizzazione",
    tone: "cotto",
  },
];
