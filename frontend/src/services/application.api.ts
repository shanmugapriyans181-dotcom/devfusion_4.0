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
  assignScreening: (id: string, data: { testTitle: string; testUrl: string; duration?: number; instructions?: string }) =>
    ApiClient.post<{ success: boolean; data: any }>(`/applications/${id}/screening`, data),
  submitScreeningScore: (id: string, data: { score: number; submissionNotes?: string }) =>
    ApiClient.post<{ success: boolean; data: any }>(`/applications/${id}/screening-submit`, data),
  requestInterviewer: (id: string, data: { interviewerId: string; meetingUrl?: string; scheduledAt?: string; duration?: number }) =>
    ApiClient.post<{ success: boolean; data: any }>(`/applications/${id}/request-interviewer`, data),
  sendReportToManager: (id: string, data?: { reportSummary?: string }) =>
    ApiClient.post<{ success: boolean; data: any }>(`/applications/${id}/send-report-to-manager`, data || {}),
};
