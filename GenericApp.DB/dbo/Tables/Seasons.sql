CREATE TABLE [dbo].[Seasons] (
    [IdSeason]    INT            IDENTITY (1, 1) NOT NULL,
    [Name]        NVARCHAR (150) NOT NULL,
    [Description] NVARCHAR (250) NULL,
    [InitialDate] DATE           NOT NULL,
    [EndDate]     DATE           NOT NULL,
    [IsClosed]    BIT            DEFAULT (CONVERT([bit],(0))) NULL,
    [IsActive]    BIT            DEFAULT (CONVERT([bit],(1))) NULL,
    [IsDeleted]   BIT            DEFAULT (CONVERT([bit],(0))) NULL,
    [IdCompany]   INT            NOT NULL,
    [SeasonYear]  INT            NULL,
    CONSTRAINT [PK_Seasons] PRIMARY KEY CLUSTERED ([IdSeason] ASC),
    CONSTRAINT [FK_Seasons_Companies_IdCompany] FOREIGN KEY ([IdCompany]) REFERENCES [dbo].[Companies] ([IdCompany])
);


GO
CREATE NONCLUSTERED INDEX [IX_Seasons_IdCompany]
    ON [dbo].[Seasons]([IdCompany] ASC);

