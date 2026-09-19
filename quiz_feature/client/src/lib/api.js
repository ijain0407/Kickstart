import i18n from '../i18n.js';

const USER_KEY = 'kickstart.userId';
let memoryUserId = null;

/** Anonymous identity for the hackathon. TODO(B): replace with real auth. */
export function getUserId() {
  try {
    let id = window.localStorage.getItem(USER_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(USER_KEY, id);
    }
    return id;
  } catch {
    memoryUserId ??= crypto.randomUUID();
    return memoryUserId;
  }
}

export function localDate(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {
    'X-User-Id': getUserId(),
    'X-Client-Date': localDate(),
    'X-Locale': (i18n.resolvedLanguage || i18n.language || 'en').slice(0, 2),
  };
  try {
    headers['X-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    /* optional */
  }
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
