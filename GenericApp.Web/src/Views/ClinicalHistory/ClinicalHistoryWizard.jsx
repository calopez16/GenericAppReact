import React, { useState, useEffect } from 'react';
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    Paper,
    CircularProgress,
    Avatar,
    Divider,
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import { DataAPIMedicalRecordsService } from '@data/MedicalRecords/Data';
import { DataAPIConsultationsService } from '@data/Consultations/Data';

import PatientProfileSection from './Sections/PatientProfileSection';
import PathologicalHistorySection from './Sections/PathologicalHistorySection';
import NonPathologicalHistorySection from './Sections/NonPathologicalHistorySection';
import ConsultationSection from './Sections/ConsultationSection';

const ClinicalHistoryWizard = ({ client, onClose }) => {
    const { t } = useTranslation();
    const medicalRecordsService = DataAPIMedicalRecordsService();
    const consultationsService = DataAPIConsultationsService();

    const [activeStep, setActiveStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const [medicalRecord, setMedicalRecord] = useState(null);
    const [consultations, setConsultations] = useState([]);
    const [totalConsultations, setTotalConsultations] = useState(0);

    const [medicalFormData, setMedicalFormData] = useState({
        idMedicalRecord: null,
        idClient: client?.idClient ?? 0,
        bloodType: '',
        smokingHabit: '',
        alcoholHabit: '',
        drugHabit: '',
        bloodPressure: '',
        isPregnant: false,
        pregnancyMonths: '',
        diabetesStatus: '',
        diabetesNotes: '',
        cancerStatus: '',
        cancerNotes: '',
    });

    const steps = [
        t('ch_step_profile'),
        t('ch_step_pathological'),
        t('ch_step_nonpathological'),
        t('ch_step_consultation'),
    ];

    useEffect(() => {
        if (client?.idClient) {
            loadData();
        }
    }, [client?.idClient]);

    const loadData = async () => {
        setIsFetching(true);
        try {
            const [mrRes, consRes] = await Promise.all([
                medicalRecordsService.getByClientId(client.idClient),
                consultationsService.getByClientId(client.idClient, 1, 5),
            ]);

            if (mrRes.success && mrRes.data) {
                const mr = mrRes.data;
                setMedicalRecord(mr);
                setMedicalFormData({
                    idMedicalRecord: mr.idMedicalRecord,
                    idClient: client.idClient,
                    bloodType: mr.bloodType ?? '',
                    smokingHabit: mr.smokingHabit ?? '',
                    alcoholHabit: mr.alcoholHabit ?? '',
                    drugHabit: mr.drugHabit ?? '',
                    bloodPressure: mr.bloodPressure ?? '',
                    isPregnant: mr.isPregnant ?? false,
                    pregnancyMonths: mr.pregnancyMonths ?? '',
                    diabetesStatus: mr.diabetesStatus ?? '',
                    diabetesNotes: mr.diabetesNotes ?? '',
                    cancerStatus: mr.cancerStatus ?? '',
                    cancerNotes: mr.cancerNotes ?? '',
                });
            }

            if (consRes.success && consRes.data) {
                setConsultations(consRes.data.data ?? []);
                setTotalConsultations(consRes.data.totalCount ?? 0);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsFetching(false);
        }
    };

    const handleSaveMedicalRecord = async () => {
        setIsLoading(true);
        try {
            let res;
            const payload = {
                ...medicalFormData,
                pregnancyMonths: medicalFormData.pregnancyMonths !== '' ? parseInt(medicalFormData.pregnancyMonths) : null,
            };

            if (medicalFormData.idMedicalRecord) {
                res = await medicalRecordsService.update(payload);
            } else {
                res = await medicalRecordsService.create(payload);
            }

            if (res.success) {
                if (!medicalFormData.idMedicalRecord && res.data?.idMedicalRecord) {
                    setMedicalFormData(prev => ({ ...prev, idMedicalRecord: res.data.idMedicalRecord }));
                    setMedicalRecord(res.data);
                }
                ShowMessage(t('recordEditedSuccessPlural'), 'success');
                return true;
            } else {
                ShowMessage(t('error'), 'error');
                return false;
            }
        } catch (e) {
            ShowMessage(t('error'), 'error');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = async () => {
        if (activeStep === 1 || activeStep === 2) {
            const saved = await handleSaveMedicalRecord();
            if (!saved) return;
        }
        setActiveStep(prev => prev + 1);
    };

    const handleBack = () => setActiveStep(prev => prev - 1);

    if (isFetching) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, borderRadius: 2 }}>
                    <MedicalServicesIcon />
                </Avatar>
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        {t('ch_title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {client?.name}
                    </Typography>
                </Box>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Paper elevation={1} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                {activeStep === 0 && (
                    <PatientProfileSection client={client} />
                )}
                {activeStep === 1 && (
                    <PathologicalHistorySection
                        medicalRecord={medicalRecord}
                        medicalFormData={medicalFormData}
                        setMedicalFormData={setMedicalFormData}
                        onReload={loadData}
                    />
                )}
                {activeStep === 2 && (
                    <NonPathologicalHistorySection
                        medicalFormData={medicalFormData}
                        setMedicalFormData={setMedicalFormData}
                    />
                )}
                {activeStep === 3 && (
                    <ConsultationSection
                        client={client}
                        consultations={consultations}
                        setConsultations={setConsultations}
                        totalConsultations={totalConsultations}
                        setTotalConsultations={setTotalConsultations}
                    />
                )}
            </Paper>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    onClick={activeStep === 0 ? onClose : handleBack}
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    disabled={isLoading}
                >
                    {activeStep === 0 ? t('cancel') : t('back')}
                </Button>

                {activeStep < steps.length - 1 ? (
                    <Button
                        onClick={handleNext}
                        variant="contained"
                        endIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />}
                        disabled={isLoading}
                        disableElevation
                    >
                        {t('next')}
                    </Button>
                ) : (
                    <Button
                        onClick={onClose}
                        variant="contained"
                        endIcon={<SaveIcon />}
                        disableElevation
                    >
                        {t('close')}
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default ClinicalHistoryWizard;
