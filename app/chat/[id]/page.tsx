import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { DataStreamProvider } from "@/components/chat/data-stream-provider";
import { NovaAulaChat } from "@/components/organic/chat/nova-aula-chat";
import { OrganicShell } from "@/components/organic/organic-shell";
import { ActiveChatProvider } from "@/hooks/use-active-chat";
import { getChatById, getTurmaContextForChat } from "@/lib/db/queries";
import { auth } from "../../(auth)/auth";

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <ChatPageContent params={params} />
    </Suspense>
  );
}

async function ChatPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const chat = await getChatById({ id });

  if (!chat || chat.userId !== session.user.id) {
    notFound();
  }

  const turmaContext = await getTurmaContextForChat({ chatId: id });

  return (
    <OrganicShell className="flex min-h-dvh flex-col">
      <DataStreamProvider>
        <ActiveChatProvider>
          <NovaAulaChat
            turmaName={turmaContext?.turmaName ?? "Conversa"}
            turmaSubtitle={turmaContext?.turmaGrade ?? ""}
          />
        </ActiveChatProvider>
      </DataStreamProvider>
    </OrganicShell>
  );
}
