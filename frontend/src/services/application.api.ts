import { ApiClient } from './api.client';
import { ApplicationStage } from '../types';

export interface ApplyPayload {
  jobId: string;
  coverLetter?: string;
  resumeId?: string;
}

export const applicationApi = {
  apply: (payload: ApplyPayload) => ApiClient.post('/applications', payload),
  getApplications: () => ApiClient.get<{ success: boolean; data: any[] }>('/applications'),
  updateStage: (id: string, stage: ApplicationStage) =>
    ApiClient.put<{ success: boolean; data: any }>(`/applications/${id}/stage`, { stage }),
};
