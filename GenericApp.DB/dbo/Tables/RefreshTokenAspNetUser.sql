CREATE TABLE [dbo].[RefreshTokenAspNetUser] (
    [IdRefreshTokenAspNetUser] INT            IDENTITY (1, 1) NOT NULL,
    [CreationDate]             DATETIME2 (7)  DEFAULT (getdate()) NOT NULL,
    [IdUser]                   NVARCHAR (450) NOT NULL,
    [RefreshToken]             NVARCHAR (500) NOT NULL,
    [IsActive]                 BIT            DEFAULT ((1)) NULL,
    CONSTRAINT [PK_RefreshTokenAspNetUser] PRIMARY KEY CLUSTERED ([IdRefreshTokenAspNetUser] ASC)
);

