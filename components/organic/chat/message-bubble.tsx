import { FileTextIcon } from "lucide-react";
import Link from "next/link";
import type { ChatMessage } from "@/lib/types";
import { getInitials } from "@/lib/utils";

const AVATAR_TOKENS = [
  "var(--color-accent)",
  "var(--color-accent-2)",
  "var(--color-neutral-500)",
  "var(--color-primary-light)",
];

export function MessageBubble({ message }: { message: ChatMessage }) {
  return (
    <>
      {message.parts.map((part, index) => {
        const key = `${message.id}-${index}`;

        if (part.type === "file") {
          // The client sends the file part's display name as `name` to match
          // the server's zod schema (app/(chat)/api/chat/schema.ts), which
          // predates the AI SDK's `filename` field — check both.
          const fileName =
            (part as { name?: string }).name ?? part.filename ?? "arquivo";
          return (
            <div
              className="msg msg-me"
              key={key}
              style={{ alignItems: "center", display: "flex", gap: 9 }}
            >
              <FileTextIcon size={18} />
              <div style={{ lineHeight: 1.15 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{fileName}</div>
                <div style={{ fontSize: 10.5, opacity: 0.8 }}>anexado</div>
              </div>
            </div>
          );
        }

        if (part.type === "text" && part.text.trim().length > 0) {
          return (
            <div
              className={message.role === "user" ? "msg msg-me" : "msg msg-ai"}
              key={key}
            >
              {part.text}
            </div>
          );
        }

        if (
          part.type === "tool-saveAtividade" &&
          part.state === "output-available"
        ) {
          const { plano, adaptacoes } = part.input;
          const { atividadeId } = part.output;

          return (
            <div className="flex flex-col gap-3" key={key}>
              <div
                className="msg msg-ai"
                style={{
                  background: "transparent",
                  maxWidth: "92%",
                  padding: 0,
                }}
              >
                <div
                  className="card elev-sm"
                  style={{ gap: 8, padding: 14, width: "100%" }}
                >
                  <div className="card-kicker">Plano da aula</div>
                  <div
                    style={{
                      color: "var(--color-text)",
                      fontFamily: "var(--font-heading)",
                      fontSize: 18,
                      lineHeight: 1.1,
                    }}
                  >
                    {plano.tema}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {plano.habilidades[0] ? (
                      <span className="tag tag-accent">
                        BNCC {plano.habilidades[0]}
                      </span>
                    ) : null}
                    {plano.unidadeTematica[0] ? (
                      <span className="tag tag-neutral">
                        {plano.unidadeTematica[0]}
                      </span>
                    ) : null}
                  </div>
                  <p
                    style={{
                      color: "var(--color-muted)",
                      fontSize: 12,
                      lineHeight: 1.4,
                      margin: "2px 0 0",
                    }}
                  >
                    {plano.avaliacao}
                  </p>
                  <Link
                    className="btn btn-ghost"
                    href={`/plano/${atividadeId}`}
                    style={{
                      alignSelf: "flex-start",
                      fontSize: 12.5,
                      padding: "2px 0",
                    }}
                  >
                    Ver plano completo →
                  </Link>
                </div>
              </div>

              {adaptacoes.length > 0 && (
                <>
                  <div className="msg msg-ai">
                    Quer adaptar essa atividade pra algum aluno? Toque no nome.
                  </div>
                  <div className="row-chips">
                    {adaptacoes.map((a, chipIndex) => (
                      <Link
                        className="schip"
                        href={`/plano/${atividadeId}/aluno/${a.studentId}`}
                        key={a.studentId}
                      >
                        <div
                          className="av"
                          style={{
                            background:
                              AVATAR_TOKENS[chipIndex % AVATAR_TOKENS.length],
                            fontSize: 16,
                            height: 44,
                            width: 44,
                          }}
                        >
                          {getInitials(a.studentName)}
                        </div>
                        <span>{a.studentName.split(" ")[0]}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        }

        return null;
      })}
    </>
  );
}
