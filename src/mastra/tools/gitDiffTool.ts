import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const gitDiffTool = createTool({
  id: 'git-diff',
  description: 'Get staged changes or changes between commits',
  inputSchema: z.object({
    staged: z.boolean().optional().describe('Get only staged changes'),
    fromCommit: z.string().optional().describe('Starting commit hash or reference'),
    toCommit: z.string().optional().describe('Ending commit hash or reference (defaults to HEAD)'),
  }),
  outputSchema: z.object({
    diff: z.string(),
    files: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const { staged, fromCommit, toCommit } = context;
    
    let command;
    if (staged) {
      // Get staged changes
      command = 'git diff --staged';
    } else if (fromCommit) {
      // Get changes between commits
      const to = toCommit || 'HEAD';
      command = `git diff ${fromCommit} ${to}`;
    } else {
      // Get all unstaged changes
      command = 'git diff';
    }
    
    try {
      const { stdout: diff } = await execAsync(command);
      const { stdout: filesOutput } = await execAsync(
        staged 
          ? 'git diff --staged --name-only' 
          : fromCommit 
            ? `git diff --name-only ${fromCommit} ${toCommit || 'HEAD'}`
            : 'git diff --name-only'
      );
      
      const files = filesOutput.trim().split('\n').filter(Boolean);
      
      return {
        diff,
        files,
      };
    } catch (error: any) {
      throw new Error(`Failed to get git diff: ${error.message}`);
    }
  },
}); 