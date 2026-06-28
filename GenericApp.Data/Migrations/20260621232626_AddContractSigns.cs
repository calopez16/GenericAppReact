using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddContractSigns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContractSigns",
                columns: table => new
                {
                    IdContractSign = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    SignFileName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractSigns", x => x.IdContractSign);
                });

            migrationBuilder.CreateTable(
                name: "ContractTemplateContractSigns",
                columns: table => new
                {
                    IdContractTemplateContractSign = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdContractSign = table.Column<int>(type: "int", nullable: false),
                    IdContractTemplate = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractTemplateContractSigns", x => x.IdContractTemplateContractSign);
                    table.ForeignKey(
                        name: "FK_ContractTemplateContractSigns_ContractSigns_IdContractSign",
                        column: x => x.IdContractSign,
                        principalTable: "ContractSigns",
                        principalColumn: "IdContractSign",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ContractTemplateContractSigns_ContractTemplates_IdContractTemplate",
                        column: x => x.IdContractTemplate,
                        principalTable: "ContractTemplates",
                        principalColumn: "IdTemplate",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEALEDyqJ68CNqjqz/kLoDldUIT9AnmnaviMYziv2vgjrfnpCJupqFRtHUeonDIuq1w==");

            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplateContractSigns_IdContractSign",
                table: "ContractTemplateContractSigns",
                column: "IdContractSign");

            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplateContractSigns_IdContractTemplate",
                table: "ContractTemplateContractSigns",
                column: "IdContractTemplate");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContractTemplateContractSigns");

            migrationBuilder.DropTable(
                name: "ContractSigns");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAELY7F0EoStcgpwr8Lq3Pcve7G/IEHSDeuz1baMTm8/0MwCHMj9jJWkSsvI23Zrpo7A==");
        }
    }
}
