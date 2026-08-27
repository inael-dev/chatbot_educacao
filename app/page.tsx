import { redirect } from "next/navigation";
import { OrganicShell } from "@/components/organic/organic-shell";
import { getTurmaHomeData, getTurmasByTeacherId } from "@/lib/db/queries";
import { auth } from "./(auth)/auth";
import { TurmaHome } from "./turma-home";

function NoTurmaYet() {
  return (
    <OrganicShell className="flex min-h-dvh flex-col items-center justify-center gap-3 p-8 text-center">
      <h1>Nenhuma turma ainda</h1>
      <p className="text-muted max-w-xs">
        Descreva a primeira aula no chat que a gente cria a turma e monta o
        plano automaticamente.
      </p>
      <a className="btn btn-primary" href="/nova-aula">
        Começar no chat
      </a>
    </OrganicShell>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    weekday: "long",
  }).format(date);
}

export default async function TurmaPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const turmas = await getTurmasByTeacherId({ teacherId: session.user.id });
  const [activeTurma] = turmas;

  if (!activeTurma) {
    return <NoTurmaYet />;
  }

  const data = await getTurmaHomeData({ turmaId: activeTurma.id });

  if (!data) {
    return <NoTurmaYet />;
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
