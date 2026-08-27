"use client";

import {
  ArrowLeftIcon,
  CheckIcon,
  PencilIcon,
  PrinterIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  useCallback,
  useMemo,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type {
  Atividade,
  AtividadeAdaptada,
  AtividadeContent,
  Student,
} from "@/lib/db/schema";
import { cn, getAvatarColor, getInitials } from "@/lib/utils";
import {
  updateAdaptacaoAction,
  validateAdaptacaoAction,
  validateAllAction,
} from "./actions";

type AdaptacaoWithStudent = AtividadeAdaptada & { student: Student };

type AtividadeReviewProps = {
  atividade: Atividade;
  turmaName: string;
  adaptacoes: AdaptacaoWithStudent[];
};

export function AtividadeReview({
  atividade,
  turmaName,
  adaptacoes,
}: AtividadeReviewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { content } = atividade;

  const pendingCount = adaptacoes.filter((a) => a.status !== "validada").length;

  const handleValidateAll = useCallback(() => {
    startTransition(async () => {
      try {
        await validateAllAction({ atividadeId: atividade.id });
        toast.success("Todas as adaptações foram validadas.");
        router.refresh();
      } catch {
        toast.error("Não foi possível validar as adaptações.");
      }
    });
  }, [atividade.id, router]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <Button asChild className="w-fit" size="sm" variant="ghost">
        <Link href={`/plano/${atividade.id}`}>
          <ArrowLeftIcon />
          Voltar ao plano da turma
        </Link>
      </Button>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="font-semibold text-xl">{content.tema}</h1>
            <p className="text-muted-foreground text-sm">
              {turmaName}
              {content.duracao ? ` · ${content.duracao}` : ""}
            </p>
          </div>
          <Badge
            variant={
              atividade.status === "finalizada" ? "default" : "secondary"
            }
          >
            {atividade.status === "finalizada" ? "Finalizada" : "Rascunho"}
          </Badge>
        </div>

        <p className="text-sm">{atividade.objective}</p>

        {content.habilidades.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {content.habilidades.map((codigo) => (
              <Badge key={codigo} variant="outline">
                {codigo}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 text-sm">
          {content.momentos.map((momento) => (
            <div key={momento.titulo}>
              <span className="font-medium">{momento.titulo}: </span>
              <span className="text-muted-foreground">{momento.descricao}</span>
            </div>
          ))}
        </div>

        {content.recursos.length > 0 && (
          <p className="text-muted-foreground text-xs">
            Recursos: {content.recursos.join(", ")}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-medium text-sm">
          Adaptações ({adaptacoes.length})
        </h2>
        {pendingCount > 0 && (
          <Button
            disabled={isPending}
            onClick={handleValidateAll}
            size="sm"
            type="button"
          >
            Validar todos ({pendingCount})
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {adaptacoes.map((adaptacao) => (
          <AdaptacaoCard
            adaptacao={adaptacao}
            atividadeId={atividade.id}
            key={adaptacao.id}
          />
        ))}
      </div>
    </div>
  );
}

function AdaptacaoCard({
  adaptacao,
  atividadeId,
}: {
  adaptacao: AdaptacaoWithStudent;
  atividadeId: string;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<AtividadeContent>(adaptacao.content);

  const recursosText = useMemo(
    () => draft.recursos.join(", "),
    [draft.recursos]
  );

  const handleStartEdit = useCallback(() => {
    setDraft(adaptacao.content);
    setIsEditing(true);
  }, [adaptacao.content]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleMomentoChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const index = Number(event.target.dataset.index);
      const { value } = event.target;
      setDraft((current) => ({
        ...current,
        momentos: current.momentos.map((momento, i) =>
          i === index ? { ...momento, descricao: value } : momento
        ),
      }));
    },
    []
  );

  const handleAvaliacaoChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.target;
      setDraft((current) => ({ ...current, avaliacao: value }));
    },
    []
  );

  const handleRecursosChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.target;
      setDraft((current) => ({
        ...current,
        recursos: value
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
      }));
    },
    []
  );

  const handleSave = useCallback(() => {
    startTransition(async () => {
      try {
        await updateAdaptacaoAction({
          adaptacaoId: adaptacao.id,
          atividadeId,
          content: draft,
        });
        toast.success(`Adaptação de ${adaptacao.student.name} atualizada.`);
        setIsEditing(false);
        router.refresh();
      } catch {
        toast.error("Não foi possível salvar a edição.");
      }
    });
  }, [adaptacao.id, adaptacao.student.name, atividadeId, draft, router]);

  const handleValidate = useCallback(() => {
    startTransition(async () => {
      try {
        await validateAdaptacaoAction({
          adaptacaoId: adaptacao.id,
          atividadeId,
        });
        toast.success(`Adaptação de ${adaptacao.student.name} validada.`);
        router.refresh();
      } catch {
        toast.error("Não foi possível validar a adaptação.");
      }
    });
  }, [adaptacao.id, adaptacao.student.name, atividadeId, router]);

  const isValidada = adaptacao.status === "validada";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full font-medium text-xs",
              getAvatarColor(adaptacao.student.name)
            )}
          >
            {getInitials(adaptacao.student.name)}
          </div>
          <span className="font-medium text-sm">
            {adaptacao.student.preferredName || adaptacao.student.name}
          </span>
          {adaptacao.editedByTeacher ? (
            <span className="text-muted-foreground text-xs">(editado)</span>
          ) : null}
        </div>
        <Badge variant={isValidada ? "default" : "secondary"}>
          {isValidada ? "Validada" : "Rascunho"}
        </Badge>
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-3">
          {draft.momentos.map((momento, index) => (
            <div className="flex flex-col gap-1" key={momento.titulo}>
              <span className="font-medium text-xs">{momento.titulo}</span>
              <Textarea
                data-index={index}
                onChange={handleMomentoChange}
                value={momento.descricao}
              />
            </div>
          ))}

          <div className="flex flex-col gap-1">
            <span className="font-medium text-xs">Avaliação</span>
            <Textarea
              onChange={handleAvaliacaoChange}
              value={draft.avaliacao}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-medium text-xs">Recursos</span>
            <Textarea onChange={handleRecursosChange} value={recursosText} />
          </div>

          <div className="flex gap-2">
            <Button
              disabled={isPending}
              onClick={handleSave}
              size="sm"
              type="button"
            >
              Salvar edição
            </Button>
            <Button
              disabled={isPending}
              onClick={handleCancelEdit}
              size="sm"
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 text-sm">
          {adaptacao.content.momentos.map((momento) => (
            <div key={momento.titulo}>
              <span className="font-medium">{momento.titulo}: </span>
              <span className="text-muted-foreground">{momento.descricao}</span>
            </div>
          ))}
          <p>
            <span className="font-medium">Avaliação: </span>
            <span className="text-muted-foreground">
              {adaptacao.content.avaliacao}
            </span>
          </p>
          {adaptacao.content.recursos.length > 0 && (
            <p className="text-muted-foreground text-xs">
              Recursos: {adaptacao.content.recursos.join(", ")}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              disabled={isPending}
              onClick={handleStartEdit}
              size="sm"
              variant="outline"
            >
              <PencilIcon />
              Editar
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link
                href={`/atividades/${atividadeId}/imprimir/${adaptacao.id}`}
              >
                <PrinterIcon />
                Imprimir
              </Link>
            </Button>
            {!isValidada && (
              <Button disabled={isPending} onClick={handleValidate} size="sm">
                <CheckIcon />
                Validar
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
