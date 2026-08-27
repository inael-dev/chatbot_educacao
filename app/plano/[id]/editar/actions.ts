"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/(auth)/auth";
import {
  type BnccComponente,
  type BnccEtapa,
  searchBnccHabilidades,
} from "@/lib/ai/bncc";
import {
  getAtividadeWithAdaptacoes,
  updateAtividadeContent,
} from "@/lib/db/queries";
import type { AtividadeContent } from "@/lib/db/schema";

async function assertOwnership(atividadeId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const result = await getAtividadeWithAdaptacoes({ atividadeId });
  if (!result || result.atividade.teacherId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  return result;
}

export async function updateAtividadeAction({
  atividadeId,
  content,
  objective,
}: {
  atividadeId: string;
  content: AtividadeContent;
  objective: string;
}) {
  await assertOwnership(atividadeId);
  await updateAtividadeContent({ content, id: atividadeId, objective });
  revalidatePath(`/plano/${atividadeId}`);
  revalidatePath(`/plano/${atividadeId}/editar`);
}

export async function searchBnccHabilidadesAction({
  etapa,
  ano,
  componente,
  campoExperiencia,
}: {
  etapa: BnccEtapa;
  ano?: string;
  componente?: BnccComponente;
  campoExperiencia?: string;
}) {
  return await searchBnccHabilidades({
    ano,
    campoExperiencia,
    componente,
    etapa,
  });
}
