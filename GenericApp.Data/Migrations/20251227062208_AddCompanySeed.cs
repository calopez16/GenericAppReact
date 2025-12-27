using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddCompanySeed : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEBWdhDGzTluxz3GPbK95Hh1qLKQaEpZdFLzcvNAh6JwFhxt6O6YQN6bp4Wj7NgBrpQ==");

            migrationBuilder.InsertData(
                table: "Companies",
                columns: new[] { "IdCompany", "Address", "IsActive", "IsDeleted", "LogoName", "Name", "Notes", "Phone", "PostalCode", "RegFdaNo", "Rfc" },
                values: new object[] { 1, null, true, false, null, "Mision", null, null, null, null, null });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Companies",
                keyColumn: "IdCompany",
                keyValue: 1);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEN7+gw6yYF9HNonFXFkyTxTdMhMxOj2iHdNquilp2pVw8bdAaaT1cm81GEykTKtWmA==");
        }
    }
}
