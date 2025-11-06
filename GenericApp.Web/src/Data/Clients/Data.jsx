import createApiMethodsService from '@data/GenericApiMethods';

const moduleSource = "clients";

const dataMapper = (i, rowData) => {
    return rowData[i];
};

export const DataAPIClientsService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService
    };
};