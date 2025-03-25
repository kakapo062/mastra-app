import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { cursorRulesAgent, codeReviewAgent } from "./agents";

export const mastra = new Mastra({
    agents: {
        cursorRulesAgent,
        codeReviewAgent,
    },
    logger: createLogger({
        name: "GitHub Cursor Rules Agent",
        level: "info",
    }),
});