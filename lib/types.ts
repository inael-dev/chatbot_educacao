import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { ArtifactKind } from "@/components/chat/artifact";
import type { createDocument } from "./ai/tools/create-document";
import type { getWeather } from "./ai/tools/get-weather";
import type { listStudents } from "./ai/tools/list-students";
import type { lookupBnccHabilidade } from "./ai/tools/lookup-bncc-habilidade";
import type { lookupStudent } from "./ai/tools/lookup-student";
import type { requestSuggestions } from "./ai/tools/request-suggestions";
import type { saveAtividade } from "./ai/tools/save-atividade";
import type { updateAdaptacao } from "./ai/tools/update-adaptacao";
import type { updateDocument } from "./ai/tools/update-document";
import type { Suggestion } from "./db/schema";

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type weatherTool = InferUITool<typeof getWeather>;
type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<
  ReturnType<typeof requestSuggestions>
>;
type listStudentsTool = InferUITool<ReturnType<typeof listStudents>>;
type lookupStudentTool = InferUITool<ReturnType<typeof lookupStudent>>;
type lookupBnccHabilidadeTool = InferUITool<typeof lookupBnccHabilidade>;
type saveAtividadeTool = InferUITool<ReturnType<typeof saveAtividade>>;
type updateAdaptacaoTool = InferUITool<ReturnType<typeof updateAdaptacao>>;

export type ChatTools = {
  getWeather: weatherTool;
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
  listStudents: listStudentsTool;
  lookupStudent: lookupStudentTool;
  lookupBnccHabilidade: lookupBnccHabilidadeTool;
  saveAtividade: saveAtividadeTool;
  updateAdaptacao: updateAdaptacaoTool;
};

export type WaitingStatusData = {
  phase: "waiting" | "still-waiting" | "health" | "thinking";
  message: string;
  modelId: string;
  modelName: string;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  kind: ArtifactKind;
  clear: null;
  finish: null;
  "chat-title": string;
  "waiting-status": WaitingStatusData;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
};
