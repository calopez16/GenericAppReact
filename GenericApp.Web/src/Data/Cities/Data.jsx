import createApiMethodsService from '@data/GenericApiMethods';

const moduleSource = "cities";

const dataMapper = (i, rowData) => {
    return rowData[i];
};

export const DataAPICitiesService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService
    };
};