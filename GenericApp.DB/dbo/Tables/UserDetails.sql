CREATE TABLE [dbo].[UserDetails] (
    [IdUserDetail] INT            IDENTITY (1, 1) NOT NULL,
    [IdUser]       NVARCHAR (450) NOT NULL,
    [IdCompany]    INT            NOT NULL,
    CONSTRAINT [PK_UserDetails] PRIMARY KEY CLUSTERED ([IdUserDetail] ASC)
);

