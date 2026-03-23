import createApiMethodsService from '@data/GenericApiMethods';
import { GET } from '@data/GenericApiCalls';

const moduleSource = "clients";

const dataMapper = (i, rowData) => {
    return rowData[i];
};

export const DataAPIClientsService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService,
        getCatalogOptions: () => GET(`${moduleSource}/catalog-options`)
    };
};