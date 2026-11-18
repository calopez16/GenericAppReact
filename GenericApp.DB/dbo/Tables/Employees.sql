CREATE TABLE [dbo].[Employees] (
    [IdEmployee]      INT            IDENTITY (1, 1) NOT NULL,
    [Clave]           INT            NOT NULL,
    [ApellidoPaterno] NVARCHAR (150) NULL,
    [ApellidoMaterno] NVARCHAR (150) NULL,
    [Nombre]          NVARCHAR (150) NULL,
    [Address]         NVARCHAR (250) NULL,
    [RFC]             NVARCHAR (50)  NULL,
    [CURP]            NVARCHAR (50)  NULL,
    [IMSS]            NVARCHAR (50)  NULL,
    [Genre]           NVARCHAR (50)  NULL,
    [CivilStatus]     NVARCHAR (50)  NULL,
    [Position]        NVARCHAR (150) NULL,
    [BirthDate]       DATETIME2 (7)  NOT NULL,
    [IsActive]        BIT            DEFAULT (CONVERT([bit],(1))) NULL,
    [IsDeleted]       BIT            DEFAULT (CONVERT([bit],(0))) NULL,
    [IdCompany]       INT            NOT NULL,
    CONSTRAINT [PK_Employees] PRIMARY KEY CLUSTERED ([IdEmployee] ASC),
    CONSTRAINT [FK_Employees_Companies_IdCompany] FOREIGN KEY ([IdCompany]) REFERENCES [dbo].[Companies] ([IdCompany])
);

