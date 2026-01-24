import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@layout/Layout';

// --- Importaciones Dinámicas (Lazy Loading) ---
const LoginPage = lazy(() => import('@views/Auth/Login'));
const HomePage = lazy(() => import('@views/Home'));
const UsersPage = lazy(() => import('@views/Users'));
const CitiesPage = lazy(() => import('@views/Cities'));
const ClientsPage = lazy(() => import('@views/Clients'));
const CompaniesPage = lazy(() => import('@views/Companies'));
const ShippingCompaniesPage = lazy(() => import('@views/ShippingCompanies'));
const DriversPage = lazy(() => import('@views/Drivers'));
const SeasonsPage = lazy(() => import('@views/Seasons'));
const LabelsPage = lazy(() => import('@views/Labels'));
const NotFoundPage = lazy(() => import('@views/Pages/NotFound'));
const Parameters = lazy(() => import('@views/Parameters'));
const ShipmentsPage = lazy(() => import('@views/Shipments/Index'));
const EmbarqueAddOrEdit = lazy(() => import('@views/Shipments/ShipmentAddOrEdit'));
const EmbarqueDetail = lazy(() => import('@views/Shipments/ShipmentDetail'));
const UnathorizePage = lazy(() => import('@views/Pages/Unauthorized'));

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
                <Route path="/drivers" element={<DriversPage />} />
                <Route path="/shipping-companies" element={<ShippingCompaniesPage />} />
                <Route path="/labels" element={<LabelsPage />} />
                <Route path="/unauthorized" element={<UnathorizePage />} />

                <Route path="/shipments">
                    <Route index element={<ShipmentsPage />} />
                    <Route path="add" element={<EmbarqueAddOrEdit isEditing={false} />} />
                    <Route path="edit/:id" element={<EmbarqueAddOrEdit isEditing={true} />} />
                    <Route path="details/:id" element={<EmbarqueDetail />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

export default App;