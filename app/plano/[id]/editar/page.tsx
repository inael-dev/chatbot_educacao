import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { OrganicShell } from "@/components/organic/organic-shell";
import { EditarPlano } from "@/components/organic/plano/editar-plano";
import { getAtividadeWithAdaptacoes } from "@/lib/db/queries";
import { auth } from "../../../(auth)/auth";

export default function EditarPlanoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <EditarPlanoPageContent params={params} />
    </Suspense>
  );
}

async function EditarPlanoPageContent({
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

  return (
    <OrganicShell className="flex min-h-dvh flex-col">
      <EditarPlano atividade={result.atividade} />
    </OrganicShell>
  );
}
