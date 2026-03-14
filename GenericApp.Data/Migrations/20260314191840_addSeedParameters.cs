using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class addSeedParameters : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEDf07YMLcz/ZoS4PAG3UNjnCosO0gBXMrrfenVJzm01T7CWzrsNPZlM2d+BRMcaepA==");

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "IdCompany",
                keyValue: 1,
                column: "Name",
                value: "Default Company");

            migrationBuilder.InsertData(
                table: "Parameters",
                columns: new[] { "IdParameter", "Description", "ParameterCode", "Value" },
                values: new object[,]
                {
                    { 1, "MultiLenguage habilitado", "P1", "false" },
                    { 2, "Lenguaje por defecto", "P2", "es" },
                    { 3, "Elegir Thema habilitado", "P3", "true" },
                    { 4, "Thema por defecto", "P4", "dark" },
                    { 5, "MultiEmpresa habilitado", "P5", "false" }
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Parameters",
                keyColumn: "IdParameter",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Parameters",
                keyColumn: "IdParameter",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Parameters",
                keyColumn: "IdParameter",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Parameters",
                keyColumn: "IdParameter",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Parameters",
                keyColumn: "IdParameter",
                keyValue: 5);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEJ7xutA1nZ9OFQAeBaATDSl7OsSTL15OIUX3i6WmGlooXRvbtNk7G4mA2fh7vHL5ag==");

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "IdCompany",
                keyValue: 1,
                column: "Name",
                value: "Mision");
        }
    }
}
