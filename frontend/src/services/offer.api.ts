import { ApiClient } from './api.client';

export const offerApi = {
  getOffers: () => ApiClient.get<{ success: boolean; data: any[] }>('/offers'),
  createOffer: (data: any) => ApiClient.post('/offers', data),
  approveOffer: (id: string) => ApiClient.post(`/offers/${id}/approve`),
  updateStatus: (id: string, status: string) => ApiClient.put(`/offers/${id}/status`, { status }),
};
