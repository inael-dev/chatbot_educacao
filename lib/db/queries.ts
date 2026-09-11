import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { ArtifactKind } from "@/components/chat/artifact";
import type { VisibilityType } from "@/components/chat/visibility-selector";
import { ChatbotError } from "../errors";
import {
  type Atividade,
  type AtividadeAdaptada,
  type AtividadeContent,
  atividade,
  atividadeAdaptada,
  type Chat,
  chat,
  type DBMessage,
  document,
  message,
  type PlanejamentoSemanal,
  planejamentoSemanal,
  type Student,
  type StudentAeeNote,
  type StudentCondition,
  type StudentGoal,
  type StudentInterest,
  type StudentLearningPreference,
  type StudentObservation,
  type Suggestion,
  stream,
  student,
  studentAeeNote,
  studentAiMemory,
  studentCondition,
  studentGoal,
  studentInterest,
  studentLearningPreference,
  studentObservation,
  studentProfile,
  studentSensitivity,
  suggestion,
  type Turma,
  turma,
  turmaStudent,
  type User,
  user,
  vote,
} from "./schema";

const client = postgres(process.env.POSTGRES_URL ?? "");
const db = drizzle(client);

// Sole login path: a teacher's CPF doubles as their identifier. First CPF
// seen creates the account; every login after that resumes it — no password,
// no "reset" from a lost guest cookie.
export async function getOrCreateUserByCpf(cpf: string): Promise<User> {
  try {
    const [existing] = await db.select().from(user).where(eq(user.cpf, cpf));
    if (existing) {
      return existing;
    }

    const [created] = await db
      .insert(user)
      .values({ cpf })
      .onConflictDoNothing({ target: user.cpf })
      .returning();
    if (created) {
      return created;
    }

    // Lost a race against a concurrent first login with the same CPF.
    const [racedIn] = await db.select().from(user).where(eq(user.cpf, cpf));
    return racedIn;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      createdAt: new Date(),
      id,
      title,
      userId,
      visibility,
    });
  } catch (error) {
    throw new ChatbotError("bad_request:database", {
      cause: error,
    });
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    const userChats = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, userId));

    if (userChats.length === 0) {
      return { deletedCount: 0 };
    }

    const chatIds = userChats.map((c) => c.id);

    await db.delete(vote).where(inArray(vote.chatId, chatIds));
    await db.delete(message).where(inArray(message.chatId, chatIds));
    await db.delete(stream).where(inArray(stream.chatId, chatIds));

    const deletedChats = await db
      .delete(chat)
      .where(eq(chat.userId, userId))
      .returning();

    return { deletedCount: deletedChats.length };
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<unknown>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id)
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Chat[] = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatbotError(
          "not_found:database",
          `Chat with id ${startingAfter} not found`
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatbotError(
          "not_found:database",
          `Chat with id ${endingBefore} not found`
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    if (!selectedChat) {
      return null;
    }

    return selectedChat;
  } catch (error) {
    throw new ChatbotError("bad_request:database", {
      cause: error,
    });
  }
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    throw new ChatbotError("bad_request:database", {
      cause: error,
    });
  }
}

export async function updateMessage({
  id,
  parts,
}: {
  id: string;
  parts: DBMessage["parts"];
}) {
  try {
    return await db.update(message).set({ parts }).where(eq(message.id, id));
  } catch (error) {
    throw new ChatbotError("bad_request:database", {
      cause: error,
    });
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === "up" })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      isUpvoted: type === "up",
      messageId,
    });
  } catch (error) {
    throw new ChatbotError("bad_request:database", {
      cause: error,
    });
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        content,
        createdAt: new Date(),
        id,
        kind,
        title,
        userId,
      })
      .returning();
  } catch (error) {
    throw new ChatbotError("bad_request:database", {
      cause: error,
    });
  }
}

export async function updateDocumentContent({
  id,
  content,
}: {
  id: string;
  content: string;
}) {
  try {
    const docs = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt))
      .limit(1);

    const [latest] = docs;
    if (!latest) {
      throw new ChatbotError("not_found:database", "Document not found");
    }

    return await db
      .update(document)
      .set({ content })
      .where(and(eq(document.id, id), eq(document.createdAt, latest.createdAt)))
      .returning();
  } catch (error) {
    if (error instanceof ChatbotError) {
      throw error;
    }
    throw new ChatbotError("bad_request:database", {
      cause: error,
    });
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp)
        )
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(eq(suggestion.documentId, documentId));
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
      );

    const messageIds = messagesToDelete.map(
      (currentMessage) => currentMessage.id
    );

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds))
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds))
        );
    }
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function updateChatTitleById({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) {
  try {
    return await db.update(chat).set({ title }).where(eq(chat.id, chatId));
  } catch {
    // Best effort title update.
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const cutoffTime = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, cutoffTime),
          eq(message.role, "user")
        )
      )
      .execute();

    return stats?.count ?? 0;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ chatId, createdAt: new Date(), id: streamId });
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export type StudentWithDetails = Student & {
  conditions: StudentCondition[];
  interests: StudentInterest[];
};

export async function getStudentsByTeacherId({
  teacherId,
}: {
  teacherId: string;
}): Promise<StudentWithDetails[]> {
  try {
    const students = await db
      .select()
      .from(student)
      .where(eq(student.teacherId, teacherId))
      .orderBy(asc(student.name));

    if (students.length === 0) {
      return [];
    }

    const studentIds = students.map((s) => s.id);

    const [conditions, interests] = await Promise.all([
      db
        .select()
        .from(studentCondition)
        .where(inArray(studentCondition.studentId, studentIds)),
      db
        .select()
        .from(studentInterest)
        .where(inArray(studentInterest.studentId, studentIds)),
    ]);

    return students.map((s) => ({
      ...s,
      conditions: conditions.filter((c) => c.studentId === s.id),
      interests: interests.filter((i) => i.studentId === s.id),
    }));
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

// Manual student registration (there is no other production path to create
// a `student` row — the AI tools only ever look up existing students).
export async function createStudentWithDetails({
  teacherId,
  name,
  preferredName,
  conditions,
  interests,
}: {
  teacherId: string;
  name: string;
  preferredName?: string;
  conditions: string[];
  interests: string[];
}): Promise<Student> {
  try {
    const [created] = await db
      .insert(student)
      .values({ name, preferredName, teacherId })
      .returning();

    await Promise.all([
      conditions.length > 0
        ? db.insert(studentCondition).values(
            conditions.map((condition) => ({
              condition,
              studentId: created.id,
            }))
          )
        : Promise.resolve(),
      interests.length > 0
        ? db.insert(studentInterest).values(
            interests.map((interest) => ({
              interest,
              studentId: created.id,
            }))
          )
        : Promise.resolve(),
    ]);

    // `resolveActiveTurma` só popula a turma no momento em que a cria, com os
    // alunos que já existiam. Sem vincular aqui, todo aluno cadastrado depois
    // da primeira aula ficaria fora da turma — invisível na home e ignorado
    // nas adaptações. Antes da primeira turma existir não há o que vincular:
    // o backfill de `resolveActiveTurma` cobre esse caso.
    const [activeTurma] = await getTurmasByTeacherId({ teacherId });
    if (activeTurma) {
      await addStudentsToTurma({
        studentIds: [created.id],
        turmaId: activeTurma.id,
      });
    }

    return created;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

// Conditions/interests + the rest of the profile, combined for screens that
// display the student's context at a glance (e.g. the adaptação builder,
// tela 5). getStudentFullContext alone doesn't include conditions/interests.
export async function getStudentAdaptacaoContext({
  studentId,
}: {
  studentId: string;
}) {
  try {
    const [conditions, interests, fullContext] = await Promise.all([
      db
        .select()
        .from(studentCondition)
        .where(eq(studentCondition.studentId, studentId)),
      db
        .select()
        .from(studentInterest)
        .where(eq(studentInterest.studentId, studentId)),
      getStudentFullContext({ studentId }),
    ]);

    return { conditions, interests, ...fullContext };
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

// Recent observations + AEE notes were added here (not just fetched
// separately by the profile screen) so `lookupStudent` — the tool the AI
// already calls before adapting or advising on a student — carries them
// automatically. Without this the conselho comportamental flow (§4.3) would
// give advice blind to what already happened with that student. Capped at 8
// observations (most recent first) so the prompt stays a manageable size;
// AEE notes are usually few enough not to need a cap.
const RECENT_OBSERVATIONS_LIMIT = 8;

export async function getStudentFullContext({
  studentId,
}: {
  studentId: string;
}) {
  try {
    const [
      [profile],
      goals,
      learningPreferences,
      sensitivities,
      [aiMemory],
      recentObservations,
      aeeNotes,
    ] = await Promise.all([
      db
        .select()
        .from(studentProfile)
        .where(eq(studentProfile.studentId, studentId)),
      db.select().from(studentGoal).where(eq(studentGoal.studentId, studentId)),
      db
        .select()
        .from(studentLearningPreference)
        .where(eq(studentLearningPreference.studentId, studentId)),
      db
        .select()
        .from(studentSensitivity)
        .where(eq(studentSensitivity.studentId, studentId)),
      db
        .select()
        .from(studentAiMemory)
        .where(eq(studentAiMemory.studentId, studentId)),
      db
        .select()
        .from(studentObservation)
        .where(eq(studentObservation.studentId, studentId))
        .orderBy(desc(studentObservation.createdAt))
        .limit(RECENT_OBSERVATIONS_LIMIT),
      db
        .select()
        .from(studentAeeNote)
        .where(eq(studentAeeNote.studentId, studentId))
        .orderBy(desc(studentAeeNote.createdAt)),
    ]);

    return {
      aeeNotes: aeeNotes.map((n) => ({
        autor: n.autor,
        papel: n.papel,
        texto: n.texto,
      })),
      aiMemorySummary: aiMemory?.summary ?? null,
      goals,
      learningPreferences,
      profile: profile ?? null,
      recentObservations: recentObservations.map((o) => ({
        createdAt: o.createdAt,
        observation: o.observation,
        origem: o.origem,
        tipo: o.tipo,
      })),
      sensitivities,
    };
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

// Student profile screen (tela 8): the base student row, scoped to the
// requesting teacher for ownership checks. Conditions/interests/etc. come
// from getStudentAdaptacaoContext instead of being re-fetched here.
export async function getStudentForProfile({
  studentId,
  teacherId,
}: {
  studentId: string;
  teacherId: string;
}): Promise<Student | null> {
  try {
    const [row] = await db
      .select()
      .from(student)
      .where(and(eq(student.id, studentId), eq(student.teacherId, teacherId)));

    return row ?? null;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function getStudentHistorico({
  studentId,
}: {
  studentId: string;
}) {
  try {
    const rows = await db
      .select({
        atividadeTema: atividade.content,
        observation: studentObservation,
      })
      .from(studentObservation)
      .leftJoin(atividade, eq(studentObservation.atividadeId, atividade.id))
      .where(eq(studentObservation.studentId, studentId))
      .orderBy(desc(studentObservation.createdAt));

    return rows.map((row) => ({
      ...row.observation,
      atividadeTema: row.atividadeTema?.tema ?? null,
    }));
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function createObservacao({
  studentId,
  teacherId,
  observation,
  tipo,
  origem,
  atividadeId,
  chatId,
}: {
  studentId: string;
  teacherId: string;
  observation: string;
  tipo: StudentObservation["tipo"];
  origem: StudentObservation["origem"];
  atividadeId?: string;
  chatId?: string;
}): Promise<StudentObservation> {
  try {
    const [created] = await db
      .insert(studentObservation)
      .values({
        atividadeId,
        chatId,
        observation,
        origem,
        studentId,
        teacherId,
        tipo,
      })
      .returning();
    return created;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function deleteObservacao({ id }: { id: string }) {
  try {
    await db.delete(studentObservation).where(eq(studentObservation.id, id));
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

// Conselho comportamental (PLANEJAMENTO.md §4.3): one studentObservation per
// chat, kept up to date as the conversation continues rather than growing
// one row per assistant reply — same "latest call replaces the previous
// version" idea already used by updateAdaptacao, applied to a different
// table. Called server-side after each assistant turn in a chat that has
// `chat.studentId` set (see app/(chat)/api/chat/route.ts), never from a
// model tool call, so there's no risk of the model forgetting to save it.
export async function upsertConselhoObservation({
  chatId,
  studentId,
  teacherId,
  observation,
}: {
  chatId: string;
  studentId: string;
  teacherId: string;
  observation: string;
}): Promise<StudentObservation> {
  try {
    const [existing] = await db
      .select()
      .from(studentObservation)
      .where(eq(studentObservation.chatId, chatId));

    if (existing) {
      const [updated] = await db
        .update(studentObservation)
        .set({ observation })
        .where(eq(studentObservation.id, existing.id))
        .returning();
      return updated;
    }

    return await createObservacao({
      chatId,
      observation,
      origem: "conselho",
      studentId,
      teacherId,
      tipo: "neutro",
    });
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

// Finds the teacher's most recent conselho chat for this student (so
// re-opening "Conversar sobre {Nome}" continues the same thread instead of
// fragmenting into a new one every time) or creates a fresh one.
export async function findOrCreateConselhoChat({
  studentId,
  teacherId,
  studentName,
}: {
  studentId: string;
  teacherId: string;
  studentName: string;
}): Promise<Chat> {
  try {
    const [existing] = await db
      .select()
      .from(chat)
      .where(and(eq(chat.studentId, studentId), eq(chat.userId, teacherId)))
      .orderBy(desc(chat.createdAt))
      .limit(1);

    if (existing) {
      return existing;
    }

    const [created] = await db
      .insert(chat)
      .values({
        createdAt: new Date(),
        studentId,
        title: `Conversa sobre ${studentName}`,
        userId: teacherId,
        visibility: "private",
      })
      .returning();

    return created;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function getAeeNotes({ studentId }: { studentId: string }) {
  try {
    return await db
      .select()
      .from(studentAeeNote)
      .where(eq(studentAeeNote.studentId, studentId))
      .orderBy(asc(studentAeeNote.createdAt));
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function createAeeNote({
  studentId,
  autor,
  papel,
  texto,
}: {
  studentId: string;
  autor: string;
  papel: StudentAeeNote["papel"];
  texto: string;
}): Promise<StudentAeeNote> {
  try {
    const [created] = await db
      .insert(studentAeeNote)
      .values({ autor, papel, studentId, texto })
      .returning();
    return created;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function createStudentGoal({
  studentId,
  goal,
  difficulty,
}: {
  studentId: string;
  goal: string;
  difficulty?: StudentGoal["difficulty"];
}): Promise<StudentGoal> {
  try {
    const [created] = await db
      .insert(studentGoal)
      .values({ difficulty, goal, studentId })
      .returning();
    return created;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function updateStudentGoalStatus({
  id,
  status,
}: {
  id: string;
  status: StudentGoal["status"];
}) {
  try {
    await db.update(studentGoal).set({ status }).where(eq(studentGoal.id, id));
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function deleteStudentGoal({ id }: { id: string }) {
  try {
    await db.delete(studentGoal).where(eq(studentGoal.id, id));
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function createStudentLearningPreference({
  studentId,
  strategy,
  effectiveness,
}: {
  studentId: string;
  strategy: string;
  effectiveness: StudentLearningPreference["effectiveness"];
}): Promise<StudentLearningPreference> {
  try {
    const [created] = await db
      .insert(studentLearningPreference)
      .values({ effectiveness, strategy, studentId })
      .returning();
    return created;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function deleteStudentLearningPreference({ id }: { id: string }) {
  try {
    await db
      .delete(studentLearningPreference)
      .where(eq(studentLearningPreference.id, id));
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

// Recent atividades a student has an adaptação for, used by the "registrar
// feedback" quick action on the profile screen to let the teacher pick which
// aula the feedback relates to.
export async function getRecentAtividadesForStudent({
  studentId,
  limit = 5,
}: {
  studentId: string;
  limit?: number;
}) {
  try {
    return await db
      .select({ atividade })
      .from(atividadeAdaptada)
      .innerJoin(atividade, eq(atividadeAdaptada.atividadeId, atividade.id))
      .where(eq(atividadeAdaptada.studentId, studentId))
      .orderBy(desc(atividade.createdAt))
      .limit(limit)
      .then((rows) => rows.map((row) => row.atividade));
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function createTurma({
  name,
  grade,
  teacherId,
}: {
  name: string;
  grade?: string;
  teacherId: string;
}) {
  try {
    return await db
      .insert(turma)
      .values({ grade, name, teacherId })
      .returning();
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function addStudentsToTurma({
  turmaId,
  studentIds,
}: {
  turmaId: string;
  studentIds: string[];
}) {
  if (studentIds.length === 0) {
    return [];
  }

  try {
    return await db
      .insert(turmaStudent)
      .values(studentIds.map((studentId) => ({ studentId, turmaId })))
      .onConflictDoNothing()
      .returning();
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function getTurmasByTeacherId({
  teacherId,
}: {
  teacherId: string;
}): Promise<Turma[]> {
  try {
    return await db
      .select()
      .from(turma)
      .where(eq(turma.teacherId, teacherId))
      .orderBy(asc(turma.name));
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

// Shared by `saveAtividade` and `savePlanejamentoSemanal` — a teacher's
// first activity of any kind (daily or weekly) auto-creates their default
// turma and backfills it with every existing student, so the AI tools never
// have to ask "which turma?" before the professor has created one.
// `turmaNome`/`turmaAno` come from what the professor already said in the
// chat ("aula de frações pro 5º ano B"); "Minha turma" is the last-resort
// fallback, not the expected outcome.
export async function resolveActiveTurma({
  teacherId,
  turmaNome,
  turmaAno,
}: {
  teacherId: string;
  turmaNome?: string;
  turmaAno?: string;
}): Promise<Turma> {
  const turmas = await getTurmasByTeacherId({ teacherId });
  const [activeTurma] = turmas;

  if (activeTurma) {
    return activeTurma;
  }

  const [created] = await createTurma({
    grade: turmaAno,
    name: turmaNome || "Minha turma",
    teacherId,
  });

  const students = await getStudentsByTeacherId({ teacherId });
  await addStudentsToTurma({
    studentIds: students.map((s) => s.id),
    turmaId: created.id,
  });

  return created;
}

export async function getTurmaWithStudents({ turmaId }: { turmaId: string }) {
  try {
    const [selectedTurma] = await db
      .select()
      .from(turma)
      .where(eq(turma.id, turmaId));

    if (!selectedTurma) {
      return null;
    }

    const students = await db
      .select({ student })
      .from(turmaStudent)
      .innerJoin(student, eq(turmaStudent.studentId, student.id))
      .where(eq(turmaStudent.turmaId, turmaId))
      .orderBy(asc(student.name));

    return {
      students: students.map((row) => row.student),
      turma: selectedTurma,
    };
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

// Powers the `/turma` home screen: turma + its students (with conditions, so
// the "Atípicos" filter and needs tag can be computed without a second
// round-trip) + the most recent atividade for the turma + each student's
// adaptation status against that atividade specifically (an older adaptação
// from a past atividade shouldn't read as "done" for today's aula).
export async function getTurmaHomeData({ turmaId }: { turmaId: string }) {
  try {
    const [selectedTurma] = await db
      .select()
      .from(turma)
      .where(eq(turma.id, turmaId));

    if (!selectedTurma) {
      return null;
    }

    const studentRows = await db
      .select({ student })
      .from(turmaStudent)
      .innerJoin(student, eq(turmaStudent.studentId, student.id))
      .where(eq(turmaStudent.turmaId, turmaId))
      .orderBy(asc(student.name));

    const studentIds = studentRows.map((row) => row.student.id);

    const conditions = studentIds.length
      ? await db
          .select()
          .from(studentCondition)
          .where(inArray(studentCondition.studentId, studentIds))
      : [];

    const [latestAtividade] = await db
      .select()
      .from(atividade)
      .where(eq(atividade.turmaId, turmaId))
      .orderBy(desc(atividade.createdAt))
      .limit(1);

    const adaptacoes = latestAtividade
      ? await db
          .select()
          .from(atividadeAdaptada)
          .where(eq(atividadeAdaptada.atividadeId, latestAtividade.id))
      : [];

    const students = studentRows.map((row) => {
      const adaptacao = adaptacoes.find((a) => a.studentId === row.student.id);
      return {
        ...row.student,
        adaptacaoStatus: adaptacao?.status ?? null,
        conditions: conditions.filter((c) => c.studentId === row.student.id),
      };
    });

    return {
      latestAtividade: latestAtividade ?? null,
      students,
      turma: selectedTurma,
    };
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function createAtividade({
  turmaId,
  teacherId,
  objective,
  content,
  sourceChatId,
  sourceFileUrl,
  planejamentoSemanalId,
  diaAplicacao,
}: {
  turmaId: string;
  teacherId: string;
  objective: string;
  content: AtividadeContent;
  sourceChatId?: string;
  sourceFileUrl?: string;
  planejamentoSemanalId?: string;
  diaAplicacao?: string;
}): Promise<Atividade> {
  try {
    const [createdAtividade] = await db
      .insert(atividade)
      .values({
        content,
        diaAplicacao,
        objective,
        planejamentoSemanalId,
        sourceChatId,
        sourceFileUrl,
        teacherId,
        turmaId,
      })
      .returning();

    return createdAtividade;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function createPlanejamentoSemanal({
  turmaId,
  teacherId,
  objetivoGeral,
  sourceChatId,
}: {
  turmaId: string;
  teacherId: string;
  objetivoGeral?: string;
  sourceChatId?: string;
}): Promise<PlanejamentoSemanal> {
  try {
    const [created] = await db
      .insert(planejamentoSemanal)
      .values({ objetivoGeral, sourceChatId, teacherId, turmaId })
      .returning();

    return created;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function createAtividadesAdaptadas({
  atividadeId,
  versions,
}: {
  atividadeId: string;
  versions: { studentId: string; content: AtividadeContent }[];
}): Promise<AtividadeAdaptada[]> {
  if (versions.length === 0) {
    return [];
  }

  try {
    return await db
      .insert(atividadeAdaptada)
      .values(
        versions.map(({ studentId, content }) => ({
          atividadeId,
          content,
          status: "rascunho" as const,
          studentId,
        }))
      )
      .returning();
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

// Used by the updateAdaptacao AI tool (per-student refinement chat, tela 5).
// Distinct from updateAtividadeAdaptadaContent, which is the teacher's own
// manual edit in the review screen and marks `editedByTeacher: true` — an
// AI-driven refinement here shouldn't be mislabeled as a manual edit.
export async function upsertAdaptacaoFromAi({
  atividadeId,
  studentId,
  content,
}: {
  atividadeId: string;
  studentId: string;
  content: AtividadeContent;
}): Promise<AtividadeAdaptada> {
  try {
    const [existing] = await db
      .select()
      .from(atividadeAdaptada)
      .where(
        and(
          eq(atividadeAdaptada.atividadeId, atividadeId),
          eq(atividadeAdaptada.studentId, studentId)
        )
      );

    if (existing) {
      const [updated] = await db
        .update(atividadeAdaptada)
        .set({ content, status: "rascunho", updatedAt: new Date() })
        .where(eq(atividadeAdaptada.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(atividadeAdaptada)
      .values({ atividadeId, content, status: "rascunho", studentId })
      .returning();
    return created;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

// Used by /chat/:id (continuing a saved chat) to show the same turma header
// nova-aula shows for a fresh chat, when this chat already produced an
// atividade. Returns null for a chat that hasn't (yet) — the screen falls
// back to a generic header in that case.
export async function getTurmaContextForChat({ chatId }: { chatId: string }) {
  try {
    const [row] = await db
      .select({ turmaGrade: turma.grade, turmaName: turma.name })
      .from(atividade)
      .innerJoin(turma, eq(atividade.turmaId, turma.id))
      .where(eq(atividade.sourceChatId, chatId))
      .orderBy(desc(atividade.createdAt))
      .limit(1);

    return row ?? null;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function getAtividadesByTeacherId({
  teacherId,
}: {
  teacherId: string;
}) {
  try {
    const rows = await db
      .select({ atividade, turmaName: turma.name })
      .from(atividade)
      .innerJoin(turma, eq(atividade.turmaId, turma.id))
      .where(eq(atividade.teacherId, teacherId))
      .orderBy(desc(atividade.createdAt));

    return rows;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

// Grouped by atividade (aula), each with its per-student adaptações — used
// by the /atividades list screen (tela 7), which groups rows by aula/aluno
// per the design handoff instead of showing a flat atividade-only list.
export async function getAtividadesWithAdaptacoesByTeacherId({
  teacherId,
}: {
  teacherId: string;
}) {
  try {
    const atividadeRows = await db
      .select({ atividade, turmaName: turma.name })
      .from(atividade)
      .innerJoin(turma, eq(atividade.turmaId, turma.id))
      .where(eq(atividade.teacherId, teacherId))
      .orderBy(desc(atividade.createdAt));

    if (atividadeRows.length === 0) {
      return [];
    }

    const atividadeIds = atividadeRows.map((row) => row.atividade.id);
    const adaptacaoRows = await db
      .select({ adaptada: atividadeAdaptada, student })
      .from(atividadeAdaptada)
      .innerJoin(student, eq(atividadeAdaptada.studentId, student.id))
      .where(inArray(atividadeAdaptada.atividadeId, atividadeIds))
      .orderBy(asc(student.name));

    return atividadeRows.map((row) => ({
      adaptacoes: adaptacaoRows
        .filter((a) => a.adaptada.atividadeId === row.atividade.id)
        .map((a) => ({ ...a.adaptada, student: a.student })),
      atividade: row.atividade,
      turmaName: row.turmaName,
    }));
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function getAtividadeWithAdaptacoes({
  atividadeId,
}: {
  atividadeId: string;
}) {
  try {
    const [selectedAtividade] = await db
      .select({ atividade, turmaGrade: turma.grade, turmaName: turma.name })
      .from(atividade)
      .innerJoin(turma, eq(atividade.turmaId, turma.id))
      .where(eq(atividade.id, atividadeId));

    if (!selectedAtividade) {
      return null;
    }

    const adaptacoes = await db
      .select({ adaptada: atividadeAdaptada, student })
      .from(atividadeAdaptada)
      .innerJoin(student, eq(atividadeAdaptada.studentId, student.id))
      .where(eq(atividadeAdaptada.atividadeId, atividadeId))
      .orderBy(asc(student.name));

    return {
      adaptacoes: adaptacoes.map((row) => ({
        ...row.adaptada,
        student: row.student,
      })),
      atividade: selectedAtividade.atividade,
      turmaGrade: selectedAtividade.turmaGrade,
      turmaName: selectedAtividade.turmaName,
    };
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function updateAtividadeContent({
  id,
  content,
  objective,
}: {
  id: string;
  content: AtividadeContent;
  objective: string;
}) {
  try {
    const [updated] = await db
      .update(atividade)
      .set({ content, objective, updatedAt: new Date() })
      .where(eq(atividade.id, id))
      .returning();

    return updated;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function updateAtividadeAdaptadaContent({
  id,
  content,
}: {
  id: string;
  content: AtividadeContent;
}) {
  try {
    const [updated] = await db
      .update(atividadeAdaptada)
      .set({ content, editedByTeacher: true, updatedAt: new Date() })
      .where(eq(atividadeAdaptada.id, id))
      .returning();

    return updated;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function validateAtividadeAdaptada({ id }: { id: string }) {
  try {
    const [validated] = await db
      .update(atividadeAdaptada)
      .set({ status: "validada", updatedAt: new Date() })
      .where(eq(atividadeAdaptada.id, id))
      .returning();

    return validated;
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function validateAllAtividadesAdaptadas({
  atividadeId,
}: {
  atividadeId: string;
}) {
  try {
    return await db
      .update(atividadeAdaptada)
      .set({ status: "validada", updatedAt: new Date() })
      .where(eq(atividadeAdaptada.atividadeId, atividadeId))
      .returning();
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function getAdaptacaoForPrint({
  adaptacaoId,
}: {
  adaptacaoId: string;
}) {
  try {
    const [row] = await db
      .select({
        adaptada: atividadeAdaptada,
        schoolName: user.schoolName,
        student,
        teacherId: atividade.teacherId,
        turmaName: turma.name,
      })
      .from(atividadeAdaptada)
      .innerJoin(atividade, eq(atividadeAdaptada.atividadeId, atividade.id))
      .innerJoin(turma, eq(atividade.turmaId, turma.id))
      .innerJoin(user, eq(atividade.teacherId, user.id))
      .innerJoin(student, eq(atividadeAdaptada.studentId, student.id))
      .where(eq(atividadeAdaptada.id, adaptacaoId));

    if (!row) {
      return null;
    }

    return {
      adaptacao: row.adaptada,
      schoolName: row.schoolName,
      student: row.student,
      teacherId: row.teacherId,
      turmaName: row.turmaName,
    };
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}

export async function getAtividadeForPrint({
  atividadeId,
}: {
  atividadeId: string;
}) {
  try {
    const [row] = await db
      .select({
        atividade,
        schoolName: user.schoolName,
        turmaGrade: turma.grade,
        turmaName: turma.name,
      })
      .from(atividade)
      .innerJoin(turma, eq(atividade.turmaId, turma.id))
      .innerJoin(user, eq(atividade.teacherId, user.id))
      .where(eq(atividade.id, atividadeId));

    if (!row) {
      return null;
    }

    return {
      atividade: row.atividade,
      schoolName: row.schoolName,
      turmaGrade: row.turmaGrade,
      turmaName: row.turmaName,
    };
  } catch (error) {
    throw new ChatbotError("bad_request:database", { cause: error });
  }
}
