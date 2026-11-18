using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUnusedContractSignFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
        }
    }
}
