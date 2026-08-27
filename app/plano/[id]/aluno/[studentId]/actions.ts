"use server";

import { auth } from "@/app/(auth)/auth";
import {
  getAtividadeWithAdaptacoes,
  validateAtividadeAdaptada,
} from "@/lib/db/queries";

export async function acceptAdaptacaoAction({
  atividadeId,
  adaptacaoId,
}: {
  atividadeId: string;
  adaptacaoId: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const result = await getAtividadeWithAdaptacoes({ atividadeId });
  if (!result || result.atividade.teacherId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await validateAtividadeAdaptada({ id: adaptacaoId });
}
