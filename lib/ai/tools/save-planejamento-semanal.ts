import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import {
  createAtividade,
  createAtividadesAdaptadas,
  createPlanejamentoSemanal,
  resolveActiveTurma,
} from "@/lib/db/queries";
import { planoSchema } from "./save-atividade";

type SavePlanejamentoSemanalProps = {
  session: Session;
  chatId: string;
};

const diaSchema = z.object({
  adaptacoes: z
    .array(
      z.object({
        plano: planoSchema,
        studentId: z.string().describe("id do aluno, obtido via lookupStudent"),
        studentName: z.string(),
      })
    )
    .describe(
      "Adaptações por aluno já definidas na conversa para ESTE dia específico. Pode ser vazio — nesse caso o professor adapta depois, individualmente, na tela do plano (/plano/:id, botão 'Adaptar por aluno')."
    ),
  diaAplicacao: z
    .string()
    .describe(
      "Dia da semana ou data desse plano, ex: 'Segunda-feira' ou '22/09'"
    ),
  objetivo: z.string().describe("Objetivo pedagógico desse dia específico"),
  plano: planoSchema,
});

export const savePlanejamentoSemanal = ({
  session,
  chatId,
}: SavePlanejamentoSemanalProps) =>
  tool({
    description:
      "Salva no sistema o planejamento semanal da turma: cria uma atividade por dia informado pelo professor. Use quando o professor descrever ou anexar o planejamento de VÁRIOS dias de uma vez (ex: já traz o plano da semana inteira pronto, dia a dia) — para uma única aula, use `saveAtividade`, não esta. Adaptação por aluno em cada dia é OPCIONAL nesta chamada: inclua em `dias[].adaptacoes` só se o professor já indicou quais alunos adaptar para aquele dia específico na própria conversa; caso contrário deixe vazio e ele adapta depois, dia a dia, na revisão.",
    execute: async ({
      turmaNome,
      turmaAno,
      objetivoGeral,
      sourceFileUrl,
      dias,
    }) => {
      const activeTurma = await resolveActiveTurma({
        teacherId: session.user.id,
        turmaAno,
        turmaNome,
      });

      const createdPlanejamento = await createPlanejamentoSemanal({
        objetivoGeral,
        sourceChatId: chatId,
        teacherId: session.user.id,
        turmaId: activeTurma.id,
      });

      const createdDias = [];
      // biome-ignore lint/performance/noAwaitInLoops: sequential inserts, one atividade per day of the week the professor described
      for (const dia of dias) {
        const createdAtividade = await createAtividade({
          content: dia.plano,
          diaAplicacao: dia.diaAplicacao,
          objective: dia.objetivo,
          planejamentoSemanalId: createdPlanejamento.id,
          sourceChatId: chatId,
          sourceFileUrl,
          teacherId: session.user.id,
          turmaId: activeTurma.id,
        });

        // biome-ignore lint/performance/noAwaitInLoops: same sequential-inserts reasoning as above
        const createdAdaptacoes = await createAtividadesAdaptadas({
          atividadeId: createdAtividade.id,
          versions: dia.adaptacoes.map((a) => ({
            content: a.plano,
            studentId: a.studentId,
          })),
        });

        createdDias.push({
          atividadeId: createdAtividade.id,
          diaAplicacao: dia.diaAplicacao,
          studentsAdapted: dia.adaptacoes.map((a) => a.studentName),
          totalAdaptacoes: createdAdaptacoes.length,
        });
      }

      return {
        dias: createdDias,
        planejamentoSemanalId: createdPlanejamento.id,
        turmaId: activeTurma.id,
        turmaNome: activeTurma.name,
      };
    },
    inputSchema: z.object({
      dias: z
        .array(diaSchema)
        .describe("Uma entrada por dia de aula planejado na semana."),
      objetivoGeral: z
        .string()
        .optional()
        .describe(
          "Objetivo/tema geral da semana, se o professor mencionar um fio condutor comum a todos os dias. Opcional — nem toda semana tem um."
        ),
      sourceFileUrl: z
        .string()
        .optional()
        .describe(
          "URL do arquivo anexado pelo professor, se o planejamento semanal veio de um upload"
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
