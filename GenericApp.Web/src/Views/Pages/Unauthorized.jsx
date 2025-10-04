import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@layout/Layout';
import LoginPage from '@views/Auth/Login'
import HomePage from '@views/Home'
import UsersPage from '@views/Users'

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/users" element={<UsersPage />} />
                {/*<Route path="/perfil" element={<ProfilePage />} />*/}
                {/*<Route path="/configuracion" element={<SettingsPage />} />*/}
            </Route>
        </Routes>
    );
}

export default App;