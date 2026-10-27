import { config } from '../config/config.js';

/**
 * Reusable fetch wrapper with timeout, AbortController, error normalization.
 */
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
    // No backend — return null to signal "unavailable".
    return null;
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

async function request(method, path, { params, body, signal, headers = {}, credentials = 'include' } = {}) {
  const url = buildUrl(path, params);
  if (!url) {
    throw new ApiError('Backend is not configured', {
      status: 0,
      code: 'NO_BACKEND',
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeout);

  // Link external signal
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const finalHeaders = { Accept: 'application/json', ...headers };
  let finalBody;
  if (body !== undefined) {
    if (body instanceof FormData) {
      finalBody = body;
    } else {
      finalHeaders['Content-Type'] = 'application/json';
      finalBody = JSON.stringify(body);
    }
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: finalBody,
      credentials,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new ApiError('Request aborted or timed out', {
        code: 'TIMEOUT',
      });
    }
    throw new ApiError('Network error', {
      code: 'NETWORK_ERROR',
      details: err.message,
    });
  }
  clearTimeout(timeout);

  if (res.status === 204) return null;

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!res.ok) {
        throw new ApiError(`HTTP ${res.status}`, {
          status: res.status,
          code: 'INVALID_JSON',
          details: text.slice(0, 200),
        });
      }
      return text;
    }
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) || `HTTP ${res.status}`;
    throw new ApiError(message, {
      status: res.status,
      code: 'HTTP_ERROR',
      details: data,
    });
  }
  return data;
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
  isConfigured: () => Boolean(config.apiBaseUrl),
  buildUrl,
};