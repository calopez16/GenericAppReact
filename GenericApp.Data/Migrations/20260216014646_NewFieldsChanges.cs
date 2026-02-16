using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class NewFieldsChanges : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdTrailerBoxType",
                table: "Manifests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrailerBoxPlateEconomicNumber",
                table: "Manifests",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrailerPlateEconomicNumber",
                table: "Manifests",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "Clients",
                type: "nvarchar(25)",
                maxLength: 25,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "TrailerBoxType",
                columns: table => new
                {
                    IdTrailerBoxType = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrailerBoxType", x => x.IdTrailerBoxType);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEEjh+ptmVFDmMVXuir9Bhi6K351IvuS1jQKjHojUAJH5sREOSGxx93HnNkQYeIfMcg==");

            migrationBuilder.CreateIndex(
                name: "IX_Manifests_IdTrailerBoxType",
                table: "Manifests",
                column: "IdTrailerBoxType");

            migrationBuilder.AddForeignKey(
                name: "FK_Manifests_TrailerBoxType_IdTrailerBoxType",
                table: "Manifests",
                column: "IdTrailerBoxType",
                principalTable: "TrailerBoxType",
                principalColumn: "IdTrailerBoxType",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Manifests_TrailerBoxType_IdTrailerBoxType",
                table: "Manifests");

            migrationBuilder.DropTable(
                name: "TrailerBoxType");

            migrationBuilder.DropIndex(
                name: "IX_Manifests_IdTrailerBoxType",
                table: "Manifests");

            migrationBuilder.DropColumn(
                name: "IdTrailerBoxType",
                table: "Manifests");

            migrationBuilder.DropColumn(
                name: "TrailerBoxPlateEconomicNumber",
                table: "Manifests");

            migrationBuilder.DropColumn(
                name: "TrailerPlateEconomicNumber",
                table: "Manifests");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "Clients");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEMz/EVPfOpwen/OPFvEn3BRhQVfbRgCWLWt5m7x6wfRHXFZj0ia2HJDcb9MOi13NUg==");
        }
    }
}
