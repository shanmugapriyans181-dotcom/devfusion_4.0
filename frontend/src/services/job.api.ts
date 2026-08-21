import { ApiClient } from './api.client';
import { Job } from '../types';

export interface JobFilterParams {
  keyword?: string;
  location?: string;
  employmentType?: string;
  workMode?: string;
  minSalary?: number;
  status?: string;
}

export const jobApi = {
  getJobs: (params?: JobFilterParams) => {
    const query = new URLSearchParams(params as any).toString();
    return ApiClient.get<{ success: boolean; data: Job[] }>(`/jobs${query ? `?${query}` : ''}`);
  },
  getJobById: (id: string) => ApiClient.get<{ success: boolean; data: Job }>(`/jobs/${id}`),
  createJob: (data: Partial<Job>) => ApiClient.post<{ success: boolean; data: Job }>('/jobs', data),
  approveJob: (id: string) => ApiClient.patch<{ success: boolean; data: Job }>(`/jobs/${id}/approve`),
  updateJob: (id: string, data: Partial<Job>) => ApiClient.put<{ success: boolean; data: Job }>(`/jobs/${id}`, data),
  closeJob: (id: string) => ApiClient.post<{ success: boolean; data: Job }>(`/jobs/${id}/close`),
  duplicateJob: (id: string) => ApiClient.post<{ success: boolean; data: Job }>(`/jobs/${id}/duplicate`),
  deleteJob: (id: string) => ApiClient.delete(`/jobs/${id}`),
};
