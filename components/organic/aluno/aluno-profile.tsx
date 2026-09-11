"use client";

import {
  ArrowLeftIcon,
  CheckIcon,
  MessageCircleIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useCallback, useState } from "react";
import { toast } from "sonner";
import {
  adicionarEstrategiaAction,
  adicionarMetaAction,
  atualizarStatusMetaAction,
  registrarObservacaoAction,
  removerEstrategiaAction,
  removerMetaAction,
  removerObservacaoAction,
  responderAeeAction,
  startConselhoChatAction,
} from "@/app/aluno/[id]/actions";
import { TabBar } from "@/components/organic/tab-bar";
import type {
  getAeeNotes,
  getRecentAtividadesForStudent,
  getStudentAdaptacaoContext,
  getStudentHistorico,
} from "@/lib/db/queries";
import type {
  Student,
  StudentGoal,
  StudentLearningPreference,
  StudentObservation,
} from "@/lib/db/schema";
import { getInitials } from "@/lib/utils";

type StudentContext = Awaited<ReturnType<typeof getStudentAdaptacaoContext>>;
type Historico = Awaited<ReturnType<typeof getStudentHistorico>>;
type AeeNotes = Awaited<ReturnType<typeof getAeeNotes>>;
type AtividadesRecentes = Awaited<
  ReturnType<typeof getRecentAtividadesForStudent>
>;

const TIPO_OPTIONS: { value: StudentObservation["tipo"]; label: string }[] = [
  { label: "Positivo", value: "positivo" },
  { label: "Neutro", value: "neutro" },
  { label: "Barreira", value: "barreira" },
];

const TIPO_DOT_COLOR: Record<StudentObservation["tipo"], string> = {
  barreira: "var(--color-accent-400)",
  neutro: "var(--color-neutral-400)",
  positivo: "var(--color-accent-2-500)",
};

const STATUS_OPTIONS: { value: StudentGoal["status"]; label: string }[] = [
  { label: "Não iniciado", value: "not_started" },
  { label: "Em andamento", value: "in_progress" },
  { label: "Alcançado", value: "achieved" },
  { label: "Pausado", value: "paused" },
];

const DIFFICULTY_OPTIONS: {
  value: NonNullable<StudentGoal["difficulty"]>;
  label: string;
}[] = [
  { label: "Fácil", value: "easy" },
  { label: "Médio", value: "medium" },
  { label: "Difícil", value: "hard" },
];

const DIFFICULTY_LABEL: Record<
  NonNullable<StudentGoal["difficulty"]>,
  string
> = {
  easy: "Fácil",
  hard: "Difícil",
  medium: "Médio",
};

const EFFECTIVENESS_OPTIONS: {
  value: StudentLearningPreference["effectiveness"];
  label: string;
}[] = [
  { label: "Baixa", value: "low" },
  { label: "Média", value: "medium" },
  { label: "Alta", value: "high" },
];

const EFFECTIVENESS_LABEL: Record<
  StudentLearningPreference["effectiveness"],
  string
> = {
  high: "Alta",
  low: "Baixa",
  medium: "Média",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function calcIdade(birthDate: Date | null): number | null {
  if (!birthDate) {
    return null;
  }
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function ObservacaoForm({
  studentId,
  atividadesRecentes,
  onDone,
}: {
  studentId: string;
  atividadesRecentes: AtividadesRecentes;
  onDone: () => void;
}) {
  const [tipo, setTipo] = useState<StudentObservation["tipo"]>("neutro");
  const [texto, setTexto] = useState("");
  const [atividadeId, setAtividadeId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleTextoChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => setTexto(event.target.value),
    []
  );

  const handleAtividadeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) =>
      setAtividadeId(event.target.value),
    []
  );

  const handleTipoClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const value = event.currentTarget.dataset
        .tipo as StudentObservation["tipo"];
      setTipo(value);
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!texto.trim()) {
        return;
      }
      setIsSaving(true);
      try {
        await registrarObservacaoAction({
          atividadeId: atividadeId || undefined,
          studentId,
          texto,
          tipo,
        });
        toast.success("Observação registrada.");
        onDone();
      } catch {
        toast.error("Não foi possível registrar.");
      } finally {
        setIsSaving(false);
      }
    },
    [atividadeId, onDone, studentId, texto, tipo]
  );

  return (
    <form
      className="card elev-sm"
      onSubmit={handleSubmit}
      style={{ gap: 8, padding: 12 }}
    >
      <div style={{ display: "flex", gap: 6 }}>
        {TIPO_OPTIONS.map((opt) => (
          <button
            className="tag"
            data-tipo={opt.value}
            key={opt.value}
            onClick={handleTipoClick}
            style={{
              background:
                tipo === opt.value
                  ? "var(--color-accent)"
                  : "var(--color-neutral-100)",
              color:
                tipo === opt.value ? "var(--color-bg)" : "var(--color-text)",
              cursor: "pointer",
            }}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>
      <textarea
        className="input"
        onChange={handleTextoChange}
        placeholder="O que aconteceu?"
        style={{ minHeight: 60 }}
        value={texto}
      />
      {atividadesRecentes.length > 0 ? (
        <select
          className="input"
          onChange={handleAtividadeChange}
          value={atividadeId}
        >
          <option value="">Relacionar a uma atividade (opcional)</option>
          {atividadesRecentes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.content.tema}
            </option>
          ))}
        </select>
      ) : null}
      <button
        className="btn btn-primary btn-block"
        disabled={isSaving || !texto.trim()}
        type="submit"
      >
        {isSaving ? "Salvando…" : "Salvar observação"}
      </button>
    </form>
  );
}

function MetaForm({
  studentId,
  onDone,
}: {
  studentId: string;
  onDone: () => void;
}) {
  const [goal, setGoal] = useState("");
  const [difficulty, setDifficulty] = useState<
    StudentGoal["difficulty"] | undefined
  >(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const handleGoalChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => setGoal(event.target.value),
    []
  );

  const handleDifficultyClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const value = event.currentTarget.dataset
        .difficulty as StudentGoal["difficulty"];
      setDifficulty((prev) => (prev === value ? undefined : value));
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!goal.trim()) {
        return;
      }
      setIsSaving(true);
      try {
        await adicionarMetaAction({ difficulty, goal, studentId });
        toast.success("Objetivo adicionado.");
        onDone();
      } catch {
        toast.error("Não foi possível adicionar.");
      } finally {
        setIsSaving(false);
      }
    },
    [difficulty, goal, onDone, studentId]
  );

  return (
    <form
      className="card elev-sm"
      onSubmit={handleSubmit}
      style={{ gap: 8, padding: 12 }}
    >
      <textarea
        className="input"
        onChange={handleGoalChange}
        placeholder="Ex: Ampliar o tempo de permanência nas atividades"
        style={{ minHeight: 50 }}
        value={goal}
      />
      <div style={{ display: "flex", gap: 6 }}>
        {DIFFICULTY_OPTIONS.map((opt) => (
          <button
            className="tag"
            data-difficulty={opt.value}
            key={opt.value}
            onClick={handleDifficultyClick}
            style={{
              background:
                difficulty === opt.value
                  ? "var(--color-accent)"
                  : "var(--color-neutral-100)",
              color:
                difficulty === opt.value
                  ? "var(--color-bg)"
                  : "var(--color-text)",
              cursor: "pointer",
            }}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>
      <button
        className="btn btn-primary btn-block"
        disabled={isSaving || !goal.trim()}
        type="submit"
      >
        {isSaving ? "Salvando…" : "Salvar objetivo"}
      </button>
    </form>
  );
}

function EstrategiaForm({
  studentId,
  onDone,
}: {
  studentId: string;
  onDone: () => void;
}) {
  const [strategy, setStrategy] = useState("");
  const [effectiveness, setEffectiveness] =
    useState<StudentLearningPreference["effectiveness"]>("medium");
  const [isSaving, setIsSaving] = useState(false);

  const handleStrategyChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setStrategy(event.target.value),
    []
  );

  const handleEffectivenessClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const value = event.currentTarget.dataset
        .effectiveness as StudentLearningPreference["effectiveness"];
      setEffectiveness(value);
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!strategy.trim()) {
        return;
      }
      setIsSaving(true);
      try {
        await adicionarEstrategiaAction({ effectiveness, strategy, studentId });
        toast.success("Estratégia adicionada.");
        onDone();
      } catch {
        toast.error("Não foi possível adicionar.");
      } finally {
        setIsSaving(false);
      }
    },
    [effectiveness, onDone, strategy, studentId]
  );

  return (
    <form
      className="card elev-sm"
      onSubmit={handleSubmit}
      style={{ gap: 8, padding: 12 }}
    >
      <input
        className="input"
        onChange={handleStrategyChange}
        placeholder="Ex: Rotina visual estruturada"
        value={strategy}
      />
      <div style={{ display: "flex", gap: 6 }}>
        {EFFECTIVENESS_OPTIONS.map((opt) => (
          <button
            className="tag"
            data-effectiveness={opt.value}
            key={opt.value}
            onClick={handleEffectivenessClick}
            style={{
              background:
                effectiveness === opt.value
                  ? "var(--color-accent)"
                  : "var(--color-neutral-100)",
              color:
                effectiveness === opt.value
                  ? "var(--color-bg)"
                  : "var(--color-text)",
              cursor: "pointer",
            }}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>
      <button
        className="btn btn-primary btn-block"
        disabled={isSaving || !strategy.trim()}
        type="submit"
      >
        {isSaving ? "Salvando…" : "Salvar estratégia"}
      </button>
    </form>
  );
}

export function AlunoProfile({
  student,
  studentContext,
  historico,
  aeeNotes,
  atividadesRecentes,
}: {
  student: Student;
  studentContext: StudentContext;
  historico: Historico;
  aeeNotes: AeeNotes;
  atividadesRecentes: AtividadesRecentes;
}) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [aeePapel, setAeePapel] = useState<"regente" | "aee">("regente");
  const [aeeTexto, setAeeTexto] = useState("");
  const [isSendingAee, setIsSendingAee] = useState(false);
  const [confirmingRemoveId, setConfirmingRemoveId] = useState<string | null>(
    null
  );
  const [isStartingConselho, setIsStartingConselho] = useState(false);
  const [isMetaFormOpen, setIsMetaFormOpen] = useState(false);
  const [isEstrategiaFormOpen, setIsEstrategiaFormOpen] = useState(false);

  const displayName = student.preferredName || student.name;
  const idade = calcIdade(student.birthDate);

  const handleBack = useCallback(() => router.back(), [router]);
  const handleOpenForm = useCallback(() => setIsFormOpen(true), []);
  const handleCloseForm = useCallback(() => setIsFormOpen(false), []);
  const handleOpenMetaForm = useCallback(() => setIsMetaFormOpen(true), []);
  const handleCloseMetaForm = useCallback(() => setIsMetaFormOpen(false), []);
  const handleOpenEstrategiaForm = useCallback(
    () => setIsEstrategiaFormOpen(true),
    []
  );
  const handleCloseEstrategiaForm = useCallback(
    () => setIsEstrategiaFormOpen(false),
    []
  );

  const handleStatusChange = useCallback(
    async (event: ChangeEvent<HTMLSelectElement>) => {
      const { id } = event.currentTarget.dataset;
      const status = event.target.value as StudentGoal["status"];
      if (!id) {
        return;
      }
      try {
        await atualizarStatusMetaAction({ id, status, studentId: student.id });
      } catch {
        toast.error("Não foi possível atualizar o status.");
      }
    },
    [student.id]
  );

  const handleRemoverMeta = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      const { id } = event.currentTarget.dataset;
      if (!id) {
        return;
      }
      try {
        await removerMetaAction({ id, studentId: student.id });
        toast.success("Objetivo removido.");
      } catch {
        toast.error("Não foi possível remover.");
      }
    },
    [student.id]
  );

  const handleRemoverEstrategia = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      const { id } = event.currentTarget.dataset;
      if (!id) {
        return;
      }
      try {
        await removerEstrategiaAction({ id, studentId: student.id });
        toast.success("Estratégia removida.");
      } catch {
        toast.error("Não foi possível remover.");
      }
    },
    [student.id]
  );

  const handleConversarClick = useCallback(async () => {
    setIsStartingConselho(true);
    await startConselhoChatAction({ studentId: student.id });
  }, [student.id]);

  const handleAskRemover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { id } = event.currentTarget.dataset;
      setConfirmingRemoveId(id ?? null);
    },
    []
  );

  const handleCancelRemover = useCallback(
    () => setConfirmingRemoveId(null),
    []
  );

  const handleConfirmRemover = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      const { id } = event.currentTarget.dataset;
      if (!id) {
        return;
      }
      setConfirmingRemoveId(null);
      try {
        await removerObservacaoAction({ id, studentId: student.id });
        toast.success("Observação removida.");
      } catch {
        toast.error("Não foi possível remover.");
      }
    },
    [student.id]
  );

  const handleAeePapelClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAeePapel(event.currentTarget.dataset.papel as "regente" | "aee");
    },
    []
  );

  const handleAeeTextoChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setAeeTexto(event.target.value),
    []
  );

  const handleAeeSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!aeeTexto.trim()) {
        return;
      }
      setIsSendingAee(true);
      try {
        await responderAeeAction({
          papel: aeePapel,
          studentId: student.id,
          texto: aeeTexto,
        });
        setAeeTexto("");
        toast.success("Mensagem enviada.");
      } catch {
        toast.error("Não foi possível enviar.");
      } finally {
        setIsSendingAee(false);
      }
    },
    [aeePapel, aeeTexto, student.id]
  );

  return (
    <>
      <div style={{ padding: "10px 18px 4px" }}>
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
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: 16,
          overflow: "auto",
          padding: "4px 16px 16px",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: 14 }}>
          <div
            className="av washed"
            style={{
              background: "var(--color-accent)",
              fontSize: 22,
              height: 66,
              width: 66,
            }}
          >
            {getInitials(displayName)}
          </div>
          <div>
            <div
              style={{
                color: "var(--color-text)",
                fontFamily: "var(--font-heading)",
                fontSize: 22,
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginTop: 6,
              }}
            >
              {studentContext.conditions.map((c) => (
                <span className="tag tag-accent-2" key={c.id}>
                  {c.condition}
                </span>
              ))}
              {idade === null ? (
                studentContext.profile?.grade ? (
                  <span className="tag tag-neutral">
                    {studentContext.profile.grade}
                  </span>
                ) : null
              ) : (
                <span className="tag tag-neutral">{idade} anos</span>
              )}
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary btn-block"
          disabled={isStartingConselho}
          onClick={handleConversarClick}
          style={{
            alignItems: "center",
            display: "flex",
            gap: 8,
            justifyContent: "center",
          }}
          type="button"
        >
          <MessageCircleIcon size={16} strokeWidth={2.75} />
          {isStartingConselho ? "Abrindo…" : `Conversar sobre ${displayName}`}
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                color: "var(--color-text)",
                fontFamily: "var(--font-heading)",
                fontSize: 16,
              }}
            >
              Objetivos
            </div>
            <button
              onClick={handleOpenMetaForm}
              style={{
                alignItems: "center",
                background: "none",
                border: "none",
                color: "var(--color-accent)",
                cursor: "pointer",
                display: "flex",
                fontSize: 12.5,
                gap: 3,
              }}
              type="button"
            >
              <PlusIcon size={13} strokeWidth={2.75} />
              Adicionar objetivo
            </button>
          </div>

          {isMetaFormOpen ? (
            <MetaForm onDone={handleCloseMetaForm} studentId={student.id} />
          ) : null}

          {studentContext.goals.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 13 }}>
              Nenhum objetivo cadastrado ainda.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {studentContext.goals.map((g) => (
                <div
                  className="card elev-sm"
                  key={g.id}
                  style={{ padding: 10 }}
                >
                  <div
                    style={{
                      alignItems: "flex-start",
                      display: "flex",
                      gap: 8,
                      justifyContent: "space-between",
                    }}
                  >
                    <p style={{ flex: 1, fontSize: 13, margin: 0 }}>{g.goal}</p>
                    <button
                      aria-label="Remover objetivo"
                      data-id={g.id}
                      onClick={handleRemoverMeta}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--color-muted)",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      type="button"
                    >
                      <XIcon size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div
                    style={{
                      alignItems: "center",
                      display: "flex",
                      gap: 6,
                      marginTop: 6,
                    }}
                  >
                    <select
                      className="input"
                      data-id={g.id}
                      onChange={handleStatusChange}
                      style={{
                        fontSize: 11.5,
                        height: "auto",
                        padding: "3px 6px",
                      }}
                      value={g.status}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {g.difficulty ? (
                      <span className="tag tag-neutral">
                        {DIFFICULTY_LABEL[g.difficulty]}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                color: "var(--color-text)",
                fontFamily: "var(--font-heading)",
                fontSize: 16,
              }}
            >
              Estratégias pedagógicas
            </div>
            <button
              onClick={handleOpenEstrategiaForm}
              style={{
                alignItems: "center",
                background: "none",
                border: "none",
                color: "var(--color-accent)",
                cursor: "pointer",
                display: "flex",
                fontSize: 12.5,
                gap: 3,
              }}
              type="button"
            >
              <PlusIcon size={13} strokeWidth={2.75} />
              Adicionar estratégia
            </button>
          </div>

          {isEstrategiaFormOpen ? (
            <EstrategiaForm
              onDone={handleCloseEstrategiaForm}
              studentId={student.id}
            />
          ) : null}

          {studentContext.learningPreferences.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 13 }}>
              Nenhuma estratégia cadastrada ainda.
            </p>
          ) : (
            <div className="card elev-sm" style={{ gap: 8, padding: 12 }}>
              {studentContext.learningPreferences.map((p) => (
                <div
                  key={p.id}
                  style={{
                    alignItems: "center",
                    display: "flex",
                    gap: 8,
                    justifyContent: "space-between",
                  }}
                >
                  <p style={{ flex: 1, fontSize: 13, margin: 0 }}>
                    {p.strategy}
                  </p>
                  <span className="tag tag-neutral">
                    {EFFECTIVENESS_LABEL[p.effectiveness]}
                  </span>
                  <button
                    aria-label="Remover estratégia"
                    data-id={p.id}
                    onClick={handleRemoverEstrategia}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--color-muted)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                    type="button"
                  >
                    <XIcon size={13} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                color: "var(--color-text)",
                fontFamily: "var(--font-heading)",
                fontSize: 16,
              }}
            >
              Histórico recente
            </div>
            <button
              onClick={handleOpenForm}
              style={{
                alignItems: "center",
                background: "none",
                border: "none",
                color: "var(--color-accent)",
                cursor: "pointer",
                display: "flex",
                fontSize: 12.5,
                gap: 3,
              }}
              type="button"
            >
              <PlusIcon size={13} strokeWidth={2.75} />
              Registrar observação
            </button>
          </div>

          {isFormOpen ? (
            <ObservacaoForm
              atividadesRecentes={atividadesRecentes}
              onDone={handleCloseForm}
              studentId={student.id}
            />
          ) : null}

          {historico.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 13 }}>
              Nenhuma observação registrada ainda.
            </p>
          ) : (
            <div className="card elev-sm" style={{ gap: 10, padding: 14 }}>
              {historico.map((entry) => (
                <div
                  key={entry.id}
                  style={{ alignItems: "flex-start", display: "flex", gap: 9 }}
                >
                  <div
                    style={{
                      background: TIPO_DOT_COLOR[entry.tipo],
                      borderRadius: "50%",
                      flex: "none",
                      height: 8,
                      marginTop: 5,
                      width: 8,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        color: "var(--color-text)",
                        fontSize: 13,
                        lineHeight: 1.4,
                        margin: 0,
                      }}
                    >
                      {entry.observation}
                      {entry.atividadeTema ? (
                        <span className="text-muted">
                          {" "}
                          · {entry.atividadeTema}
                        </span>
                      ) : null}
                    </p>
                    <span
                      style={{ color: "var(--color-muted)", fontSize: 10.5 }}
                    >
                      {formatDate(new Date(entry.createdAt))}
                      {entry.origem === "conselho" ? " · Conselho da IA" : ""}
                    </span>
                  </div>
                  {confirmingRemoveId === entry.id ? (
                    <div
                      style={{ alignItems: "center", display: "flex", gap: 4 }}
                    >
                      <button
                        aria-label="Confirmar remoção"
                        data-id={entry.id}
                        onClick={handleConfirmRemover}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-danger)",
                          cursor: "pointer",
                          padding: 0,
                        }}
                        type="button"
                      >
                        <CheckIcon size={14} strokeWidth={2.5} />
                      </button>
                      <button
                        aria-label="Cancelar remoção"
                        onClick={handleCancelRemover}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-muted)",
                          cursor: "pointer",
                          padding: 0,
                        }}
                        type="button"
                      >
                        <XIcon size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <button
                      aria-label="Remover observação"
                      data-id={entry.id}
                      onClick={handleAskRemover}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--color-muted)",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      type="button"
                    >
                      <XIcon size={13} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="card elev-sm"
          style={{
            background: "var(--color-accent-2-100)",
            gap: 10,
            padding: 14,
          }}
        >
          <div
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              className="card-kicker"
              style={{ color: "var(--color-accent-2-800)" }}
            >
              Dupla pedagógica
            </div>
            <span className="tag tag-accent-2">AEE + Regente</span>
          </div>

          {aeeNotes.length === 0 ? (
            <p style={{ color: "var(--color-accent-2-900)", fontSize: 12.5 }}>
              Nenhuma nota ainda entre AEE e regente.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {aeeNotes.map((note) => (
                <div
                  className="card"
                  key={note.id}
                  style={{
                    background: "var(--color-surface)",
                    gap: 3,
                    padding: 10,
                  }}
                >
                  <p style={{ fontSize: 12.5, lineHeight: 1.4, margin: 0 }}>
                    {note.texto}
                  </p>
                  <span style={{ color: "var(--color-muted)", fontSize: 10.5 }}>
                    {note.autor} · {formatDate(new Date(note.createdAt))}
                  </span>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={handleAeeSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              <button
                className="tag"
                data-papel="regente"
                onClick={handleAeePapelClick}
                style={{
                  background:
                    aeePapel === "regente"
                      ? "var(--color-accent-2-500)"
                      : "var(--color-surface)",
                  color:
                    aeePapel === "regente"
                      ? "var(--color-bg)"
                      : "var(--color-text)",
                  cursor: "pointer",
                }}
                type="button"
              >
                Enviar como regente
              </button>
              <button
                className="tag"
                data-papel="aee"
                onClick={handleAeePapelClick}
                style={{
                  background:
                    aeePapel === "aee"
                      ? "var(--color-accent-2-500)"
                      : "var(--color-surface)",
                  color:
                    aeePapel === "aee"
                      ? "var(--color-bg)"
                      : "var(--color-text)",
                  cursor: "pointer",
                }}
                type="button"
              >
                Enviar como AEE
              </button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input"
                onChange={handleAeeTextoChange}
                placeholder="Responder →"
                style={{ flex: 1 }}
                value={aeeTexto}
              />
              <button
                className="btn btn-primary"
                disabled={isSendingAee || !aeeTexto.trim()}
                type="submit"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      </div>

      <div style={{ padding: "0 16px 18px" }}>
        <Link
          className="btn btn-primary btn-block"
          href="/nova-aula"
          style={{ height: 48 }}
        >
          Gerar atividade adaptada
        </Link>
      </div>

      <TabBar />
    </>
  );
}
