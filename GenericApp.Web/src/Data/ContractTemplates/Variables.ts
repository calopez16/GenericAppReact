export interface TemplateVariable {
    key: string;
    label: string;
    sample: string;
}

export const AVAILABLE_VARIABLES: TemplateVariable[] = [
    // -- Datos del trabajador --
    { key: "{{clave_trabajador}}",    label: "Clave del trabajador",              sample: "021058" },
    { key: "{{nombre}}",              label: "Nombre",                            sample: "VICTOR DANIEL ALVAREZ AYALA" },
    { key: "{{nacionalidad}}",        label: "Nacionalidad",                      sample: "MEXICANA" },
    { key: "{{edad}}",                label: "Edad",                              sample: "31" },
    { key: "{{sexo}}",                label: "Sexo",                              sample: "MASCULINO" },
    { key: "{{estado_civil}}",        label: "Estado civil",                      sample: "CASADO(A)" },
    { key: "{{curp}}",                label: "CURP",                              sample: "AAAV940403HGTLYC02" },
    { key: "{{rfc}}",                 label: "RFC",                               sample: "AAAV-940403-570" },
    { key: "{{num_afiliacion_imss}}", label: "Num. afiliacion IMSS",              sample: "12-10-94-1139-2" },
    { key: "{{domicilio}}",           label: "Domicilio",                         sample: "EJ. FRONTERIZO" },
    // -- Datos del contrato --
    { key: "{{puesto}}",              label: "Puesto",                            sample: "SORTEADORES" },
    { key: "{{turno}}",               label: "Turno",                             sample: "1.-DIURNO (8 HRS) (DIURNO)" },
    { key: "{{salario_diario_base}}", label: "Salario diario base",               sample: "440.87" },
    { key: "{{fecha_inicio}}",        label: "Fecha de inicio de temporada",      sample: "20/03/2026" },
    { key: "{{fecha_terminacion}}",   label: "Fecha de terminacion de temporada", sample: "30/04/2026" },
];

/**
 * Replaces every {{variable}} placeholder in an HTML string with its
 * corresponding sample value. Unknown variables are left untouched.
 */
export function applyPreviewData(html: string): string {
    let result = html;
    for (const variable of AVAILABLE_VARIABLES) {
        // Replace both the raw text form AND the atom-node rendered form
        result = result.replaceAll(variable.key, variable.sample);
        // Also replace the span that the TemplateVariable node renders
        const spanPattern = new RegExp(
            `<span[^>]*data-variable="${variable.key.replace(/[{}]/g, '\\$&')}"[^>]*>[^<]*<\\/span>`,
            'g'
        );
        result = result.replace(spanPattern, `<strong>${variable.sample}</strong>`);
    }
    return result;
}
