import React, { useState } from "react";
import { login, register } from '../services/api';
import auth from '../utils/auth';


const AuthForm = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const res = await login({ email: form.email, password: form.password });
        if (res.token) {
          auth.setToken(res.token);
          auth.setUser(res.user);
          onClose && onClose();
        } else {
          setError(res.error || 'Credenciales incorrectas');
        }
      } else {
        const res = await register({ name: form.name, email: form.email, password: form.password });
        if (res.token) {
          auth.setToken(res.token);
          auth.setUser(res.user);
          onClose && onClose();
        } else {
          setError(res.error || 'No se pudo registrar');
        }
      }
    } catch (err) {
      setError('Error de red o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-center mb-4">
        <button
          className={`px-4 py-2 ${isLogin ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-l`}
          onClick={() => { setIsLogin(true); setError(''); }}
        >
          Iniciar Sesión
        </button>
        <button
          className={`px-4 py-2 ${!isLogin ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-r`}
          onClick={() => { setIsLogin(false); setError(''); }}
        >
          Registrarse
        </button>
      </div>
      {error && <div className="text-red-600 text-center mb-2">{error}</div>}
      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isLogin && (
          <input className="w-full border p-2 rounded" name="name" type="text" placeholder="Nombre" value={form.name} onChange={handleChange} required />
        )}
        <input className="w-full border p-2 rounded" name="email" type="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} required />
        <input className="w-full border p-2 rounded" name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
        <button
          className={`w-full py-2 rounded ${isLogin ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}
          type="submit"
          disabled={loading}
        >
          {loading ? (isLogin ? 'Entrando...' : 'Registrando...') : (isLogin ? 'Entrar' : 'Registrarse')}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
