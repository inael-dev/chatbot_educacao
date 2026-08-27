import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAtividadeWithAdaptacoes } from "@/lib/db/queries";
import { auth } from "../../../(auth)/auth";
import { AtividadeReview } from "./review-client";

export default function AtividadePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-muted-foreground text-sm">Carregando…</div>
      }
    >
      <AtividadeContent params={params} />
    </Suspense>
  );
}

async function AtividadeContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const result = await getAtividadeWithAdaptacoes({ atividadeId: id });

  if (!result || result.atividade.teacherId !== session.user.id) {
    notFound();
  }

  return (
    <AtividadeReview
      adaptacoes={result.adaptacoes}
      atividade={result.atividade}
      turmaName={result.turmaName}
    />
  );
}
