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
        getDataPagination: (pageNumber = 1, pageSize = 10, searchTerm = "", idCompany = null, dateFrom = null, dateTo = null) => {
            let url = `${moduleSource}/pagination?pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}`;
            if (idCompany) url += `&idCompany=${idCompany}`;
            if (dateFrom) url += `&dateFrom=${dateFrom}`;
            if (dateTo) url += `&dateTo=${dateTo}`;
            return GET(url);
        },
        getEmployeePagination: (pageNumber = 1, pageSize = 10, searchTerm = "", idCompany = null, dateFrom = null, dateTo = null, showNoContract = false) => {
            let url = `${moduleSource}/employee-pagination?pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}`;
            if (idCompany) url += `&idCompany=${idCompany}`;
            if (dateFrom) url += `&dateFrom=${dateFrom}`;
            if (dateTo) url += `&dateTo=${dateTo}`;
            if (showNoContract) url += `&showNoContract=true`;
            return GET(url);
        },
        getPdfById: (id) => GET(`${moduleSource}/pdf/${id}`, { responseType: 'blob' }),
        getPreview: (data) => POST(`${moduleSource}/preview`, data, { responseType: 'blob' }),
        downloadZip: (ids) => POST(`${moduleSource}/download-zip`, ids, { responseType: 'blob' }),
    };
};
