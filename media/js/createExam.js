$(function () {
    //试题类型DOM arr
    var examItems = $(".item");
    var currentSelectedIndex;
    //题型类型, 与后端确认参数名, 这里以数字代替
    var types = [];
    for (var i = 0; i < 7; i++) {
        types.push(i);
    }
    //题型显示隐藏
    $(".controls input[type='checkbox']").on("change", function () {
        var that = $(this);
        var index = that.index("input[type='checkbox']");
        console.log(that.prop("checked"));
        if (that.prop("checked")) {
            examItems.eq(index).show();
        } else {
            examItems.eq(index).hide();
        }
        resetItemNum();
    })

    //临时保存后端获取的题, 两种
    var tmpData;
    //临时保存已选的试题数据
    var selectdTests = [];
    //选择试题
    $(".chooseBtn").on("click", function () {
        tmpData = {default: [], my: []};
        $(".testList").html("");
        var that = $(this);
        //根据index获取题型
        currentSelectedIndex = that.index(".chooseBtn");
        console.log("当前选择的题型" + currentSelectedIndex);
        /*
        $.ajax({
            url: "api",
            method: post,
            dataType: "json", 
            data: {
                type: types[index]
            },
            success: function(res){
                
            }
        })
        */
        //激活的默认或者我的
        var typeStr = $(".test_wrap").find(".active").children("a").html();
        getData(typeStr == "默认试题" ? "default" : "my");
    });

    //获取数据并渲染
    var getData = function(type) {
        // $.ajax({})
        setTimeout(function() {
            var resData = {
                    items: [
                        {
                            id: 123,
                            type: "选择题",
                            content: "这是"+type+"啊实打实的股份第三个试题中的一道选择题",
                            options: ["可复制性", "不可重复性", "学习学习", "凹凹来了"]
                        },
                        {
                            id: 124,
                            type: "选择题",
                            content: "阿拉德贺"+type+"电话费破阿斯哈佛前不耐烦",
                            options: ["萨达开奖号", "今天天气不错", "嗯好的", "女儿国"]
                        }
                    ]
                };
            tmpData[type] = resData.items;
            //如果题目已经有了就不能再选了, 需要一个当前已选的数据和后台拿来的数据对比
            //获取当前已选的题
            var currentTestIds = [];

            $(".item").find("tr:not(:first)").each(function() {
                currentTestIds.push($(this).data("id"));
            });
            console.log(currentTestIds);
            for (var i = 0; i < resData.items.length; i++) {
                var hasSel = currentTestIds.indexOf(resData.items[i]["id"]) > -1;
                var testLitStru = $('<div class="testList-item clearfix" data-id='+resData.items[i]["id"]+'>'+
'				<div class="test-left pull-left">'+
'					<p>'+resData.items[i]["content"]+'</p>'+
'				</div><div class="test-right pull-right">'+
'					<button type="button" class="btn btn-primary" data-choose="'+hasSel+'"' + (hasSel ? "disabled" : "") + '>'+ (hasSel ? "已选择" : "选用") +'</button>'+
'				</div>');
                $("#"+type+"Test .testList").append(testLitStru);
            }
        }, 500);
    }

    //题库切换
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        if($(e.target).attr("href") == "#myTest"){
             if(tmpData["my"].length == 0) {
                getData("my");
             }   
        }else {
            if(tmpData["default"].length == 0) {
                getData("default");
            }
        }
    })


    //选用
    $(".content").on("click", "button[data-choose]", function() {
        var that = $(this);
        console.log(that.data("choose"));
        if(that.data("choose")) {
            that.data("choose", false);
            that.html("选用");
            var id = that.parents(".testList-item").data("id");
            for(var i in selectdTests) {
                if(selectdTests[i]["id"] == id) {
                    selectdTests.splice(i, 1);
                }
            }
        }else {
            that.data("choose", true);
            that.html("取消");
            var id = that.parents(".testList-item").data("id");
            var typeStr = $(".test_wrap").find(".active").children("a").html();
            var type = typeStr == "默认试题" ? "default" : "my";
            var testItem = tmpData[type];
            for(var i in tmpData[type]) {
                if(tmpData[type][i]["id"] == id) {
                    selectdTests.push(tmpData[type][i]);
                }
            }
        }
    });

    //选择试题结束
    $("#saveChoose").on("click", function () {
        var currentSelectedItem = examItems.eq(currentSelectedIndex);
        
        //如果没有table需要创建
        var hasTable = currentSelectedItem.find("table").length > 0 ? true : false;
        if (!hasTable) {
            currentSelectedItem.append($("<table class='table table-bordered'>" +
                "                        <tr style=\"background-color: #ccc\">" +
                "                            <th>序号</th>" +
                "                            <th>题目</th>" +
                "                            <th>操作</th>" +
                "                        </tr>" +
                "                    </table>"));
        }
        //选中的li新建tr
        $.each(selectdTests, function (index, item) {
            var tr = $("<tr data-id="+item["id"]+"><td></td><td>" + item["content"] + "</td><td><a href=\"#\">查看</a><a href=\"#\" class='rem'>删除</a></td></tr>");
            //把选择的题放到表格中
            currentSelectedItem.find("table").append(tr);
        });
        resetTableNum(currentSelectedItem.find("table"));
        //选完清空
        tempExamData = [];
        resetScore(currentSelectedItem);
    })

    //选择模态框消失
    $("#myModal").on("hidden.bs.modal", function() {
        selectdTests = [];
    })

    //删除
    $(document).on("click", "table .rem", function () {
        //取下标
        var that = $(this);
        var index = that.parents("tr").index();
        console.log(index);
        var table = that.parents("tr").parents("table");
        that.parents("tr").remove();
        resetTableNum(table);
        resetScore(table.parents(".item"));

        if (table.find("tr").length < 2) {
            table.remove();
        }
    })


    //总分值input键盘事件
    $(document).on("keyup", ".item input[type='text']", function (e) {
        console.log(e.keyCode);
        var that = $(this);
        resetScore(that.parent(".item"));
    })

    /**
     * 处理分数
     * parm: 当前哪一个试题
     */
    var resetScore = function (examItem) {
        //总分
        var totalScore = examItem.find("input:first").val() || 0;
        //已选择?道题
        var choosedCount = examItem.find("tr").length > 0 ? examItem.find("tr").length - 1 : 0;
        examItem.find(".choosedCount").html(choosedCount);
        //每道题?分
        examItem.find(".perScore").html(choosedCount == 0 ? 0 : Math.round(totalScore / choosedCount));
    }

    /**
     * 重置序号的方法, 表格增删改查触发
     * parm: table元素
     */
    var resetTableNum = function (table) {
        table.find("tr>td:first-child").each(function () {
            console.log(this);
            $(this).html($(this).parents("tr").index());
        })
    }

    //重置大模块的序号
    var resetItemNum = function () {
        var nums_ZH = ["一", "二", "三", "四", "五", "六", "七"];
        examItems.filter(":visible").find("span:first-child").each(function (i) {
            console.log(i);
            var newTitle = $(this).html().replace(/./, nums_ZH[i]);
            $(this).html(newTitle);
        });
    }

    //预览
    //IE8需要在服务器环境才能使用
    if (!window.sessionStorage) {
        alert("请升级到IE8以上的浏览器, 否则无法使用预览功能");
    }

    var typesArr = ["单选题", "多选题", "判断题", "名词解释题", "简答题", "综合论述题", "案例分析题"];
    /*结构示例
    var struct = {
        "单选题": {
            "totalScore": 20,
            "perScore": 5,
            "count": 2,
            "tests": [
                {
                    id: 123,
                    content: "内容",
                    options: []
                },
                {
                    id: 126,
                    content: "内容",
                    options: []
                }
            ]
        }
    };*/
    $("#preview").on("click", function () {
        console.log("预览");
        if (totalScoreLimit()) {
            alert("大了");
            return;
        }
        var previewObj = {};
        var _length = $(".head input[type='checkbox']:checked").length;
        $("table").each(function (index) {
            var _key = typesArr[$(this).parents(".item").index(".item")];
            previewObj[_key] = {
                "totalScore": examItems.eq(index).find("input:first").val(),
                "perScore": examItems.eq(index).find(".perScore").html(),
                "count": examItems.eq(index).find(".choosedCount").html(),
                "tests": []
            };

            //内容
            $(this).find("tr:not(:first)").each(function () {
                previewObj[_key]["tests"].push($(this).find("td:nth-child(2)").html());
            })
        })
        sessionStorage.setItem("previewObj", JSON.stringify(previewObj));
        window.open("preview.html");
    })

    //分数验证
    var totalScoreLimit = function () {
        //总分
        var totalScore = $("#totalScore").val();
        //每个
        var allScore = 0;
        $(".item:visible").find("input:first").each(function () {
            allScore += Number($(this).val());
        })
        return totalScore == allScore;
    }

    //保存
    $("#save").on("click", function() {
        if(!totalScoreLimit()) {
            alert("请检查分数设置");
            return;
        }else{
            $.ajax({
                url: "",
                method: "post",
                data: {},
                success: function() {
                    alert("保存成功");
                }
            })
        }
    })
});