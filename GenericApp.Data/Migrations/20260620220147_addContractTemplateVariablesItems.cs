using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class addContractTemplateVariablesItems : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEKN4i7cmGkKetc498uhuuQxgRNmegNEY9BSemCG/oeIldEI2n6pAXZyum6m64BipLQ==");

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 25,
                columns: new[] { "Code", "Description" },
                values: new object[] { "Beneficiario1_Porcentaje", "Porcentaje del Beneficiario 1" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 26,
                columns: new[] { "Code", "Description" },
                values: new object[] { "Beneficiario2", "Beneficiario 2" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 27,
                columns: new[] { "Code", "Description", "Type" },
                values: new object[] { "Beneficiario2_Domicilio", "Domicilio del Beneficiario 2", "string" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 28,
                columns: new[] { "Code", "Description", "Type" },
                values: new object[] { "Beneficiario2_FechaNacimiento", "Fecha de Nacimiento del Beneficiario 2", "DateTime" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 29,
                columns: new[] { "Code", "Description" },
                values: new object[] { "Beneficiario2_Telefono", "Teléfono del Beneficiario 2" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 30,
                columns: new[] { "Code", "Description" },
                values: new object[] { "Beneficiario2_Porcentaje", "Porcentaje del Beneficiario 2" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 31,
                columns: new[] { "Code", "Description", "Type" },
                values: new object[] { "Beneficiario3", "Beneficiario 3", "string" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 32,
                columns: new[] { "Code", "Description" },
                values: new object[] { "Beneficiario3_Domicilio", "Domicilio del Beneficiario 3" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 33,
                columns: new[] { "Code", "Description", "Type" },
                values: new object[] { "Beneficiario3_FechaNacimiento", "Fecha de Nacimiento del Beneficiario 3", "DateTime" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 34,
                columns: new[] { "Code", "Description" },
                values: new object[] { "Beneficiario3_Telefono", "Teléfono del Beneficiario 3" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 35,
                columns: new[] { "Code", "Description", "Type" },
                values: new object[] { "Beneficiario3_Porcentaje", "Porcentaje del Beneficiario 3", "string" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 36,
                columns: new[] { "Code", "Description" },
                values: new object[] { "Beneficiario4", "Beneficiario 4" });

            migrationBuilder.InsertData(
                table: "ContractTemplateVariables",
                columns: new[] { "IdContractTemplateVariable", "Code", "Description", "IsActive", "IsDeleted", "Type" },
                values: new object[,]
                {
                    { 37, "Beneficiario4_Domicilio", "Domicilio del Beneficiario 4", true, false, "string" },
                    { 38, "Beneficiario4_FechaNacimiento", "Fecha de Nacimiento del Beneficiario 4", true, false, "DateTime" },
                    { 39, "Beneficiario4_Telefono", "Teléfono del Beneficiario 4", true, false, "string" },
                    { 40, "Beneficiario4_Porcentaje", "Porcentaje del Beneficiario 4", true, false, "string" }
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 37);

            migrationBuilder.DeleteData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 38);

            migrationBuilder.DeleteData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 39);

            migrationBuilder.DeleteData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 40);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEIolJZBvZf9WI9MCcqkoeSkY9BCvU6giNN+zTvevpHa0FJJBVrswEgXiw6wJ4Hdk0w==");

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 25,
                columns: new[] { "Code", "Description" },
                values: new object[] { "Beneficiario2", "Beneficiario 2" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 26,
                columns: new[] { "Code", "Description" },
                values: new object[] { "Beneficiario2_Domicilio", "Domicilio del Beneficiario 2" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 27,
                columns: new[] { "Code", "Description", "Type" },
                values: new object[] { "Beneficiario2_FechaNacimiento", "Fecha de Nacimiento del Beneficiario 2", "DateTime" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 28,
                columns: new[] { "Code", "Description", "Type" },
                values: new object[] { "Beneficiario2_Telefono", "Teléfono del Beneficiario 2", "string" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 29,
                columns: new[] { "Code", "Description" },
                values: new object[] { "Beneficiario3", "Beneficiario 3" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 30,
                columns: new[] { "Code", "Description" },
                values: new object[] { "Beneficiario3_Domicilio", "Domicilio del Beneficiario 3" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 31,
                columns: new[] { "Code", "Description", "Type" },
                values: new object[] { "Beneficiario3_FechaNacimiento", "Fecha de Nacimiento del Beneficiario 3", "DateTime" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 32,
                columns: new[] { "Code", "Description" },
                values: new object[] { "Beneficiario3_Telefono", "Teléfono del Beneficiario 3" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 33,
                columns: new[] { "Code", "Description", "Type" },
                values: new object[] { "Beneficiario4", "Beneficiario 4", "string" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 34,
                columns: new[] { "Code", "Description" },
                values: new object[] { "Beneficiario4_Domicilio", "Domicilio del Beneficiario 4" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 35,
                columns: new[] { "Code", "Description", "Type" },
                values: new object[] { "Beneficiario4_FechaNacimiento", "Fecha de Nacimiento del Beneficiario 4", "DateTime" });

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 36,
                columns: new[] { "Code", "Description" },
                values: new object[] { "Beneficiario4_Telefono", "Teléfono del Beneficiario 4" });
        }
    }
}
