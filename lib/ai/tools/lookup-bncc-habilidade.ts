import { tool } from "ai";
import { z } from "zod";

const BNCC_API_BASE_URL = "https://bncc.api.br";

const etapaEnum = z.enum([
  "educacao_infantil",
  "ensino_fundamental",
  "ensino_medio",
]);

const areaConhecimentoEnum = z.enum([
  "linguagens",
  "matematica",
  "ciencias_natureza",
  "ciencias_humanas",
  "ensino_religioso",
  "computacao",
]);

const componenteCurricularEnum = z.enum([
  "lingua_portuguesa",
  "arte",
  "educacao_fisica",
  "lingua_inglesa",
  "matematica",
  "ciencias",
  "geografia",
  "historia",
  "ensino_religioso",
  "computacao",
]);

function bnccHeaders() {
  return {
    Authorization: `Bearer ${process.env.BNCC_API_KEY ?? ""}`,
  };
}

function normalizeForMatch(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export const lookupBnccHabilidade = tool({
  description:
    "Consulta habilidades oficiais da BNCC (Base Nacional Comum Curricular). Use `codigo` quando já souber o código oficial (ex.: EF05MA07). Caso contrário, filtre por etapa/ano/área/componente para encontrar a habilidade certa antes de citar um código BNCC — nunca invente um código. Para Educação Infantil, `area_conhecimento`/`componente` NÃO filtram por conteúdo (a API sempre retorna 'linguagens'); use `campo_experiencia` em vez disso (ex.: 'quantidades', 'corpo', 'escuta e fala').",
  execute: async ({
    codigo,
    etapa,
    ano,
    area_conhecimento,
    componente,
    campo_experiencia,
  }) => {
    if (!process.env.BNCC_API_KEY) {
      return {
        error:
          "BNCC_API_KEY não configurada. Peça para o desenvolvedor configurar a variável de ambiente.",
      };
    }

    try {
      if (codigo) {
        const response = await fetch(
          `${BNCC_API_BASE_URL}/api/v1/habilidades/${encodeURIComponent(codigo)}`,
          { headers: bnccHeaders() }
        );

        if (response.status === 404) {
          return {
            error: `Nenhuma habilidade encontrada com o código "${codigo}".`,
          };
        }
        if (response.status === 401) {
          return { error: "Chave da BNCC API inválida ou revogada." };
        }
        if (response.status === 429) {
          return {
            error:
              "Limite de requisições da BNCC API excedido. Tente novamente em instantes.",
          };
        }
        if (!response.ok) {
          return {
            error: `Erro ao consultar a BNCC API (status ${response.status}).`,
          };
        }

        return await response.json();
      }

      const params = new URLSearchParams();
      if (etapa) {
        params.set("etapa", etapa);
      }
      if (ano) {
        params.set("ano", ano);
      }
      if (area_conhecimento) {
        params.set("area_conhecimento", area_conhecimento);
      }
      if (componente) {
        params.set("componente", componente);
      }
      params.set("size", campo_experiencia ? "100" : "10");

      const response = await fetch(
        `${BNCC_API_BASE_URL}/api/v1/habilidades?${params.toString()}`,
        { headers: bnccHeaders() }
      );

      if (response.status === 401) {
        return { error: "Chave da BNCC API inválida ou revogada." };
      }
      if (response.status === 429) {
        return {
          error:
            "Limite de requisições da BNCC API excedido. Tente novamente em instantes.",
        };
      }
      if (!response.ok) {
        return {
          error: `Erro ao consultar a BNCC API (status ${response.status}).`,
        };
      }

      const data = await response.json();
      const items = data.items as { campo_experiencia?: string | null }[];

      if (!campo_experiencia) {
        return { habilidades: items, total: data.total };
      }

      const needle = normalizeForMatch(campo_experiencia);
      const filtered = items.filter((item) =>
        normalizeForMatch(item.campo_experiencia ?? "").includes(needle)
      );

      return {
        habilidades: filtered,
        note: `Filtrado por campo_experiencia contendo "${campo_experiencia}" entre ${items.length} de ${data.total} habilidades retornadas pela etapa/ano informados.`,
        total: filtered.length,
      };
    } catch {
      return { error: "Não foi possível consultar a BNCC API agora." };
    }
  },
  inputSchema: z.object({
    ano: z
      .string()
      .describe(
        "Ensino Fundamental/Médio: ano escolar, ex.: '5'. Educação Infantil: faixa etária oficial '01', '02' ou '03' (não é série) — na dúvida, para EI é mais seguro omitir e usar campo_experiencia."
      )
      .optional(),
    area_conhecimento: areaConhecimentoEnum
      .describe(
        "Área de conhecimento (usado com etapa/ano/componente). Não filtra por conteúdo na Educação Infantil — use campo_experiencia."
      )
      .optional(),
    campo_experiencia: z
      .string()
      .describe(
        "Campo de experiência da Educação Infantil, busca livre (ex.: 'quantidades', 'corpo', 'escuta e fala'). Use etapa='educacao_infantil' junto. Necessário porque area_conhecimento/componente não distinguem conteúdo nessa etapa."
      )
      .optional(),
    codigo: z
      .string()
      .describe(
        "Código oficial da habilidade, ex.: EF05MA07. Se informado, os outros filtros são ignorados."
      )
      .optional(),
    componente: componenteCurricularEnum
      .describe("Componente curricular (usado com etapa/ano/área)")
      .optional(),
    etapa: etapaEnum
      .describe("Etapa de ensino (usado com ano/área/componente)")
      .optional(),
  }),
});
