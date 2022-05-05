var colors = ["black", "silver", "gray", "white", "maroon", "red", "purple", "fuchsia", "green", "lime", "olive", "yellow", "navy", "blue", "teal", "aqua",  "antiquewhite", "aquamarine", "beige", "blanchedalmond", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick", "forestgreen",  "gold", "goldenrod", "greenyellow", "grey", "hotpink", "indianred", "indigo", "khaki", "lawngreen", "lemonchiffon",  "limegreen", "linen", "magenta", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mistyrose", "moccasin", "navajowhite", "olivedrab", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "sienna", "skyblue", "slateblue", "slategray", "slategrey", "steelblue", "tan", "thistle", "tomato", "turquoise", "violet", "wheat", "yellowgreen", "rebeccapurple"];
var operators = [">=", "<=", ">", "<", "="];

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

// Hàm lấy tọa độ của elm
function getOffset(elm, parent) {
    var offset_elm = elm.offset();

    if (parent) {
        var result = {
            top: offset_elm.top - parent.top,
            left: offset_elm.left - parent.left,
            bottom: offset_elm.top + elm.outerHeight() - parent.top,
            right: offset_elm.left + elm.outerWidth() - parent.left,
        }
    } else {
        var result = {
            top: offset_elm.top,
            left: offset_elm.left,
            bottom: offset_elm.top + elm.outerHeight(),
            right: offset_elm.left + elm.outerWidth()
        }
    }
    
    return result;
}

//Hàm vẽ canvas
function draw() {
    const canvas = document.querySelector('#canvas');

    if (!canvas.getContext) {
        return;
    }

    var listTable = document.getElementById("listTable");
    canvas.width = listTable.clientWidth;
    canvas.height = listTable.clientHeight;

    const ctx = canvas.getContext('2d');
    // set line stroke and line width
    ctx.lineWidth = 2;


    var parent = $("#listTable");
    var offset_parent = getOffset(parent, null);

    var ForeignKeys = [];
    for (var table of QBE.ForeignKeys) {
        for (var item of table.data) {
            if (!ForeignKeys.some(data => data.FK_NAME == item.FK_NAME)) {
                ForeignKeys.push(item);
            }
        }
    }

    var position = {
        moveToX: 0,
        moveToY: 0,
        lineToX: 0,
        lineToY: 0
    }

    for (var fk of ForeignKeys ) {
        var table = $("#table_" + fk.object_id);
        var referenced_table = $("#table_" + fk.referenced_object_id);

        if (table.length < 1 || referenced_table.length < 1) {
            continue;
        }

        var elm = table.find("tr[data-id=" + fk.column + "]");
        var offset_col = getOffset(elm, offset_parent);

        var referenced_elm = referenced_table.find("tr[data-id=" + fk.referenced_column + "]");
        var offset_referenced_col = getOffset(referenced_elm, offset_parent);

        ctx.beginPath();
        ctx.strokeStyle = fk.color;

        if (offset_col.left > offset_referenced_col.left) {
            position.moveToX = offset_col.left;
            position.moveToY = offset_col.top + 15;
            position.lineToX = offset_referenced_col.right;
            position.lineToY = offset_referenced_col.bottom - 15;
        } else {
            position.moveToX = offset_referenced_col.left;
            position.moveToY = offset_referenced_col.top + 15;
            position.lineToX = offset_col.right;
            position.lineToY = offset_col.bottom - 15;
        }

        ctx.moveTo(position.moveToX, position.moveToY);
        ctx.lineTo(position.lineToX, position.lineToY);

        ctx.stroke();

        // draw circle
        ctx.beginPath();
        ctx.arc(position.moveToX, position.moveToY, 3, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.strokeStyle = fk.color;
        ctx.fillStyle = fk.color;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(position.lineToX, position.lineToY, 3, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.strokeStyle = fk.color;
        ctx.fillStyle = fk.color;
        ctx.stroke();
    }


}

// Hàm xóa canvas
function clear() {
    const canvas = document.querySelector('#canvas');

    if (!canvas.getContext) {
        return;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

}

// Thêm bảng mới vào danh sách Table
function addOptionGenTable(table) {
    var value = table.object_id + "$$" + table.name;
    var html = '<option value="' + value + '">' + table.name + '</option>';
    $(".gen_Table").append(html);
}

// Xóa bảng khỏi danh sách Table
function removeOptionGenTable(table) {
    var value = table.object_id + "$$" + table.name;

    var item = $(".gen_Table option[value='" + value + "']");
    var item_selected = $(".gen_Table option[value='" + value + "']:selected");
    var isChange = item_selected.length > 0;
    var parent = item_selected.parent();
    item.remove();

    if (isChange) {
        parent.trigger("change");
    }
}

window.QBE = {};
QBE.ForeignKeys = [];
QBE.Tables = [];


$(function () {

    function genData(){
        // Tạo lại data => json
        var data = $("#genForm").serializeArray();
        var result = {
            object_ids: []
        };
        for (let i = 0; i < data.length; i++) {
            var name = data[i].name;
            var value = data[i].value;

            if (!result[name]) {
                result[name] = [];
            }



            var object_id = "";
            if (data[i].value.includes("$$")) {
                var array = data[i].value.split("$$");
                object_id = array[0];
                value = array[1];
            }
            if (name == "gen_Table") {
                result["object_ids"].push(object_id);
            }

            result[name].push(value);


        }
        if (!result.gen_Show) result.gen_Show = [];
        if (!result.gen_Total) result.gen_Total = [];

        var noOfColumn = document.getElementById('dataTable').rows[0].cells.length - 1;
        var genOr = [];
        for (let i = 0; i < result.gen_Or.length; i += noOfColumn) {
            genOr.push(result.gen_Or.slice(i, i + noOfColumn));
        }
        result.gen_Or = genOr;
        result.TableList = QBE.Tables.map(item => item.name);
        return result;
    }

    function ajaxRequest(url, data, callback) {
        $.ajax({
            url: url,
            method: 'post',
            contentType: "application/json",
            data: JSON.stringify(data),
            dataType: "json",
            success: function (resp) {
                callback(resp);
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
    // Lấy danh sách các khóa ngoại và sau đó vẽ lại nó bằng canvas
    function getForeignKey(object_id) {
        ajaxRequest('Default.aspx/getForeignKey', { object_id: object_id } , function (resp) {
            var data = JSON.parse(resp.d);
            if (data.length > 0) {
                data.map(item => {
                    item.color = colors[Math.floor(Math.random() * colors.length)];
                    return item;
                });

                QBE.ForeignKeys.push({
                    object_id: object_id,
                    data: data
                });
            }
            draw();
        });
    }

    clear();
    var options = {
        containment: "parent",
        scroll: true,
        start: function (event, ui) {
            clear();
        },
        stop: function (event, ui) {
            draw();
        }
    };

    var draggable = $(".draggable").draggable(options);

    function removeTableFromRelationShip(data, elm) {
        $("a[id=a_" + data.object_id + "]").parents().removeClass("active");

        QBE.Tables = QBE.Tables.filter(table => table.object_id != data.object_id);
        QBE.ForeignKeys = QBE.ForeignKeys.filter(table => table.object_id != data.object_id);

        elm.remove();
        clear();
        draw();
        removeOptionGenTable(data);
    }

    $.contextMenu({
        selector: '.context-menu',
        callback: function (key, options) {
            var item = options.$trigger,
                object_id = item.attr("data-id"),
                name = item.attr("data-name");

            var table = $("table[id=table_" + object_id + "]");
            // nếu bảng đã tồn tại trên relationship thì xóa nó khỏi 
            if (table.length > 0) {
                removeTableFromRelationShip({ object_id, name }, table)
                return;
            }
        },
        items: {
            "delete": { name: "Delete", icon: "delete" },
        }
    });  

     // Sự kiện click vào tên table => hiện table ở bảng relationship
    $('body').on('click', '.btnGetColumn', function () {
        var object_id = $(this).data("id");
        var name = $(this).data("name");

        var table = $("table[id=table_" + object_id + "]");
        // nếu bảng đã tồn tại trên relationship thì xóa nó khỏi 
        if (table.length > 0) {
            removeTableFromRelationShip({ object_id, name }, table);
            return;
        }

        // Thực hiện requset lên server lấy danh sách các cột của 1 bảng nào đó theo object_id
        ajaxRequest('Default.aspx/getColumns', { object_id: object_id }, function (respGetColumns) {
            ajaxRequest('Default.aspx/getPrimaryKey', { object_id: object_id }, function (respGetPrimaryKey) {
                draggable.draggable("destroy");

                // vẽ lại nó trên bảng relationship
                var html = "<table class=\"draggable shadow table-sql context-menu\" data-name=\"" + name + "\" data-id=\"" + object_id + "\" id=\"table_" + object_id + "\">" +
                    "<thead>" +
                    "<tr>" +
                    "<th scope=\"col\">" + name + "</th>" +
                    "</tr>" +
                    "</thead>" +
                    "<tbody>";
                html += "<tr data-column=\"" + name + ".*\" data-id=\"*\"><th scope=\"row\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*</th></tr>";
                var dataColumn = JSON.parse(respGetColumns.d);

                var dataTable = {
                    name: name,
                    object_id: object_id,
                    columns: dataColumn
                };
                QBE.Tables.push(dataTable);

                var dataPrimaryKey = JSON.parse(respGetPrimaryKey.d).map(item => item.name);

                for (let i = 0; i < dataColumn.length; i++) {
                    var type = dataColumn[i].CHARACTER_MAXIMUM_LENGTH != null ? "(" + dataColumn[i].CHARACTER_MAXIMUM_LENGTH + ")" : "";
                    var pk = dataPrimaryKey.includes(dataColumn[i].name) ? "<img src=\"Content/images/b_primary.png\"/>&nbsp;" : "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                    html += "<tr data-column=\"" + name + "." + dataColumn[i].name + "\" data-id=\"" + dataColumn[i].name + "\"><th scope=\"row\">" + pk + dataColumn[i].name + ": " + dataColumn[i].DATA_TYPE + type + "</th></tr>";
                }

                html += "</tbody></table>";

                $("#listTable").append(html);
                $(".draggable").draggable(options);
                $("a[id=a_" + object_id + "]").parents().addClass("active");
                getForeignKey(object_id);
                addOptionGenTable(dataTable);
            });
        });
    });

    // Sự kiện nếu chọn cột table => lấy column hiện thị ra bảng chọn field
    $('body').on('change', '.gen_Table', function () {
        var $this = $(this);
        var value = $this.val().split("$$");
        var object_id = value.length > 0 ? value[0] : '';
        var idx = $('#tr_Table td').index($this.parent());

        var elm = $("#tr_Field td:eq(" + idx + ")").find("select[name=gen_Field]");
        var elm_check_show = $("#tr_Show td:eq(" + idx + ")").find("input[name=gen_Show]");;
        var html = '';

        if (!object_id || object_id == "") {
            html = '<option value=""></option>';
            elm.html(html);
            elm_check_show.prop("checked", false);
            return;
        }

        
        var table = QBE.Tables.find(item => item.object_id == object_id);

        html += '<option value="*">*</option>';
        html += table.columns.map(function (c) { return '<option value="' + c.name + '">' + c.name + '</option>'; }).join('');
        elm.html(html);
        elm_check_show.prop("checked", true);
    });

    // Sự kiện click nút tạo câu lệnh query SQL
    $('body').on('keyup change', '#genForm', function () {
        // thực hiện request lên server để gen câu lệnh sql
        var result = genData();
        var $errorElm = $("#error");
        ajaxRequest('Default.aspx/genSQL', result, function (resp) {
            var errorMsg = "";
            if (resp.d) {
                if (resp.d.includes("ERROR|")) {
                    errorMsg = resp.d.replace("ERROR|", "");
                } else {
                    errorMsg = "";
                    $("#querySQL").val(resp.d);
                }
            }
            else {
                errorMsg =  "Lỗi hệ thống! Hãy thử lại!";
            }

            if (errorMsg == "" && !$errorElm.hasClass("d-none")) {
                $errorElm.addClass("d-none");
            } else if (errorMsg != "" && $errorElm.hasClass("d-none")) {
                $errorElm.removeClass("d-none");
            }
            $errorElm.html(errorMsg);

        });
    });

    // sự kiện click nút tạo report
    $('body').on('click', '#genReport', function () {

        $("#reportForm").find(".card").addClass("loading");
        var data = $("#reportForm").serializeArray();
        var result = {};
        for (let i = 0; i < data.length; i++) {
            result[data[i].name] = data[i].value;
        }

        ajaxRequest('Default.aspx/genReport', result, function (resp) {
            if (resp.d) {
                if (resp.d.includes("ERROR|")) {
                    Swal.fire("Lỗi!", resp.d.replace("ERROR|", ""), 'error');
                } else {
                    window.open('/Viewer.aspx', '_blank');
                }
            }
            else {
                Swal.fire("Thất bại!", "Lỗi hệ thống! Hãy thử lại!", 'error');
            }
            $("#reportForm").find(".card").removeClass("loading");
        });
    });


    // sự kiện click nút tạo hàm thống kê
    $('body').on('click', '#sumSQL', function () {
        if ($("#tr_Total").hasClass("d-none")) {
            $("#tr_Total").removeClass("d-none");
            $(".gen_Total").prop("disabled", false);
        } else {
            $("#tr_Total").addClass("d-none");
            $(".gen_Total").prop("disabled", true);
        }

        $("#genForm").trigger("change");
        
    });

    // sự kiện click nút reset tất cả
    $('body').on('click', '#resetAllSQL', function () {
        Swal.fire({
            title: 'Hãy chắc chắn thao tác này!',
            icon: 'warning',
            showCancelButton: true,
            focusConfirm: false
        }).then((result) => {
            if (result.isConfirmed) {
                $("#genForm").trigger("reset");
                $("#reportForm").trigger("reset");
                $(".gen_Field option").each(function (index) {
                    if ($(this).val() != "") {
                        $(this).remove();
                    }
                });

                $(".item_table.active").each(function (index) {
                    $(this).find("a").click();
                });

                Swal.fire('Đã reset!', '', 'success')
            }
           

        })

       
    });


    // sự kiện click nút reset bảng chọn
    $('body').on('click', '#resetSQL', function () {
        Swal.fire({
            title: 'Hãy chắc chắn thao tác này!',
            icon: 'warning',
            showCancelButton: true,
            focusConfirm: false
        }).then((result) => {
            if (result.isConfirmed) {
                $("#genForm").trigger("reset");
                Swal.fire('Đã reset!', '', 'success')
            }


        })


    });
    // sự kiện click nút thêm 1 hàng
    $('body').on('click', '#addOneRow', function () {
        var noOfColumn = document.getElementById('dataTable').rows[0].cells.length - 1;
        var html = `<tr> <td class="no-border">&nbsp;</td>`;

        for (let i = 0; i < noOfColumn; i++) {
            html += '<td> <input class="form-control form-control-sm" name="gen_Or" value=""> </td>';
        }

        html += '</tr>';
        $("#dataTable tbody").append(html);
    });

    // sự kiện click nút thêm 1 hàng
    $('body').on('click', '#addOneColumn', function () {
        $('#dataTable tr').each(function () {
            $(this).append($(this).find('td:last').clone());
        });

        var elm_table = $('#tr_Table td:last').find("select[name=gen_Table]");
        elm_table.val("");
        elm_table.trigger("change");
    });

    $('body').on('click', '#removeOneRow', function () {
        if ($('#dataTable tbody tr').length == 12) {
            Swal.fire("Cảnh báo!", "Không xóa được nữa!", 'warning');
            return;
        }
        $('#dataTable tbody tr:last').remove();
    });
    $('body').on('click', '#removeOneColumn', function () {
        var noOfColumn = document.getElementById('dataTable').rows[0].cells.length - 1;
        if (noOfColumn == 10) {
            Swal.fire("Cảnh báo!", "Không xóa được nữa!", 'warning');
            return;
        }

        $('#dataTable tr').each(function () {
            $(this).find('td:last').remove();
        });
    });
});