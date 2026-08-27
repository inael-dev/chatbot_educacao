"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/(auth)/auth";
import {
  createAeeNote,
  createObservacao,
  deleteObservacao,
  getStudentForProfile,
} from "@/lib/db/queries";
import type { StudentAeeNote, StudentObservation } from "@/lib/db/schema";

async function assertOwnership(studentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const result = await getStudentForProfile({
    studentId,
    teacherId: session.user.id,
  });
  if (!result) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function registrarObservacaoAction({
  studentId,
  tipo,
  texto,
  atividadeId,
}: {
  studentId: string;
  tipo: StudentObservation["tipo"];
  texto: string;
  atividadeId?: string;
}) {
  const session = await assertOwnership(studentId);
  await createObservacao({
    atividadeId,
    observation: texto,
    origem: atividadeId ? "feedback" : "avulso",
    studentId,
    teacherId: session.user.id,
    tipo,
  });
  revalidatePath(`/aluno/${studentId}`);
}

export async function removerObservacaoAction({
  id,
  studentId,
}: {
  id: string;
  studentId: string;
}) {
  await assertOwnership(studentId);
  await deleteObservacao({ id });
  revalidatePath(`/aluno/${studentId}`);
}

export async function responderAeeAction({
  studentId,
  papel,
  texto,
}: {
  studentId: string;
  papel: StudentAeeNote["papel"];
  texto: string;
}) {
  const session = await assertOwnership(studentId);
  const autor =
    papel === "aee"
      ? "Prof. AEE"
      : (session.user.name ?? session.user.email ?? "Você");
  await createAeeNote({ autor, papel, studentId, texto });
  revalidatePath(`/aluno/${studentId}`);
}
