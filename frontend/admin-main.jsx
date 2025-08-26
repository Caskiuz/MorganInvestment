
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AdminReservas from './src/pages/admin/Reservas';
import './src/index.css';

createRoot(document.getElementById('root')).render(
	<BrowserRouter>
		<AdminReservas />
	</BrowserRouter>
);
