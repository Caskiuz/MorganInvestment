// Pequeñas utilidades para auth en frontend (guardar token, user, verificar)
export default {
  setToken(token) { localStorage.setItem('auth_token', token); },
  getToken() { return localStorage.getItem('auth_token'); },
  setUser(user) { localStorage.setItem('user_data', JSON.stringify(user)); window.dispatchEvent(new Event('authChanged')); },
  getUser() { try { return JSON.parse(localStorage.getItem('user_data')); } catch(e) { return null; } },
  clear() { localStorage.removeItem('auth_token'); localStorage.removeItem('user_data'); window.dispatchEvent(new Event('authChanged')); },
  isAuthenticated() { return !!localStorage.getItem('auth_token'); }
};
