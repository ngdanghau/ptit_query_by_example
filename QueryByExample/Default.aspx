<%@ Page Language="C#" AutoEventWireup="true" MasterPageFile="~/Site.master" CodeFile="Default.aspx.cs" Inherits="_Default" %>

<asp:Content ID="Content" ContentPlaceHolderID="MainContent" runat="server">
    <!-- Topbar -->
                <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
                    <h3>
                        <strong class="text-center">Query By Example</strong>
                    </h3>
                </nav>
                <!-- End of Topbar -->

                <!-- Begin Page Content -->
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12">
                             <canvas id="canvas" height="1" width="1"></canvas>
                            <div class="container-draggable card" id="listTable">

                            </div>
                        </div>
                    </div>

                    <div class="row mt-5">
                        <div class="col-12">
                            <form id="reportForm">
                                <div class="mb-3">
                                    <label for="title" class="form-label">Tiêu đề báo cáo</label>
                                    <input class="form-control" name="title" value=""/>
                                </div>
                                <div class="mb-3">
                                  <label for="querySQL" class="form-label">Query SQL</label>
                                  <textarea class="form-control" id="querySQL" name="query" rows="7"></textarea>
                                </div>
                                <div class="mb-3">
                                  <button type="button" class="btn btn-sm btn-primary"  id="genReport">Tạo báo cáo</button>
                                  
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <div class="row mt-5">
                        <div class="col-12">
                            <form method="get" id="genForm">
                                <div class="card">
                                    <div class="card-body bg-white">
                                         <button type="button" class="btn btn-sm btn-primary mb-3" id="genSQL">Gen SQL</button>
                                         <table class="table table-bordered table-sm no-border table-responsive" id="dataTable" width="100%" cellspacing="0">
                                        <tbody>
                                            <% foreach (var col in listCol) { %>
                                            <tr>
                                                <td class="no-border" style="width: 100px"><%= col %></td>
                                                <% for (int i = 0; i < 10; i++){ %>
                                                <td style="width: 150px">
                                                    <% if (col == "Table" || col == "Field"){ %>
                                                    <select class="form-select form-select-sm gen_<%= col %>" data-id="<%= i %>" id="gen_<%= col %>_<%= i %>" name="gen_<%= col %>">
                                                      <option value=""></option>
                                                    </select>
                                                    <% } %>

                                                    <% else if (col == "Show"){ %>
                                                    <div class="form-check text-center">
                                                      <input class="form-check-input" type="checkbox" value="<%= i %>" name="gen_<%= col %>" id="gen_<%= col %>_<%= i %>"/>
                                                    </div>
                                                    <% } %>
                                                
                                                    <% else if (col == "Sort"){ %>
                                                    <select class="form-select form-select-sm gen_<%= col %>" name="gen_<%= col %>" id="gen_<%= col %>">
                                                       <option value="">(not sorted)</option>
                                                       <option value="asc">Ascending</option>
                                                       <option value="desc">Descending</option>
                                                    </select>
                                                    <% } %>

                                                    <% else { %>
                                                    <input class="form-control" value="" name="gen_<%= col %>" id="gen_<%= col %>"/>
                                                    <% } %>
                                                </td>
                                                 <% } %>
                                            </tr>
                                            <% } %>

                                            <% for (int i = 0; i < 7; i++){ %>
                                            <tr>
                                                <td class="no-border">&nbsp;</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <% } %>
                                        
                                        
                                        </tbody>
                                    </table>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <!-- /.container-fluid -->

    

</asp:Content>