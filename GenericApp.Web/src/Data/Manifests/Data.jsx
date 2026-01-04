import createApiMethodsService from '@data/GenericApiMethods';
import { GET, POST, PUT } from '@data/GenericApiCalls';

const moduleSource = "manifests";

const dataMapper = (i, rowData) => {
    return rowData;
};

export const dataApiManifestsService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService
    };
};