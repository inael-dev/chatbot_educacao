import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  type AtividadeContent,
  atividade,
  atividadeAdaptada,
  student,
  turma,
  turmaStudent,
  user,
} from "./schema";

config({ path: ".env.local" });

const atividadeContent: AtividadeContent = {
  avaliacao:
    "Observação da participação nas rodas de contagem e registro de quantas crianças conseguem contar até 10 com apoio de objetos concretos.",
  duracao: "50 min",
  habilidades: ["EI03ET07"],
  momentos: [
    {
      descricao:
        "Roda de conversa: contar quantas crianças vieram à escola hoje, uma a uma.",
      titulo: "Acolhida e contagem coletiva",
    },
    {
      descricao:
        "Cada criança recebe potes com tampinhas e conta em duplas, comparando quantidades.",
      titulo: "Contagem com material concreto",
    },
    {
      descricao:
        "Registro no caderno: desenhar a quantidade contada ao lado do número correspondente.",
      titulo: "Registro da contagem",
    },
  ],
  recursos: ["tampinhas coloridas", "potes", "cartões numéricos 1-10"],
  tema: "Contando até 10 com material concreto",
  unidadeTematica: ["Números"],
};

// Vary adaptação status across students so the home screen shows the
// different pill states (pronto / rascunho / adaptar).
const statusByIndex: ("validada" | "rascunho" | "gerando")[] = [
  "validada",
  "rascunho",
  "gerando",
];

const runSeedTurma = async () => {
  if (!process.env.POSTGRES_URL) {
    console.log("POSTGRES_URL not defined, skipping seed");
    process.exit(0);
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  const teachers = await db.select().from(user);

  if (teachers.length === 0) {
    console.log("No user found in the database. Sign in once, then re-run.");
    process.exit(0);
  }

  const existingStudents = await db.select().from(student);

  if (existingStudents.length === 0) {
    console.log("No students found. Run `pnpm db:seed` first.");
    process.exit(0);
  }

  // Session cookies can point at any existing guest user, so seed a turma
  // for every teacher that doesn't have one yet instead of guessing which
  // guest is currently active in the browser.
  for (const teacher of teachers) {
    // biome-ignore lint/performance/noAwaitInLoops: seed script, ordering doesn't matter but keeping it simple
    const existingTurmas = await db
      .select()
      .from(turma)
      .where(eq(turma.teacherId, teacher.id));

    if (existingTurmas.length > 0) {
      console.log(`Skipping ${teacher.email}, already has a turma.`);
      continue;
    }

    const [createdTurma] = await db
      .insert(turma)
      .values({
        grade: "Pré II",
        name: "Pré II - Manhã",
        teacherId: teacher.id,
      })
      .returning();

    await db.insert(turmaStudent).values(
      existingStudents.map((s) => ({
        studentId: s.id,
        turmaId: createdTurma.id,
      }))
    );

    const [createdAtividade] = await db
      .insert(atividade)
      .values({
        content: atividadeContent,
        objective: "Contar de 1 a 10 utilizando objetos concretos",
        teacherId: teacher.id,
        turmaId: createdTurma.id,
      })
      .returning();

    const adaptedVersions = existingStudents.slice(0, 3).map((s, index) => ({
      atividadeId: createdAtividade.id,
      content: atividadeContent,
      status: statusByIndex[index],
      studentId: s.id,
    }));

    await db.insert(atividadeAdaptada).values(adaptedVersions);

    console.log(`Created turma "${createdTurma.name}" for ${teacher.email}.`);
  }

  console.log("Seed completed.");
  process.exit(0);
};

runSeedTurma().catch((err) => {
  console.error("Seed failed");
  console.error(err);
  process.exit(1);
});
