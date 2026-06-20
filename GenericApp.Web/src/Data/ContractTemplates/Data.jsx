import createApiMethodsService from '@data/GenericApiMethods';
import { GET } from '@data/GenericApiCalls';

const moduleSource = "contract-templates";

const dataMapper = (i, rowData) => {
    return rowData[i];
};

export const DataAPIContractTemplatesService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService,
        getPdfById: (id, idCompany) => GET(`${moduleSource}/pdf/${id}${idCompany ? `?idCompany=${idCompany}` : ''}`, { responseType: 'blob' }),
        getVariables: () => GET(`${moduleSource}/variables`),
    };
};

