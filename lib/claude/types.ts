export interface ClaudeCallOptions {
  system: string;
  prompt: string;
  maxTokens?: number;
}

export interface PipelineContext {
  analysisId: string;
  companyName: string;
  industry: string;
  reportYear: number;
  reportText: string;
}
