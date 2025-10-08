import type { FetchOptions } from 'ofetch';

export function useApiFetch<T>(path: string, options: FetchOptions<'json'> = {}) {
  const config = useRuntimeConfig();
  const requestHeaders = useRequestHeaders(['cookie']);

  return $fetch<T>(path, {
    baseURL: config.public.apiBase,
    credentials: 'include',
    ...options,
    headers: {
      ...requestHeaders,
      ...(options.headers as Record<string, string> | undefined),
    },
  });
}
