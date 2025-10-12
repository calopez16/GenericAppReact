import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@layout/Layout';
import LoginPage from '@views/Auth/Login'
import HomePage from '@views/Home'
import UsersPage from '@views/Users'
import NotFoundPage from '@views/Pages/NotFound'
import Parameters from '@views/Parameters'
import EmbarquesList from '@views/Embarques/Index';
import EmbarqueAddOrEdit from '@views/Embarques/EmbarqueAddOrEdit';


function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/parameters" element={<Parameters />} />

                {/* Configuración para Embarques:
                  Usamos una ruta padre sin elemento para agrupar las rutas hijas.
                  Esto asegura que el componente <Layout> se mantenga para todas ellas.
                */}
                <Route path="/embarques">
                    {/* Ruta de Índice: Muestra la lista SOLO cuando la URL es exactamente /embarques
                      Se asume que tu componente Embarques es solo el LISTADO (renombrado a EmbarquesList)
                    */}
                    <Route index element={<EmbarquesList />} />

                    {/* Ruta para AGREGAR */}
                    <Route path="add" element={<EmbarqueAddOrEdit isEditing={false} />} />

                    {/* Ruta para EDITAR */}
                    <Route path="edit/:id" element={<EmbarqueAddOrEdit isEditing={true} />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

export default App;