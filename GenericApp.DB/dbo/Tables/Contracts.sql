CREATE TABLE [dbo].[Contracts] (
    [IdContract]    INT            IDENTITY (1, 1) NOT NULL,
    [IdEmployee]    INT            NOT NULL,
    [SignatureDate] DATETIME2 (7)  NULL,
    [DocumentName]  NVARCHAR (250) NULL,
    [VirtualPath]   NVARCHAR (500) NULL,
    [IsActive]      BIT            DEFAULT (CONVERT([bit],(1))) NULL,
    [IsDeleted]     BIT            DEFAULT (CONVERT([bit],(0))) NULL,
    [IdCompany]     INT            NOT NULL,
    [CreateDate]    DATETIME2 (7)  DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_Contracts] PRIMARY KEY CLUSTERED ([IdContract] ASC),
    CONSTRAINT [FK_Contracts_Companies_IdCompany] FOREIGN KEY ([IdCompany]) REFERENCES [dbo].[Companies] ([IdCompany]),
    CONSTRAINT [FK_Contracts_Employees_IdEmployee] FOREIGN KEY ([IdEmployee]) REFERENCES [dbo].[Employees] ([IdEmployee])
);

