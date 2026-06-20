export const AVAILABLE_VARIABLES = [
    // Employee variables
    { key: 'employeeName', label: 'Nombre Empleado', sample: 'Juan Pérez García' },
    { key: 'employeeId', label: 'ID Empleado', sample: '12345' },
    { key: 'position', label: 'Cargo', sample: 'Desarrollador Senior' },
    { key: 'rfc', label: 'RFC', sample: 'PEGJ800101XXX' },
    { key: 'curp', label: 'CURP', sample: 'PEGJ800101HDFRNN09' },
    { key: 'imss', label: 'IMSS', sample: '12345678901' },
    { key: 'address', label: 'Dirección', sample: 'Calle Principal #123, Col. Centro' },
    { key: 'birthDate', label: 'Fecha Nacimiento', sample: '01/01/1980' },
    { key: 'genre', label: 'Género', sample: 'Masculino' },
    { key: 'civilStatus', label: 'Estado Civil', sample: 'Casado' },

    // Company variables
    { key: 'companyName', label: 'Nombre Empresa', sample: 'Mi Empresa S.A. de C.V.' },
    { key: 'companyRFC', label: 'RFC Empresa', sample: 'EMP850101XXX' },
    { key: 'companyAddress', label: 'Dirección Empresa', sample: 'Av. Reforma #456, CDMX' },
    { key: 'razonSocial', label: 'Razón Social', sample: 'Mi Empresa Sociedad Anónima de Capital Variable' },

    // Date variables
    { key: 'currentDate', label: 'Fecha Actual', sample: new Date().toLocaleDateString('es-ES') },
    { key: 'currentYear', label: 'Año Actual', sample: new Date().getFullYear().toString() },
];

export const applyPreviewData = (htmlContent) => {
    if (!htmlContent) return '';

    let result = htmlContent;
    AVAILABLE_VARIABLES.forEach(variable => {
        const regex = new RegExp(`{{\\s*${variable.key}\\s*}}`, 'gi');
        result = result.replace(regex, `<span style="background-color: #e3f2fd; padding: 2px 6px; border-radius: 3px; font-weight: 600;">${variable.sample}</span>`);
    });

    return result;
};

export const applyRealData = (htmlContent, data) => {
    if (!htmlContent || !data) return htmlContent;

    let result = htmlContent;
    Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
        result = result.replace(regex, data[key] || '');
    });

    return result;
};
