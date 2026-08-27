"use client";

import { ArrowLeftIcon, ArrowUpIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { acceptAdaptacaoAction } from "@/app/plano/[id]/aluno/[studentId]/actions";
import { AdaptacaoMessage } from "@/components/organic/plano/adaptacao-message";
import { useActiveChat } from "@/hooks/use-active-chat";
import type { getStudentAdaptacaoContext } from "@/lib/db/queries";
import type { Atividade, AtividadeAdaptada, Student } from "@/lib/db/schema";
import { getInitials } from "@/lib/utils";

const QUICK_CHIPS: { label: string; message: string }[] = [
  {
    label: "Trocar tema",
    message: "Troca o tema pra algo que combine mais com o interesse dele.",
  },
  { label: "Menos texto", message: "Deixa o enunciado com menos texto." },
  { label: "+ apoio visual", message: "Adiciona mais apoio visual." },
  { label: "Mais fácil", message: "Deixa a atividade mais fácil." },
];

type StudentContext = Awaited<ReturnType<typeof getStudentAdaptacaoContext>>;

export function AdaptacaoBuilder({
  atividade,
  student,
  studentContext,
  existingAdaptacao,
}: {
  atividade: Atividade;
  student: Student;
  studentContext: StudentContext;
  existingAdaptacao: AtividadeAdaptada | null;
}) {
  const router = useRouter();
  const { messages, sendMessage, status, input, setInput } = useActiveChat();
  const [isAccepting, setIsAccepting] = useState(false);
  const hasAutoSentRef = useRef(false);

  const displayName = student.preferredName || student.name;
  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (
      hasAutoSentRef.current ||
      messages.length > 0 ||
      existingAdaptacao ||
      isBusy
    ) {
      return;
    }
    hasAutoSentRef.current = true;
    const [habilidade] = atividade.content.habilidades;
    sendMessage({
      parts: [
        {
          text: `Quero a primeira versão do plano adaptado do ${displayName} pra atividade "${atividade.content.tema}"${habilidade ? `, mantendo a habilidade BNCC ${habilidade}` : ""}. Considere o perfil dele antes de propor.`,
          type: "text",
        },
      ],
      role: "user",
    });
  }, [
    atividade.content.habilidades,
    atividade.content.tema,
    displayName,
    existingAdaptacao,
    isBusy,
    messages.length,
    sendMessage,
  ]);

  const successfulUpdates = messages
    .flatMap((m) => m.parts)
    .filter(
      (p) =>
        p.type === "tool-updateAdaptacao" &&
        p.state === "output-available" &&
        !("error" in p.output)
    ) as { output: { adaptacaoId: string } }[];

  const latestAdaptacaoId =
    successfulUpdates.at(-1)?.output.adaptacaoId ??
    existingAdaptacao?.id ??
    null;

  const handleQuickChipClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isBusy) {
        return;
      }
      const { message } = event.currentTarget.dataset;
      if (!message) {
        return;
      }
      sendMessage({ parts: [{ text: message, type: "text" }], role: "user" });
    },
    [isBusy, sendMessage]
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
      if (isBusy || !input.trim()) {
        return;
      }
      sendMessage({ parts: [{ text: input, type: "text" }], role: "user" });
      setInput("");
    },
    [input, isBusy, sendMessage, setInput]
  );

  const handleAceitar = useCallback(async () => {
    if (!latestAdaptacaoId) {
      return;
    }
    setIsAccepting(true);
    try {
      await acceptAdaptacaoAction({
        adaptacaoId: latestAdaptacaoId,
        atividadeId: atividade.id,
      });
      router.push(`/atividades/${atividade.id}/imprimir/${latestAdaptacaoId}`);
    } catch {
      toast.error("Não foi possível aceitar a adaptação.");
      setIsAccepting(false);
    }
  }, [atividade.id, latestAdaptacaoId, router]);

  const conditionTag = studentContext.conditions[0]?.condition ?? null;
  const strategyTag = studentContext.learningPreferences[0]?.strategy ?? null;
  const historicoTag =
    studentContext.aiMemorySummary ??
    (studentContext.interests[0]
      ? `interesse: ${studentContext.interests[0].interest}`
      : null);

  return (
    <>
      <div
        style={{
          borderBottom: "1px solid var(--color-divider)",
          padding: "10px 18px 12px",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: 11 }}>
          <Link
            aria-label="Voltar"
            href={`/plano/${atividade.id}`}
            style={{ color: "var(--color-text)", display: "flex" }}
          >
            <ArrowLeftIcon size={22} strokeWidth={2.75} />
          </Link>
          <div
            className="av"
            style={{ background: "var(--color-accent)", height: 34, width: 34 }}
          >
            {getInitials(displayName)}
          </div>
          <div style={{ flex: 1, lineHeight: 1.1 }}>
            <div
              style={{
                color: "var(--color-text)",
                fontFamily: "var(--font-heading)",
                fontSize: 16,
              }}
            >
              Plano do {displayName}
            </div>
            <div style={{ color: "var(--color-muted)", fontSize: 11 }}>
              {atividade.content.tema}
              {atividade.content.habilidades[0]
                ? ` · ${atividade.content.habilidades[0]}`
                : ""}
            </div>
          </div>
          <span
            className="pill"
            style={{
              background: "var(--color-accent-200)",
              color: "var(--color-accent-800)",
            }}
          >
            Rascunho
          </span>
        </div>

        {conditionTag || strategyTag || historicoTag ? (
          <div
            style={{
              display: "flex",
              gap: 6,
              marginTop: 10,
              overflowX: "auto",
              paddingBottom: 2,
            }}
          >
            {conditionTag ? (
              <span className="tag tag-accent-2" style={{ flex: "none" }}>
                {conditionTag}
              </span>
            ) : null}
            {strategyTag ? (
              <span className="tag tag-neutral" style={{ flex: "none" }}>
                estratégia: {strategyTag}
              </span>
            ) : null}
            {historicoTag ? (
              <span className="tag tag-neutral" style={{ flex: "none" }}>
                {historicoTag}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: 12,
          overflow: "auto",
          padding: "10px 16px",
        }}
      >
        {existingAdaptacao ? (
          <div
            className="msg msg-ai"
            style={{ background: "transparent", maxWidth: "92%", padding: 0 }}
          >
            <div
              className="card elev-sm"
              style={{ gap: 8, padding: 14, width: "100%" }}
            >
              <div className="card-kicker">
                Prévia · versão atual do {displayName}
              </div>
              <div
                style={{
                  color: "var(--color-text)",
                  fontFamily: "var(--font-heading)",
                  fontSize: 18,
                }}
              >
                {existingAdaptacao.content.tema}
              </div>
              <p
                style={{ color: "var(--color-muted)", fontSize: 12, margin: 0 }}
              >
                {existingAdaptacao.content.momentos[0]?.descricao ??
                  existingAdaptacao.content.avaliacao}
              </p>
            </div>
          </div>
        ) : null}

        {messages.map((message, index) => (
          <AdaptacaoMessage
            key={message.id}
            message={message}
            studentName={displayName}
            version={
              (existingAdaptacao ? 1 : 0) +
              messages
                .slice(0, index + 1)
                .flatMap((m) =>
                  m.parts.filter(
                    (p) =>
                      p.type === "tool-updateAdaptacao" &&
                      p.state === "output-available"
                  )
                ).length
            }
          />
        ))}

        {isBusy ? <div className="msg msg-ai text-muted">Pensando…</div> : null}
      </div>

      <div
        style={{
          borderTop: "1px solid var(--color-divider)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: "10px 16px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 2,
          }}
        >
          {QUICK_CHIPS.map((chip) => (
            <button
              className="tag tag-outline"
              data-message={chip.message}
              disabled={isBusy}
              key={chip.label}
              onClick={handleQuickChipClick}
              style={{ cursor: "pointer", flex: "none" }}
              type="button"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ alignItems: "center", display: "flex", gap: 9 }}
        >
          <input
            className="input input-pill"
            onChange={handleInputChange}
            placeholder="Peça um ajuste…"
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
              height: 40,
              width: 40,
            }}
            type="submit"
          >
            <ArrowUpIcon color="var(--color-bg)" size={18} strokeWidth={2.75} />
          </button>
        </form>

        <button
          className="btn btn-primary btn-block"
          disabled={!latestAdaptacaoId || isAccepting || isBusy}
          onClick={handleAceitar}
          style={{
            alignItems: "center",
            display: "flex",
            gap: 6,
            height: 48,
            justifyContent: "center",
          }}
          type="button"
        >
          <CheckIcon size={17} strokeWidth={2.75} />
          {isAccepting ? "Gerando…" : "Aceitar e gerar PDF"}
        </button>
      </div>
    </>
  );
}
