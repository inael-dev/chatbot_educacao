export const DEFAULT_CHAT_MODEL = "openai/gpt-5-mini";

export const titleModel = {
  description: "Fast model for title generation",
  id: "openai/gpt-5-mini",
  name: "GPT-5 Mini",
  provider: "openai",
};

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
};

export const chatModels: ChatModel[] = [
  {
    description: "OpenAI's mini reasoning model — chat, tools and atividade generation",
    id: "openai/gpt-5-mini",
    name: "GPT-5 Mini",
    provider: "openai",
    reasoningEffort: "medium",
  },
];

const capabilitiesById: Record<string, ModelCapabilities> = {
  "openai/gpt-5-mini": { reasoning: true, tools: true, vision: true },
};

export function getCapabilities(): Record<string, ModelCapabilities> {
  return capabilitiesById;
}

export const isDemo = process.env.IS_DEMO === "1";

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
