import Link from "next/link";

import type {
  AdminSupportConversationListItem,
} from "@fixpro/db";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fixpro/ui";

type SupportChannelListProps = {
  channels: AdminSupportConversationListItem[];
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getCompanyName(
  channel: AdminSupportConversationListItem,
) {
  return channel.company?.name ?? "Impresa";
}

function getStatusVariant(
  channel: AdminSupportConversationListItem,
) {
  return channel.isResolved
    ? "success"
    : "warning";
}

function getStatusLabel(
  channel: AdminSupportConversationListItem,
) {
  return channel.isResolved
    ? "Risolta"
    : "Aperta";
}

export function SupportChannelList({
  channels,
}: SupportChannelListProps) {
  if (channels.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-text-secondary">
            Nessun canale di assistenza disponibile.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {channels.map((channel) => (
        <Link
          key={channel.id}
          href={`/support/${encodeURIComponent(channel.id)}`}
          className="block"
        >
          <Card className="transition-colors hover:bg-surface-secondary">
            <CardHeader className="gap-4 sm:flex sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">
                    {getCompanyName(channel)}
                  </CardTitle>

                  <Badge
                    variant={getStatusVariant(channel)}
                    size="sm"
                  >
                    {getStatusLabel(channel)}
                  </Badge>

                  {channel.hasUnread ? (
                    <Badge variant="danger" size="sm">
                      Nuovo
                    </Badge>
                  ) : null}
                </div>

                <CardDescription>
                  Assistenza Esigenta
                </CardDescription>
              </div>

              <time className="text-sm text-text-muted">
                {formatDateTime(channel.updatedAt)}
              </time>
            </CardHeader>

            <CardContent>
              <p className="line-clamp-2 text-sm leading-6 text-text-secondary">
                {channel.lastMessage?.body ??
                  "Nessun messaggio ancora inviato."}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
