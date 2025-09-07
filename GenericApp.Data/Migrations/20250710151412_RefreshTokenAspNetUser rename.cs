using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class RefreshTokenAspNetUserrename : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_ApplicationUser",
                table: "ApplicationUser");

            migrationBuilder.RenameTable(
                name: "ApplicationUser",
                newName: "RefreshTokenAspNetUser");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RefreshTokenAspNetUser",
                table: "RefreshTokenAspNetUser",
                column: "IdRefreshTokenAspNetUser");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_RefreshTokenAspNetUser",
                table: "RefreshTokenAspNetUser");

            migrationBuilder.RenameTable(
                name: "RefreshTokenAspNetUser",
                newName: "ApplicationUser");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ApplicationUser",
                table: "ApplicationUser",
                column: "IdRefreshTokenAspNetUser");
        }
    }
}
