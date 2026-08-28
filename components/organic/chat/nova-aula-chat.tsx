"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  FileTextIcon,
  PlusIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { TabBar } from "@/components/organic/tab-bar";
import { useActiveChat } from "@/hooks/use-active-chat";
import type { Attachment } from "@/lib/types";
import { MessageBubble } from "./message-bubble";

async function uploadFile(file: File): Promise<Attachment | null> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/files/upload`,
      { body: formData, method: "POST" }
    );

    if (!response.ok) {
      const { error } = await response.json();
      toast.error(error ?? "Falha ao enviar o arquivo, tente novamente.");
      return null;
    }

    const { url, pathname, contentType } = await response.json();
    return { contentType, name: pathname, url };
  } catch {
    toast.error("Falha ao enviar o arquivo, tente novamente.");
    return null;
  }
}

export function NovaAulaChat({
  turmaName,
  turmaSubtitle,
}: {
  turmaName: string;
  turmaSubtitle: string;
}) {
  const { messages, sendMessage, status, input, setInput, isLoading } =
    useActiveChat();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const isBusy = status === "submitted" || status === "streaming";
  const isThinking =
    isBusy &&
    !messages
      .at(-1)
      ?.parts?.some((p) => p.type === "text" && p.text.trim().length > 0) &&
    messages.at(-1)?.role !== "user";

  const handleDescreverClick = useCallback(() => {
    textInputRef.current?.focus();
  }, []);

  const handleAnexarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) {
        return;
      }

      setIsUploading(true);
      const attachment = await uploadFile(file);
      setIsUploading(false);

      if (!attachment) {
        return;
      }

      setAttachments((current) => [...current, attachment]);
      setInput(
        "Segue o plano de aula da turma em anexo. Adapte para os alunos que precisam de apoio."
      );
    },
    [setInput]
  );

  const handleRemoveAttachmentClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const {
        dataset: { url },
      } = event.currentTarget;
      setAttachments((current) => current.filter((a) => a.url !== url));
    },
    []
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput(event.target.value);
    },
    [setInput]
  );

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (isBusy || (!input.trim() && attachments.length === 0)) {
        return;
      }

      sendMessage({
        parts: [
          ...attachments.map((attachment) => ({
            mediaType: attachment.contentType,
            name: attachment.name,
            type: "file" as const,
            url: attachment.url,
          })),
          { text: input, type: "text" as const },
        ],
        role: "user",
      });

      setInput("");
      setAttachments([]);
    },
    [attachments, input, isBusy, sendMessage, setInput]
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
          href="/"
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
            Nova aula
          </div>
          <div style={{ color: "var(--color-muted)", fontSize: 11 }}>
            {turmaName}
            {turmaSubtitle ? ` · ${turmaSubtitle}` : ""}
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
          <>
            <div className="msg msg-ai">
              Oi, prof! Como quer começar a aula de hoje?
            </div>
            <div style={{ alignSelf: "stretch", display: "flex", gap: 9 }}>
              <button
                className="choice-card"
                onClick={handleDescreverClick}
                type="button"
              >
                <div
                  className="av"
                  style={{
                    background: "var(--color-accent-2-500)",
                    height: 34,
                    width: 34,
                  }}
                >
                  <PlusIcon
                    color="var(--color-bg)"
                    size={17}
                    strokeWidth={2.75}
                  />
                </div>
                <div className="choice-card-title">Descrever no chat</div>
                <div className="choice-card-body">
                  Conte a atividade e a IA monta o plano.
                </div>
                <div className="choice-card-action">
                  <span className="choice-card-action-label">Começar</span>
                  <div
                    className="av"
                    style={{
                      background: "var(--color-accent-2-500)",
                      height: 26,
                      width: 26,
                    }}
                  >
                    <ArrowRightIcon
                      color="var(--color-bg)"
                      size={13}
                      strokeWidth={3}
                    />
                  </div>
                </div>
              </button>
              <button
                className="choice-card choice-card-accent"
                onClick={handleAnexarClick}
                type="button"
              >
                <div
                  className="av"
                  style={{
                    background: "var(--color-accent)",
                    height: 34,
                    width: 34,
                  }}
                >
                  <UploadIcon
                    color="var(--color-bg)"
                    size={17}
                    strokeWidth={2.75}
                  />
                </div>
                <div className="choice-card-title">Anexar plano pronto</div>
                <div
                  className="choice-card-body"
                  style={{ color: "var(--color-accent-800)" }}
                >
                  Foto ou PDF — a IA extrai e organiza.
                </div>
                <div className="choice-card-action">
                  <span
                    className="choice-card-action-label"
                    style={{ color: "var(--color-accent-800)" }}
                  >
                    Anexar
                  </span>
                  <div
                    className="av"
                    style={{
                      background: "var(--color-accent)",
                      height: 26,
                      width: 26,
                    }}
                  >
                    <ArrowRightIcon
                      color="var(--color-bg)"
                      size={13}
                      strokeWidth={3}
                    />
                  </div>
                </div>
              </button>
            </div>
          </>
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
          {(attachments.length > 0 || isUploading) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {attachments.map((attachment) => {
                const isImage = attachment.contentType.startsWith("image/");
                return (
                  <div className="attachment-thumb" key={attachment.url}>
                    <div className="attachment-thumb-media">
                      {isImage ? (
                        <img alt={attachment.name} src={attachment.url} />
                      ) : (
                        <FileTextIcon
                          color="var(--color-muted)"
                          size={22}
                          strokeWidth={2}
                        />
                      )}
                    </div>
                    <button
                      aria-label="Remover anexo"
                      className="attachment-remove"
                      data-url={attachment.url}
                      onClick={handleRemoveAttachmentClick}
                      type="button"
                    >
                      <XIcon size={11} strokeWidth={3} />
                    </button>
                  </div>
                );
              })}
              {isUploading ? (
                <span className="tag tag-neutral">Enviando…</span>
              ) : null}
            </div>
          )}

          <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
            <input
              accept="image/jpeg,image/png,application/pdf"
              className="sr-only"
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
            />
            <button
              aria-label="Anexar arquivo"
              className="composer-icon-btn"
              onClick={handleAnexarClick}
              type="button"
            >
              <PlusIcon size={19} strokeWidth={2.5} />
            </button>
            <input
              className="input composer-input"
              onChange={handleInputChange}
              placeholder="Mensagem…"
              ref={textInputRef}
              value={input}
            />
            <button
              aria-label="Enviar"
              className="av"
              disabled={isBusy || (!input.trim() && attachments.length === 0)}
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
