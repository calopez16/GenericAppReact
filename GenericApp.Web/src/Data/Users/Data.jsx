import GenericApiService from '../GenericApiMethods';
import { GET, POST } from '../GenericApiCalls';
import { useAppContext } from '../../config/AppContext';

const moduleSource = "users";

const dataMapper = (i, rowData) => {
    return {
        "id": rowData[i]["idUser"],
        "employeeNumber": rowData[i]["employeeNumber"],
        "fullName": rowData[i]["fullName"],
        "userName": rowData[i]["userName"],
        "sid": rowData[i]["sid"],
        "email": rowData[i]["email"],
        "active": rowData[i]["active"],
        "idRole": rowData[i]["idRole"],
        "roleDescription": rowData[i]["roleDescription"],
    };
};

class DataAPIService extends GenericApiService {
    constructor(apiUrl) {
        super(apiUrl, moduleSource, dataMapper);
        this.apiUrl = apiUrl;
    }

    async GetByUserName(username) {
        return await GET(this.apiUrl, `${this.moduleSource}/username/${username}`);
    }

    async GetADByUserName(username) {
        return await GET(this.apiUrl, `${this.moduleSource}/ad-user/${username}`);
    }
}

export const DataAPIServices = () => {
    const { apiUrl } = useAppContext(); // Use the hook to get apiUrl
    return new DataAPIService(apiUrl);
};