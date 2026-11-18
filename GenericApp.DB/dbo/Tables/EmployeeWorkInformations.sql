CREATE TABLE [dbo].[EmployeeWorkInformations] (
    [IdEmployeeWorkInformation] INT             IDENTITY (1, 1) NOT NULL,
    [IdEmployee]                INT             NOT NULL,
    [DailySalary]               DECIMAL (18, 2) NOT NULL,
    [IntegralSalary]            DECIMAL (18, 2) NOT NULL,
    [PayType]                   NVARCHAR (50)   NULL,
    [InitialDate]               DATETIME2 (7)   NOT NULL,
    [ContractExpiration]        DATETIME2 (7)   NOT NULL,
    [IsActive]                  BIT             DEFAULT (CONVERT([bit],(1))) NULL,
    [IsDeleted]                 BIT             DEFAULT (CONVERT([bit],(0))) NULL,
    CONSTRAINT [PK_EmployeeWorkInformations] PRIMARY KEY CLUSTERED ([IdEmployeeWorkInformation] ASC),
    CONSTRAINT [FK_EmployeeWorkInformations_Employees_IdEmployee] FOREIGN KEY ([IdEmployee]) REFERENCES [dbo].[Employees] ([IdEmployee])
);

