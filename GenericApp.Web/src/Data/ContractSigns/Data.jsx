import createApiMethodsService from '@data/GenericApiMethods';
import { GET } from '@data/GenericApiCalls';

const moduleSource = "contracts-signs";

const dataMapper = (i, rowData) => {
    return rowData[i];
};

export const DataAPIContractSignsService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService,
    };
};
