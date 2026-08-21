interface FetchOptions extends RequestInit {
  data?: any;
}

export class ApiClient {
  private static baseUrl = '/api';

  public static async request<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { data, headers: customHeaders, ...customOptions } = options;

    const token = localStorage.getItem('hireai_token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((customHeaders as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...customOptions,
      headers,
      credentials: 'include',
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (response.status === 401) {
      localStorage.removeItem('hireai_token');
      localStorage.removeItem('hireai_user');
    }

    const resData = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = resData.message || (resData.errors && Array.isArray(resData.errors) ? resData.errors.map((e: any) => e.message || e).join(', ') : null) || resData.error || response.statusText || 'An unexpected API error occurred';
      throw new Error(errorMessage);
    }

    return resData;
  }

  public static get<T = any>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public static post<T = any>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', data });
  }

  public static put<T = any>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', data });
  }

  public static patch<T = any>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', data });
  }

  public static delete<T = any>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}
