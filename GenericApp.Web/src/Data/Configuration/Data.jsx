import createApiMethodsService from '@data/GenericApiMethods';
import { GET } from '@data/GenericApiCalls';

const moduleSource = "configuration";

const dataMapper = (i, rowData) => {
    return rowData[i];
};

export const DataAPIConfigurationService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService,
        getData: () => genericService.getAllData()
    };
};

export const getConfiguration = () => GET(moduleSource, true);

