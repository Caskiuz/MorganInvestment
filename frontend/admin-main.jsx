
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

createRoot(document.getElementById('root')).render(
	<BrowserRouter>
		<Routes>
			<Route path="/admin/login" element={<AdminLogin />} />
			<Route path="/admin" element={<AdminGuard><AdminReservas /></AdminGuard>} />
		</Routes>
	</BrowserRouter>
);
