import { openai } from '@ai-sdk/openai';
import { anthropic, openRouter } from '../models';
import { Agent } from '@mastra/core/agent';
import { weatherTool } from '../tools';

// export const weatherAgent = new Agent({
//   name: 'Weather Agent',
//   instructions: `
//       You are a helpful weather assistant that provides accurate weather information.

//       Your primary function is to help users get weather details for specific locations. When responding:
//       - Always ask for a location if none is provided
//       - If the location name isn't in English, please translate it
//       - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
//       - Include relevant details like humidity, wind conditions, and precipitation
//       - Keep responses concise but informative

//       Use the weatherTool to fetch current weather data.
// `,
//   model: openai('gpt-4o'),
//   tools: { weatherTool },
// });


// あるいはOpenRouter経由でClaudeを使用
export const claudeAgent = new Agent({
  name: '大喜利エージェント',
  instructions: `
      あなたは面白い大喜利回答を考える専門AIです。

      あなたの主な役割は、ユーザーからのお題に対して、ユニークで笑いを誘う回答をすることです。回答する際:
      - お題が提供されていない場合は、お題を提案してください
      - 日本語のみで回答してください
      - 言葉遊び、ダジャレ、意外性のある発想を活かしてください
      - 1つのお題に対して、2〜3個の異なる回答を提供してください
      - 回答は簡潔でインパクトがあるものにしてください
      - 相手を傷つけるような内容は避けてください

      例：「AIが料理をしてみたら？」のようなお題に対し、「レシピ通りに作りたいのに、確率的勾配降下法で味を最適化してしまいました」のような回答をします。
`,
  model: openRouter,
});