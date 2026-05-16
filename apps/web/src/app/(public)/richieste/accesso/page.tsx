import {
  redirect,
} from 'next/navigation'
import {
  Button,
  Card,
  Container,
  Input,
  cn,
  tokens,
} from '@fixpro/ui'

import {
  sendCustomerRequestsAccessEmail,
} from '@fixpro/db'

import { PublicShell } from '../../../../components/layout/public-shell'

type CustomerRequestsAccessPageProps = {
  searchParams: Promise<{
    sent?: string
  }>
}

async function requestCustomerAccessAction(
  formData: FormData,
) {
  'use server'

  const email =
    String(formData.get('email') ?? '')
      .trim()
      .toLowerCase()

  await sendCustomerRequestsAccessEmail({
    email,
  })

  redirect('/richieste/accesso?sent=1')
}

export default async function CustomerRequestsAccessPage({
  searchParams,
}: CustomerRequestsAccessPageProps) {
  const { sent } =
    await searchParams
  const hasSent =
    sent === '1'

  return (
    <PublicShell>
      <section className={tokens.spacing.sectionLg}>
        <Container size="sm">
          <Card
            className={cn(
              'p-6',
              tokens.radius.lg,
              tokens.shadows.surface,
            )}
          >
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <h1
                  className={cn(
                    'text-text-primary',
                    tokens.typography.title,
                  )}
                >
                  Storico richieste
                </h1>
                <p className="text-sm leading-6 text-text-secondary">
                  Inserisci l&rsquo;email usata per inviare la richiesta. Ti manderemo un link sicuro per vedere lo stato delle tue richieste, senza password.
                </p>
              </div>

              {hasSent ? (
                <p className="rounded-md border border-border-primary bg-surface-primary px-3 py-2 text-sm text-text-secondary">
                  Se l&rsquo;email &egrave; associata a richieste, riceverai un link di accesso.
                </p>
              ) : null}

              <form
                action={requestCustomerAccessAction}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-text-primary"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="rounded-md"
                  />
                </div>

                <Button
                  type="submit"
                >
                  Ricevi link allo storico
                </Button>
              </form>
            </div>
          </Card>
        </Container>
      </section>
    </PublicShell>
  )
}
