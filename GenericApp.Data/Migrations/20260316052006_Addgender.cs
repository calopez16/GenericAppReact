using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class Addgender : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdGender",
                table: "Clients",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Genders",
                columns: table => new
                {
                    IdGender = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Descripcion = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Genders", x => x.IdGender);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAELjZWBizlA3KPPVxLUficU8mPE7bLsOGtMgF2e2uxj7MVttcYcwJ57rBmDemsf7DCw==");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_IdGender",
                table: "Clients",
                column: "IdGender");

            migrationBuilder.AddForeignKey(
                name: "FK_Clients_Genders_IdGender",
                table: "Clients",
                column: "IdGender",
                principalTable: "Genders",
                principalColumn: "IdGender",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Clients_Genders_IdGender",
                table: "Clients");

            migrationBuilder.DropTable(
                name: "Genders");

            migrationBuilder.DropIndex(
                name: "IX_Clients_IdGender",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "IdGender",
                table: "Clients");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEMxBBwaHKGyuJS4Jjpl5rSkgOTBsAPO5BCIyIxn3Iqkznq2CC67GZnLbBB92XhBgNg==");
        }
    }
}
