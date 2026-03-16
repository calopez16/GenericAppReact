import React, { lazy, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@layout/Layout';
import { AppContext } from '@helpers/AppContext';

const LoginPage = lazy(() => import('@views/Auth/Login'));
const HomePage = lazy(() => import('@views/Home'));
const UsersPage = lazy(() => import('@views/Users'));
const CitiesPage = lazy(() => import('@views/Cities'));
const ClientsPage = lazy(() => import('@views/Clients'));
const CompaniesPage = lazy(() => import('@views/Companies'));
const ConsultationsPage = lazy(() => import('@views/Consultations/Index'));
const NewConsultationPage = lazy(() => import('@views/Consultations/NewConsultationPage'));
const ConsultationDetailPage = lazy(() => import('@views/Consultations/ConsultationDetailPage'));
const ClinicalHistoryPage = lazy(() => import('@views/ClinicalHistory/ClinicalHistoryPage'));
const NotFoundPage = lazy(() => import('@views/Pages/NotFound'));
const Parameters = lazy(() => import('@views/Parameters'));
const ConfigurationPage = lazy(() => import('@views/Configuration'));
const UnathorizePage = lazy(() => import('@views/Pages/Unauthorized'));

const ProtectedRoute = ({ roles, allowedUsers, children }) => {
    const { userRoles, userName } = useContext(AppContext);
    const userRoleList = Array.isArray(userRoles) ? userRoles.map(r => r.trim()) : [];
    const hasRoleAccess = roles?.some(r => userRoleList.includes(r));
    const hasUserAccess = allowedUsers?.includes(userName);
    return hasRoleAccess && hasUserAccess ? children : <Navigate to="/unauthorized" replace />;
};

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/parameters" element={<Parameters />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/cities" element={<CitiesPage />} />
                <Route path="/companies" element={<CompaniesPage />} />
                <Route path="/consultas" element={<ConsultationsPage />} />
                <Route path="/consultas/nueva" element={<NewConsultationPage />} />
                <Route path="/consultas/:id" element={<ConsultationDetailPage />} />
                <Route path="/historia-clinica/:clientId" element={<ClinicalHistoryPage />} />
                <Route path="/unauthorized" element={<UnathorizePage />} />
                <Route path="/configuration" element={
                    <ProtectedRoute roles={['Administrator']} allowedUsers={['admin']}>
                        <ConfigurationPage />
                    </ProtectedRoute>
                } />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

export default App;