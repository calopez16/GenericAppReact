using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class addContractTemplateVariableEdit : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAELY7F0EoStcgpwr8Lq3Pcve7G/IEHSDeuz1baMTm8/0MwCHMj9jJWkSsvI23Zrpo7A==");

            migrationBuilder.UpdateData(
                table: "ContractTemplateVariables",
                keyColumn: "IdContractTemplateVariable",
                keyValue: 2,
                columns: new[] { "Code", "Description" },
                values: new object[] { "fechaActualContrato", "Fecha actual contrato" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
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
                keyValue: 2,
                columns: new[] { "Code", "Description" },
                values: new object[] { "fechaActual", "Fecha actual" });
        }
    }
}
