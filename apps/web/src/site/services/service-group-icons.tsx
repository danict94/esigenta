// Icone linea per ambito, una per ciascuno dei 20 project group della
// taxonomy. Geometria copiata 1:1 da docs/servizi.html (mai ridisegnata):
// qui sono solo trascritte in componenti React, per poterle colorare via
// currentColor invece che come markup statico.
type ServiceGroupIconProps = {
  className?: string;
};

function IconSvg({ className, children }: ServiceGroupIconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function RistrutturazioniIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <path d="M6 26 6 12l10-7 10 7v14" />
      <path d="M12 26v-8h8v8" />
    </IconSvg>
  );
}

function TettiIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <path d="M4 17 16 7l12 10" />
      <path d="M8 17v8h16v-8" />
      <path d="M13 20h6v5h-6z" />
    </IconSvg>
  );
}

function FotovoltaicoIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <rect x="5" y="9" width="22" height="14" rx="1" />
      <path d="M5 14h22M5 19h22M12 9v14M20 9v14" />
    </IconSvg>
  );
}

function FacciateEBalconiIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <rect x="6" y="5" width="20" height="22" rx="1" />
      <path d="M6 14h20M6 20h20" />
      <path d="M4 20h2M26 20h2" />
    </IconSvg>
  );
}

function PavimentazioniIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <rect x="5" y="5" width="9" height="9" />
      <rect x="18" y="5" width="9" height="9" />
      <rect x="5" y="18" width="9" height="9" />
      <rect x="18" y="18" width="9" height="9" />
    </IconSvg>
  );
}

function FinitureIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <path d="M8 24 22 10a3 3 0 0 1 4 4L12 28z" />
      <path d="M6 28l2-6 4 4z" />
    </IconSvg>
  );
}

function CartongessoIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <rect x="5" y="7" width="22" height="5" />
      <rect x="5" y="14" width="22" height="5" />
      <rect x="5" y="21" width="22" height="5" />
    </IconSvg>
  );
}

function ImpiantiElettriciIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <path d="M17 4 8 18h7l-2 10 11-14h-7z" />
    </IconSvg>
  );
}

function IdraulicaIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <path d="M12 5h8v5l3 3v3H9v-3l3-3z" />
      <path d="M16 16v6a4 4 0 0 0 8 0v-2" />
    </IconSvg>
  );
}

function ClimatizzazioneIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <rect x="4" y="10" width="24" height="8" rx="3" />
      <path d="M9 21q2 3 0 6M16 21q2 3 0 6M23 21q2 3 0 6" />
    </IconSvg>
  );
}

function CitofoniSicurezzaESmartHomeIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <path d="M16 4 6 8v7c0 7 4.3 11 10 13 5.7-2 10-6 10-13V8z" />
      <path d="M12 16l3 3 5-6" />
    </IconSvg>
  );
}

function OpereMurarieEDemolizioniIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <path d="M5 12h9v6H5zM18 12h9v6h-9zM5 18h9v6H5zM18 18h9v6h-9z" />
    </IconSvg>
  );
}

function SerramentiEInfissiIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <rect x="6" y="5" width="20" height="22" />
      <path d="M16 5v22M6 16h20" />
    </IconSvg>
  );
}

function RiscaldamentoIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <rect x="7" y="6" width="18" height="20" rx="1" />
      <path d="M11 6v20M16 6v20M21 6v20" />
    </IconSvg>
  );
}

function FabbroSerrandeECancelliIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <rect x="6" y="6" width="20" height="20" rx="1" />
      <path d="M6 12h20M6 18h20M6 24h20M12 6v20M20 6v20" />
    </IconSvg>
  );
}

function CaminiStufeECanneFumarieIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <path d="M10 27V15l4-9 4 9v12z" />
      <path d="M8 27h12" />
    </IconSvg>
  );
}

function EsterniEGiardinoIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <path d="M16 28V16" />
      <path d="M16 16c0-6-5-9-9-9 0 6 3 9 9 9zM16 18c0-6 5-9 9-9 0 6-3 9-9 9z" />
    </IconSvg>
  );
}

function TecniciEPraticheEdilizieIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <path d="M9 4h10l4 4v20H9z" />
      <path d="M19 4v4h4" />
      <circle cx="14" cy="20" r="3.5" />
      <path d="M12 24l-2.5 4" />
    </IconSvg>
  );
}

function CostruzioniEAmpliamentiIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <path d="M6 27V9l7 4V9l7 4V9l6 4v14z" />
      <path d="M6 27h20" />
    </IconSvg>
  );
}

function PiscineIcon(props: ServiceGroupIconProps) {
  return (
    <IconSvg {...props}>
      <rect x="5" y="7" width="22" height="13" rx="1" />
      <path d="M4 24q3-2 6 0t6 0 6 0 6 0" />
    </IconSvg>
  );
}

const ICONS_BY_GROUP_SLUG: Record<string, (props: ServiceGroupIconProps) => React.JSX.Element> = {
  ristrutturazioni: RistrutturazioniIcon,
  tetti: TettiIcon,
  fotovoltaico: FotovoltaicoIcon,
  "facciate-e-balconi": FacciateEBalconiIcon,
  pavimentazioni: PavimentazioniIcon,
  finiture: FinitureIcon,
  cartongesso: CartongessoIcon,
  "impianti-e-manutenzioni-elettriche": ImpiantiElettriciIcon,
  idraulica: IdraulicaIcon,
  climatizzazione: ClimatizzazioneIcon,
  "citofoni-sicurezza-e-smart-home": CitofoniSicurezzaESmartHomeIcon,
  "opere-murarie-e-demolizioni": OpereMurarieEDemolizioniIcon,
  "serramenti-e-infissi": SerramentiEInfissiIcon,
  riscaldamento: RiscaldamentoIcon,
  "fabbro-serrande-e-cancelli": FabbroSerrandeECancelliIcon,
  "camini-stufe-e-canne-fumarie": CaminiStufeECanneFumarieIcon,
  "esterni-e-giardino": EsterniEGiardinoIcon,
  "tecnici-e-pratiche-edilizie": TecniciEPraticheEdilizieIcon,
  "costruzioni-e-ampliamenti": CostruzioniEAmpliamentiIcon,
  piscine: PiscineIcon,
};

export function ServiceGroupIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const Icon = ICONS_BY_GROUP_SLUG[slug];

  if (!Icon) {
    return null;
  }

  return <Icon className={className} />;
}
