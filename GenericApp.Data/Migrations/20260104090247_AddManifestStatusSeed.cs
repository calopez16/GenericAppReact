using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddManifestStatusSeed : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEIsY7u0lHYx9d/0Ft/z6s6bh29Dab34cwTp4ExKfOl2tSBvCvIuWJ8fm9jaerQL61w==");

            migrationBuilder.InsertData(
                table: "ManifestStatuses",
                columns: new[] { "IdManifestStatus", "Description", "IsActive", "IsDeleted" },
                values: new object[] { 1, "Activa", true, false });

            migrationBuilder.InsertData(
                table: "ManifestStatuses",
                columns: new[] { "IdManifestStatus", "Description", "IsActive", "IsDeleted" },
                values: new object[] { 2, "Concluída", true, false });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ManifestStatuses",
                keyColumn: "IdManifestStatus",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "ManifestStatuses",
                keyColumn: "IdManifestStatus",
                keyValue: 2);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEACP9d5wvdkhasxbCWFsebmaxj6GyRWPoOQ7VvcMqK5w+gfOytHEGmSzv73m/sgV7g==");
        }
    }
}
