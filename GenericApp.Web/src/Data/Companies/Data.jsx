import createApiMethodsService from '@data/GenericApiMethods';

const moduleSource = "companies";

const dataMapper = (i, rowData) => {
    return rowData[i];
};

export const DataAPICompaniesService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService
    };
};