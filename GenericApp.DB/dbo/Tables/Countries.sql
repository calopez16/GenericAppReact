CREATE TABLE [dbo].[Countries] (
    [IdCountry]   INT            IDENTITY (1, 1) NOT NULL,
    [Description] NVARCHAR (150) NOT NULL,
    [IsActive]    BIT            DEFAULT (CONVERT([bit],(1))) NULL,
    [IsDeleted]   BIT            DEFAULT (CONVERT([bit],(0))) NULL,
    CONSTRAINT [PK_Countries] PRIMARY KEY CLUSTERED ([IdCountry] ASC)
);

