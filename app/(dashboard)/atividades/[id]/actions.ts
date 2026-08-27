"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/(auth)/auth";
import {
  getAtividadeWithAdaptacoes,
  updateAtividadeAdaptadaContent,
  validateAllAtividadesAdaptadas,
  validateAtividadeAdaptada,
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

export async function updateAdaptacaoAction({
  atividadeId,
  adaptacaoId,
  content,
}: {
  atividadeId: string;
  adaptacaoId: string;
  content: AtividadeContent;
}) {
  await assertOwnership(atividadeId);
  await updateAtividadeAdaptadaContent({ content, id: adaptacaoId });
  revalidatePath(`/atividades/${atividadeId}`);
}

export async function validateAdaptacaoAction({
  atividadeId,
  adaptacaoId,
}: {
  atividadeId: string;
  adaptacaoId: string;
}) {
  await assertOwnership(atividadeId);
  await validateAtividadeAdaptada({ id: adaptacaoId });
  revalidatePath(`/atividades/${atividadeId}`);
}

export async function validateAllAction({
  atividadeId,
}: {
  atividadeId: string;
}) {
  await assertOwnership(atividadeId);
  await validateAllAtividadesAdaptadas({ atividadeId });
  revalidatePath(`/atividades/${atividadeId}`);
}
