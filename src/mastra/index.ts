import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
// import { cursorRulesWorkflow } from "./workflows";
import { cursorRulesAgent, codeReviewAgent, prReviewAgent } from "./agents";

export const mastra = new Mastra({
    agents: {
        cursorRulesAgent,
        codeReviewAgent,
        prReviewAgent,
    },
    // workflows: {
    //     cursorRulesWorkflow,
    // },
    logger: createLogger({
        name: "GitHub Cursor Rules Agent",
        level: "info",
    }),
});