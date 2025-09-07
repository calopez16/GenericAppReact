import createApiMethodsService from '@data/GenericApiMethods';
import { GET, POST } from '@data/Data/GenericApiCalls';

const moduleSource = "Auth";

const dataMapper = (item) => item;

export const AuthenticationAPIService = (apiUrl) => {
    const genericService = createApiMethodsService(apiUrl, moduleSource, dataMapper);

    return {
        ...genericService,
        authenticate: () => POST(apiUrl, `${moduleSource}/login`),
        refreshToken: () => GET(apiUrl, `${moduleSource}/refresh-token`),
    };
};