using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddMaritalStatus : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MaritalStatus",
                columns: table => new
                {
                    IdMaritalStatus = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaritalStatus", x => x.IdMaritalStatus);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEPtC/RhzMwUXwoCD9udn7VZmC8SQdNyIYc8CjKFR9Vpqh/drazHqywBP/qsCF4JQgA==");

            migrationBuilder.InsertData(
                table: "MaritalStatus",
                columns: new[] { "IdMaritalStatus", "Description", "IsActive", "IsDeleted" },
                values: new object[,]
                {
                    { 1, "Soltero(a)", true, false },
                    { 2, "Casado(a)", true, false },
                    { 3, "Divorciado(a)", true, false },
                    { 4, "Viudo(a)", true, false }
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MaritalStatus");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEAa0Bm4Ha6OvvlrDMKUWWO7M3gxSw3LNgqJx/O6yBHCgDMyft3ln6SK8b/RbIcV1lg==");
        }
    }
}
