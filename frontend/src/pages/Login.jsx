import React from 'react';
import { login, register } from '../services/api';
import auth from '../utils/auth';

export default function Login() {
  const [mode, setMode] = React.useState('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = (mode === 'login') ? await login({ email, password }) : await register({ name, email, password });
      if (data.error) { setError(data.error); setLoading(false); return; }
      if (data.token) {
        auth.setToken(data.token);
        auth.setUser(data.user);
        window.dispatchEvent(new Event('authChanged'));
      }
    } catch (e) {
      setError('Error de red');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold mb-4 text-center">{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h2>
      <form onSubmit={submit} className="space-y-3 bg-white p-6 rounded shadow">
        {mode === 'register' && (
          <input className="w-full p-2 border rounded" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
        )}
        <input className="w-full p-2 border rounded" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 border rounded" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex gap-2">
          <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Procesando...' : (mode === 'login' ? 'Entrar' : 'Registrar')}</button>
          <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="bg-gray-200 px-4 py-2 rounded">{mode === 'login' ? 'Crear cuenta' : 'Ir a login'}</button>
        </div>
      </form>
    </div>
  );
}
