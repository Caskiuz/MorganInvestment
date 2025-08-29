// Base URL de la API (usa VITE_API_BASE si está presente, si no construye desde VITE_API_URL)
const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '');
import auth from '../utils/auth';

// Enviar testimonio
export async function postTestimonio({ nombre, texto }) {
  try {
    const res = await fetch(`${API_BASE}/public/testimonios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, texto })
    });
    if (!res.ok) {
      const err = await res.json();
      return { ok: false, error: err.error || 'Error' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error de red' };
  }
}
export async function register({ name, email, password }) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Error de registro' };
    return { token: data.token, user: data.user };
  } catch (err) {
    return { error: 'Error de red' };
  }
}

// Ofertas
export async function getOfertas() {
  try {
    const res = await fetch(`${API_BASE}/public/ofertas`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// Testimonios
export async function getTestimonios() {
  try {
    const res = await fetch(`${API_BASE}/public/testimonios`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// Actividades
export async function getActividades() {
  try {
    const res = await fetch(`${API_BASE}/public/actividades`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// Config pública (contacto / políticas básicas)
export async function getPublicConfig() {
  try {
    const res = await fetch(`${API_BASE}/config/public`);
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

// Newsletter
export async function postNewsletter(email) {
  try {
    const res = await fetch(`${API_BASE}/public/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const err = await res.json();
      return { ok: false, error: err.error || 'Error' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error de red' };
  }
}

export async function login({ email, password }) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Credenciales inválidas' };
    return { token: data.token, user: data.user };
  } catch (err) {
    return { error: 'Error de red' };
  }
}

export async function me(token) {
  try {
    const res = await fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'No autorizado' };
    return { user: data.user };
  } catch (err) {
    return { error: 'Error de red' };
  }
}

// Helper para fetch con token Authorization si existe
export function fetchAuth(url, opts = {}) {
  const token = auth.getToken();
  const headers = opts.headers ? { ...opts.headers } : {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { ...opts, headers });
}
