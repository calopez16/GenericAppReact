import createApiMethodsService from '@data/GenericApiMethods';
import { GET, POST } from '@data/GenericApiCalls';

const moduleSource = "contracts";

const dataMapper = (i, rowData) => {
    return rowData[i];
};

export const DataAPIContractsService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService,
        getDataPagination: (pageNumber = 1, pageSize = 10, searchTerm = "", idCompany = null) => 
            GET(`${moduleSource}/pagination?pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}` + (idCompany ? `&idCompany=${idCompany}` : '')),
        getPdfById: (id) => GET(`${moduleSource}/pdf/${id}`, { responseType: 'blob' }),
        getPreview: (data) => POST(`${moduleSource}/preview`, data, { responseType: 'blob' }),
    };
};
