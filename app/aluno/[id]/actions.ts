"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import {
  createAeeNote,
  createObservacao,
  createStudentGoal,
  createStudentLearningPreference,
  deleteObservacao,
  deleteStudentGoal,
  deleteStudentLearningPreference,
  findOrCreateConselhoChat,
  getStudentForProfile,
  updateStudentGoalStatus,
} from "@/lib/db/queries";
import type {
  StudentAeeNote,
  StudentGoal,
  StudentLearningPreference,
  StudentObservation,
} from "@/lib/db/schema";

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

export async function startConselhoChatAction({
  studentId,
}: {
  studentId: string;
}) {
  const session = await assertOwnership(studentId);
  const student = await getStudentForProfile({
    studentId,
    teacherId: session.user.id,
  });
  if (!student) {
    throw new Error("Unauthorized");
  }

  const chat = await findOrCreateConselhoChat({
    studentId,
    studentName: student.preferredName || student.name,
    teacherId: session.user.id,
  });

  redirect(`/chat/${chat.id}`);
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

export async function adicionarMetaAction({
  studentId,
  goal,
  difficulty,
}: {
  studentId: string;
  goal: string;
  difficulty?: StudentGoal["difficulty"];
}) {
  await assertOwnership(studentId);
  await createStudentGoal({ difficulty, goal, studentId });
  revalidatePath(`/aluno/${studentId}`);
}

export async function atualizarStatusMetaAction({
  id,
  studentId,
  status,
}: {
  id: string;
  studentId: string;
  status: StudentGoal["status"];
}) {
  await assertOwnership(studentId);
  await updateStudentGoalStatus({ id, status });
  revalidatePath(`/aluno/${studentId}`);
}

export async function removerMetaAction({
  id,
  studentId,
}: {
  id: string;
  studentId: string;
}) {
  await assertOwnership(studentId);
  await deleteStudentGoal({ id });
  revalidatePath(`/aluno/${studentId}`);
}

export async function adicionarEstrategiaAction({
  studentId,
  strategy,
  effectiveness,
}: {
  studentId: string;
  strategy: string;
  effectiveness: StudentLearningPreference["effectiveness"];
}) {
  await assertOwnership(studentId);
  await createStudentLearningPreference({ effectiveness, strategy, studentId });
  revalidatePath(`/aluno/${studentId}`);
}

export async function removerEstrategiaAction({
  id,
  studentId,
}: {
  id: string;
  studentId: string;
}) {
  await assertOwnership(studentId);
  await deleteStudentLearningPreference({ id });
  revalidatePath(`/aluno/${studentId}`);
}
