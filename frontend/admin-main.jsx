
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminReservas from './src/pages/admin/Reservas';
import AdminLogin from './src/pages/admin/AdminLogin';
import auth from './src/utils/auth';
import './src/index.css';

function AdminGuard({ children }) {
	const isAuth = auth.isAuthenticated();
	const user = auth.getUser();
	if (!isAuth || user?.role !== 'admin') return <Navigate to="/admin/login" replace />;
	return children;
}

// Si el archivo se sirve como /admin.html (por ejemplo al abrir admin.html directamente),
// normalizamos la URL a /admin para que react-router encuentre la ruta correcta.
if (typeof window !== 'undefined' && window.location && window.location.pathname && window.location.pathname.includes('admin.html')) {
	window.history.replaceState({}, '', '/admin');
}

createRoot(document.getElementById('root')).render(
	<BrowserRouter>
		<Routes>
			<Route path="/admin/login" element={<AdminLogin />} />
			<Route path="/admin" element={<AdminGuard><AdminReservas /></AdminGuard>} />
			<Route path="/" element={<AdminGuard><AdminReservas /></AdminGuard>} />
		</Routes>
	</BrowserRouter>
);
