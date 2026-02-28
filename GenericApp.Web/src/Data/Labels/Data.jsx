import createApiMethodsService from '@data/GenericApiMethods';
import { GET } from '@data/GenericApiCalls';
const moduleSource = "labels";

const dataMapper = (i, rowData) => {
    return rowData[i];
};

export const DataAPILabelsService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService,
        getActiveLabelTypes: () => GET(`${moduleSource}/labeltypes-active`),

    };
};