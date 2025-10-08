import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@layout/Layout';
import LoginPage from '@views/Auth/Login'
import HomePage from '@views/Home'
import UsersPage from '@views/Users'
import NotFoundPage from '@views/Pages/NotFound'
import Parameters from '@views/Parameters'
import Embarques from '@views/Embarques'

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/parameters" element={<Parameters />} />
                <Route path="/embarques" element={<Embarques />} />
                {/*<Route path="/perfil" element={<ProfilePage />} />*/}
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

export default App;