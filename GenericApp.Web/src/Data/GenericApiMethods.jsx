import { GET, POST, PUT, DELETE } from '@data/GenericApiCalls';

const createApiMethodsService = (moduleSource, rowMapper) => ({
    addData: (data, isReturnData = false) => POST(moduleSource, data, isReturnData),
    editData: (data, isReturnData = false) => PUT(moduleSource, data, isReturnData),
    deleteData: (id, isReturnData = false) => DELETE(`${moduleSource}/${id}`, null, isReturnData),
    getDataById: (id) => GET(`${moduleSource}/${id}`),
    getAllData: () => GET(moduleSource),
    getDataActive: () => GET(`${moduleSource}/active`),
    getDataPagination: (pageNumber = 1, pageSize = 10, searchTerm = "", active = null) => GET(`${moduleSource}/pagination?pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}` + (active ? `&active=${active}` : '')),
    disableData: (dataId) => PUT(`${moduleSource}/disable/${dataId}`),
    enableData: (dataId) => PUT(`${moduleSource}/enable/${dataId}`)

});

export default createApiMethodsService;