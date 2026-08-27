const BNCC_API_BASE_URL = "https://bncc.api.br";

export type BnccHabilidade = {
  codigo: string;
  descricao: string;
  unidade_tematica?: string | null;
};

export type BnccEtapa =
  | "educacao_infantil"
  | "ensino_fundamental"
  | "ensino_medio";

export type BnccComponente =
  | "lingua_portuguesa"
  | "arte"
  | "educacao_fisica"
  | "lingua_inglesa"
  | "matematica"
  | "ciencias"
  | "geografia"
  | "historia"
  | "ensino_religioso"
  | "computacao";

function bnccHeaders() {
  return { Authorization: `Bearer ${process.env.BNCC_API_KEY ?? ""}` };
}

// Filtered search used by the plano editor's BNCC selector modal. Mirrors
// lookup-bncc-habilidade.ts's non-codigo branch (kept separate — that file
// wraps its logic in an AI SDK `tool()` not meant to be called directly).
export async function searchBnccHabilidades({
  etapa,
  ano,
  componente,
  campoExperiencia,
}: {
  etapa: BnccEtapa;
  ano?: string;
  componente?: BnccComponente;
  campoExperiencia?: string;
}): Promise<{ habilidades: BnccHabilidade[]; error?: string }> {
  if (!process.env.BNCC_API_KEY) {
    return { error: "BNCC_API_KEY não configurada.", habilidades: [] };
  }

  const params = new URLSearchParams();
  params.set("etapa", etapa);
  if (ano) {
    params.set("ano", ano);
  }
  if (componente) {
    params.set("componente", componente);
  }
  params.set("size", campoExperiencia ? "100" : "20");

  try {
    const response = await fetch(
      `${BNCC_API_BASE_URL}/api/v1/habilidades?${params.toString()}`,
      { headers: bnccHeaders() }
    );

    if (!response.ok) {
      return {
        error: `Erro ao consultar a BNCC API (status ${response.status}).`,
        habilidades: [],
      };
    }

    const data = await response.json();
    const items = data.items as (BnccHabilidade & {
      campo_experiencia?: string | null;
    })[];

    if (!campoExperiencia) {
      return { habilidades: items };
    }

    const needle = campoExperiencia
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
    return {
      habilidades: items.filter((item) =>
        (item.campo_experiencia ?? "")
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .toLowerCase()
          .includes(needle)
      ),
    };
  } catch {
    return {
      error: "Não foi possível consultar a BNCC API agora.",
      habilidades: [],
    };
  }
}

// Direct-by-code lookup used for display (e.g. the plano screen's Habilidade
// BNCC card). The AI-facing tool in lookup-bncc-habilidade.ts covers the
// broader search-by-filters case used during chat generation.
export async function getBnccHabilidadeByCodigo(
  codigo: string
): Promise<BnccHabilidade | null> {
  if (!process.env.BNCC_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `${BNCC_API_BASE_URL}/api/v1/habilidades/${encodeURIComponent(codigo)}`,
      { headers: { Authorization: `Bearer ${process.env.BNCC_API_KEY}` } }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}
