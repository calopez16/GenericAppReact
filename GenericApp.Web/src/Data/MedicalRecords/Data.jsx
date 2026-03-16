import { GET, POST, PUT, DELETE } from '@data/GenericApiCalls';

const moduleSource = 'medical-records';

export const DataAPIMedicalRecordsService = () => ({
    getByClientId: (clientId) => GET(`${moduleSource}/client/${clientId}`),
    create: (data) => POST(moduleSource, data, true),
    update: (data) => PUT(moduleSource, data, true),

    addSurgery: (medicalRecordId, data) => POST(`${moduleSource}/${medicalRecordId}/surgeries`, data, true),
    deleteSurgery: (medicalRecordId, surgeryId) => DELETE(`${moduleSource}/${medicalRecordId}/surgeries/${surgeryId}`, null, true),

    addAllergy: (medicalRecordId, data) => POST(`${moduleSource}/${medicalRecordId}/allergies`, data, true),
    deleteAllergy: (medicalRecordId, allergyId) => DELETE(`${moduleSource}/${medicalRecordId}/allergies/${allergyId}`, null, true),

    addDisease: (medicalRecordId, data) => POST(`${moduleSource}/${medicalRecordId}/diseases`, data, true),
    updateDisease: (medicalRecordId, diseaseId, data) => PUT(`${moduleSource}/${medicalRecordId}/diseases/${diseaseId}`, data, true),
    deleteDisease: (medicalRecordId, diseaseId) => DELETE(`${moduleSource}/${medicalRecordId}/diseases/${diseaseId}`, null, true),
});
