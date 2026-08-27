import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AlunoProfile } from "@/components/organic/aluno/aluno-profile";
import { OrganicShell } from "@/components/organic/organic-shell";
import {
  getAeeNotes,
  getRecentAtividadesForStudent,
  getStudentAdaptacaoContext,
  getStudentForProfile,
  getStudentHistorico,
} from "@/lib/db/queries";
import { auth } from "../../(auth)/auth";

export default function AlunoProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <AlunoProfileContent params={params} />
    </Suspense>
  );
}

async function AlunoProfileContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const student = await getStudentForProfile({
    studentId: id,
    teacherId: session.user.id,
  });

  if (!student) {
    notFound();
  }

  const [studentContext, historico, aeeNotes, atividadesRecentes] =
    await Promise.all([
      getStudentAdaptacaoContext({ studentId: id }),
      getStudentHistorico({ studentId: id }),
      getAeeNotes({ studentId: id }),
      getRecentAtividadesForStudent({ studentId: id }),
    ]);

  return (
    <OrganicShell className="flex min-h-dvh flex-col">
      <AlunoProfile
        aeeNotes={aeeNotes}
        atividadesRecentes={atividadesRecentes}
        historico={historico}
        student={student}
        studentContext={studentContext}
      />
    </OrganicShell>
  );
}
