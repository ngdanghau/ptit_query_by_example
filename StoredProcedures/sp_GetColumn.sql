USE [QLDSV_TC]
GO
/****** Object:  StoredProcedure [dbo].[sp_GetColumn]    Script Date: 3/13/2022 9:34:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE OR ALTER   PROCEDURE [dbo].[sp_GetColumn]
	-- khai bao cac bien tam 
	@OBJECT_ID int
AS
BEGIN
	SELECT a.name, b.DATA_TYPE, b.CHARACTER_MAXIMUM_LENGTH
	FROM 
		QLDSV_TC.sys.columns a
	JOIN QLDSV_TC.INFORMATION_SCHEMA.COLUMNS b
	ON a.name = b.COLUMN_NAME AND b.TABLE_NAME = OBJECT_NAME(@OBJECT_ID)
	WHERE a.object_id = @OBJECT_ID AND a.is_rowguidcol = 0 
	GROUP BY a.name, b.DATA_TYPE, b.CHARACTER_MAXIMUM_LENGTH, a.column_id
	ORDER BY a.column_id

END
