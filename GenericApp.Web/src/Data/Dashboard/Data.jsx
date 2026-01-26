import createApiMethodsService from '@data/GenericApiMethods';
import { GET, POST, PUT } from '@data/GenericApiCalls';

const moduleSource = "dashboard";

const dataMapper = (i, rowData) => {
    return rowData[i];
};

export const DataAPIDashboardService = () => {
    const genericService = createApiMethodsService(moduleSource, dataMapper);

    return {
        ...genericService,
        getEmbarquesTemporada: (idCompany) => GET(`${moduleSource}/${idCompany}/embarques-temporada`),
        getTotalCajasSemana: (idCompany) => GET(`${moduleSource}/${idCompany}/total-cajas-semana`),
        getUltimoViaje: (idCompany) => GET(`${moduleSource}/${idCompany}/ultimo-viaje`),
        getTemperaturaPromedio: (idCompany) => GET(`${moduleSource}/${idCompany}/temperatura-promedio`),
        getGraficaEmbarques: (idCompany) => GET(`${moduleSource}/${idCompany}/grafica-embarques`)
    };
};