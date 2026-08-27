"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DownloadIcon,
  PencilIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Atividade, AtividadeAdaptada, Student } from "@/lib/db/schema";
import { getInitials } from "@/lib/utils";

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

function statusFor(
  status: AtividadeAdaptada["status"] | undefined
): keyof typeof STATUS_LABEL {
  if (status === "validada") {
    return "pronto";
  }
  if (status === "rascunho" || status === "gerando") {
    return "rascunho";
  }
  return "adaptar";
}

type PlanoTurmaProps = {
  atividade: Atividade;
  turmaName: string;
  turmaGrade: string | null;
  habilidadeDescricao: string | null;
  students: Student[];
  adaptacoes: (AtividadeAdaptada & { student: Student })[];
};

export function PlanoTurma({
  atividade,
  turmaName,
  turmaGrade,
  habilidadeDescricao,
  students,
  adaptacoes,
}: PlanoTurmaProps) {
  const router = useRouter();
  const { content } = atividade;
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleExportarClick = useCallback(() => {
    toast.info("Exportar PDF da turma ainda não disponível.");
  }, []);

  const handleAdaptarClick = useCallback(() => {
    setIsPickerOpen(true);
  }, []);

  const handleClosePicker = useCallback(() => {
    setIsPickerOpen(false);
  }, []);

  return (
    <>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 18px 8px",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: 11 }}>
          <button
            aria-label="Voltar"
            onClick={handleBack}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text)",
              cursor: "pointer",
              display: "flex",
              padding: 0,
            }}
            type="button"
          >
            <ArrowLeftIcon size={22} strokeWidth={2.75} />
          </button>
          <div
            style={{
              color: "var(--color-text)",
              fontFamily: "var(--font-heading)",
              fontSize: 16,
            }}
          >
            Plano da aula
          </div>
        </div>
        <Link
          className="btn btn-ghost"
          href={`/plano/${atividade.id}/editar`}
          style={{
            alignItems: "center",
            display: "flex",
            fontSize: 13,
            gap: 5,
          }}
        >
          <PencilIcon size={15} strokeWidth={2.75} />
          Editar
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: 13,
          overflow: "auto",
          padding: "2px 16px",
        }}
      >
        <div>
          <div
            style={{
              color: "var(--color-text)",
              fontFamily: "var(--font-heading)",
              fontSize: 24,
              lineHeight: 1.05,
            }}
          >
            {content.tema}
          </div>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}
          >
            {content.habilidades[0] ? (
              <span className="tag tag-accent">
                BNCC {content.habilidades[0]}
              </span>
            ) : null}
            {turmaGrade ? (
              <span className="tag tag-neutral">{turmaGrade}</span>
            ) : null}
            <span className="tag tag-neutral">{turmaName}</span>
          </div>
        </div>

        {content.habilidades[0] ? (
          <div
            className="card elev-sm"
            style={{
              background: "var(--color-accent-2-100)",
              gap: 5,
              padding: 13,
            }}
          >
            <div
              className="card-kicker"
              style={{ color: "var(--color-accent-2-800)" }}
            >
              Habilidade BNCC
            </div>
            <p
              style={{
                color: "var(--color-accent-2-900)",
                fontSize: 12.5,
                lineHeight: 1.42,
                margin: 0,
              }}
            >
              {habilidadeDescricao ??
                `Código ${content.habilidades[0]} — consulte a base oficial para a descrição completa.`}
            </p>
          </div>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              color: "var(--color-muted)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Objetivo
          </div>
          <p
            style={{
              color: "var(--color-text)",
              fontSize: 13,
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            {atividade.objective}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              background: "var(--color-surface)",
              borderRadius: 16,
              flex: 1,
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                color: "var(--color-muted)",
                fontSize: 10,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Duração
            </div>
            <div
              style={{
                color: "var(--color-text)",
                fontFamily: "var(--font-heading)",
                fontSize: 16,
              }}
            >
              {content.duracao ?? "—"}
            </div>
          </div>
          <div
            style={{
              background: "var(--color-surface)",
              borderRadius: 16,
              flex: 1,
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                color: "var(--color-muted)",
                fontSize: 10,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Recursos
            </div>
            <div
              style={{
                color: "var(--color-text)",
                fontFamily: "var(--font-heading)",
                fontSize: 16,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {content.recursos.length > 0 ? content.recursos.join(", ") : "—"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <div
            style={{
              color: "var(--color-muted)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Momentos da aula
          </div>
          {content.momentos.map((momento, index) => (
            <div key={momento.titulo} style={{ display: "flex", gap: 11 }}>
              <div
                className="av"
                style={{
                  background: "var(--color-accent)",
                  fontSize: 12,
                  height: 26,
                  width: 26,
                }}
              >
                {index + 1}
              </div>
              <div
                style={{
                  color: "var(--color-text)",
                  fontSize: 12.5,
                  lineHeight: 1.35,
                }}
              >
                <b>{momento.titulo}</b> — {momento.descricao}
              </div>
            </div>
          ))}
        </div>

        <div className="card elev-sm" style={{ gap: 4, padding: 12 }}>
          <div className="card-kicker">Avaliação</div>
          <p
            style={{
              color: "var(--color-muted)",
              fontSize: 12.5,
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            {content.avaliacao}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 9, padding: "11px 16px 18px" }}>
        <button
          aria-label="Exportar PDF"
          className="btn btn-secondary"
          onClick={handleExportarClick}
          style={{ flex: "none", height: 48, padding: 0, width: 48 }}
          type="button"
        >
          <DownloadIcon size={19} strokeWidth={2.75} />
        </button>
        <button
          className="btn btn-primary"
          onClick={handleAdaptarClick}
          style={{
            alignItems: "center",
            display: "flex",
            flex: 1,
            fontSize: 14.5,
            gap: 6,
            height: 48,
            justifyContent: "center",
          }}
          type="button"
        >
          Adaptar por aluno
          <ArrowRightIcon size={16} strokeWidth={2.75} />
        </button>
      </div>

      {isPickerOpen ? (
        <div className="dialog-backdrop">
          <div
            className="dialog"
            style={{ maxHeight: "80vh", overflow: "auto" }}
          >
            <div className="dialog-title">Adaptar por aluno</div>
            <div className="dialog-body">
              Toque num aluno pra abrir (ou continuar) o construtor da adaptação
              dele.
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {students.length === 0 ? (
                <p className="text-muted" style={{ fontSize: 13 }}>
                  Nenhum aluno nessa turma ainda.
                </p>
              ) : (
                students.map((student) => {
                  const adaptacao = adaptacoes.find(
                    (a) => a.studentId === student.id
                  );
                  const status = statusFor(adaptacao?.status);
                  const displayName = student.preferredName || student.name;

                  return (
                    <Link
                      className="srow"
                      href={`/plano/${atividade.id}/aluno/${student.id}`}
                      key={student.id}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        className="av"
                        style={{
                          background: "var(--color-accent)",
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
            <div className="dialog-actions">
              <button
                className="btn btn-secondary"
                onClick={handleClosePicker}
                type="button"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
