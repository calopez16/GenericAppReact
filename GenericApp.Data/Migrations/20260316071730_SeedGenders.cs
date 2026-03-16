using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class SeedGenders : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Genders",
                columns: new[] { "Descripcion", "IsActive", "IsDeleted" },
                values: new object[,]
                {
                    { "Masculino", true, false },
                    { "Femenino",  true, false },
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEGCjvUZC3h5OelnUEqMrAq6/MWevy9qvtT7kTa1dDVi1iyY+PbNr4cmKWJngPxMjeA==");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Genders",
                keyColumn: "Descripcion",
                keyValues: new object[] { "Masculino", "Femenino" });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEDBzd26cpKMw9jaQDtdIpTuR6Yl6WCKOrYdOzHhtiWtHQ2n0rO7tACOaIaSi+vz2IA==");
        }
    }
}
