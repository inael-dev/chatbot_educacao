import { config } from "dotenv";
import { asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  student,
  studentAiMemory,
  studentCondition,
  studentGoal,
  studentInterest,
  studentLearningPreference,
  studentProfile,
  user,
} from "./schema";

config({ path: ".env.local" });

type SeedStudent = {
  name: string;
  preferredName?: string;
  profile: {
    grade: string;
    literacyLevel?: number;
    mathLevel?: number;
    motorCoordinationLevel?: number;
    communicationLevel?: number;
    attentionLevel?: number;
    autonomyLevel?: number;
    generalNotes?: string;
  };
  conditions: { condition: string; level?: string; observation?: string }[];
  interests: string[];
  learningPreferences: {
    strategy: string;
    effectiveness: "low" | "medium" | "high";
  }[];
  goals: {
    bnccCode?: string;
    goal: string;
    status: "not_started" | "in_progress" | "achieved" | "paused";
  }[];
  aiMemorySummary: string;
};

const seedStudents: SeedStudent[] = [
  {
    aiMemorySummary:
      "Maria responde melhor quando usamos objetos concretos. Tem interesse por ursos e animais. Já domina contagem até cinco.",
    conditions: [{ condition: "TEA", level: "leve" }, { condition: "TDAH" }],
    goals: [
      {
        bnccCode: "EI03ET07",
        goal: "Contar de 1 a 10 utilizando objetos concretos",
        status: "in_progress",
      },
    ],
    interests: ["ursos", "animais", "música"],
    learningPreferences: [
      { effectiveness: "high", strategy: "objetos concretos" },
      { effectiveness: "high", strategy: "música" },
      { effectiveness: "medium", strategy: "pintura" },
    ],
    name: "Maria Souza",
    profile: {
      attentionLevel: 2,
      autonomyLevel: 3,
      generalNotes: "Se distrai com facilidade em ambientes barulhentos.",
      grade: "Pré II",
      literacyLevel: 2,
      mathLevel: 2,
    },
  },
  {
    aiMemorySummary:
      "João tem dificuldade motora e não escreve bem, mas entende bem instruções visuais. Interesse forte por dinossauros. Usa cartões numéricos em vez de escrita.",
    conditions: [
      { condition: "TEA" },
      { condition: "dificuldade motora", observation: "não escreve bem" },
    ],
    goals: [
      {
        bnccCode: "EI03ET07",
        goal: "Associar quantidade ao número correspondente usando cartões",
        status: "in_progress",
      },
    ],
    interests: ["dinossauros", "carros"],
    learningPreferences: [
      { effectiveness: "high", strategy: "cartões numéricos" },
      { effectiveness: "high", strategy: "instruções visuais" },
    ],
    name: "João Pereira",
    profile: {
      attentionLevel: 3,
      autonomyLevel: 2,
      generalNotes: "Prefere apontar/circular a escrever.",
      grade: "Pré II",
      literacyLevel: 1,
      mathLevel: 2,
      motorCoordinationLevel: 1,
    },
  },
  {
    aiMemorySummary:
      "Pedro trabalha melhor com atividades com poucos elementos na página. Gosta de carros. Está desenvolvendo autonomia para colar e recortar.",
    conditions: [{ condition: "deficiência intelectual" }],
    goals: [
      {
        bnccCode: "EI03ET07",
        goal: "Contar quantidades pequenas (até 5) com apoio visual reduzido",
        status: "not_started",
      },
    ],
    interests: ["carros", "fazenda"],
    learningPreferences: [
      { effectiveness: "high", strategy: "recorte e colagem" },
      { effectiveness: "medium", strategy: "poucos elementos por página" },
    ],
    name: "Pedro Lima",
    profile: {
      attentionLevel: 3,
      autonomyLevel: 2,
      generalNotes:
        "Atividades com muitos elementos na página o sobrecarregam.",
      grade: "Pré II",
      literacyLevel: 2,
      mathLevel: 1,
    },
  },
  {
    aiMemorySummary:
      "Lucas se agita em atividades longas, mas mantém foco em blocos curtos com pausas. Interesse por Minecraft e construções.",
    conditions: [{ condition: "TDAH", level: "leve" }],
    goals: [
      {
        bnccCode: "EI03ET07",
        goal: "Concluir atividades de contagem em blocos curtos com pausas",
        status: "in_progress",
      },
    ],
    interests: ["Minecraft", "construções", "carros"],
    learningPreferences: [
      { effectiveness: "high", strategy: "atividades em blocos curtos" },
      { effectiveness: "medium", strategy: "jogos" },
    ],
    name: "Lucas Andrade",
    profile: {
      attentionLevel: 2,
      autonomyLevel: 4,
      generalNotes: "Rende mais logo após intervalos.",
      grade: "Pré II",
      literacyLevel: 3,
      mathLevel: 3,
    },
  },
  {
    aiMemorySummary:
      "Ana acompanha a turma sem necessidade de adaptação até o momento. Gosta de histórias e desenho.",
    conditions: [],
    goals: [
      {
        bnccCode: "EI03ET07",
        goal: "Contar de 1 a 10",
        status: "in_progress",
      },
    ],
    interests: ["histórias", "desenho", "princesas"],
    learningPreferences: [{ effectiveness: "high", strategy: "histórias" }],
    name: "Ana Ferreira",
    profile: {
      attentionLevel: 4,
      autonomyLevel: 4,
      grade: "Pré II",
      literacyLevel: 3,
      mathLevel: 3,
    },
  },
];

const runSeed = async () => {
  if (!process.env.POSTGRES_URL) {
    console.log("POSTGRES_URL not defined, skipping seed");
    process.exit(0);
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  const [teacher] = await db
    .select()
    .from(user)
    .orderBy(asc(user.createdAt))
    .limit(1);

  if (!teacher) {
    console.log(
      "No user found in the database. Sign in once, then re-run the seed."
    );
    process.exit(0);
  }

  console.log(
    `Seeding ${seedStudents.length} students for teacher ${teacher.email}...`
  );

  for (const seedStudent of seedStudents) {
    // biome-ignore lint/performance/noAwaitInLoops: seed script, inserts must stay ordered per student for readable output and FK dependencies
    const [createdStudent] = await db
      .insert(student)
      .values({
        name: seedStudent.name,
        preferredName: seedStudent.preferredName,
        teacherId: teacher.id,
      })
      .returning();

    await db.insert(studentProfile).values({
      studentId: createdStudent.id,
      ...seedStudent.profile,
    });

    if (seedStudent.conditions.length > 0) {
      await db.insert(studentCondition).values(
        seedStudent.conditions.map((c) => ({
          studentId: createdStudent.id,
          ...c,
        }))
      );
    }

    if (seedStudent.interests.length > 0) {
      await db.insert(studentInterest).values(
        seedStudent.interests.map((interest) => ({
          interest,
          studentId: createdStudent.id,
        }))
      );
    }

    if (seedStudent.learningPreferences.length > 0) {
      await db.insert(studentLearningPreference).values(
        seedStudent.learningPreferences.map((p) => ({
          studentId: createdStudent.id,
          ...p,
        }))
      );
    }

    if (seedStudent.goals.length > 0) {
      await db.insert(studentGoal).values(
        seedStudent.goals.map((g) => ({
          studentId: createdStudent.id,
          ...g,
        }))
      );
    }

    await db.insert(studentAiMemory).values({
      studentId: createdStudent.id,
      summary: seedStudent.aiMemorySummary,
    });

    console.log(`  - ${createdStudent.name}`);
  }

  console.log("Seed completed.");
  process.exit(0);
};

runSeed().catch((err) => {
  console.error("Seed failed");
  console.error(err);
  process.exit(1);
});
