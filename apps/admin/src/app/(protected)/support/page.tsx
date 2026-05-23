import {
  listAdminSupportConversations,
} from "@fixpro/db";
import {
  Badge,
  Card,
  CardContent,
  PageShell,
} from "@fixpro/ui";

import {
  requireAdmin,
} from "../../../auth/server";

import {
  SupportChannelList,
} from "./_components/support-channel-list";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  const admin =
    await requireAdmin();
  const result =
    await listAdminSupportConversations({
      userId: admin.userId,
    });
  const conversationCount =
    result.ok
      ? result.conversations.length
      : 0;
  const unreadCount =
    result.ok
      ? result.conversations.filter(
          (conversation) =>
            conversation.hasUnread,
        ).length
      : 0;

  return (
    <PageShell size="lg" className="py-8 md:py-10">
      <section className="space-y-7">
        <header className="border-b border-border-primary pb-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-text-muted">
                Control room
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
                Assistenza
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
                Messaggi operativi tra imprese e team FixPro.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="neutral">
                {conversationCount} imprese
              </Badge>
              <Badge
                variant={unreadCount > 0 ? "danger" : "success"}
              >
                {unreadCount} non letti
              </Badge>
            </div>
          </div>
        </header>

        {result.ok ? (
          <SupportChannelList
            channels={result.conversations}
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary">
                {result.message}
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </PageShell>
  );
}
