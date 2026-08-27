import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { OrganicShell } from "@/components/organic/organic-shell";
import { PlanoTurma } from "@/components/organic/plano/plano-turma";
import { getBnccHabilidadeByCodigo } from "@/lib/ai/bncc";
import {
  getAtividadeWithAdaptacoes,
  getTurmaWithStudents,
} from "@/lib/db/queries";
import { auth } from "../../(auth)/auth";

export default function PlanoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <PlanoPageContent params={params} />
    </Suspense>
  );
}

async function PlanoPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const result = await getAtividadeWithAdaptacoes({ atividadeId: id });

  if (!result || result.atividade.teacherId !== session.user.id) {
    notFound();
  }

  const [primeiraHabilidade] = result.atividade.content.habilidades;
  const [habilidade, turmaWithStudents] = await Promise.all([
    primeiraHabilidade ? getBnccHabilidadeByCodigo(primeiraHabilidade) : null,
    getTurmaWithStudents({ turmaId: result.atividade.turmaId }),
  ]);

  return (
    <OrganicShell className="flex min-h-dvh flex-col">
      <PlanoTurma
        adaptacoes={result.adaptacoes}
        atividade={result.atividade}
        habilidadeDescricao={habilidade?.descricao ?? null}
        students={turmaWithStudents?.students ?? []}
        turmaGrade={result.turmaGrade}
        turmaName={result.turmaName}
      />
    </OrganicShell>
  );
}
