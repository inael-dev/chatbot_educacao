import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { huggingface } from "@ai-sdk/huggingface";
import { openai } from "@ai-sdk/openai";
import { customProvider } from "ai";
import { isTestEnvironment } from "../constants";
import { titleModel } from "./models";

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        chatModel,
        titleModel: mockTitleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "title-model": mockTitleModel,
        },
      });
    })()
  : null;

function resolveModel(modelId: string) {
  const [provider, ...rest] = modelId.split("/");
  const id = rest.join("/");
  switch (provider) {
    case "anthropic":
      return anthropic(id);
    case "google":
      return google(id);
    case "huggingface":
      return huggingface(id);
    case "openai":
      return openai(id);
    default:
      throw new Error(`Unknown model provider: ${provider}`);
  }
}

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  return resolveModel(modelId);
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  return resolveModel(titleModel.id);
}
