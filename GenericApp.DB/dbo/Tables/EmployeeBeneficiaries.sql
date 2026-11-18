CREATE TABLE [dbo].[EmployeeBeneficiaries] (
    [IdEmployeeBeneficiarie]     INT            IDENTITY (1, 1) NOT NULL,
    [IdEmployee]                 INT            NOT NULL,
    [Name]                       NVARCHAR (150) NULL,
    [IdEmployeeRelationshipType] INT            NULL,
    [Percentage]                 DECIMAL (5, 2) NULL,
    [IsActive]                   BIT            DEFAULT (CONVERT([bit],(1))) NULL,
    [IsDeleted]                  BIT            DEFAULT (CONVERT([bit],(0))) NULL,
    [Order]                      INT            DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_EmployeeBeneficiaries] PRIMARY KEY CLUSTERED ([IdEmployeeBeneficiarie] ASC),
    CONSTRAINT [FK_EmployeeBeneficiaries_EmployeeRelationshipTypes_IdEmployeeRelationshipType] FOREIGN KEY ([IdEmployeeRelationshipType]) REFERENCES [dbo].[EmployeeRelationshipTypes] ([IdEmployeeRelationshipType]),
    CONSTRAINT [FK_EmployeeBeneficiaries_Employees_IdEmployee] FOREIGN KEY ([IdEmployee]) REFERENCES [dbo].[Employees] ([IdEmployee])
);

