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
        getPagination: (pageNumber = 1, pageSize = 10, searchTerm = "") => GET(`${moduleSource}/pagination?pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}`),
        getManifestPdfById: (id) => GET(`${moduleSource}/manifest-pdf/${id}`, { responseType: 'blob' }),

    };
};