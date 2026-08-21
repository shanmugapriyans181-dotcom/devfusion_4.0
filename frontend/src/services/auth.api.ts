import { ApiClient } from './api.client';
import { User, Role } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export const authApi = {
  login: (payload: LoginPayload) => ApiClient.post<AuthResponse>('/auth/login', payload),
  register: (payload: RegisterPayload) => ApiClient.post<AuthResponse>('/auth/register', payload),
  logout: () => ApiClient.post('/auth/logout'),
  getMe: () => ApiClient.get<{ success: boolean; data: User }>('/auth/me'),
};
