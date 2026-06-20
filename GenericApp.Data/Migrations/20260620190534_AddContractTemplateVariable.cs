using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddContractTemplateVariable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContractTemplateVariables",
                columns: table => new
                {
                    IdContractTemplateVariable = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: true),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractTemplateVariables", x => x.IdContractTemplateVariable);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEIolJZBvZf9WI9MCcqkoeSkY9BCvU6giNN+zTvevpHa0FJJBVrswEgXiw6wJ4Hdk0w==");

            migrationBuilder.InsertData(
                table: "ContractTemplateVariables",
                columns: new[] { "IdContractTemplateVariable", "Code", "Description", "IsActive", "IsDeleted", "Type" },
                values: new object[,]
                {
                    { 1, "nombreEmpresa", "Nombre de la empresa", true, false, "string" },
                    { 2, "fechaActual", "Fecha actual", true, false, "DateTime" },
                    { 3, "clave", "Clave", true, false, "string" },
                    { 4, "nombre", "Nombre", true, false, "string" },
                    { 5, "nacionalidad", "Nacionalidad", true, false, "string" },
                    { 6, "edad", "Edad", true, false, "int" },
                    { 7, "sexo", "Sexo", true, false, "string" },
                    { 8, "estadoCivil", "Estado Civil", true, false, "string" },
                    { 9, "curp", "CURP", true, false, "string" },
                    { 10, "rfc", "RFC", true, false, "string" },
                    { 11, "numeroAfiliacionImss", "Número de Afiliación IMSS", true, false, "string" },
                    { 12, "domicilio", "Domicilio", true, false, "string" },
                    { 13, "puesto", "Puesto", true, false, "string" },
                    { 14, "turno", "Turno", true, false, "string" },
                    { 15, "salarioDiarioBase", "Salario Diario Base", true, false, "decimal" },
                    { 16, "fechaInicioContrato", "Fecha de Inicio del Contrato", true, false, "DateTime" },
                    { 17, "fechaTerminacionContrato", "Fecha de Terminación del Contrato", true, false, "DateTime" },
                    { 18, "fechaActualFormatoCorto", "Fecha Actual Formato Corto", true, false, "DateTime" },
                    { 19, "fechaActualFormatoLargo", "Fecha Actual Formato Largo", true, false, "DateTime" },
                    { 20, "firmaContrato", "Firma del Contrato", true, false, "string" },
                    { 21, "Beneficiario1", "Beneficiario 1", true, false, "string" },
                    { 22, "Beneficiario1_Domicilio", "Domicilio del Beneficiario 1", true, false, "string" },
                    { 23, "Beneficiario1_FechaNacimiento", "Fecha de Nacimiento del Beneficiario 1", true, false, "DateTime" },
                    { 24, "Beneficiario1_Telefono", "Teléfono del Beneficiario 1", true, false, "string" },
                    { 25, "Beneficiario2", "Beneficiario 2", true, false, "string" },
                    { 26, "Beneficiario2_Domicilio", "Domicilio del Beneficiario 2", true, false, "string" },
                    { 27, "Beneficiario2_FechaNacimiento", "Fecha de Nacimiento del Beneficiario 2", true, false, "DateTime" },
                    { 28, "Beneficiario2_Telefono", "Teléfono del Beneficiario 2", true, false, "string" },
                    { 29, "Beneficiario3", "Beneficiario 3", true, false, "string" },
                    { 30, "Beneficiario3_Domicilio", "Domicilio del Beneficiario 3", true, false, "string" },
                    { 31, "Beneficiario3_FechaNacimiento", "Fecha de Nacimiento del Beneficiario 3", true, false, "DateTime" },
                    { 32, "Beneficiario3_Telefono", "Teléfono del Beneficiario 3", true, false, "string" },
                    { 33, "Beneficiario4", "Beneficiario 4", true, false, "string" },
                    { 34, "Beneficiario4_Domicilio", "Domicilio del Beneficiario 4", true, false, "string" },
                    { 35, "Beneficiario4_FechaNacimiento", "Fecha de Nacimiento del Beneficiario 4", true, false, "DateTime" },
                    { 36, "Beneficiario4_Telefono", "Teléfono del Beneficiario 4", true, false, "string" }
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContractTemplateVariables");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEK4ZcQiadOaRPi0vgXYRE/tweVrUY8IxPfU4/eypzHHRuujlHM/mXvj3URkxCUXeTQ==");
        }
    }
}
