import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { DataStreamProvider } from "@/components/chat/data-stream-provider";
import { OrganicShell } from "@/components/organic/organic-shell";
import { AdaptacaoBuilder } from "@/components/organic/plano/adaptacao-builder";
import { ActiveChatProvider } from "@/hooks/use-active-chat";
import {
  getAtividadeWithAdaptacoes,
  getStudentAdaptacaoContext,
  getTurmaWithStudents,
} from "@/lib/db/queries";
import { auth } from "../../../../(auth)/auth";

export default function AdaptacaoPage({
  params,
}: {
  params: Promise<{ id: string; studentId: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <AdaptacaoPageContent params={params} />
    </Suspense>
  );
}

async function AdaptacaoPageContent({
  params,
}: {
  params: Promise<{ id: string; studentId: string }>;
}) {
  const { id, studentId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const result = await getAtividadeWithAdaptacoes({ atividadeId: id });

  if (!result || result.atividade.teacherId !== session.user.id) {
    notFound();
  }

  const turmaWithStudents = await getTurmaWithStudents({
    turmaId: result.atividade.turmaId,
  });
  const student = turmaWithStudents?.students.find((s) => s.id === studentId);

  if (!student) {
    notFound();
  }

  const studentContext = await getStudentAdaptacaoContext({ studentId });
  const existingAdaptacao =
    result.adaptacoes.find((a) => a.studentId === studentId) ?? null;

  return (
    <OrganicShell className="flex min-h-dvh flex-col">
      <DataStreamProvider>
        <ActiveChatProvider>
          <AdaptacaoBuilder
            atividade={result.atividade}
            existingAdaptacao={existingAdaptacao}
            student={student}
            studentContext={studentContext}
          />
        </ActiveChatProvider>
      </DataStreamProvider>
    </OrganicShell>
  );
}
