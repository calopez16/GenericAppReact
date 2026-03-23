import { GET, POST, PUT, DELETE } from '@data/GenericApiCalls';

const moduleSource = 'medical-records';

export const DataAPIMedicalRecordsService = () => ({
    getByClientId: (clientId) => GET(`${moduleSource}/client/${clientId}`),
    getAllergyCatalog: () => GET(`${moduleSource}/allergies/catalog`),
    create: (data) => POST(moduleSource, data, true),
    update: (data, consultationId) => PUT(consultationId ? `${moduleSource}?consultationId=${consultationId}` : moduleSource, data, true),

    addSurgery: (medicalRecordId, data, consultationId) => POST(consultationId ? `${moduleSource}/${medicalRecordId}/surgeries?consultationId=${consultationId}` : `${moduleSource}/${medicalRecordId}/surgeries`, data, true),
    deleteSurgery: (medicalRecordId, surgeryId) => DELETE(`${moduleSource}/${medicalRecordId}/surgeries/${surgeryId}`, null, true),

    addAllergy: (medicalRecordId, data, consultationId) => POST(consultationId ? `${moduleSource}/${medicalRecordId}/allergies?consultationId=${consultationId}` : `${moduleSource}/${medicalRecordId}/allergies`, data, true),
    deleteAllergy: (medicalRecordId, allergyId) => DELETE(`${moduleSource}/${medicalRecordId}/allergies/${allergyId}`, null, true),

    addDisease: (medicalRecordId, data, consultationId) => POST(consultationId ? `${moduleSource}/${medicalRecordId}/diseases?consultationId=${consultationId}` : `${moduleSource}/${medicalRecordId}/diseases`, data, true),
    updateDisease: (medicalRecordId, diseaseId, data, consultationId) => PUT(consultationId ? `${moduleSource}/${medicalRecordId}/diseases/${diseaseId}?consultationId=${consultationId}` : `${moduleSource}/${medicalRecordId}/diseases/${diseaseId}`, data, true),
    deleteDisease: (medicalRecordId, diseaseId) => DELETE(`${moduleSource}/${medicalRecordId}/diseases/${diseaseId}`, null, true),

    getBloodPressureHistory: (medicalRecordId) => GET(`${moduleSource}/${medicalRecordId}/blood-pressure`),
    addBloodPressureRecord: (medicalRecordId, data, consultationId) => POST(consultationId ? `${moduleSource}/${medicalRecordId}/blood-pressure?consultationId=${consultationId}` : `${moduleSource}/${medicalRecordId}/blood-pressure`, data, true),

    addNote: (medicalRecordId, data, consultationId) => POST(consultationId ? `${moduleSource}/${medicalRecordId}/notes?consultationId=${consultationId}` : `${moduleSource}/${medicalRecordId}/notes`, data, true),
});
