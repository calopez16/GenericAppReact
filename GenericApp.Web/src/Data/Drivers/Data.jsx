import createApiMethodsService from '@data/GenericApiMethods';
import { GET } from '@data/GenericApiCalls';
const moduleSource = "drivers";

const dataMapper = (i, rowData) => {
    return rowData[i];
};

export const DataAPIDriversService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService
    };
};