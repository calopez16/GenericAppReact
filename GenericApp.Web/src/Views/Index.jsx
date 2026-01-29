import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@layout/Layout';

// --- Importaciones Dinámicas (Lazy Loading) ---
const LoginPage = lazy(() => import('@views/Auth/Login'));
const HomePage = lazy(() => import('@views/Home'));
const UsersPage = lazy(() => import('@views/Users'));
const NotFoundPage = lazy(() => import('@views/Pages/NotFound'));
const UnathorizePage = lazy(() => import('@views/Pages/Unauthorized'));

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/unauthorized" element={<UnathorizePage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

export default App;