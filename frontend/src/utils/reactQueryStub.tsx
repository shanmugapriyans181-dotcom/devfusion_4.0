import React from 'react';

export class QueryClient {
  constructor(public options?: any) {}
}

export const QueryClientProvider: React.FC<{ client: any; children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export function useQuery(options?: any) {
  return { data: null, isLoading: false, error: null, refetch: () => {} };
}

export function useMutation(options?: any) {
  return { mutate: () => {}, isLoading: false, error: null };
}
