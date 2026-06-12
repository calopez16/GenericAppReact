import createApiMethodsService from '@data/GenericApiMethods';
import { GET, POST, PUT, DELETE } from '@data/GenericApiCalls';

const moduleSource = "employees";

const dataMapper = (i, rowData) => {
    return rowData;
};

export const DataAPIEmployeesService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService,
        getEmployeesPagination: (idCompany, pageNumber = 1, pageSize = 10, searchTerm = "") =>
            GET(`${moduleSource}/pagination?idCompany=${idCompany}&pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}`),
        getEmployeeById: (id) => GET(`${moduleSource}/${id}`),
        addEmployee: (data) => POST(`${moduleSource}`, data, true),
        updateEmployee: (data) => PUT(`${moduleSource}`, data, true),
        disableEmployee: (id) => PUT(`${moduleSource}/disable/${id}`),
        enableEmployee: (id) => PUT(`${moduleSource}/enable/${id}`),
        deleteEmployee: (id) => DELETE(`${moduleSource}/${id}`),
        getRelationshipTypes: () => GET(`${moduleSource}/relationship-types`),
        addRelationshipType: (data) => POST(`${moduleSource}/relationship-types`, data, true),
        uploadExcel: (formData) => POST(`${moduleSource}/upload-excel`, formData, true),
        importExcel: (data) => POST(`${moduleSource}/import-excel`, data),
    };
};
