using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddTrackingFieldsManifest : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Chismografo",
                table: "Manifests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Stamps",
                table: "Manifests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrackingCode",
                table: "Manifests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEESwY7ioe6QM+guWer49IeQr6wZrOLRX8t+S+oyiEB1KvgvfTH0tLpUAI5L/QxDUsQ==");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Chismografo",
                table: "Manifests");

            migrationBuilder.DropColumn(
                name: "Stamps",
                table: "Manifests");

            migrationBuilder.DropColumn(
                name: "TrackingCode",
                table: "Manifests");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEET6g1btYXCz7ZoYi1UGZmrgbgIE8xL7yjKfTe48cjx42N5kKUHHuO9ONNgv6bD/mw==");
        }
    }
}
