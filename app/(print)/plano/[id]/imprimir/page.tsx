import { notFound } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth";
import { getAtividadeForPrint } from "@/lib/db/queries";
import { PlanoPrintView } from "./plano-print-view";

export default function ImprimirPlanoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ImprimirPlanoPageContent params={params} />
    </Suspense>
  );
}

async function ImprimirPlanoPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const result = await getAtividadeForPrint({ atividadeId: id });

  if (!result || result.atividade.teacherId !== session.user.id) {
    notFound();
  }

  return (
    <PlanoPrintView
      backHref={`/plano/${id}`}
      content={result.atividade.content}
      objective={result.atividade.objective}
      schoolName={result.schoolName}
      turmaGrade={result.turmaGrade}
      turmaName={result.turmaName}
    />
  );
}
