"use client";

import { useCallback, useState } from "react";
import { searchBnccHabilidadesAction } from "@/app/plano/[id]/editar/actions";
import type { BnccComponente, BnccEtapa, BnccHabilidade } from "@/lib/ai/bncc";

const ETAPA_OPTIONS: { value: BnccEtapa; label: string }[] = [
  { label: "Educação Infantil", value: "educacao_infantil" },
  { label: "Ensino Fundamental", value: "ensino_fundamental" },
  { label: "Ensino Médio", value: "ensino_medio" },
];

const COMPONENTE_OPTIONS: { value: BnccComponente; label: string }[] = [
  { label: "Língua Portuguesa", value: "lingua_portuguesa" },
  { label: "Arte", value: "arte" },
  { label: "Educação Física", value: "educacao_fisica" },
  { label: "Língua Inglesa", value: "lingua_inglesa" },
  { label: "Matemática", value: "matematica" },
  { label: "Ciências", value: "ciencias" },
  { label: "Geografia", value: "geografia" },
  { label: "História", value: "historia" },
  { label: "Ensino Religioso", value: "ensino_religioso" },
  { label: "Computação", value: "computacao" },
];

export function BnccSelector({
  onSelect,
  onClose,
}: {
  onSelect: (habilidade: BnccHabilidade) => void;
  onClose: () => void;
}) {
  const [etapa, setEtapa] = useState<BnccEtapa>("ensino_fundamental");
  const [ano, setAno] = useState("");
  const [componente, setComponente] = useState<BnccComponente | "">("");
  const [campoExperiencia, setCampoExperiencia] = useState("");
  const [results, setResults] = useState<BnccHabilidade[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    setError(null);
    const { habilidades, error: searchError } =
      await searchBnccHabilidadesAction({
        ano: ano || undefined,
        campoExperiencia: campoExperiencia || undefined,
        componente: componente || undefined,
        etapa,
      });
    setIsSearching(false);
    setResults(habilidades);
    if (searchError) {
      setError(searchError);
    }
  }, [ano, campoExperiencia, componente, etapa]);

  const handleEtapaChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setEtapa(event.target.value as BnccEtapa);
    },
    []
  );

  const handleAnoChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAno(event.target.value);
    },
    []
  );

  const handleComponenteChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setComponente(event.target.value as BnccComponente | "");
    },
    []
  );

  const handleCampoExperienciaChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCampoExperiencia(event.target.value);
    },
    []
  );

  const handleResultClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { codigo } = event.currentTarget.dataset;
      const selected = results?.find((h) => h.codigo === codigo);
      if (selected) {
        onSelect(selected);
      }
    },
    [results, onSelect]
  );

  const isEducacaoInfantil = etapa === "educacao_infantil";

  return (
    <div className="dialog-backdrop">
      <div className="dialog" style={{ maxHeight: "85vh", overflow: "auto" }}>
        <div className="dialog-title">Selecionar habilidade BNCC</div>
        <div className="dialog-body">
          Nunca digitada — busque na base oficial e escolha um código.
        </div>

        <div className="field">
          <label htmlFor="bncc-etapa">Etapa</label>
          <select
            className="input"
            id="bncc-etapa"
            onChange={handleEtapaChange}
            value={etapa}
          >
            {ETAPA_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="bncc-ano">
              {isEducacaoInfantil ? "Faixa etária (01/02/03)" : "Ano"}
            </label>
            <input
              className="input"
              id="bncc-ano"
              onChange={handleAnoChange}
              placeholder={isEducacaoInfantil ? "02" : "ex: 3"}
              value={ano}
            />
          </div>
          {!isEducacaoInfantil && (
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="bncc-componente">Componente</label>
              <select
                className="input"
                id="bncc-componente"
                onChange={handleComponenteChange}
                value={componente}
              >
                <option value="">Qualquer</option>
                {COMPONENTE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {isEducacaoInfantil && (
          <div className="field">
            <label htmlFor="bncc-campo">Campo de experiência</label>
            <input
              className="input"
              id="bncc-campo"
              onChange={handleCampoExperienciaChange}
              placeholder="ex: quantidades, corpo, escuta e fala"
              value={campoExperiencia}
            />
          </div>
        )}

        <button
          className="btn btn-primary btn-block"
          disabled={isSearching}
          onClick={handleSearch}
          type="button"
        >
          {isSearching ? "Buscando…" : "Buscar"}
        </button>

        {error ? (
          <p style={{ color: "var(--color-danger)", fontSize: 12.5 }}>
            {error}
          </p>
        ) : null}

        {results && results.length === 0 && !error && (
          <p className="text-muted" style={{ fontSize: 12.5 }}>
            Nenhuma habilidade encontrada com esses filtros.
          </p>
        )}

        {results && results.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {results.map((habilidade) => (
              <button
                className="card elev-sm"
                data-codigo={habilidade.codigo}
                key={habilidade.codigo}
                onClick={handleResultClick}
                style={{
                  alignItems: "flex-start",
                  cursor: "pointer",
                  gap: 4,
                  padding: 10,
                  textAlign: "left",
                }}
                type="button"
              >
                <span className="tag tag-accent">{habilidade.codigo}</span>
                <span style={{ fontSize: 12, lineHeight: 1.4 }}>
                  {habilidade.descricao}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onClose} type="button">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
