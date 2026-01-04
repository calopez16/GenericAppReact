using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddManifestFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Empaque",
                table: "Manifests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RegFdaNo",
                table: "Manifests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEFrHbd2k2Ds5p4J8fgGpyb97MhMNUeACDJaa3MoTAwS8wPEwMHtFuwWPwZA5DEZt4w==");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Empaque",
                table: "Manifests");

            migrationBuilder.DropColumn(
                name: "RegFdaNo",
                table: "Manifests");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEIsY7u0lHYx9d/0Ft/z6s6bh29Dab34cwTp4ExKfOl2tSBvCvIuWJ8fm9jaerQL61w==");
        }
    }
}
