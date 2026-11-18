using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddContractSignFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AditionalText",
                table: "ContractSigns",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCompanyIncluded",
                table: "ContractSigns",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsTestigo",
                table: "ContractSigns",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Position",
                table: "ContractSigns",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEFph+MO1vhgOl6mOvE9ystxuj1xRHf0DSEA27jnaOyX/qsHOHgNw0nEd7HBH6ttE1A==");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AditionalText",
                table: "ContractSigns");

            migrationBuilder.DropColumn(
                name: "IsCompanyIncluded",
                table: "ContractSigns");

            migrationBuilder.DropColumn(
                name: "IsTestigo",
                table: "ContractSigns");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "ContractSigns");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEBV1B6Jv9waxVKRrM9vewkulgA5AgCssrq19fmbbyiTHIrnBdalh0sIt65qH2RJvxA==");
        }
    }
}
