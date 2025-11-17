import createApiMethodsService from '@data/GenericApiMethods';
import { GET, POST, PUT } from '@data/GenericApiCalls';

const moduleSource = "parameters";

const dataMapper = (i, rowData) => {
    return rowData;
};

export const DataAPIParametersService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService,
        code: (code) => GET(`${moduleSource}/code/${code}`),
        setAppLogo: (image) => POST(`${moduleSource}/logo`, image),
        setLoginBackground: (image) => POST(`${moduleSource}/login-background`, image),
    };
};