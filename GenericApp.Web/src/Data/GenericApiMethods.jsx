import { GET, POST, PUT, DELETE } from '@data/Data/GenericApiCalls';

const createApiMethodsService = (moduleSource, rowMapper) => ({
    addData: (data, isReturnData = false) => POST(moduleSource, data, isReturnData),
    editData: (data, isReturnData = false) => PUT(moduleSource, data, isReturnData),
    deleteData: (id, isReturnData = false) => DELETE(`${moduleSource}/${id}`, null, isReturnData),
    getDataById: (id) => GET(`${moduleSource}/${id}`),
    getAllData: () => GET(moduleSource),
    getDataActive: (id) => GET(`${moduleSource}/active`)
});

export default createApiMethodsService;