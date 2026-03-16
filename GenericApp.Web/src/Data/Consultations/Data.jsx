import { GET, POST, PUT, DELETE } from '@data/GenericApiCalls';

const moduleSource = 'consultations';

export const DataAPIConsultationsService = () => ({
    getRecent: (pageNumber = 1, pageSize = 10, searchTerm = '', idCompany = null) => {
        let url = `${moduleSource}/recent?pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}`;
        if (idCompany) url += `&idCompany=${idCompany}`;
        return GET(url);
    },
    getByClientId: (clientId, pageNumber = 1, pageSize = 10) =>
        GET(`${moduleSource}/client/${clientId}?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    getById: (id) => GET(`${moduleSource}/${id}`),
    create: (data) => POST(moduleSource, data, true),
    update: (data) => PUT(moduleSource, data, true),
    delete: (id) => DELETE(`${moduleSource}/${id}`, null, true),
});

