import createApiMethodsService from '@data/GenericApiMethods';
import { GET,PUT } from '@data/GenericApiCalls';
const moduleSource = "seasons";

const dataMapper = (i, rowData) => {
    return rowData[i];
};

export const DataAPISeasonsService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService,
        close: (dataId) => PUT(`${moduleSource}/close/${dataId}`),
        open: (dataId) => PUT(`${moduleSource}/open/${dataId}`)
    };
};