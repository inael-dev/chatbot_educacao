"use client";

import {
  ChevronDownIcon,
  GripVerticalIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { updateAtividadeAction } from "@/app/plano/[id]/editar/actions";
import { BnccSelector } from "@/components/organic/plano/bncc-selector";
import { TabBar } from "@/components/organic/tab-bar";
import type { BnccHabilidade } from "@/lib/ai/bncc";
import type { Atividade, AtividadeContent } from "@/lib/db/schema";

type Momento = AtividadeContent["momentos"][number];

function MomentoRow({
  momento,
  index,
  isFirst,
  isLast,
  onChangeField,
  onMove,
  onRemove,
}: {
  momento: Momento;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onChangeField: (index: number, field: keyof Momento, value: string) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (index: number) => void;
}) {
  const handleTituloChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeField(index, "titulo", event.target.value);
    },
    [index, onChangeField]
  );

  const handleDescricaoChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChangeField(index, "descricao", event.target.value);
    },
    [index, onChangeField]
  );

  const handleMoveUp = useCallback(() => {
    onMove(index, -1);
  }, [index, onMove]);

  const handleMoveDown = useCallback(() => {
    onMove(index, 1);
  }, [index, onMove]);

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  return (
    <div className="card elev-sm" style={{ gap: 6, padding: 10 }}>
      <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
        <GripVerticalIcon
          color="var(--color-subtle)"
          size={15}
          strokeWidth={2.75}
        />
        <input
          className="input flex-1"
          onChange={handleTituloChange}
          placeholder="Título (ex: Abertura)"
          value={momento.titulo}
        />
        <button
          aria-label="Mover para cima"
          disabled={isFirst}
          onClick={handleMoveUp}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-muted)",
            cursor: "pointer",
            fontSize: 12,
            padding: 0,
          }}
          type="button"
        >
          ↑
        </button>
        <button
          aria-label="Mover para baixo"
          disabled={isLast}
          onClick={handleMoveDown}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-muted)",
            cursor: "pointer",
            fontSize: 12,
            padding: 0,
          }}
          type="button"
        >
          ↓
        </button>
        <button
          aria-label="Remover momento"
          onClick={handleRemove}
          style={{
            alignItems: "center",
            background: "none",
            border: "none",
            color: "var(--color-muted)",
            cursor: "pointer",
            display: "flex",
            padding: 0,
          }}
          type="button"
        >
          <XIcon size={15} strokeWidth={2.75} />
        </button>
      </div>
      <textarea
        className="input"
        onChange={handleDescricaoChange}
        placeholder="Descrição do momento"
        style={{ minHeight: 44 }}
        value={momento.descricao}
      />
    </div>
  );
}

export function EditarPlano({ atividade }: { atividade: Atividade }) {
  const router = useRouter();
  const { content } = atividade;

  const [tema, setTema] = useState(content.tema);
  const [objective, setObjective] = useState(atividade.objective);
  const [habilidade, setHabilidade] = useState<{
    codigo: string;
    descricao: string;
  } | null>(
    content.habilidades[0]
      ? { codigo: content.habilidades[0], descricao: "" }
      : null
  );
  const [momentos, setMomentos] = useState<(Momento & { key: number })[]>(() =>
    content.momentos.map((m, i) => ({ ...m, key: i }))
  );
  const nextMomentoKeyRef = useRef(content.momentos.length);
  const [avaliacao, setAvaliacao] = useState(content.avaliacao);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCancelar = useCallback(() => {
    router.back();
  }, [router]);

  const handleOpenSelector = useCallback(() => {
    setIsSelectorOpen(true);
  }, []);

  const handleCloseSelector = useCallback(() => {
    setIsSelectorOpen(false);
  }, []);

  const handleSelectHabilidade = useCallback((selected: BnccHabilidade) => {
    setHabilidade({ codigo: selected.codigo, descricao: selected.descricao });
    setIsSelectorOpen(false);
  }, []);

  const handleTemaChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTema(event.target.value);
    },
    []
  );

  const handleObjectiveChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setObjective(event.target.value);
    },
    []
  );

  const handleAvaliacaoChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setAvaliacao(event.target.value);
    },
    []
  );

  const handleAdicionarMomento = useCallback(() => {
    const key = nextMomentoKeyRef.current;
    nextMomentoKeyRef.current += 1;
    setMomentos((current) => [...current, { descricao: "", key, titulo: "" }]);
  }, []);

  const handleMomentoChange = useCallback(
    (index: number, field: keyof Momento, value: string) => {
      setMomentos((current) =>
        current.map((m, i) => (i === index ? { ...m, [field]: value } : m))
      );
    },
    []
  );

  const handleRemoverMomento = useCallback((index: number) => {
    setMomentos((current) => current.filter((_, i) => i !== index));
  }, []);

  const handleMoveMomento = useCallback((index: number, direction: -1 | 1) => {
    setMomentos((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) {
        return current;
      }
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const handleSalvar = useCallback(async () => {
    setIsSaving(true);
    try {
      const nextHabilidades = habilidade
        ? [habilidade.codigo, ...content.habilidades.slice(1)]
        : content.habilidades;

      await updateAtividadeAction({
        atividadeId: atividade.id,
        content: {
          ...content,
          avaliacao,
          habilidades: nextHabilidades,
          momentos: momentos.map(({ key, ...m }) => m),
          tema,
        },
        objective,
      });
      toast.success("Plano salvo.");
      router.push(`/plano/${atividade.id}`);
    } catch {
      toast.error("Não foi possível salvar o plano.");
    } finally {
      setIsSaving(false);
    }
  }, [
    atividade.id,
    avaliacao,
    content,
    habilidade,
    momentos,
    objective,
    router,
    tema,
  ]);

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
        <button
          onClick={handleCancelar}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-muted)",
            cursor: "pointer",
            fontSize: 14,
            padding: 0,
          }}
          type="button"
        >
          Cancelar
        </button>
        <div
          style={{
            color: "var(--color-text)",
            fontFamily: "var(--font-heading)",
            fontSize: 16,
          }}
        >
          Editar plano
        </div>
        <button
          disabled={isSaving}
          onClick={handleSalvar}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-accent)",
            cursor: "pointer",
            fontFamily: "var(--font-heading)",
            fontSize: 14,
            padding: 0,
          }}
          type="button"
        >
          {isSaving ? "Salvando…" : "Salvar"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: 12,
          overflow: "auto",
          padding: "6px 16px",
        }}
      >
        <div className="field">
          <label htmlFor="titulo-aula">Título da aula</label>
          <input
            className="input"
            id="titulo-aula"
            onChange={handleTemaChange}
            value={tema}
          />
        </div>

        <div className="field">
          <label htmlFor="bncc-field">Habilidade BNCC</label>
          <button
            className="input"
            id="bncc-field"
            onClick={handleOpenSelector}
            style={{
              alignItems: "center",
              color: "var(--color-text)",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
            }}
            type="button"
          >
            <span style={{ alignItems: "center", display: "flex", gap: 7 }}>
              {habilidade ? (
                <span className="tag tag-accent" style={{ padding: "2px 8px" }}>
                  {habilidade.codigo}
                </span>
              ) : (
                <span className="text-muted">Selecionar habilidade…</span>
              )}
            </span>
            <ChevronDownIcon
              color="var(--color-muted)"
              size={16}
              strokeWidth={2.75}
            />
          </button>
          <div
            style={{
              color: "var(--color-muted)",
              fontSize: 10.5,
              marginTop: 5,
            }}
          >
            Selecionada da base oficial — não é digitada.
          </div>
        </div>

        <div className="field">
          <label htmlFor="objetivo">Objetivo</label>
          <textarea
            className="input"
            id="objetivo"
            onChange={handleObjectiveChange}
            style={{ minHeight: 64 }}
            value={objective}
          />
        </div>

        <div className="field">
          <label
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            Momentos da aula
            <button
              onClick={handleAdicionarMomento}
              style={{
                alignItems: "center",
                background: "none",
                border: "none",
                color: "var(--color-accent)",
                cursor: "pointer",
                display: "flex",
                fontSize: 12,
                gap: 3,
              }}
              type="button"
            >
              <PlusIcon size={13} strokeWidth={2.75} />
              Adicionar
            </button>
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {momentos.map((momento, index) => (
              <MomentoRow
                index={index}
                isFirst={index === 0}
                isLast={index === momentos.length - 1}
                key={momento.key}
                momento={momento}
                onChangeField={handleMomentoChange}
                onMove={handleMoveMomento}
                onRemove={handleRemoverMomento}
              />
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="avaliacao">Avaliação</label>
          <textarea
            className="input"
            id="avaliacao"
            onChange={handleAvaliacaoChange}
            style={{ minHeight: 54 }}
            value={avaliacao}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 9, padding: "11px 16px 18px" }}>
        <button
          className="btn btn-secondary"
          onClick={handleCancelar}
          style={{ flex: 1, height: 48 }}
          type="button"
        >
          Cancelar
        </button>
        <button
          className="btn btn-primary"
          disabled={isSaving}
          onClick={handleSalvar}
          style={{ flex: 1, height: 48 }}
          type="button"
        >
          {isSaving ? "Salvando…" : "Salvar plano"}
        </button>
      </div>

      <TabBar />

      {isSelectorOpen ? (
        <BnccSelector
          onClose={handleCloseSelector}
          onSelect={handleSelectHabilidade}
        />
      ) : null}
    </>
  );
}
