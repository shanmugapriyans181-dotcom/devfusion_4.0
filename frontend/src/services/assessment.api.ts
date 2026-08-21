import { ApiClient } from './api.client';

export const assessmentApi = {
  getAssessments: () => ApiClient.get<{ success: boolean; data: any[] }>('/assessments'),
  getAssessmentById: (id: string) => ApiClient.get<{ success: boolean; data: any }>(`/assessments/${id}`),
  submitAttempt: (id: string, answers: any[]) => ApiClient.post(`/assessments/${id}/submit`, { answers }),
};
