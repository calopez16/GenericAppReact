CREATE TABLE [dbo].[Companies] (
    [IdCompany]   INT            IDENTITY (1, 1) NOT NULL,
    [Name]        NVARCHAR (150) NOT NULL,
    [Rfc]         NVARCHAR (13)  NULL,
    [Address]     NVARCHAR (250) NULL,
    [PostalCode]  NVARCHAR (50)  NULL,
    [Phone]       NVARCHAR (25)  NULL,
    [Notes]       NVARCHAR (250) NULL,
    [IsActive]    BIT            DEFAULT (CONVERT([bit],(1))) NULL,
    [IsDeleted]   BIT            DEFAULT (CONVERT([bit],(0))) NULL,
    [RegFdaNo]    NVARCHAR (50)  NULL,
    [LogoName]    NVARCHAR (MAX) NULL,
    [Empaque]     NVARCHAR (MAX) NULL,
    [GnnNumber]   NVARCHAR (MAX) NULL,
    [RazonSocial] NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_Companies] PRIMARY KEY CLUSTERED ([IdCompany] ASC)
);

