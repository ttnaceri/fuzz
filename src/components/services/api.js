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
  // Backend manzili qat'iy belgilangan
  const baseUrl = 'https://my-backend.updbackend.workers.dev/fuzz';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  let url = `${baseUrl}${cleanPath}`;
  
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

async function request(method, path, { params, body, signal, headers = {} } = {}) {
  const url = buildUrl(path, params);
  
  // 15 soniyalik vaqt chegarasi (timeout)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); 

  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const finalHeaders = { 
    'Accept': 'application/json',
    ...headers 
  };
  
  let finalBody;
  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    finalBody = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: finalBody,
      // ENG MUHIM O'ZGARISH: CORS xatosini oldini olish uchun 'omit'
      credentials: 'omit', 
      signal: controller.signal,
    });
    
    clearTimeout(timeout);

    if (res.status === 204) return null;
    
    const text = await res.text();
    let data = null;
    
    if (text) {
      try { 
        data = JSON.parse(text); 
      } catch { 
        if (!res.ok) throw new ApiError(`Server xatosi: ${res.status}`, { status: res.status, details: text });
        return text; 
      }
    }

    if (!res.ok) {
      const message = data?.error || data?.message || `Xatolik yuz berdi (${res.status})`;
      throw new ApiError(message, { status: res.status, details: data });
    }
    
    return data;

  } catch (err) {
    clearTimeout(timeout);
    
    if (err.name === 'AbortError') {
      throw new ApiError('Server bilan aloqa vaqti tugadi. Qayta urinib ko\'ring.', { code: 'TIMEOUT' });
    }
    
    if (err instanceof ApiError) throw err;
    
    throw new ApiError('Tarmoq xatosi. Internetni tekshiring yoki server ishlamayapti.', { code: 'NETWORK_ERROR', details: err.message });
  }
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
  isConfigured: () => true,
  buildUrl,
};