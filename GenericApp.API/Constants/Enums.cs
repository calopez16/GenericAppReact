namespace GenericApp.API.Constants
{
    public enum AppPolicies
    {
        User,
        IsDisabled,
        IsChangePasswordNeeded
    }

    public enum AppRoles
    {
        Administrator,
        User,
        MultiEmpresa
    }

    public enum ShipmentsStatus
    {
        Activa = 1,
        Concluida = 2
    }

    public enum ManifestStatusEnum
    {
        Activa = 1,
        Concluida = 2
    }

    public enum ContractTemplateVariablesEnum
    {
        nombreEmpresa,
        fechaActualContrato,
        clave,
        nombre,
        nacionalidad,
        edad,
        sexo,
        estadoCivil,
        curp,
        rfc,
        numeroAfiliacionImss,
        domicilio,
        puesto,
        turno,
        salarioDiarioBase,
        fechaInicioContrato,
        fechaTerminacionContrato,
        fechaActualFormatoCorto,
        fechaActualFormatoLargo,
        firmaContrato,
        Beneficiario1,
        Beneficiario1_Domicilio,
        Beneficiario1_FechaNacimiento,
        Beneficiario1_Telefono,
        Beneficiario1_Percentage,
        Beneficiario2,
        Beneficiario2_Domicilio,
        Beneficiario2_FechaNacimiento,
        Beneficiario2_Telefono,
        Beneficiario2_Percentage,
        Beneficiario3,
        Beneficiario3_Domicilio,
        Beneficiario3_FechaNacimiento,
        Beneficiario3_Telefono,
        Beneficiario3_Percentage,
        Beneficiario4,
        Beneficiario4_Domicilio,
        Beneficiario4_FechaNacimiento,
        Beneficiario4_Telefono,
        Beneficiario4_Percentage
    }
}
