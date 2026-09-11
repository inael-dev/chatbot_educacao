import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import {
  createAtividade,
  createAtividadesAdaptadas,
  resolveActiveTurma,
} from "@/lib/db/queries";

type SaveAtividadeProps = {
  session: Session;
  chatId: string;
};

export const planoSchema = z.object({
  avaliacao: z.string().describe("Como a aprendizagem será observada/avaliada"),
  duracao: z.string().optional().describe("Duração da aula, ex: '50 minutos'"),
  habilidades: z
    .array(z.string())
    .describe(
      "Códigos oficiais da BNCC (ex: EF05MA07), confirmados via lookupBnccHabilidade — nunca inventados."
    ),
  momentos: z
    .array(z.object({ descricao: z.string(), titulo: z.string() }))
    .describe(
      "Metodologia da aula dividida em momentos sequenciais (ex: '1º momento', '2º momento')."
    ),
  recursos: z.array(z.string()).describe("Materiais/recursos necessários"),
  tema: z.string().describe("Tema da aula"),
  unidadeTematica: z
    .array(z.string())
    .describe("Unidade(s) temática(s) trabalhada(s)"),
});

export const saveAtividade = ({ session, chatId }: SaveAtividadeProps) =>
  tool({
    description:
      "Salva no sistema a atividade planejada para a turma e as versões adaptadas para os alunos sinalizados, como rascunho para revisão posterior. Use só depois de já ter: (1) o plano completo definido — tema, objetivo, recursos, habilidades BNCC confirmadas via lookupBnccHabilidade, metodologia em momentos, avaliação — (o plano vai nos campos desta tool, não escrito no chat); (2) para cada aluno que vai receber adaptação, já ter consultado lookupStudent e gerado uma versão completa do plano preservando o mesmo objetivo pedagógico. Nunca invente studentId — use sempre o id retornado por lookupStudent.",
    execute: async ({
      turmaNome,
      turmaAno,
      objetivo,
      plano,
      sourceFileUrl,
      adaptacoes,
    }) => {
      const activeTurma = await resolveActiveTurma({
        teacherId: session.user.id,
        turmaAno,
        turmaNome,
      });

      const createdAtividade = await createAtividade({
        content: plano,
        objective: objetivo,
        sourceChatId: chatId,
        sourceFileUrl,
        teacherId: session.user.id,
        turmaId: activeTurma.id,
      });

      const createdAdaptacoes = await createAtividadesAdaptadas({
        atividadeId: createdAtividade.id,
        versions: adaptacoes.map((a) => ({
          content: a.plano,
          studentId: a.studentId,
        })),
      });

      return {
        atividadeId: createdAtividade.id,
        studentsAdapted: adaptacoes.map((a) => a.studentName),
        totalAdaptacoes: createdAdaptacoes.length,
        turmaId: activeTurma.id,
        turmaNome: activeTurma.name,
      };
    },
    inputSchema: z.object({
      adaptacoes: z
        .array(
          z.object({
            plano: planoSchema,
            studentId: z
              .string()
              .describe("id do aluno, obtido via lookupStudent"),
            studentName: z.string(),
          })
        )
        .describe(
          "Uma entrada por aluno sinalizado para adaptação. Pode ser vazio se nenhum aluno precisar de adaptação."
        ),
      objetivo: z.string().describe("Objetivo pedagógico da aula"),
      plano: planoSchema,
      sourceFileUrl: z
        .string()
        .optional()
        .describe(
          "URL do arquivo anexado pelo professor, se a atividade veio de um upload de plano existente"
        ),
      turmaAno: z
        .string()
        .optional()
        .describe(
          "Ano/série da turma, se dedutível do que o professor disse (ex: '5º ano'). Só é usado quando a turma ainda não existe."
        ),
      turmaNome: z
        .string()
        .optional()
        .describe(
          "Nome da turma, deduzido do que o professor disse (ex: '5º ano B'). Só é usado quando a turma ainda não existe; depois disso a turma ativa do professor é usada e este campo é ignorado."
        ),
    }),
  });
