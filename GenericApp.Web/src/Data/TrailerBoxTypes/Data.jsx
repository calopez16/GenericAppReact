import createApiMethodsService from '@data/GenericApiMethods';
import { GET } from '@data/GenericApiCalls';
const moduleSource = "trailerboxtypes";

const dataMapper = (i, rowData) => {
    return rowData[i];
};

export const DataAPITrailerBoxTypesService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService
    };
};