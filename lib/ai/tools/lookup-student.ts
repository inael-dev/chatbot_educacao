import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import {
  getStudentFullContext,
  getStudentsByTeacherId,
} from "@/lib/db/queries";

type LookupStudentProps = {
  session: Session;
};

export const lookupStudent = ({ session }: LookupStudentProps) =>
  tool({
    description:
      "Busca o perfil pedagógico de um aluno do professor atual pelo nome: condições, interesses, estratégias que funcionam, sensibilidades, objetivos atuais e o resumo do aluno. Use antes de adaptar qualquer atividade para um aluno específico — nunca invente características do aluno.",
    execute: async ({ nome }) => {
      const students = await getStudentsByTeacherId({
        teacherId: session.user.id,
      });

      const query = nome.trim().toLowerCase();
      const matches = students.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.preferredName?.toLowerCase().includes(query)
      );

      if (matches.length === 0) {
        return {
          error: `Nenhum aluno encontrado com o nome "${nome}". Confirme o nome com o professor antes de prosseguir.`,
        };
      }

      if (matches.length > 1) {
        return {
          matches: matches.map((s) => ({ id: s.id, name: s.name })),
          message:
            "Mais de um aluno encontrado com esse nome. Peça ao professor para especificar.",
        };
      }

      const [matchedStudent] = matches;
      const context = await getStudentFullContext({
        studentId: matchedStudent.id,
      });

      return {
        conditions: matchedStudent.conditions.map((c) => ({
          condition: c.condition,
          level: c.level,
          observation: c.observation,
        })),
        id: matchedStudent.id,
        interests: matchedStudent.interests.map((i) => i.interest),
        name: matchedStudent.name,
        ...context,
      };
    },
    inputSchema: z.object({
      nome: z.string().describe("Nome ou apelido do aluno"),
    }),
  });
