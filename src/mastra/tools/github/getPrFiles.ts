import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { Octokit } from '@octokit/rest';

interface FileData {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

// GitHubのURL形式を解析する関数
function parseGitHubUrl(url: string): { owner: string; repo: string; pullNumber?: number } {
  // GitHub URLからオーナー、リポジトリ、PR番号を抽出
  const githubRegex = /github\.com\/([^\/]+)\/([^\/]+)(?:\/pull\/(\d+))?/;
  const match = url.match(githubRegex);
  
  if (!match) {
    throw new Error('Invalid GitHub URL format');
  }
  
  return {
    owner: match[1],
    repo: match[2].replace('.git', ''),
    pullNumber: match[3] ? parseInt(match[3], 10) : undefined
  };
}

export const getPrFileTool = createTool({
  id: 'get-pr-file',
  description: 'Get the content of a specific file from a PR',
  inputSchema: z.object({
    prUrl: z.string().optional().describe('GitHub PR URL (e.g. https://github.com/owner/repo/pull/123)'),
    owner: z.string().optional().describe('Repository owner (username or organization)'),
    repo: z.string().optional().describe('Repository name'),
    pullNumber: z.number().optional().describe('Pull request number'),
    filePath: z.string().describe('Path of the file to retrieve'),
    ghToken: z.string().optional().describe('GitHub personal access token (will use env.GITHUB_TOKEN if not provided)'),
  }),
  outputSchema: z.object({
    filename: z.string(),
    content: z.string(),
    beforeContent: z.string().optional(),
    afterContent: z.string().optional(),
    patch: z.string().optional(),
  }),
  execute: async ({ context }) => {
    let owner: string;
    let repo: string;
    let pullNumber: number;
    const { filePath } = context;
    
    // URLから情報を抽出するか、個別のパラメータを使用
    if (context.prUrl) {
      const parsedUrl = parseGitHubUrl(context.prUrl);
      owner = parsedUrl.owner;
      repo = parsedUrl.repo;
      
      if (parsedUrl.pullNumber) {
        pullNumber = parsedUrl.pullNumber;
      } else if (context.pullNumber) {
        pullNumber = context.pullNumber;
      } else {
        throw new Error('Pull request number not found in URL and not provided separately');
      }
    } else {
      // 個別パラメータを使用
      if (!context.owner || !context.repo || !context.pullNumber) {
        throw new Error('Either prUrl or all of owner, repo, and pullNumber must be provided');
      }
      
      owner = context.owner;
      repo = context.repo;
      pullNumber = context.pullNumber;
    }
    
    const octokit = new Octokit({
      auth: context.ghToken || process.env.GITHUB_TOKEN,
    });
    
    // Get PR details to get base and head
    const { data: prData } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    });
    
    // Get file from PR files list to get the patch
    const { data: filesData } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
    });
    
    const targetFile = filesData.find((file: FileData) => file.filename === filePath);
    
    if (!targetFile) {
      throw new Error(`File ${filePath} not found in PR #${pullNumber}`);
    }
    
    // Get the content of the file in the head branch
    let afterContent = '';
    try {
      const { data: headContent } = await octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: prData.head.ref,
      });
      
      if ('content' in headContent) {
        afterContent = Buffer.from(headContent.content, 'base64').toString('utf-8');
      }
    } catch (error: any) {
      // File might be deleted in the PR
      console.error(`Error getting head content: ${error.message}`);
    }
    
    // Get the content of the file in the base branch if it's not a new file
    let beforeContent = '';
    if (targetFile.status !== 'added') {
      try {
        const { data: baseContent } = await octokit.repos.getContent({
          owner,
          repo,
          path: filePath,
          ref: prData.base.ref,
        });
        
        if ('content' in baseContent) {
          beforeContent = Buffer.from(baseContent.content, 'base64').toString('utf-8');
        }
      } catch (error: any) {
        console.error(`Error getting base content: ${error.message}`);
      }
    }
    
    return {
      filename: filePath,
      content: targetFile.status === 'removed' ? beforeContent : afterContent,
      beforeContent: targetFile.status !== 'added' ? beforeContent : undefined,
      afterContent: targetFile.status !== 'removed' ? afterContent : undefined,
      patch: targetFile.patch,
    };
  },
}); 