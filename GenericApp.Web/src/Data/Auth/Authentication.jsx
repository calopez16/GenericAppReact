import createApiMethodsService from '@data/GenericApiMethods';
import { GET, POST } from '@data/GenericApiCalls';

const moduleSource = "Auth";
const dataMapper = (item) => item;

export const AuthenticationAPIService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService,
        authenticate: (credentials) => POST(`${moduleSource}/login`, credentials, true),
        refreshToken: () => GET(`${moduleSource}/refresh-token`),
        passwordRestart: (data) => POST(`${moduleSource}/pass-restart`, data, true),
    };
};