import React from 'react';
import AuthForm from '../../components/AuthForm';
import auth from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  React.useEffect(() => {
    function onAuth() {
      if (auth.isAuthenticated() && auth.getUser()?.role === 'admin') navigate('/admin');
    }
    window.addEventListener('authChanged', onAuth);
    onAuth();
    return () => window.removeEventListener('authChanged', onAuth);
  }, []);

  return (
    <section className="max-w-md mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold mb-4">Login Admin</h2>
      <AuthForm onClose={() => { if (auth.isAuthenticated()) window.location.href = '/admin'; }} />
    </section>
  );
}
