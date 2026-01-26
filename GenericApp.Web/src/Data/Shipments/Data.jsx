import createApiMethodsService from '@data/GenericApiMethods';
import { GET, POST, PUT } from '@data/GenericApiCalls';

const moduleSource = "shipments";

const dataMapper = (i, rowData) => {
    return rowData;
};

export const dataApiShipmentsService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService,
        getDataCompanyPagination: (idCompany, pageNumber = 1, pageSize = 10, searchTerm = "") => GET(`${moduleSource}/${idCompany}/pagination?pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}`),
        getManifestPdfById: (id) => GET(`${moduleSource}/manifest-pdf/${id}`, { responseType: 'blob' }),
        getRemisionPdfById: (id) => GET(`${moduleSource}/remision-pdf/${id}`, { responseType: 'blob' }),
        getBitacoraSellosPdfById: (id,horaCierre) => GET(`${moduleSource}/bitacora-pdf/${id}/${horaCierre}`, { responseType: 'blob' }),

    };
};