﻿using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class Viewer : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (Session["querySQL"] != null && Session["title"] != null)
        {
            var title = Session["title"].ToString();
            var sql = Session["querySQL"].ToString();

            DataTable dt = DB.ExecSqlDataTable(sql);

            ASPxDocumentViewer1.Report = new XtraReport1(title, dt);
        }
        else
        {
            Response.Redirect("/");
        }
    }
}