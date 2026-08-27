import { notFound } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth";
import { getAdaptacaoForPrint } from "@/lib/db/queries";
import { PrintView } from "./print-view";

export default function ImprimirAdaptacaoPage({
  params,
}: {
  params: Promise<{ id: string; adaptacaoId: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ImprimirAdaptacaoPageContent params={params} />
    </Suspense>
  );
}

async function ImprimirAdaptacaoPageContent({
  params,
}: {
  params: Promise<{ id: string; adaptacaoId: string }>;
}) {
  const { id, adaptacaoId } = await params;
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const result = await getAdaptacaoForPrint({ adaptacaoId });

  if (!result || result.teacherId !== session.user.id) {
    notFound();
  }

  return (
    <PrintView
      backHref={`/atividades/${id}`}
      content={result.adaptacao.content}
      habilidade={result.adaptacao.content.habilidades[0] ?? null}
      schoolName={result.schoolName}
      studentName={result.student.preferredName || result.student.name}
      turmaName={result.turmaName}
    />
  );
}
