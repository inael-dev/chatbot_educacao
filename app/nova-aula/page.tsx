import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DataStreamProvider } from "@/components/chat/data-stream-provider";
import { NovaAulaChat } from "@/components/organic/chat/nova-aula-chat";
import { OrganicShell } from "@/components/organic/organic-shell";
import { ActiveChatProvider } from "@/hooks/use-active-chat";
import { getTurmasByTeacherId } from "@/lib/db/queries";
import { auth } from "../(auth)/auth";

export default function NovaAulaPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <NovaAulaPageContent />
    </Suspense>
  );
}

async function NovaAulaPageContent() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const turmas = await getTurmasByTeacherId({ teacherId: session.user.id });
  const [activeTurma] = turmas;

  return (
    <OrganicShell className="flex min-h-dvh flex-col">
      <DataStreamProvider>
        <ActiveChatProvider>
          <NovaAulaChat
            turmaName={activeTurma?.name ?? "Primeira aula"}
            turmaSubtitle={activeTurma?.grade ?? ""}
          />
        </ActiveChatProvider>
      </DataStreamProvider>
    </OrganicShell>
  );
}
