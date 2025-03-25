declare module '@octokit/rest' {
  export class Octokit {
    constructor(options?: { auth?: string });
    
    pulls: {
      get: (params: { owner: string; repo: string; pull_number: number }) => Promise<{ data: any }>;
      listFiles: (params: { owner: string; repo: string; pull_number: number }) => Promise<{ data: any[] }>;
      listReviewComments: (params: { owner: string; repo: string; pull_number: number }) => Promise<{ data: any[] }>;
    };
    
    issues: {
      listComments: (params: { owner: string; repo: string; issue_number: number }) => Promise<{ data: any[] }>;
    };
    
    repos: {
      getContent: (params: { owner: string; repo: string; path: string; ref?: string }) => Promise<{ data: any }>;
    };
  }
} 