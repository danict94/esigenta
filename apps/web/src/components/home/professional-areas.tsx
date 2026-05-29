import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Card, CardContent, cn, tokens } from "@fixpro/ui";

import { HomeContentRail } from "../layout/home-content-rail";
import { HomeImage } from "./home-image";

type ProjectArea = {
  description: string;
  href: string;
  imageSrc: string;
  title: string;
};

const projects: ProjectArea[] = [
  {
    title: "Elettricista",
    description:
      "Devi rifare l'impianto o hai bisogno di un altro intervento? Vedi.",
    href: "/richiesta/elettricista",
    imageSrc: "/assets/images/home/elettricista.webp",
  },
  {
    title: "Climatizzazione",
    description:
      "Installazione climatizzatore, pompe di aerazione e altri lavori.",
    href: "/richiesta/climatizzazione",
    imageSrc: "/assets/images/home/climatizzazione.webp",
  },
  {
    title: "Fotovoltaico",
    description: "Scopri i vantaggi del fotovoltaico e i suoi benefici.",
    href: "/richiesta/fotovoltaico",
    imageSrc: "/assets/images/home/fotovoltaico.webp",
  },
];

export function ProfessionalAreas() {
  return (
    <section
      id="progetti-piu-richiesti"
      className={cn(tokens.home.sectionGap)}
    >
      <HomeContentRail>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={tokens.home.sectionLabel}>
              Richieste comuni
            </p>

            <h2 className={cn("mt-2", tokens.home.sectionTitle)}>
              I progetti più richiesti
            </h2>

            <p className={cn("mt-3", tokens.home.sectionDescription)}>
              Parti da un'area di intervento e scopri quali lavori puoi
              richiedere.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="hidden items-center gap-2 text-action-primary md:flex"
            >
              <ArrowLeft className="size-5" />
              <ArrowRight className="size-5" />
            </div>

            <Link
              href="#progetti-piu-richiesti"
              className={cn(
                tokens.interactive.base,
                tokens.interactive.variants.secondary,
                "h-11 gap-2 rounded-full px-5 text-sm",
              )}
            >
              Esplora categorie
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3 lg:gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </HomeContentRail>
    </section>
  );
}

function ProjectCard({ project }: { project: ProjectArea }) {
  return (
    <Card className="flex min-w-0 flex-col overflow-hidden border-transparent transition-shadow hover:shadow-surface">
      <HomeImage
        src={project.imageSrc}
        alt={project.title}
        sizes="(min-width: 1024px) 360px, (min-width: 768px) 30vw, 100vw"
        fallbackLabel={`Foto ${project.title}`}
        className="aspect-video bg-surface-tertiary"
      />

      <CardContent className="flex flex-1 flex-col px-5 pb-5 pt-5">
        <h3 className="text-lg font-semibold text-text-primary">
          {project.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {project.description}
        </p>

        <Link
          href={project.href}
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-action-primary transition-colors hover:text-action-primary-hover"
        >
          Scopri lavori
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}
