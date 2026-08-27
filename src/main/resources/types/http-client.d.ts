// Minimal types for lib-http-client 4 (no @enonic-types package exists — verified against the
// registry). Resolved as the module for `/lib/http-client` via tsconfig `paths`.
// Declares only what the market source uses; extend it as further options are needed.

export type HttpRequestParams = {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'PATCH';
  headers?: Record<string, string>;
  contentType?: string;
  body?: string;
  connectionTimeout?: number;
  readTimeout?: number;
  followRedirects?: boolean;
};

export type HttpResponse = {
  status: number;
  message: string;
  body: string | null;
  contentType: string;
  headers: Record<string, string>;
};

export function request(params: HttpRequestParams): HttpResponse;
