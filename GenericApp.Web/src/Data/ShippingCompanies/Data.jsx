import createApiMethodsService from '@data/GenericApiMethods';
import { GET } from '@data/GenericApiCalls';
const moduleSource = "shipping-companies";

const dataMapper = (i, rowData) => {
    return rowData[i];
};

export const DataAPIShippingCompaniesService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService
    };
};