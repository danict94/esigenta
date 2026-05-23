import {
  revalidatePath,
} from "next/cache";
import {
  redirect,
} from "next/navigation";

import {
  getAdminConversationThread,
  markConversationRead,
  resolveSupportConversation,
  sendConversationMessage,
} from "@fixpro/db";
import {
  Button,
  Card,
  CardContent,
  PageShell,
} from "@fixpro/ui";

import {
  requireAdmin,
} from "../../../../auth/server";

import {
  AdminMessageForm,
} from "../_components/admin-message-form";
import {
  SupportThread,
} from "../_components/support-thread";

export const dynamic = "force-dynamic";

type AdminSupportThreadPageProps = {
  params: Promise<{
    conversationId: string;
  }>;
  searchParams: Promise<{
    sent?: string | string[];
    resolved?: string | string[];
    error?: string | string[];
  }>;
};

function readSearchParam(
  value?: string | string[],
) {
  return Array.isArray(value)
    ? value[0]
    : value;
}

function buildSupportThreadHref(
  conversationId: string,
  params?: Record<string, string>,
) {
  const query =
    params &&
    new URLSearchParams(params).toString();

  return query
    ? `/support/${encodeURIComponent(conversationId)}?${query}`
    : `/support/${encodeURIComponent(conversationId)}`;
}

function getStatusMessage({
  sent,
  resolved,
  error,
}: {
  sent: string | undefined;
  resolved: string | undefined;
  error: string | undefined;
}) {
  if (sent === "1") {
    return "Risposta inviata.";
  }

  if (resolved === "1") {
    return "Canale assistenza chiuso.";
  }

  if (error) {
    return "Non siamo riusciti a completare l'operazione.";
  }

  return null;
}

export default async function AdminSupportThreadPage({
  params,
  searchParams,
}: AdminSupportThreadPageProps) {
  const [
    resolvedParams,
    resolvedSearchParams,
    admin,
  ] = await Promise.all([
    params,
    searchParams,
    requireAdmin(),
  ]);
  const { conversationId } =
    resolvedParams;
  const result =
    await getAdminConversationThread({
      conversationId,
      userId: admin.userId,
    });

  if (
    result.ok &&
    result.thread.type === "SUPPORT"
  ) {
    await markConversationRead({
      conversationId,
      reader: {
        actorType: "ADMIN",
        userId: admin.userId,
      },
    });
  }

  const statusMessage =
    getStatusMessage({
      sent: readSearchParam(
        resolvedSearchParams.sent,
      ),
      resolved: readSearchParam(
        resolvedSearchParams.resolved,
      ),
      error: readSearchParam(
        resolvedSearchParams.error,
      ),
    });

  async function sendAdminMessageAction(
    formData: FormData,
  ) {
    "use server";

    const currentAdmin =
      await requireAdmin();
    const body =
      String(formData.get("body") ?? "");
    const sendResult =
      await sendConversationMessage({
        conversationId,
        body,
        sender: {
          actorType: "ADMIN",
          userId:
            currentAdmin.userId,
        },
      });

    if (!sendResult.ok) {
      redirect(
        buildSupportThreadHref(conversationId, {
          error: sendResult.code,
        }),
      );
    }

    revalidatePath("/support");
    revalidatePath(
      buildSupportThreadHref(conversationId),
    );
    revalidatePath("/", "layout");

    redirect(
      buildSupportThreadHref(conversationId, {
        sent: "1",
      }),
    );
  }

  async function resolveSupportAction() {
    "use server";

    const currentAdmin =
      await requireAdmin();
    const resolveResult =
      await resolveSupportConversation({
        conversationId,
        userId:
          currentAdmin.userId,
      });

    if (!resolveResult.ok) {
      redirect(
        buildSupportThreadHref(conversationId, {
          error: resolveResult.code,
        }),
      );
    }

    revalidatePath("/support");
    revalidatePath(
      buildSupportThreadHref(conversationId),
    );
    revalidatePath("/", "layout");

    redirect(
      buildSupportThreadHref(conversationId, {
        resolved: "1",
      }),
    );
  }

  return (
    <PageShell size="lg" className="py-8 md:py-10">
      <section className="space-y-6">
        <header className="border-b border-border-primary pb-6">
          <p className="text-sm font-medium text-text-muted">
            Assistenza
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
            Messaggi assistenza
          </h1>
        </header>

        {statusMessage ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary">
                {statusMessage}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {result.ok &&
        result.thread.type === "SUPPORT" ? (
          <SupportThread
            thread={result.thread}
            actions={
              result.thread.isResolved ? null : (
                <form action={resolveSupportAction}>
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                  >
                    Chiudi assistenza
                  </Button>
                </form>
              )
            }
          >
            <AdminMessageForm
              action={sendAdminMessageAction}
            />
          </SupportThread>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary">
                {result.ok
                  ? "Questo non e un canale di assistenza."
                  : result.message}
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </PageShell>
  );
}
