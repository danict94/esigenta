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
  { id: "preload-3", name: "Installare fotovoltaico", slug: "installare-fotovoltaico" },
];

export const scatterTags: ScatterTag[] = [
  { label: "perdita", dx: "-430px", dy: "-126px", dr: "-12deg", gx: "-68px", gy: "18px", delay: "0ms", floatX: "10px", floatY: "-14px", floatR: "2deg" },
  { label: "bagno", dx: "-278px", dy: "164px", dr: "9deg", gx: "-24px", gy: "74px", delay: "90ms", floatX: "-12px", floatY: "10px", floatR: "-2deg" },
  { label: "tetto", dx: "276px", dy: "-176px", dr: "13deg", gx: "48px", gy: "-42px", delay: "170ms", floatX: "14px", floatY: "12px", floatR: "-2deg" },
  { label: "elettrico", dx: "404px", dy: "78px", dr: "-8deg", gx: "82px", gy: "28px", delay: "250ms", floatX: "-10px", floatY: "-12px", floatR: "2deg" },
  { label: "fotovoltaico", dx: "-142px", dy: "-236px", dr: "6deg", gx: "-18px", gy: "-92px", delay: "330ms", floatX: "12px", floatY: "-10px", floatR: "-1deg" },
  { label: "clima", dx: "136px", dy: "226px", dr: "-10deg", gx: "26px", gy: "92px", delay: "410ms", floatX: "-14px", floatY: "11px", floatR: "2deg" },
  { label: "preventivo", dx: "-520px", dy: "50px", dr: "14deg", gx: "-110px", gy: "12px", delay: "490ms", floatX: "9px", floatY: "14px", floatR: "-2deg" },
  { label: "urgenza", dx: "516px", dy: "-48px", dr: "-15deg", gx: "104px", gy: "-8px", delay: "570ms", floatX: "-12px", floatY: "-10px", floatR: "2deg" },
];

export const featuredWorks: FeaturedWork[] = [
  {
    idx: "01 - Bagno",
    title: "Ristrutturazione bagno",
    description:
      "Dal rifacimento completo alla sostituzione di sanitari e rivestimenti: una richiesta chiara per partire con il piede giusto.",
    href: "/interventi/ristrutturare-bagno",
    cta: "SCOPRI IL PERCORSO BAGNO",
    imageSrc: "/assets/images/rifacimento-bagno.webp",
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
    imageSrc: "/assets/images/rifare-tetto.webp",
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
