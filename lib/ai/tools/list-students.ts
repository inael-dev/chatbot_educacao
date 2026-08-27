import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { getStudentsByTeacherId } from "@/lib/db/queries";

type ListStudentsProps = {
  session: Session;
};

export const listStudents = ({ session }: ListStudentsProps) =>
  tool({
    description:
      "Lista os alunos do professor atual com um resumo rápido (nome, condições, interesses) — sem precisar que o professor cite nomes. Use no início do planejamento de uma atividade para a turma, pra decidir proativamente quais alunos provavelmente precisam de adaptação. Para o perfil completo de um aluno específico antes de gerar a versão adaptada dele, use lookupStudent.",
    execute: async () => {
      const students = await getStudentsByTeacherId({
        teacherId: session.user.id,
      });

      return {
        students: students.map((s) => ({
          conditions: s.conditions.map((c) => c.condition),
          id: s.id,
          interests: s.interests.map((i) => i.interest),
          name: s.name,
        })),
      };
    },
    inputSchema: z.object({}),
  });
