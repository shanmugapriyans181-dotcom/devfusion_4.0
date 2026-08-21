import { ApiClient } from './api.client';

export const interviewApi = {
  getInterviews: () => ApiClient.get<{ success: boolean; data: any[] }>('/interviews'),
  scheduleInterview: (data: any) => ApiClient.post('/interviews', data),
  submitFeedback: (id: string, feedback: any) => ApiClient.post(`/interviews/${id}/feedback`, feedback),
};
