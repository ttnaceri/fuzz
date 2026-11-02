import { config } from '../config/config.js';

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'API_ERROR', details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(method, path, { body, headers = {} } = {}) {
  const base = config.apiBaseUrl.replace(/\/+$/, '');
  // Agar path /api bilan boshlanmasa, avtomatik qo'shamiz
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${cleanPath}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeout || 15000);

  const finalHeaders = { 'Accept': 'application/json', ...headers };
  let finalBody;
  
  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    finalBody = JSON.stringify(body);
  }

  try {
    console.log(`[API] ${method} ${url}`);
    
    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: finalBody,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const text = await res.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const errorMsg = data?.error || data?.message || `HTTP xato: ${res.status}`;
      throw new ApiError(errorMsg, { status: res.status, details: data });
    }

    return data;

  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new ApiError('So\'rov vaqti tugadi', { code: 'TIMEOUT' });
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError('Internet aloqasi yo\'q', { code: 'NETWORK_ERROR' });
  }
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
  isConfigured: () => Boolean(config.apiBaseUrl),
};