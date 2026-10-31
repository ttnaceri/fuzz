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

function buildUrl(path, params) {
  const base = config.apiBaseUrl ? config.apiBaseUrl.replace(/\/+$/, '') : '';
  const prefix = config.apiPrefix || '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  let url = `${base}${prefix}${cleanPath}`;
  
  if (!base) {
    throw new ApiError('Backend URL manzili sozlanmagan!', { code: 'NO_BACKEND' });
  }
  
  if (params && typeof params === 'object') {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') usp.append(k, String(v));
    });
    const qs = usp.toString();
    if (qs) url += `?${qs}`;
  }
  return url;
}

async function request(method, path, { params, body, headers = {} } = {}) {
  const url = buildUrl(path, params);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeout || 15000);

  const finalHeaders = { 'Accept': 'application/json', ...headers };
  let finalBody;
  
  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    finalBody = JSON.stringify(body);
  }

  try {
    console.log(`[API] ${method} ${url}`, body ? body : ''); // Debug uchun
    
    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: finalBody,
      signal: controller.signal,
      // credentials: 'omit', // Agar CORS muammosi bo'lsa shu yerni ochish kerak
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
      throw new ApiError('So\'rov vaqti tugadi (Timeout)', { code: 'TIMEOUT' });
    }
    if (err instanceof ApiError) throw err;
    
    console.error("[API Network Error]", err);
    throw new ApiError('Internet aloqasi yo\'q yoki server javob bermayapti', { code: 'NETWORK_ERROR', details: err.message });
  }
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
  isConfigured: () => Boolean(config.apiBaseUrl),
};