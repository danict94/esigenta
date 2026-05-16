import { cn, Container, tokens } from "@fixpro/ui";
import { FunnelEntry } from "./funnel-entry";

// Hero composition consumes shared layout primitives, typography tokens, and semantic palette utilities.
export function Hero() {
  return (
    <section className={tokens.spacing.sectionXl}>
      <Container size="xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <h1
                className={cn(
                  "max-w-2xl text-text-primary",
                  tokens.typography.hero,
                )}
              >
                Il modo più semplice per trovare il professionista giusto.
              </h1>

              <p className={cn("max-w-xl", tokens.typography.subtitle)}>
                Invia la tua richiesta, confronta preventivi e scegli
                professionisti verificati nella tua zona.
              </p>
            </div>

            <FunnelEntry />
          </div>

          <div
            className={cn(
              "relative aspect-[4/3] overflow-hidden border border-border-primary bg-surface-elevated",
              tokens.radius.lg,
              tokens.shadows.surface,
            )}
          >
            <div className="absolute inset-0 flex items-center justify-center text-sm text-text-muted">
              Hero visual placeholder
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
