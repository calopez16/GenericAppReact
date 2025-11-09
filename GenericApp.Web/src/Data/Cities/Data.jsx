import createApiMethodsService from '@data/GenericApiMethods';
import { GET } from '@data/GenericApiCalls';
const moduleSource = "cities";

const dataMapper = (i, rowData) => {
    return rowData[i];
};

export const DataAPICitiesService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService,
        getStatesPagination: (pageNumber = 1, pageSize = 10, searchTerm = "", idCountry = null) => GET(`${moduleSource}/pagination-states?pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}` + (idCountry ? `&idCountry=${idCountry}` : '')),
        getCountriesActive: () => GET(`${moduleSource}/countries`)
    };
};