using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using DevExpress.Web;

public partial class SiteMaster : System.Web.UI.MasterPage {

        public List<Table> listTables = new List<Table>();
        

        protected void Page_Load(object sender, EventArgs e) {
            
            string lenh = "SELECT name, object_id FROM  QLDSV_TC.sys.Tables WHERE is_ms_shipped = 0 AND name != 'sysdiagrams'";
            DataTable dt = DB.ExecSqlDataTable(lenh);
            ListTable.DataSource = dt;
            ListTable.DataBind();
        }
}