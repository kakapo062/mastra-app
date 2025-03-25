
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';

import { claudeAgent } from './agents';

export const mastra = new Mastra({
  agents: { claudeAgent },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
