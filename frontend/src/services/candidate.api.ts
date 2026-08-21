import { ApiClient } from './api.client';

export const candidateApi = {
  getProfile: () => ApiClient.get<{ success: boolean; data: any }>('/candidates/profile'),
  updateProfile: (data: any) => ApiClient.put<{ success: boolean; data: any }>('/candidates/profile', data),
  getCandidates: () => ApiClient.get<{ success: boolean; data: any[] }>('/candidates'),
};
