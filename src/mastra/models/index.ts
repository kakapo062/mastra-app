import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

// Google Gemini AIプロバイダーの作成
export const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY || "",
});

// エンべディングモデルのインスタンス
export const googleEmbeddingModel =
    google.textEmbeddingModel("text-embedding-004");

// Claude APIを直接使用する設定
export const anthropicProvider = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// Claude 3.7 Sonnetモデルのインスタンス（直接APIを使用）
export const claude = anthropicProvider.languageModel("claude-3-7-sonnet-20250219");

// OpenRouter経由でのモデル利用設定
export const openRouter = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || "",
    baseURL: "https://openrouter.ai/api/v1",
})("anthropic/claude-3-7-sonnet:thinking");