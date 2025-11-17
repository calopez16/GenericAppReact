using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class ShipmentAndManifestStatus : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdShipmentStatus",
                table: "Shipments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "Mixed",
                table: "Shipments",
                type: "bit",
                nullable: true,
                defaultValue: false);

            migrationBuilder.AlterColumn<DateTime>(
                name: "ExitDate",
                table: "Manifests",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime");

            migrationBuilder.AddColumn<int>(
                name: "IdManifestStatus",
                table: "Manifests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "RegFdaNo",
                table: "Companies",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(80)",
                oldMaxLength: 80,
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "ManifestStatuses",
                columns: table => new
                {
                    IdManifestStatus = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ManifestStatuses", x => x.IdManifestStatus);
                });

            migrationBuilder.CreateTable(
                name: "ShipmentStatuses",
                columns: table => new
                {
                    IdShipmentStatus = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShipmentStatuses", x => x.IdShipmentStatus);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAELqpxh6QsckSfG6pYumBGLRpINcJOdhgNKC6/07S42O/sk2kn4PwACsEyVxSWM1orw==");

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_IdShipmentStatus",
                table: "Shipments",
                column: "IdShipmentStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Manifests_IdManifestStatus",
                table: "Manifests",
                column: "IdManifestStatus");

            migrationBuilder.AddForeignKey(
                name: "FK_Manifests_ManifestStatuses_IdManifestStatus",
                table: "Manifests",
                column: "IdManifestStatus",
                principalTable: "ManifestStatuses",
                principalColumn: "IdManifestStatus",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Shipments_ShipmentStatuses_IdShipmentStatus",
                table: "Shipments",
                column: "IdShipmentStatus",
                principalTable: "ShipmentStatuses",
                principalColumn: "IdShipmentStatus",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Manifests_ManifestStatuses_IdManifestStatus",
                table: "Manifests");

            migrationBuilder.DropForeignKey(
                name: "FK_Shipments_ShipmentStatuses_IdShipmentStatus",
                table: "Shipments");

            migrationBuilder.DropTable(
                name: "ManifestStatuses");

            migrationBuilder.DropTable(
                name: "ShipmentStatuses");

            migrationBuilder.DropIndex(
                name: "IX_Shipments_IdShipmentStatus",
                table: "Shipments");

            migrationBuilder.DropIndex(
                name: "IX_Manifests_IdManifestStatus",
                table: "Manifests");

            migrationBuilder.DropColumn(
                name: "IdShipmentStatus",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "Mixed",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "IdManifestStatus",
                table: "Manifests");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ExitDate",
                table: "Manifests",
                type: "datetime",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "date");

            migrationBuilder.AlterColumn<string>(
                name: "RegFdaNo",
                table: "Companies",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEEQ4tzF4Ks55Y5+tokDSrHqLWwFV9/Kahpnxas67EmDkFU5jCm9q0OIO7OYVwSquxA==");
        }
    }
}
