var colors = ["black", "silver", "gray", "white", "maroon", "red", "purple", "fuchsia", "green", "lime", "olive", "yellow", "navy", "blue", "teal", "aqua", "orange", "antiquewhite", "aquamarine", "beige", "bisque", "blanchedalmond", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick", "forestgreen",  "gold", "goldenrod", "greenyellow", "grey", "hotpink", "indianred", "indigo", "khaki", "lawngreen", "lemonchiffon",  "limegreen", "linen", "magenta", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mistyrose", "moccasin", "navajowhite", "olivedrab", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "sienna", "skyblue", "slateblue", "slategray", "slategrey", "springgreen", "steelblue", "tan", "thistle", "tomato", "turquoise", "violet", "wheat", "yellowgreen", "rebeccapurple"];
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
            ForeignKeys.push(item);
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

function clear() {
    const canvas = document.querySelector('#canvas');

    if (!canvas.getContext) {
        return;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

}

function setGenTable() {
    var html = '<option value=""></option>';
    html += QBE.Tables.map(function (c) { return '<option value="' + c.object_id + "$$" + c.name + '">' + c.name + '</option>'; }).join('');

    $(".gen_Table").html(html);
    $(".gen_Table").trigger("change");
}

window.QBE = {};
QBE.ForeignKeys = [];
QBE.Tables = [];


$(function () {
    function getForeignKey(object_id) {
        $.ajax({
            url: 'Default.aspx/getForeignKey',
            method: 'post',
            contentType: "application/json",
            data: '{object_id:' + object_id + '}',
            dataType: "json",
            success: function (resp) {
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
            },
            error: function (err) {
                console.log(err);
            }
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

     
    $('body').on('click', '.btnGetColumn', function () {
        var object_id = $(this).data("id");
        var name = $(this).data("name");

        var table = $("table[id=table_" + object_id + "]");
        if (table.length > 0) {
            $("a[id=a_" + object_id + "]").parents().removeClass("active");

            QBE.Tables = QBE.Tables.filter(table => table.object_id != object_id);
            QBE.ForeignKeys = QBE.ForeignKeys.filter(table => table.object_id != object_id);

            table.remove();
            clear();
            draw();
            setGenTable();
            return;
        }

        $.ajax({
            url: 'Default.aspx/getColumns',
            method: 'post',
            contentType: "application/json",
            data: '{object_id:' + object_id + '}',
            dataType: "json",
            success: function (resp) {
                draggable.draggable("destroy");
                
                var html = "<table class=\"draggable shadow table-sql\" data-id=\""+object_id+"\" id=\"table_" + object_id + "\">" +
                    "<thead>" +
                    "<tr>" +
                    "<th scope=\"col\">" + name + "</th>" +
                    "</tr>" +
                    "</thead>" +
                    "<tbody>";
                html += "<tr data-column=\"" + name + ".*\" data-id=\"*\"><th scope=\"row\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*</th></tr>";
                var data = JSON.parse(resp.d);

                QBE.Tables.push({
                    name: name,
                    object_id: object_id,
                    columns: data
                });

                for (let i = 0; i < data.length; i++) {
                    var type = data[i].CHARACTER_MAXIMUM_LENGTH != null ? "(" + data[i].CHARACTER_MAXIMUM_LENGTH + ")" : "";
                    var pk = data[i].is_primary_key ? "<img src=\"Content/images/b_primary.png\"/>&nbsp;" : "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                    html += "<tr data-column=\"" + name + "." + data[i].name +"\" data-id=\"" +data[i].name+"\"><th scope=\"row\">" + pk + data[i].name + ": " + data[i].DATA_TYPE + type +"</th></tr>";
                }

                html += "</tbody></table>";

                $("#listTable").append(html);
                $(".draggable").draggable(options);
                $("a[id=a_" + object_id + "]").parents().addClass("active");
                getForeignKey(object_id);
                setGenTable();
            },
            error: function (err) {
                console.log(err);
            }
        });
    });

    $('body').on('change', '.gen_Table', function () {
        var value = this.value.split("$$");
        var object_id = value.length > 0 ? value[0] : '';
        var id = $(this).attr("data-id");
        var elm = $("#gen_Field_" + id);
        var elm_check_show = $("#gen_Show_" + id);
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

    $('body').on('click', '#genSQL', function () {

        var data = $("#genForm").serializeArray();
        var result = {
            object_ids: []
        };
        for (let i = 0; i < data.length; i++) {
            if (!result[data[i].name]) {
                result[data[i].name] = [];
            }
            var value = data[i].value;
            var object_id = "";
            if (data[i].value.includes("$$")) {
                var array = data[i].value.split("$$");
                object_id = array[0];
                value = array[1];
            }
            if (data[i].name == "gen_Table") {
                result["object_ids"].push(object_id);
            }
            result[data[i].name].push(value);
        }
        if (!result.gen_Show) result.gen_Show = [];

        $.ajax({
            url: 'Default.aspx/genSQL',
            method: 'post',
            contentType: "application/json",
            data: JSON.stringify(result),
            dataType: "json",
            success: function (resp) {
                if (resp.d) {
                    if (resp.d.includes("ERROR|")) {
                        Swal.fire("Lỗi!", resp.d.replace("ERROR|", ""), 'error');
                    } else {
                        $("#querySQL").val(resp.d);
                    }
                }
                else {
                    Swal.fire("Thất bại!", "Lỗi hệ thống! Hãy thử lại!", 'error');
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    });

    $('body').on('click', '#genReport', function () {

        var data = $("#reportForm").serializeArray();
        var result = {};
        for (let i = 0; i < data.length; i++) {
            result[data[i].name] = data[i].value;
        }
        $.ajax({
            url: 'Default.aspx/genReport',
            method: 'post',
            contentType: "application/json",
            data: JSON.stringify(result),
            dataType: "json",
            success: function (resp) {
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
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
});