import { ApiClient } from './api.client';

export const aiApi = {
  parseResume: (rawText?: string) => ApiClient.post('/ai/resume-parse', { rawText }),
  matchCandidate: (data: { resumeText?: string; jobTitle?: string; jobRequirements?: string[]; jobSkills?: string[] }) =>
    ApiClient.post('/ai/match', data),
};
