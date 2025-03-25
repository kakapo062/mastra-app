import { Octokit } from '@octokit/rest';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

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

export const getPullRequestTool = createTool({
  id: 'get-pull-request',
  description: 'Get details of a GitHub Pull Request',
  inputSchema: z.object({
    prUrl: z.string().optional().describe('GitHub PR URL (e.g. https://github.com/owner/repo/pull/123)'),
    owner: z.string().optional().describe('Repository owner (username or organization)'),
    repo: z.string().optional().describe('Repository name'),
    pullNumber: z.number().optional().describe('Pull request number'),
    ghToken: z.string().optional().describe('GitHub personal access token (will use env.GITHUB_TOKEN if not provided)'),
  }),
  outputSchema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    state: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    changedFiles: z.number(),
    additions: z.number(),
    deletions: z.number(),
    commentsCount: z.number(),
    reviewCommentsCount: z.number(),
    fileChanges: z.array(z.object({
      filename: z.string(),
      status: z.string(),
      additions: z.number(),
      deletions: z.number(),
      changes: z.number(),
      patch: z.string().optional(),
    })),
  }),
  execute: async ({ context }) => {
    let owner: string;
    let repo: string;
    let pullNumber: number;
    
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
    
    // Get PR details
    const { data: prData } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    });
    
    // Get PR files
    const { data: filesData } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
    });
    
    // Get PR comments
    const { data: comments } = await octokit.issues.listComments({
      owner,
      repo,
      issue_number: pullNumber,
    });
    
    // Get PR review comments
    const { data: reviewComments } = await octokit.pulls.listReviewComments({
      owner,
      repo,
      pull_number: pullNumber,
    });
    
    return {
      title: prData.title,
      description: prData.body || '',
      author: prData.user?.login || '',
      state: prData.state,
      createdAt: prData.created_at,
      updatedAt: prData.updated_at,
      changedFiles: prData.changed_files,
      additions: prData.additions,
      deletions: prData.deletions,
      commentsCount: comments.length,
      reviewCommentsCount: reviewComments.length,
      fileChanges: filesData.map((file: FileData) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch,
      })),
    };
  },
}); 