import {
  Container,
  cn,
  tokens,
} from '@fixpro/ui'

import { RuntimeFunnelRoute } from '../../../../components/funnel/runtime-funnel-route'
import { PublicShell } from '../../../../components/layout/public-shell'

type RequestFunnelPageProps = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    q?: string
  }>
}

export default async function RequestFunnelPage({
  params,
  searchParams,
}: RequestFunnelPageProps) {
  const { slug } = await params
  const { q } = await searchParams

  return (
    <PublicShell>
      <section className={tokens.spacing.sectionLg}>
        <Container size="md">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium text-brand-primary">
                Richiesta guidata
              </p>

              <h1
                className={cn(
                  'text-text-primary',
                  tokens.typography.title,
                )}
              >
                Raccontaci cosa ti serve.
              </h1>

              <p
                className={cn(
                  'max-w-2xl',
                  tokens.typography.body,
                  'text-text-secondary',
                )}
              >
                Pochi passaggi per preparare una richiesta chiara e utile.
              </p>
            </div>

            <RuntimeFunnelRoute
              interventionSlug={slug}
              query={q}
            />
          </div>
        </Container>
      </section>
    </PublicShell>
  )
}
