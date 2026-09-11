import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OrganicShell } from "@/components/organic/organic-shell";
import {
  getStudentsByTeacherId,
  getTurmaHomeData,
  getTurmasByTeacherId,
} from "@/lib/db/queries";
import { auth } from "./(auth)/auth";
import { NoStudentsYet } from "./no-students-yet";
import { NoTurmaYet } from "./no-turma-yet";
import { TurmaHome } from "./turma-home";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    weekday: "long",
  }).format(date);
}

type TurmaPageProps = {
  searchParams: Promise<{ novo?: string }>;
};

export default function TurmaPage({ searchParams }: TurmaPageProps) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <TurmaPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function TurmaPageContent({ searchParams }: TurmaPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const students = await getStudentsByTeacherId({ teacherId: session.user.id });

  if (students.length === 0) {
    return <NoStudentsYet />;
  }

  // Presente só no redirect vindo de /aluno/novo: o nome de quem acabou de
  // ser cadastrado, pra tela abrir confirmando em vez de anunciar a ausência
  // de turma.
  const { novo: justCreatedName } = await searchParams;

  const turmas = await getTurmasByTeacherId({ teacherId: session.user.id });
  const [activeTurma] = turmas;

  if (!activeTurma) {
    return <NoTurmaYet justCreatedName={justCreatedName} />;
  }

  const data = await getTurmaHomeData({ turmaId: activeTurma.id });

  if (!data) {
    return <NoTurmaYet justCreatedName={justCreatedName} />;
  }

  const professorInitials = (session.user.name ?? session.user.email ?? "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <OrganicShell className="flex min-h-dvh flex-col">
      <TurmaHome
        data={data}
        professorInitials={professorInitials}
        today={formatDate(new Date())}
      />
    </OrganicShell>
  );
}
