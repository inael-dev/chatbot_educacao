"use client";

import Link from "next/link";
import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import { TabBar } from "@/components/organic/tab-bar";
import type { getAtividadesWithAdaptacoesByTeacherId } from "@/lib/db/queries";
import { getInitials } from "@/lib/utils";

type Grupos = Awaited<
  ReturnType<typeof getAtividadesWithAdaptacoesByTeacherId>
>;

const AVATAR_TOKENS = [
  "var(--color-accent)",
  "var(--color-accent-2)",
  "var(--color-neutral-500)",
  "var(--color-primary-light)",
];

const STATUS_LABEL: Record<"pronto" | "rascunho", string> = {
  pronto: "Pronto",
  rascunho: "Rascunho",
};

const STATUS_STYLE: Record<
  keyof typeof STATUS_LABEL,
  { background: string; color: string }
> = {
  pronto: {
    background: "var(--color-accent-2-200)",
    color: "var(--color-accent-2-800)",
  },
  rascunho: {
    background: "var(--color-accent-200)",
    color: "var(--color-accent-800)",
  },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function AtividadesList({ grupos }: { grupos: Grupos }) {
  const [query, setQuery] = useState("");
  const [selectedTurma, setSelectedTurma] = useState<string>("todas");

  const turmaOptions = useMemo(
    () => Array.from(new Set(grupos.map((g) => g.turmaName))),
    [grupos]
  );

  const handleQueryChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
    },
    []
  );

  const handleTurmaClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { turma } = event.currentTarget.dataset;
      if (turma) {
        setSelectedTurma(turma);
      }
    },
    []
  );

  const visibleGrupos = useMemo(() => {
    const q = query.trim().toLowerCase();

    return grupos
      .filter((g) => selectedTurma === "todas" || g.turmaName === selectedTurma)
      .map((g) => {
        if (!q || g.atividade.content.tema.toLowerCase().includes(q)) {
          return g;
        }
        return {
          ...g,
          adaptacoes: g.adaptacoes.filter((a) =>
            (a.student.preferredName || a.student.name)
              .toLowerCase()
              .includes(q)
          ),
        };
      })
      .filter(
        (g) =>
          !q ||
          g.atividade.content.tema.toLowerCase().includes(q) ||
          g.adaptacoes.length > 0
      );
  }, [grupos, query, selectedTurma]);

  const totalAdaptacoes = grupos.reduce(
    (sum, g) => sum + g.adaptacoes.length,
    0
  );

  return (
    <>
      <div style={{ padding: "16px 18px 10px" }}>
        <div
          style={{
            color: "var(--color-text)",
            fontFamily: "var(--font-heading)",
            fontSize: 22,
          }}
        >
          Atividades
        </div>
        <div style={{ color: "var(--color-muted)", fontSize: 12 }}>
          {totalAdaptacoes} adaptaç{totalAdaptacoes === 1 ? "ão" : "ões"} em{" "}
          {grupos.length} aula{grupos.length === 1 ? "" : "s"}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: "0 16px",
        }}
      >
        <input
          className="input"
          onChange={handleQueryChange}
          placeholder="Buscar por atividade ou aluno…"
          value={query}
        />

        {turmaOptions.length > 1 ? (
          <div
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              paddingBottom: 2,
            }}
          >
            <button
              className="tag"
              data-turma="todas"
              onClick={handleTurmaClick}
              style={{
                background:
                  selectedTurma === "todas"
                    ? "var(--color-accent)"
                    : "var(--color-neutral-100)",
                color:
                  selectedTurma === "todas"
                    ? "var(--color-bg)"
                    : "var(--color-text)",
                cursor: "pointer",
                flex: "none",
              }}
              type="button"
            >
              Todas
            </button>
            {turmaOptions.map((t) => (
              <button
                className="tag"
                data-turma={t}
                key={t}
                onClick={handleTurmaClick}
                style={{
                  background:
                    selectedTurma === t
                      ? "var(--color-accent)"
                      : "var(--color-neutral-100)",
                  color:
                    selectedTurma === t
                      ? "var(--color-bg)"
                      : "var(--color-text)",
                  cursor: "pointer",
                  flex: "none",
                }}
                type="button"
              >
                {t}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: 18,
          overflow: "auto",
          padding: "14px 16px",
        }}
      >
        {visibleGrupos.length === 0 ? (
          <p
            className="text-muted"
            style={{ fontSize: 13, padding: "8px 4px" }}
          >
            {grupos.length === 0
              ? "Nenhuma atividade planejada ainda. Descreva uma aula no chat da turma pra começar."
              : "Nada encontrado com esse filtro."}
          </p>
        ) : (
          visibleGrupos.map((grupo) => (
            <div
              key={grupo.atividade.id}
              style={{ display: "flex", flexDirection: "column", gap: 4 }}
            >
              <div
                style={{
                  alignItems: "baseline",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Link
                  href={`/plano/${grupo.atividade.id}`}
                  style={{
                    color: "var(--color-text)",
                    fontFamily: "var(--font-heading)",
                    fontSize: 16,
                    textDecoration: "none",
                  }}
                >
                  {grupo.atividade.content.tema}
                </Link>
                <span style={{ color: "var(--color-muted)", fontSize: 11 }}>
                  {formatDate(new Date(grupo.atividade.createdAt))}
                </span>
              </div>
              <div
                style={{
                  color: "var(--color-muted)",
                  fontSize: 11,
                  marginBottom: 4,
                }}
              >
                {grupo.turmaName}
              </div>

              {grupo.adaptacoes.length === 0 ? (
                <Link
                  className="text-muted"
                  href={`/plano/${grupo.atividade.id}`}
                  style={{ fontSize: 12.5, padding: "6px 4px" }}
                >
                  Nenhum aluno adaptado ainda — toque pra adaptar por aluno →
                </Link>
              ) : (
                grupo.adaptacoes.map((adaptacao, index) => {
                  const displayName =
                    adaptacao.student.preferredName || adaptacao.student.name;
                  const status =
                    adaptacao.status === "validada" ? "pronto" : "rascunho";
                  const href =
                    status === "pronto"
                      ? `/atividades/${grupo.atividade.id}/imprimir/${adaptacao.id}`
                      : `/plano/${grupo.atividade.id}/aluno/${adaptacao.studentId}`;

                  return (
                    <Link
                      className="srow"
                      href={href}
                      key={adaptacao.id}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        className="av"
                        style={{
                          background:
                            AVATAR_TOKENS[index % AVATAR_TOKENS.length],
                          fontSize: 14,
                          height: 38,
                          width: 38,
                        }}
                      >
                        {getInitials(displayName)}
                      </div>
                      <div
                        style={{
                          color: "var(--color-text)",
                          flex: 1,
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {displayName}
                      </div>
                      <span className="pill" style={STATUS_STYLE[status]}>
                        {STATUS_LABEL[status]}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          ))
        )}
      </div>

      <TabBar active="atividades" />
    </>
  );
}
