import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  email: varchar("email", { length: 64 }).notNull(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  image: text("image"),
  isAnonymous: boolean("isAnonymous").notNull().default(false),
  name: text("name"),
  password: varchar("password", { length: 64 }),
  // Printed on the atividade header (PLANEJAMENTO.md §4.5). No settings UI
  // yet to set this — set directly in the DB until a profile screen exists.
  schoolName: text("schoolName"),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  createdAt: timestamp("createdAt").notNull(),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable("Message_v2", {
  attachments: json("attachments").notNull(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  createdAt: timestamp("createdAt").notNull(),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  parts: json("parts").notNull(),
  role: varchar("role").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

export const vote = pgTable(
  "Vote_v2",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    isUpvoted: boolean("isUpvoted").notNull(),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chatId, table.messageId] }),
  })
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  "Document",
  {
    content: text("content"),
    createdAt: timestamp("createdAt").notNull(),
    id: uuid("id").notNull().defaultRandom(),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    title: text("title").notNull(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id, table.createdAt] }),
  })
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "Suggestion",
  {
    createdAt: timestamp("createdAt").notNull(),
    description: text("description"),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    documentId: uuid("documentId").notNull(),
    id: uuid("id").notNull().defaultRandom(),
    isResolved: boolean("isResolved").notNull().default(false),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
    pk: primaryKey({ columns: [table.id] }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  "Stream",
  {
    chatId: uuid("chatId").notNull(),
    createdAt: timestamp("createdAt").notNull(),
    id: uuid("id").notNull().defaultRandom(),
  },
  (table) => ({
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
    pk: primaryKey({ columns: [table.id] }),
  })
);

export type Stream = InferSelectModel<typeof stream>;

// Student domain. There's no separate "teacher" entity yet — a teacher is just a
// `user`. `teacherId` below points at `user.id` as a stand-in until a dedicated
// teacher/school/classroom model exists.

export const student = pgTable("Student", {
  birthDate: timestamp("birthDate"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  enrollmentNumber: varchar("enrollmentNumber", { length: 64 }),
  gender: varchar("gender", { length: 32 }),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  photoUrl: text("photoUrl"),
  preferredName: text("preferredName"),
  status: varchar("status", { enum: ["active", "inactive"] })
    .notNull()
    .default("active"),
  teacherId: uuid("teacherId")
    .notNull()
    .references(() => user.id),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Student = InferSelectModel<typeof student>;

// One-to-one pedagogical snapshot. Levels are a simple 1-5 scale set by the
// teacher/pedagogical team, not derived automatically (yet).
export const studentProfile = pgTable("StudentProfile", {
  attentionLevel: integer("attentionLevel"),
  autonomyLevel: integer("autonomyLevel"),
  communicationLevel: integer("communicationLevel"),
  generalNotes: text("generalNotes"),
  grade: varchar("grade", { length: 32 }),
  literacyLevel: integer("literacyLevel"),
  mathLevel: integer("mathLevel"),
  motorCoordinationLevel: integer("motorCoordinationLevel"),
  studentId: uuid("studentId")
    .primaryKey()
    .notNull()
    .references(() => student.id),
});

export type StudentProfile = InferSelectModel<typeof studentProfile>;

// Multiple conditions per student (e.g. TEA + TDAH) instead of fixed columns.
export const studentCondition = pgTable("StudentCondition", {
  condition: varchar("condition", { length: 128 }).notNull(),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  level: varchar("level", { length: 32 }),
  observation: text("observation"),
  studentId: uuid("studentId")
    .notNull()
    .references(() => student.id),
});

export type StudentCondition = InferSelectModel<typeof studentCondition>;

export const studentInterest = pgTable("StudentInterest", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  interest: varchar("interest", { length: 128 }).notNull(),
  studentId: uuid("studentId")
    .notNull()
    .references(() => student.id),
});

export type StudentInterest = InferSelectModel<typeof studentInterest>;

export const studentLearningPreference = pgTable("StudentLearningPreference", {
  effectiveness: varchar("effectiveness", {
    enum: ["low", "medium", "high"],
  }).notNull(),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  strategy: varchar("strategy", { length: 128 }).notNull(),
  studentId: uuid("studentId")
    .notNull()
    .references(() => student.id),
});

export type StudentLearningPreference = InferSelectModel<
  typeof studentLearningPreference
>;

export const studentSensitivity = pgTable("StudentSensitivity", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  severity: varchar("severity", { enum: ["low", "medium", "high"] }),
  studentId: uuid("studentId")
    .notNull()
    .references(() => student.id),
  type: varchar("type", { length: 128 }).notNull(),
});

export type StudentSensitivity = InferSelectModel<typeof studentSensitivity>;

export const studentGoal = pgTable("StudentGoal", {
  bnccCode: varchar("bnccCode", { length: 32 }),
  difficulty: varchar("difficulty", { enum: ["easy", "medium", "hard"] }),
  endDate: timestamp("endDate"),
  goal: text("goal").notNull(),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  startDate: timestamp("startDate"),
  status: varchar("status", {
    enum: ["not_started", "in_progress", "achieved", "paused"],
  })
    .notNull()
    .default("not_started"),
  studentId: uuid("studentId")
    .notNull()
    .references(() => student.id),
});

export type StudentGoal = InferSelectModel<typeof studentGoal>;

// `origem`/`tipo` and the optional `atividadeId` link back to the design
// handoff's recommended history model (PLANEJAMENTO.md / tela 8): entries
// either come from a post-atividade feedback prompt ("feedback", linked to
// the atividade that prompted it) or a standalone note the teacher adds
// ("avulso"). `tipo` drives the timeline dot color (positivo/barreira/neutro).
export const studentObservation = pgTable("StudentObservation", {
  atividadeId: uuid("atividadeId").references(() => atividade.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  observation: text("observation").notNull(),
  origem: varchar("origem", { enum: ["feedback", "avulso"] })
    .notNull()
    .default("avulso"),
  studentId: uuid("studentId")
    .notNull()
    .references(() => student.id),
  teacherId: uuid("teacherId")
    .notNull()
    .references(() => user.id),
  tipo: varchar("tipo", { enum: ["positivo", "barreira", "neutro"] })
    .notNull()
    .default("neutro"),
});

export type StudentObservation = InferSelectModel<typeof studentObservation>;

// Regente <-> AEE collaboration thread (PLANEJAMENTO.md / tela 8's stated
// market differentiator). `autor` is free text rather than a user FK because
// the AEE professional isn't necessarily a user of this app yet — there's no
// role system, so `papel` is set by whoever is posting the note.
export const studentAeeNote = pgTable("StudentAeeNote", {
  autor: text("autor").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  papel: varchar("papel", { enum: ["aee", "regente"] }).notNull(),
  studentId: uuid("studentId")
    .notNull()
    .references(() => student.id),
  texto: text("texto").notNull(),
});

export type StudentAeeNote = InferSelectModel<typeof studentAeeNote>;

// Rolling AI-generated summary of a student, kept short so it can be sent as
// context on every AI call instead of the full observation/goal history.
export const studentAiMemory = pgTable("StudentAiMemory", {
  studentId: uuid("studentId")
    .primaryKey()
    .notNull()
    .references(() => student.id),
  summary: text("summary").notNull(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type StudentAiMemory = InferSelectModel<typeof studentAiMemory>;

// Turma domain (see PLANEJAMENTO.md, seção 4.3/4.4). Membership is a separate
// join table rather than reusing `student.teacherId` directly, since a teacher
// can have more than one turma and a student can move between turmas.

export const turma = pgTable("Turma", {
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  grade: varchar("grade", { length: 32 }),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  teacherId: uuid("teacherId")
    .notNull()
    .references(() => user.id),
});

export type Turma = InferSelectModel<typeof turma>;

export const turmaStudent = pgTable(
  "TurmaStudent",
  {
    studentId: uuid("studentId")
      .notNull()
      .references(() => student.id),
    turmaId: uuid("turmaId")
      .notNull()
      .references(() => turma.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.turmaId, table.studentId] }),
  })
);

export type TurmaStudent = InferSelectModel<typeof turmaStudent>;

// Structured lesson-plan body, shared by `atividade.content` and
// `atividadeAdaptada.content` so the review screen can diff them
// momento-by-momento instead of comparing opaque text blobs. Modeled on the
// real municipal plan template researched 2026-08 (PLANEJAMENTO.md seção 3.2):
// tema, duração, recursos, unidades temáticas, múltiplas habilidades BNCC,
// metodologia em momentos, avaliação.
export type AtividadeContent = {
  tema: string;
  duracao?: string;
  recursos: string[];
  unidadeTematica: string[];
  habilidades: string[];
  momentos: { titulo: string; descricao: string }[];
  avaliacao: string;
};

// Base activity generated for a turma. `sourceChatId` points at the turma-first
// chat conversation that produced it; `sourceFileUrl` points at an uploaded
// plan (e.g. photo of an existing printed plan) when the atividade started
// from an upload instead of a chat description — kept as its own column so
// the source document survives even if the originating chat is deleted later
// (coordenação precisa revisar/validar o documento original).
export const atividade = pgTable("Atividade", {
  content: json("content").notNull().$type<AtividadeContent>(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  objective: text("objective").notNull(),
  sourceChatId: uuid("sourceChatId").references(() => chat.id),
  sourceFileUrl: text("sourceFileUrl"),
  status: varchar("status", { enum: ["draft", "finalizada"] })
    .notNull()
    .default("draft"),
  teacherId: uuid("teacherId")
    .notNull()
    .references(() => user.id),
  turmaId: uuid("turmaId")
    .notNull()
    .references(() => turma.id),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Atividade = InferSelectModel<typeof atividade>;

// Per-student version derived from an `atividade`. This — not the chat log —
// is what the review screen (PLANEJAMENTO.md seção 4.4) reads from and edits.
// Same AtividadeContent shape as the base atividade (a complete, standalone
// plan, not a diff) so it can be rendered/printed/exported on its own; the
// review screen computes the momento-by-momento diff against the base at
// render time instead of storing one.
export const atividadeAdaptada = pgTable("AtividadeAdaptada", {
  atividadeId: uuid("atividadeId")
    .notNull()
    .references(() => atividade.id),
  content: json("content").notNull().$type<AtividadeContent>(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  editedByTeacher: boolean("editedByTeacher").notNull().default(false),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  status: varchar("status", { enum: ["gerando", "rascunho", "validada"] })
    .notNull()
    .default("gerando"),
  studentId: uuid("studentId")
    .notNull()
    .references(() => student.id),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type AtividadeAdaptada = InferSelectModel<typeof atividadeAdaptada>;
