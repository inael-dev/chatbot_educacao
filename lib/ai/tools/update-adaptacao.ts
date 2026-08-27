import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import {
  getAtividadeWithAdaptacoes,
  upsertAdaptacaoFromAi,
} from "@/lib/db/queries";
import { planoSchema } from "./save-atividade";

type UpdateAdaptacaoProps = {
  session: Session;
};

export const updateAdaptacao = ({ session }: UpdateAdaptacaoProps) =>
  tool({
    description:
      "Salva uma nova versão do plano adaptado (estilo PEI) de UM aluno específico, para uma atividade da turma que já existe. Use depois de já ter consultado lookupStudent e ter uma versão completa do plano preservando a MESMA habilidade BNCC e o mesmo objetivo pedagógico da atividade original — só o que reduz a barreira de acesso do aluno pode mudar (recursos, apoio visual, forma de resposta, tamanho dos passos). Nunca use esta ferramenta para criar uma atividade nova; ela só atualiza a versão adaptada de um aluno numa atividade existente. Cada chamada substitui a versão anterior desse aluno.",
    execute: async ({ atividadeId, studentId, plano }) => {
      const result = await getAtividadeWithAdaptacoes({ atividadeId });

      if (!result || result.atividade.teacherId !== session.user.id) {
        return { error: "Atividade não encontrada." };
      }

      const saved = await upsertAdaptacaoFromAi({
        atividadeId,
        content: plano,
        studentId,
      });

      return {
        adaptacaoId: saved.id,
        atividadeId,
        studentId,
      };
    },
    inputSchema: z.object({
      atividadeId: z
        .string()
        .describe("id da atividade da turma sendo adaptada"),
      plano: planoSchema,
      studentId: z.string().describe("id do aluno, obtido via lookupStudent"),
    }),
  });
