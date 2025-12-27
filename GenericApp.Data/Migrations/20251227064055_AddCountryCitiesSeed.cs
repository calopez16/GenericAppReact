using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddCountryCitiesSeed : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserDetails",
                columns: table => new
                {
                    IdUserDetail = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdUser = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    IdCompany = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDetails", x => x.IdUserDetail);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEC/D6UrfsdH1SE8zcIoFxA9nJ5dymXcXH+NPsSqqjj/RxeX3629nles9niZ8pbGmDA==");

            migrationBuilder.InsertData(
                table: "Countries",
                columns: new[] { "IdCountry", "Description", "IsActive", "IsDeleted" },
                values: new object[,]
                {
                    { 1, "México", true, false },
                    { 2, "Estados Unidos", true, false }
                });

            migrationBuilder.InsertData(
                table: "UserDetails",
                columns: new[] { "IdUserDetail", "IdCompany", "IdUser" },
                values: new object[] { 1, 1, "a18be9c0-aa65-4af8-bd17-00bd9344e577" });

            migrationBuilder.InsertData(
                table: "States",
                columns: new[] { "IdState", "Description", "IdCountry", "IsActive", "IsDeleted" },
                values: new object[,]
                {
                    { 1, "Aguascalientes", 1, true, false },
                    { 2, "Baja California", 1, true, false },
                    { 3, "Baja California Sur", 1, true, false },
                    { 4, "Campeche", 1, true, false },
                    { 5, "Coahuila", 1, true, false },
                    { 6, "Colima", 1, true, false },
                    { 7, "Chiapas", 1, true, false },
                    { 8, "Chihuahua", 1, true, false },
                    { 9, "Ciudad de México", 1, true, false },
                    { 10, "Durango", 1, true, false },
                    { 11, "Guanajuato", 1, true, false },
                    { 12, "Guerrero", 1, true, false },
                    { 13, "Hidalgo", 1, true, false },
                    { 14, "Jalisco", 1, true, false },
                    { 15, "Estado de México", 1, true, false },
                    { 16, "Michoacán", 1, true, false },
                    { 17, "Morelos", 1, true, false },
                    { 18, "Nayarit", 1, true, false },
                    { 19, "Nuevo León", 1, true, false },
                    { 20, "Oaxaca", 1, true, false },
                    { 21, "Puebla", 1, true, false },
                    { 22, "Querétaro", 1, true, false },
                    { 23, "Quintana Roo", 1, true, false },
                    { 24, "San Luis Potosí", 1, true, false },
                    { 25, "Sinaloa", 1, true, false },
                    { 26, "Sonora", 1, true, false },
                    { 27, "Tabasco", 1, true, false },
                    { 28, "Tamaulipas", 1, true, false },
                    { 29, "Tlaxcala", 1, true, false },
                    { 30, "Veracruz", 1, true, false },
                    { 31, "Yucatán", 1, true, false },
                    { 32, "Zacatecas", 1, true, false },
                    { 33, "Alabama", 2, true, false },
                    { 34, "Alaska", 2, true, false },
                    { 35, "Arizona", 2, true, false },
                    { 36, "Arkansas", 2, true, false },
                    { 37, "California", 2, true, false },
                    { 38, "Colorado", 2, true, false },
                    { 39, "Connecticut", 2, true, false },
                    { 40, "Delaware", 2, true, false },
                    { 41, "Florida", 2, true, false },
                    { 42, "Georgia", 2, true, false }
                });

            migrationBuilder.InsertData(
                table: "States",
                columns: new[] { "IdState", "Description", "IdCountry", "IsActive", "IsDeleted" },
                values: new object[,]
                {
                    { 43, "Hawaii", 2, true, false },
                    { 44, "Idaho", 2, true, false },
                    { 45, "Illinois", 2, true, false },
                    { 46, "Indiana", 2, true, false },
                    { 47, "Iowa", 2, true, false },
                    { 48, "Kansas", 2, true, false },
                    { 49, "Kentucky", 2, true, false },
                    { 50, "Louisiana", 2, true, false },
                    { 51, "Maine", 2, true, false },
                    { 52, "Maryland", 2, true, false },
                    { 53, "Massachusetts", 2, true, false },
                    { 54, "Michigan", 2, true, false },
                    { 55, "Minnesota", 2, true, false },
                    { 56, "Mississippi", 2, true, false },
                    { 57, "Missouri", 2, true, false },
                    { 58, "Montana", 2, true, false },
                    { 59, "Nebraska", 2, true, false },
                    { 60, "Nevada", 2, true, false },
                    { 61, "New Hampshire", 2, true, false },
                    { 62, "New Jersey", 2, true, false },
                    { 63, "New Mexico", 2, true, false },
                    { 64, "New York", 2, true, false },
                    { 65, "North Carolina", 2, true, false },
                    { 66, "North Dakota", 2, true, false },
                    { 67, "Ohio", 2, true, false },
                    { 68, "Oklahoma", 2, true, false },
                    { 69, "Oregon", 2, true, false },
                    { 70, "Pennsylvania", 2, true, false },
                    { 71, "Rhode Island", 2, true, false },
                    { 72, "South Carolina", 2, true, false },
                    { 73, "South Dakota", 2, true, false },
                    { 74, "Tennessee", 2, true, false },
                    { 75, "Texas", 2, true, false },
                    { 76, "Utah", 2, true, false },
                    { 77, "Vermont", 2, true, false },
                    { 78, "Virginia", 2, true, false },
                    { 79, "Washington", 2, true, false },
                    { 80, "West Virginia", 2, true, false },
                    { 81, "Wisconsin", 2, true, false },
                    { 82, "Wyoming", 2, true, false }
                });

            migrationBuilder.InsertData(
                table: "Cities",
                columns: new[] { "IdCity", "Description", "IdState", "IsActive", "IsDeleted" },
                values: new object[,]
                {
                    { 1, "Tijuana", 2, true, false },
                    { 2, "Mexicali", 2, true, false },
                    { 3, "Ensenada", 2, true, false },
                    { 4, "Playas de Rosarito", 2, true, false },
                    { 5, "Tecate", 2, true, false },
                    { 6, "San Quintín", 2, true, false },
                    { 7, "San Felipe", 2, true, false },
                    { 8, "Los Angeles", 37, true, false },
                    { 9, "San Diego", 37, true, false },
                    { 10, "San Jose", 37, true, false },
                    { 11, "Calexico", 37, true, false }
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserDetails");

            migrationBuilder.DeleteData(
                table: "Cities",
                keyColumn: "IdCity",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Cities",
                keyColumn: "IdCity",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Cities",
                keyColumn: "IdCity",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Cities",
                keyColumn: "IdCity",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Cities",
                keyColumn: "IdCity",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Cities",
                keyColumn: "IdCity",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Cities",
                keyColumn: "IdCity",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Cities",
                keyColumn: "IdCity",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Cities",
                keyColumn: "IdCity",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Cities",
                keyColumn: "IdCity",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Cities",
                keyColumn: "IdCity",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 26);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 27);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 28);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 29);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 30);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 31);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 32);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 33);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 34);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 35);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 36);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 38);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 39);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 40);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 41);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 42);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 43);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 44);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 45);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 46);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 47);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 48);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 49);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 50);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 51);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 52);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 53);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 54);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 55);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 56);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 57);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 58);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 59);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 60);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 61);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 62);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 63);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 64);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 65);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 66);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 67);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 68);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 69);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 70);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 71);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 72);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 73);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 74);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 75);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 76);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 77);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 78);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 79);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 80);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 81);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 82);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "IdState",
                keyValue: 37);

            migrationBuilder.DeleteData(
                table: "Countries",
                keyColumn: "IdCountry",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Countries",
                keyColumn: "IdCountry",
                keyValue: 2);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEBWdhDGzTluxz3GPbK95Hh1qLKQaEpZdFLzcvNAh6JwFhxt6O6YQN6bp4Wj7NgBrpQ==");
        }
    }
}
