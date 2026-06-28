import React, { lazy, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@layout/Layout';
import { AppContext } from '@helpers/AppContext';

// --- Importaciones Dinámicas (Lazy Loading) ---
const LoginPage = lazy(() => import('@views/Auth/Login'));
const HomePage = lazy(() => import('@views/Home'));
const UsersPage = lazy(() => import('@views/Users'));
const CitiesPage = lazy(() => import('@views/Cities'));
const ClientsPage = lazy(() => import('@views/Clients'));
const CompaniesPage = lazy(() => import('@views/Companies'));
const SeasonsPage = lazy(() => import('@views/Seasons'));
const LabelsPage = lazy(() => import('@views/Labels'));
const TrailerBoxTypesPage = lazy(() => import('@views/TrailerBoxTypes'));
const NotFoundPage = lazy(() => import('@views/Pages/NotFound'));
const Parameters = lazy(() => import('@views/Parameters'));
const ConfigurationPage = lazy(() => import('@views/Configuration'));
const UnathorizePage = lazy(() => import('@views/Pages/Unauthorized'));
const ContractTemplatesPage = lazy(() => import('@views/ContractTemplates/Index'));
const ContractSignsPage = lazy(() => import('@views/ContractSigns/Index'));
const EmployeesPage = lazy(() => import('@views/Employees/Index'));
const ContractsPage = lazy(() => import('@views/Contracts/Index'));

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
                <Route path="/seasons" element={<SeasonsPage />} />
                <Route path="/labels" element={<LabelsPage />} />
                <Route path="/trailerboxtypes" element={<TrailerBoxTypesPage />} />
                <Route path="/contract-templates" element={<ContractTemplatesPage />} />
                <Route path="/contract-signs" element={<ContractSignsPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/contracts" element={<ContractsPage />} />
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