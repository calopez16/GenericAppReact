import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@layout/Layout';
import LoginPage from '@views/Auth/Login'
import HomePage from '@views/Home'
import UsersPage from '@views/Users'
import CitiesPage from '@views/Cities'
import ClientsPage from '@views/Clients'
import CompaniesPage from '@views/Companies'
import ShippingCompaniesPage from '@views/ShippingCompanies'
import DriversPage from '@views/Drivers'
import SeasonsPage from '@views/Seasons'
import LabelsPage from '@views/Labels'
import NotFoundPage from '@views/Pages/NotFound'
import Parameters from '@views/Parameters'
import ShipmentsPage from '@views/Shipments/Index';
import EmbarqueAddOrEdit from '@views/Shipments/ShipmentAddOrEdit';
import EmbarqueDetail from '@views/Shipments/ShipmentDetail';

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