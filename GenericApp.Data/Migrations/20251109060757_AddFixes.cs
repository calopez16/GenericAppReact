using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddFixes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdCompanyNavigationIdCompany",
                table: "ShippingCompanies",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IdCompanyNavigationIdCompany",
                table: "Seasons",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IdCompanyNavigationIdCompany",
                table: "Labels",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IdCompanyNavigationIdCompany",
                table: "Drivers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Rfc",
                table: "Clients",
                type: "nvarchar(13)",
                maxLength: 13,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(13)",
                oldMaxLength: 13);

            migrationBuilder.AlterColumn<string>(
                name: "PostalCode",
                table: "Clients",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "Clients",
                type: "nvarchar(25)",
                maxLength: 25,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(25)",
                oldMaxLength: 25);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "Clients",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(250)",
                oldMaxLength: 250);

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Clients",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(250)",
                oldMaxLength: 250);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEFqYHNOjMb61N342euIvrbfdgiHXkfHZDg/MJnn9ctyfAzVKuEyuPXUCznahde2pjQ==");

            migrationBuilder.CreateIndex(
                name: "IX_ShippingCompanies_IdCompanyNavigationIdCompany",
                table: "ShippingCompanies",
                column: "IdCompanyNavigationIdCompany");

            migrationBuilder.CreateIndex(
                name: "IX_Seasons_IdCompanyNavigationIdCompany",
                table: "Seasons",
                column: "IdCompanyNavigationIdCompany");

            migrationBuilder.CreateIndex(
                name: "IX_Labels_IdCompanyNavigationIdCompany",
                table: "Labels",
                column: "IdCompanyNavigationIdCompany");

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_IdCompanyNavigationIdCompany",
                table: "Drivers",
                column: "IdCompanyNavigationIdCompany");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_IdCity",
                table: "Clients",
                column: "IdCity");

            migrationBuilder.AddForeignKey(
                name: "FK_Clients_Cities_IdCity",
                table: "Clients",
                column: "IdCity",
                principalTable: "Cities",
                principalColumn: "IdCity",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Drivers_Companies_IdCompanyNavigationIdCompany",
                table: "Drivers",
                column: "IdCompanyNavigationIdCompany",
                principalTable: "Companies",
                principalColumn: "IdCompany",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Labels_Companies_IdCompanyNavigationIdCompany",
                table: "Labels",
                column: "IdCompanyNavigationIdCompany",
                principalTable: "Companies",
                principalColumn: "IdCompany",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Seasons_Companies_IdCompanyNavigationIdCompany",
                table: "Seasons",
                column: "IdCompanyNavigationIdCompany",
                principalTable: "Companies",
                principalColumn: "IdCompany",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ShippingCompanies_Companies_IdCompanyNavigationIdCompany",
                table: "ShippingCompanies",
                column: "IdCompanyNavigationIdCompany",
                principalTable: "Companies",
                principalColumn: "IdCompany",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Clients_Cities_IdCity",
                table: "Clients");

            migrationBuilder.DropForeignKey(
                name: "FK_Drivers_Companies_IdCompanyNavigationIdCompany",
                table: "Drivers");

            migrationBuilder.DropForeignKey(
                name: "FK_Labels_Companies_IdCompanyNavigationIdCompany",
                table: "Labels");

            migrationBuilder.DropForeignKey(
                name: "FK_Seasons_Companies_IdCompanyNavigationIdCompany",
                table: "Seasons");

            migrationBuilder.DropForeignKey(
                name: "FK_ShippingCompanies_Companies_IdCompanyNavigationIdCompany",
                table: "ShippingCompanies");

            migrationBuilder.DropIndex(
                name: "IX_ShippingCompanies_IdCompanyNavigationIdCompany",
                table: "ShippingCompanies");

            migrationBuilder.DropIndex(
                name: "IX_Seasons_IdCompanyNavigationIdCompany",
                table: "Seasons");

            migrationBuilder.DropIndex(
                name: "IX_Labels_IdCompanyNavigationIdCompany",
                table: "Labels");

            migrationBuilder.DropIndex(
                name: "IX_Drivers_IdCompanyNavigationIdCompany",
                table: "Drivers");

            migrationBuilder.DropIndex(
                name: "IX_Clients_IdCity",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "IdCompanyNavigationIdCompany",
                table: "ShippingCompanies");

            migrationBuilder.DropColumn(
                name: "IdCompanyNavigationIdCompany",
                table: "Seasons");

            migrationBuilder.DropColumn(
                name: "IdCompanyNavigationIdCompany",
                table: "Labels");

            migrationBuilder.DropColumn(
                name: "IdCompanyNavigationIdCompany",
                table: "Drivers");

            migrationBuilder.AlterColumn<string>(
                name: "Rfc",
                table: "Clients",
                type: "nvarchar(13)",
                maxLength: 13,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(13)",
                oldMaxLength: 13,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PostalCode",
                table: "Clients",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "Clients",
                type: "nvarchar(25)",
                maxLength: 25,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(25)",
                oldMaxLength: 25,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "Clients",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(250)",
                oldMaxLength: 250,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Clients",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(250)",
                oldMaxLength: 250,
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEFMRaLzRJBIw0M1MnCpGv2Dz/rCnCXBjeyrhw6kasx854KYlbeUtzG5GP6oHnTlC3A==");
        }
    }
}
