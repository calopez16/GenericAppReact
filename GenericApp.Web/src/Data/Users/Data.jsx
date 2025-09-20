import createApiMethodsService from '@data/GenericApiMethods';
import { GET, POST, PUT } from '@data/GenericApiCalls';

const moduleSource = "users";

const dataMapper = (i, rowData) => {
    return rowData;
};

export const DataAPIUsersService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService,
        getUsersPagination: (pageNumber = 1, pageSize = 10, searchTerm = "") => GET(`${moduleSource}/pagination?pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}`),
        getRoles: () => GET(`${moduleSource}/roles`),
        GetByUserName: (username) => GET(`${moduleSource}/username/${username}`),
        disableUser: (userId) => POST(`${moduleSource}/${userId}/disable`),
        enableUser: (userId) => POST(`${moduleSource}/${userId}/enable`),
        resetPassword: (userId, newPasswordData) => POST(`${moduleSource}/reset-password/${userId}`, newPasswordData),
    };
};