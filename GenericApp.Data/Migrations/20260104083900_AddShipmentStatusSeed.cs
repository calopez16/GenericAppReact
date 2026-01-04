using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddShipmentStatusSeed : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEDoBIVtFaFBsfAfgDiZawI8P8wOojB19pJwPHGOrPjHDBRUydhd1M1SxcxWalOM6Gg==");

            migrationBuilder.InsertData(
                table: "ShipmentStatuses",
                columns: new[] { "IdShipmentStatus", "Description", "IsActive", "IsDeleted" },
                values: new object[] { 1, "Activa", true, false });

            migrationBuilder.InsertData(
                table: "ShipmentStatuses",
                columns: new[] { "IdShipmentStatus", "Description", "IsActive", "IsDeleted" },
                values: new object[] { 2, "Concluída", true, false });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ShipmentStatuses",
                keyColumn: "IdShipmentStatus",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "ShipmentStatuses",
                keyColumn: "IdShipmentStatus",
                keyValue: 2);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEANcuCsxFbqtUNqR2DKhISV8tA0uwp5jwZTfwaZAL0rx+TH9jW6s1VxJGkV3+WhBRw==");
        }
    }
}
