CREATE TABLE [dbo].[ContractSigns] (
    [IdContractSign]    INT            IDENTITY (1, 1) NOT NULL,
    [Name]              NVARCHAR (150) NOT NULL,
    [SignFileName]      NVARCHAR (250) NULL,
    [IsActive]          BIT            DEFAULT (CONVERT([bit],(1))) NULL,
    [IsDeleted]         BIT            DEFAULT (CONVERT([bit],(0))) NULL,
    [IdCompany]         INT            NULL,
    CONSTRAINT [PK_ContractSigns] PRIMARY KEY CLUSTERED ([IdContractSign] ASC),
    CONSTRAINT [FK_ContractSigns_Companies_IdCompany] FOREIGN KEY ([IdCompany]) REFERENCES [dbo].[Companies] ([IdCompany])
);




GO
CREATE NONCLUSTERED INDEX [IX_ContractSigns_IdCompany]
    ON [dbo].[ContractSigns]([IdCompany] ASC);

