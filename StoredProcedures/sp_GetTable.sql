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
CREATE OR ALTER   PROCEDURE [dbo].[sp_GetTable]
	-- khai bao cac bien tam 
AS
BEGIN
	SELECT name, object_id FROM  QLDSV_TC.sys.Tables WHERE is_ms_shipped = 0 AND name != 'sysdiagrams'

END
