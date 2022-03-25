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

                            <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
                              <li class="nav-item" role="presentation">
                                <a class="nav-link active" id="relationship-panel-tab" data-toggle="pill" href="#relationship-panel" role="tab" aria-controls="relationship-panel" aria-selected="true">Relationship</a>
                              </li>
                              <li class="nav-item" role="presentation">
                                <a class="nav-link" id="sql-panel-tab" data-toggle="pill" href="#sql-panel" role="tab" aria-controls="sql-panel" aria-selected="false">SQL</a>
                              </li>
                            </ul>
                            <div class="tab-content" id="pills-tabContent">
                              <div class="tab-pane fade show active" id="relationship-panel" role="tabpanel" aria-labelledby="relationship-panel-tab">
                                   <canvas id="canvas" height="1" width="1"></canvas>
                                    <div class="container-draggable card" id="listTable">

                                    </div>
                              </div>
                              <div class="tab-pane fade" id="sql-panel" role="tabpanel" aria-labelledby="sql-panel-tab">
                                   <form id="reportForm">
                                        <div class="card">
                                            <div class="card-body">
                                                 <div class="mb-3">
                                                    <label for="title" class="form-label">Tiêu đề báo cáo</label>
                                                    <input class="form-control" name="title" value=""/>
                                                </div>
                                                <div class="mb-3">
                                                  <label for="querySQL" class="form-label">Query SQL</label>
                                                  <textarea class="form-control" id="querySQL" name="query" rows="10"></textarea>
                                                </div>
                                                <div class="mb-3">
                                                    <div class="alert alert-danger d-none" role="alert" id="error">
                                                      
                                                    </div>
                                                </div>
                                                <div class="mb-3">
                                                  <button type="button" class="btn btn-primary btn-icon-split"  id="genReport">
                                                      <span class="icon text-white-50">
                                                            <i class="fas fa-flag"></i>
                                                        </span>
                                                        <span class="text">Tạo báo cáo</span>
                                                  </button>
                                  
                                                </div>
                                            </div>
                                        </div>       
                                    </form>
                              </div>
                            </div>

                            
                        </div>
                    </div>

                    
                    
                    <div class="row mt-5">
                        <div class="col-12">
                            <form method="get" id="genForm">
                                <div class="card">
                                    <div class="card-body bg-white">
                                         
                                        <div class="row">
                                            <div class="col col-lg-7">
                                                 <button type="button" class="btn btn-primary mb-3 mr-3 btn-icon-split" id="sumSQL">
                                                     <span class="icon text-white-50">
                                                        <i class="fas fa-sigma"></i>
                                                    </span>
                                                    <span class="text">Thêm hàm thống kê SQL</span>
                                                 </button>
                                                 <button type="button" class="btn btn-warning mb-3 mr-3 btn-icon-split" id="resetSQL">
                                                     <span class="icon text-white-50">
                                                        <i class="fas fa-repeat-1"></i>
                                                    </span>
                                                    <span class="text">Reset bảng chọn</span>
                                                 </button>
                                                 <button type="button" class="btn btn-danger mb-3 mr-3 btn-icon-split" id="resetAllSQL">
                                                     <span class="icon text-white-50">
                                                        <i class="fas fa-repeat"></i>
                                                    </span>
                                                    <span class="text">Reset tất cả</span>
                                                 </button>

                                                <button type="button" class="btn btn-info mb-3 mr-3 btn-icon-split" id="addOneColumn">
                                                     <span class="icon text-white-50">
                                                        <i class="fas fa-table-columns"></i>
                                                    </span>
                                                    <span class="text">Thêm 1 cột</span>
                                                 </button>
                                      

                                                <button type="button" class="btn btn-dark mb-3 mr-3 btn-icon-split" id="addOneRow">
                                                     <span class="icon text-white-50">
                                                        <i class="fas fa-table-rows"></i>
                                                    </span>
                                                    <span class="text">Thêm 1 hàng</span>
                                                 </button>
                                            </div>
                                            <div class="col col-lg-5 text-right">
                                                 <button type="button" class="btn btn-info mb-3 mr-3 btn-icon-split" id="removeOneColumn">
                                                    <span class="icon text-white-50">
                                                        <i class="fas fa-table-columns"></i>
                                                    </span>
                                                    <span class="text">Xóa cột cuối</span>
                                                 </button>

                                                 <button type="button" class="btn btn-dark mb-3 mr-3 btn-icon-split" id="removeOneRow">
                                                     <span class="icon text-white-50">
                                                        <i class="fas fa-table-rows"></i>
                                                    </span>
                                                    <span class="text">Xóa hàng cuối</span>
                                                 </button>
                                            </div>
                                        </div>
                                        
                                       
                                          
                                        <div class="">
                                           
                                        </div>

                                         <table class="table table-bordered table-sm no-border table-responsive" id="dataTable" width="100%" cellspacing="0">
                                        <tbody>
                                            <% foreach (var col in listCol) { %>
                                            <tr id="tr_<%= col %>"  class="<%= col == "Total" ? "d-none" : "" %>">
                                                <td class="no-border" style="width: 100px"><%= col %></td>

                                                <% for (int i = 0; i < 10; i++){ %>
                                                <td style="width: 150px">
                                                    <% if (col == "Table" || col == "Field" ){ %>
                                                    <select class="form-select form-select-sm gen_<%= col %>"  name="gen_<%= col %>">
                                                      <option value=""></option>
                                                    </select>
                                                    <% } %>

                                                    <% else if (col == "Show"){ %>
                                                    <div class="form-check text-center">
                                                      <input class="form-check-input" type="checkbox" value="<%= i %>" name="gen_<%= col %>"/>
                                                    </div>
                                                    <% } %>
                                                
                                                    <% else if (col == "Sort"){ %>
                                                    <select class="form-select form-select-sm gen_<%= col %>" name="gen_<%= col %>" >
                                                       <option value="">(not sorted)</option>
                                                       <option value="asc">Ascending</option>
                                                       <option value="desc">Descending</option>
                                                    </select>
                                                    <% } %>

                                                    <% else if (col == "Total"){ %>
                                                    <select class="form-select form-select-sm gen_<%= col %>" name="gen_<%= col %>" disabled>
                                                       <option value="group_by">Group By</option>
                                                       <option value="where">Where</option>
                                                       <option value="count">Count</option>
                                                       <option value="sum">Sum</option>
                                                       <option value="min">Min</option>
                                                       <option value="max">Max</option>
                                                       <option value="avg">Avg</option>
                                                    </select>
                                                    <% } %>


                                                    <% else if (col == "Or") { %>
                                                        <input class="form-control form-control-sm gen_<%= col %>" value="" name="gen_<%= col %>"/>
                                                    <% } %>


                                                    <% else { %>
                                                        <input class="form-control form-control-sm gen_<%= col %>" value="" name="gen_<%= col %>" id="gen_<%= col %>"/>
                                                    <% } %>
                                                </td>
                                                 <% } %>
                                            </tr>
                                            <% } %>

                                            <% for (int i = 0; i < 4; i++){ %>
                                            <tr>
                                                <td class="no-border">&nbsp;</td>
                                                 <% for (int j = 0; j < 10; j++){ %>
                                                <td>
                                                    <input class="form-control form-control-sm" name="gen_Or" value=""/>
                                                </td>
                                                <% } %>
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