"use client";

import { ArrowLeftIcon, ArrowUpIcon } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useCallback, useRef } from "react";
import { MessageBubble } from "@/components/organic/chat/message-bubble";
import { TabBar } from "@/components/organic/tab-bar";
import { useActiveChat } from "@/hooks/use-active-chat";

export function ConselhoChat({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const { messages, sendMessage, status, input, setInput, isLoading } =
    useActiveChat();
  const textInputRef = useRef<HTMLInputElement>(null);

  const isBusy = status === "submitted" || status === "streaming";
  const isThinking =
    isBusy &&
    !messages
      .at(-1)
      ?.parts?.some((p) => p.type === "text" && p.text.trim().length > 0) &&
    messages.at(-1)?.role !== "user";

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput(event.target.value);
    },
    [setInput]
  );

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (isBusy || !input.trim()) {
        return;
      }

      sendMessage({
        parts: [{ text: input, type: "text" as const }],
        role: "user",
      });

      setInput("");
    },
    [input, isBusy, sendMessage, setInput]
  );

  return (
    <>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 11,
          padding: "10px 18px 12px",
        }}
      >
        <Link
          aria-label="Voltar"
          href={`/aluno/${studentId}`}
          style={{ color: "var(--color-text)", display: "flex" }}
        >
          <ArrowLeftIcon size={22} strokeWidth={2.75} />
        </Link>
        <div style={{ lineHeight: 1.1 }}>
          <div
            style={{
              color: "var(--color-text)",
              fontFamily: "var(--font-heading)",
              fontSize: 17,
            }}
          >
            Conversar sobre {studentName}
          </div>
          <div style={{ color: "var(--color-muted)", fontSize: 11 }}>
            Vira registro no histórico dele
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: 12,
          overflow: "auto",
          padding: "4px 16px",
        }}
      >
        {messages.length === 0 && !isLoading && (
          <div className="msg msg-ai">
            Conte o que está acontecendo com {studentName} — vou olhar o
            perfil e o histórico dele antes de sugerir algo.
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isThinking ? (
          <div className="msg msg-ai text-muted">Pensando…</div>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          borderTop: "1px solid var(--color-divider)",
          padding: "10px 14px 16px",
        }}
      >
        <div className="composer">
          <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
            <input
              className="input composer-input"
              onChange={handleInputChange}
              placeholder="O que está acontecendo?"
              ref={textInputRef}
              value={input}
            />
            <button
              aria-label="Enviar"
              className="av"
              disabled={isBusy || !input.trim()}
              style={{
                background: "var(--color-accent)",
                border: "none",
                cursor: "pointer",
                height: 38,
                width: 38,
              }}
              type="submit"
            >
              <ArrowUpIcon
                color="var(--color-bg)"
                size={17}
                strokeWidth={2.75}
              />
            </button>
          </div>
        </div>
      </form>

      <TabBar />
    </>
  );
}
