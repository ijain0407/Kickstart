import i18n from '../i18n.js';

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const currentLocale = () => (i18n.resolvedLanguage || i18n.language || 'en').slice(0, 2);

/**
 * Same contract as Person D's client helper: /api base, X-Locale header, and errors
 * raised as ApiError from the server's { error: { code, message } } body. League
 * content is public, so there's no user header here.
 */
export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'X-Locale': currentLocale() };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`/api${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, 'NETWORK', 'Network error');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error?.code ?? 'ERROR', data?.error?.message ?? 'Request failed');
  return data;
}
