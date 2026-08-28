import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth";
import { OrganicShell } from "@/components/organic/organic-shell";
import { getStudentsByTeacherId } from "@/lib/db/queries";
import { cadastrarAlunoAction } from "./actions";

export default function CadastrarAlunoPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <CadastrarAlunoPageContent />
    </Suspense>
  );
}

async function CadastrarAlunoPageContent() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const students = await getStudentsByTeacherId({ teacherId: session.user.id });
  const isFirstStudent = students.length === 0;

  return (
    <OrganicShell className="flex min-h-dvh flex-col items-center justify-center p-6">
      <div
        className="card elev-md"
        style={{ maxWidth: 420, padding: 24, width: "100%" }}
      >
        <div className="card-kicker">
          {isFirstStudent ? "Antes de tudo" : "Novo aluno"}
        </div>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 22,
            margin: "4px 0 6px",
          }}
        >
          {isFirstStudent
            ? "Cadastre seu primeiro aluno"
            : "Cadastrar aluno"}
        </h1>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 18 }}>
          {isFirstStudent
            ? "Antes de montar uma aula, conte quem são seus alunos — a IA usa isso pra adaptar de verdade, não pra chutar."
            : "Conte quem é esse aluno pra usarmos nas adaptações."}
        </p>

        <form action={cadastrarAlunoAction} className="flex flex-col gap-4">
          <div className="field">
            <label htmlFor="name">Nome</label>
            <input
              autoFocus
              className="input"
              id="name"
              name="name"
              placeholder="Nome completo do aluno"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="preferredName">Como prefere ser chamado (opcional)</label>
            <input
              className="input"
              id="preferredName"
              name="preferredName"
              placeholder="Ex: Zeca"
            />
          </div>

          <div className="field">
            <label htmlFor="conditions">Condições</label>
            <input
              className="input"
              id="conditions"
              name="conditions"
              placeholder="Ex: TEA, TDAH (separe por vírgula)"
            />
          </div>

          <div className="field">
            <label htmlFor="interests">Interesses</label>
            <input
              className="input"
              id="interests"
              name="interests"
              placeholder="Ex: dinossauros, música (separe por vírgula)"
            />
          </div>

          <button className="btn btn-primary btn-block" type="submit">
            {isFirstStudent ? "Salvar e continuar" : "Salvar aluno"}
          </button>

          {!isFirstStudent && (
            <a
              className="btn btn-secondary btn-block"
              href="/"
              style={{ textDecoration: "none" }}
            >
              Voltar
            </a>
          )}
        </form>
      </div>
    </OrganicShell>
  );
}
