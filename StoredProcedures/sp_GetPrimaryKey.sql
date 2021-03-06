USE [QLDSV_TC]
GO
/****** Object:  StoredProcedure [dbo].[sp_GetColumn]    Script Date: 3/21/2022 8:06:15 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE OR ALTER     PROCEDURE [dbo].[sp_GetPrimaryKey]
	-- khai bao cac bien tam 
	@OBJECT_ID int
AS
BEGIN
	SELECT  c.name
		FROM QLDSV_TC.sys.indexes i
			inner join QLDSV_TC.sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
			inner join QLDSV_TC.sys.columns c ON ic.object_id = c.object_id AND c.column_id = ic.column_id
		WHERE i.is_primary_key = 1
		AND i.object_ID = @OBJECT_ID


END
