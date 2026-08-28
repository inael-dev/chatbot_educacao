"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { TabBar } from "@/components/organic/tab-bar";
import type { getTurmaHomeData } from "@/lib/db/queries";
import { getInitials } from "@/lib/utils";

type TurmaHomeData = NonNullable<Awaited<ReturnType<typeof getTurmaHomeData>>>;
type StudentRow = TurmaHomeData["students"][number];

const AVATAR_TOKENS = [
  "var(--color-accent)",
  "var(--color-accent-2)",
  "var(--color-neutral-500)",
  "var(--color-primary-light)",
];

const STATUS_LABEL: Record<"pronto" | "rascunho" | "adaptar", string> = {
  adaptar: "Adaptar",
  pronto: "Pronto",
  rascunho: "Rascunho",
};

const STATUS_STYLE: Record<
  keyof typeof STATUS_LABEL,
  { background: string; color: string }
> = {
  adaptar: {
    background: "var(--color-neutral-200)",
    color: "var(--color-neutral-700)",
  },
  pronto: {
    background: "var(--color-accent-2-200)",
    color: "var(--color-accent-2-800)",
  },
  rascunho: {
    background: "var(--color-accent-200)",
    color: "var(--color-accent-800)",
  },
};

function statusFor(student: StudentRow): keyof typeof STATUS_LABEL {
  if (student.adaptacaoStatus === "validada") {
    return "pronto";
  }
  if (
    student.adaptacaoStatus === "rascunho" ||
    student.adaptacaoStatus === "gerando"
  ) {
    return "rascunho";
  }
  return "adaptar";
}

export function TurmaHome({
  data,
  professorInitials,
  today,
}: {
  data: TurmaHomeData;
  professorInitials: string;
  today: string;
}) {
  const [filter, setFilter] = useState<"atipicos" | "todos">("atipicos");
  const handleFilterAtipicos = useCallback(() => setFilter("atipicos"), []);
  const handleFilterTodos = useCallback(() => setFilter("todos"), []);
  const { turma, students, latestAtividade } = data;

  const visibleStudents =
    filter === "atipicos"
      ? students.filter((s) => s.conditions.length > 0)
      : students;

  const pendingCount = useMemo(
    () =>
      students.filter(
        (s) => s.conditions.length > 0 && s.adaptacaoStatus === null
      ).length,
    [students]
  );

  const content = latestAtividade?.content;
  const chatHref = latestAtividade?.sourceChatId
    ? `/chat/${latestAtividade.sourceChatId}`
    : "/nova-aula";

  return (
    <>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          padding: "16px 18px 10px",
        }}
      >
        <div>
          <div style={{ color: "var(--color-muted)", fontSize: 11 }}>
            {today}
          </div>
          <div
            style={{
              color: "var(--color-text)",
              fontFamily: "var(--font-heading)",
              fontSize: 22,
              lineHeight: 1,
            }}
          >
            {turma.name}
          </div>
        </div>
        <div
          className="av"
          style={{
            background: "var(--color-accent-2)",
            fontSize: 14,
            height: 40,
            width: 40,
          }}
        >
          {professorInitials}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: 14,
          overflow: "hidden",
          padding: "2px 16px 16px",
        }}
      >
        {content ? (
          <div
            className="card elev-md"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-bg)",
              gap: 9,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.1em",
                opacity: 0.8,
                textTransform: "uppercase",
              }}
            >
              Aula de hoje
            </div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 21,
                lineHeight: 1.05,
              }}
            >
              {content.tema}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {content.habilidades[0] ? (
                <span
                  className="tag"
                  style={{
                    background: "rgba(246, 247, 251, .22)",
                    color: "var(--color-bg)",
                  }}
                >
                  BNCC {content.habilidades[0]}
                </span>
              ) : null}
              {content.unidadeTematica[0] ? (
                <span
                  className="tag"
                  style={{
                    background: "rgba(246, 247, 251, .22)",
                    color: "var(--color-bg)",
                  }}
                >
                  {content.unidadeTematica[0]}
                </span>
              ) : null}
            </div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
                marginTop: 4,
              }}
            >
              <span style={{ fontSize: 12, opacity: 0.85 }}>
                {pendingCount === 0
                  ? "Todos adaptados"
                  : `${pendingCount} aluno${pendingCount === 1 ? "" : "s"} p/ adaptar`}
              </span>
              <Link
                className="btn"
                href={chatHref}
                style={{
                  background: "var(--color-bg)",
                  color: "var(--color-accent)",
                }}
              >
                Abrir no chat
              </Link>
            </div>
          </div>
        ) : (
          <div className="card elev-sm" style={{ gap: 6, padding: 16 }}>
            <div className="card-kicker">Aula de hoje</div>
            <p className="card-body">
              Nenhuma aula registrada ainda pra essa turma.
            </p>
            <Link className="btn btn-primary btn-block" href="/nova-aula">
              Começar no chat
            </Link>
          </div>
        )}

        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              alignItems: "center",
              display: "flex",
              gap: 10,
            }}
          >
            <div
              style={{
                color: "var(--color-text)",
                fontFamily: "var(--font-heading)",
                fontSize: 17,
              }}
            >
              Alunos
            </div>
            <Link className="btn btn-ghost" href="/aluno/novo" style={{ padding: 0 }}>
              + Adicionar
            </Link>
          </div>
          <div
            className="seg"
            style={{ transform: "scale(.85)", transformOrigin: "right" }}
          >
            <label
              className="seg-opt"
              style={
                filter === "atipicos"
                  ? {
                      background: "var(--color-accent)",
                      color: "var(--color-bg)",
                    }
                  : undefined
              }
            >
              <input
                checked={filter === "atipicos"}
                name="filtro-alunos"
                onChange={handleFilterAtipicos}
                type="radio"
              />
              Atípicos
            </label>
            <label
              className="seg-opt"
              style={
                filter === "todos"
                  ? {
                      background: "var(--color-accent)",
                      color: "var(--color-bg)",
                    }
                  : undefined
              }
            >
              <input
                checked={filter === "todos"}
                name="filtro-alunos"
                onChange={handleFilterTodos}
                type="radio"
              />
              Todos
            </label>
          </div>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", overflow: "auto" }}
        >
          {visibleStudents.length === 0 ? (
            <p
              className="text-muted"
              style={{ fontSize: 13, padding: "8px 4px" }}
            >
              {filter === "atipicos"
                ? "Nenhum aluno atípico nessa turma."
                : "Nenhum aluno nessa turma ainda."}
            </p>
          ) : (
            visibleStudents.map((student, index) => {
              const status = statusFor(student);
              const displayName = student.preferredName || student.name;
              return (
                <Link
                  className="srow"
                  href={`/aluno/${student.id}`}
                  key={student.id}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="av"
                    style={{
                      background: AVATAR_TOKENS[index % AVATAR_TOKENS.length],
                      fontSize: 15,
                      height: 42,
                      width: 42,
                    }}
                  >
                    {getInitials(displayName)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        color: "var(--color-text)",
                        fontSize: 14.5,
                        fontWeight: 600,
                      }}
                    >
                      {displayName}
                    </div>
                    {student.conditions.length > 0 && (
                      <span
                        className="tag tag-accent-2"
                        style={{ fontSize: 10, padding: "2px 8px" }}
                      >
                        {student.conditions[0].condition}
                      </span>
                    )}
                  </div>
                  <span className="pill" style={STATUS_STYLE[status]}>
                    {STATUS_LABEL[status]}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>

      <TabBar active="inicio" />
    </>
  );
}
