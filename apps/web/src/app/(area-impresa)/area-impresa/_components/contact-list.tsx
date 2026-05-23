import Link from "next/link"

import type {
  CompanyConversationListItem,
} from "@fixpro/db"
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fixpro/ui"

type ContactListProps = {
  contacts: CompanyConversationListItem[]
  hrefBase: string
  emptyMessage?: string
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

function formatRequestTitle(
  contact: CompanyConversationListItem,
) {
  if (contact.request?.interventionSlug) {
    return contact.request.interventionSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase(),
      )
  }

  return contact.request?.requestCode
    ? `Richiesta ${contact.request.requestCode}`
    : "Richiesta"
}

function formatCustomerName(
  contact: CompanyConversationListItem,
) {
  return (
    contact.customer?.name ??
    contact.customer?.email ??
    "Cliente"
  )
}

export function ContactList({
  contacts,
  hrefBase,
  emptyMessage = "Nessun contatto disponibile.",
}: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-text-secondary">
            {emptyMessage}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <Link
          key={contact.id}
          href={`${hrefBase}/${encodeURIComponent(
            contact.id,
          )}`}
          className="block"
        >
          <Card className="transition-colors hover:bg-surface-secondary">
            <CardHeader className="gap-4 sm:flex sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">
                    {formatCustomerName(contact)}
                  </CardTitle>

                  <Badge size="sm">
                    Messaggi
                  </Badge>

                  {contact.hasUnread ? (
                    <Badge
                      variant="danger"
                      size="sm"
                    >
                      Nuovo
                    </Badge>
                  ) : null}
                </div>

                <CardDescription>
                  {formatRequestTitle(contact)}
                </CardDescription>
              </div>

              <time className="text-sm text-text-muted">
                {formatDateTime(
                  contact.updatedAt,
                )}
              </time>
            </CardHeader>

            <CardContent>
              <p className="line-clamp-2 text-sm leading-6 text-text-secondary">
                {contact.lastMessage?.body ??
                  "Nessun messaggio ancora inviato."}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
