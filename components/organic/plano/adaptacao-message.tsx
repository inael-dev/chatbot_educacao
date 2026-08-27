import { ImageIcon, MessageSquareIcon, PuzzleIcon } from "lucide-react";
import type { ChatMessage } from "@/lib/types";

const APOIO_VISUAL_ICONS = [
  { Icon: ImageIcon, name: "imagem" },
  { Icon: PuzzleIcon, name: "quebra-cabeca" },
  { Icon: MessageSquareIcon, name: "fala" },
];

export function AdaptacaoMessage({
  message,
  studentName,
  version,
}: {
  message: ChatMessage;
  studentName: string;
  version: number;
}) {
  return (
    <>
      {message.parts.map((part, index) => {
        const key = `${message.id}-${index}`;

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
          part.type === "tool-updateAdaptacao" &&
          part.state === "output-available"
        ) {
          const { plano } = part.input;

          return (
            <div
              className="msg msg-ai"
              key={key}
              style={{ background: "transparent", maxWidth: "92%", padding: 0 }}
            >
              <div
                className="card elev-sm"
                style={{ gap: 8, padding: 14, width: "100%" }}
              >
                <div
                  style={{
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div className="card-kicker">
                    Prévia · versão do {studentName}
                  </div>
                  <span className="tag tag-neutral">v{version}</span>
                </div>
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
                <div style={{ display: "flex", gap: 8 }}>
                  {APOIO_VISUAL_ICONS.map(({ Icon, name }) => (
                    <div
                      key={name}
                      style={{
                        alignItems: "center",
                        background: "var(--color-accent-100)",
                        borderRadius: 12,
                        display: "flex",
                        height: 44,
                        justifyContent: "center",
                        width: 44,
                      }}
                    >
                      <Icon
                        color="var(--color-accent-700)"
                        size={18}
                        strokeWidth={2.5}
                      />
                    </div>
                  ))}
                </div>
                <p
                  style={{
                    color: "var(--color-muted)",
                    fontSize: 12,
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  {plano.momentos[0]?.descricao ?? plano.avaliacao}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {plano.habilidades[0] ? (
                    <span className="tag tag-accent">
                      BNCC {plano.habilidades[0]}
                    </span>
                  ) : null}
                  <span className="tag tag-neutral">
                    {plano.recursos.length} recurso
                    {plano.recursos.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </div>
          );
        }

        return null;
      })}
    </>
  );
}
