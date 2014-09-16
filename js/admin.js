$(function() {
    // Set Admin Page Global Variables
    $.adminGlob = {};
    $.adminGlob.onTabClick = {
        tabs_0 : onTestServerClick,
        tabs_1 : onRealSeverClick,
        tabs_2 : onStatisticsClick
    };

    var myModal = new AXModal();
    myModal.setConfig({
        windowID:"myModalCT", width:740,
        displayLoading:true
    });

    $.adminGlob.myModal = myModal;

    // Set Tabs
    $("#tabs").tabs();

    // Set Event Handler for activating Tabs
    $( "#tabs" ).on( "tabsactivate", function( event, ui ) {
        var old = ui.oldPanel.selector.substring(1, ui.newPanel.selector.length);
        var key = ui.newPanel.selector.substring(1, ui.newPanel.selector.length)
        $.adminGlob.onTabClick[key](old, key);
    });


    $('#detail_dialog').hide();

    // Create Grids on tabs_0
    onCreateAhUserGrid();
    onCreateSquareGrid();
    onCreateAhIdUserGrid();

    doBindingJobs();


    var index = localStorage.tabIndex;
    if (index == undefined) index = 0;
    $( "#tabs" ).tabs({ active: index });

    if (index == 0) {
        initTestServer();
    }
});

/*
    Event Handlers
 */
function onTestServerClick(old, _new) {
    $('#tabs_0 div').replaceWith($('#'+old).children()[0]);
    $('#'+old).prepend('<div></div>');
    localStorage.setItem("tabIndex", 0);
    $('#tabs_0 div').show();
    initTestServer();
}

function onRealSeverClick(old, _new) {
    $('#tabs_1 div').replaceWith($('#'+old).children()[0]);
    $('#'+old).prepend('<div></div>');
    localStorage.setItem("tabIndex", 1);
    $('#tabs_1 div').show();
    initRealServer();
}

function onStatisticsClick(old, _new) {
    $('#tabs_2 div:first').replaceWith($('#'+old).children()[0]);
    $('#'+old).prepend('<div></div>');
    localStorage.setItem("tabIndex", 2);
    $('#tabs_2 div:first').hide();
    initStatistics();
}


function initTestServer() {
    $.adminGlob.client = new MobileClient(GlobalVariables.TEST_URL, GlobalVariables.TEST_KEY);
    doCommonServerInit();
//    localStorage.setItem("body", $(this).children()[0]);
}

function initRealServer() {
    $.adminGlob.client = new MobileClient(GlobalVariables.REAL_URL, GlobalVariables.REAL_KEY);
    doCommonServerInit();
//    localStorage.setItem("body", $(this).children()[0]);
}

function initStatistics() {
    $.adminGlob.client = new MobileClient(GlobalVariables.REAL_URL, GlobalVariables.REAL_KEY);
    $.adminGlob.userHelper = new UserHelper($.adminGlob.client.getClient());
    $.adminGlob.squareHelper = new SquareHelper($.adminGlob.client.getClient());
    $.adminGlob.messageHelper = new MessageHelper($.adminGlob.client.getClient());
    $.adminGlob.ahIdUserHelper = new AhIdUserHelper($.adminGlob.client.getClient());
    $.adminGlob.appVersionHelper = new AppVersionHelper($.adminGlob.client.getClient());
    $.adminGlob.logHelper = new LogHelper($.adminGlob.client.getClient());

    $.adminGlob.page = 0;

    $.adminGlob.logHelper.listByMethod(LogHelper.METHOD.ENTER, {
        success: function(userList) {
            $.adminGlob.logHelper.userList = userList;

        }, error: function(err) {

        }
    });

    doStatsBindingJobs();
}

function doStatsBindingJobs() {

    $.each($('#message_list_div select'), function(index, value){
        for(var i = 0 ; i < 24 ; i++) {
            $(this).append("<option value='"+i+"'>"+i+"</option>");
        }
    });


    $('#message_search_btn').click(function(evt){
        $('#message_list').empty();
        var startDate = $('#start_date').val().replace(/-/gi, "");
        var startTime = $('#start_time').val();

        var endDate = $('#end_date').val().replace(/-/gi, "");
        var endTime = $('#end_time').val();

        var start = makeTermString(startDate, startTime);
        var end = makeTermString(endDate, endTime);

        $.adminGlob.page = 0;

        $.adminGlob.logHelper.listMessage(AhMessage.TYPE.TALK, start, end, $.adminGlob.page, {
            success: function(results, totalCount) {
                $.adminGlob.messageList = results;
                for(var i = 0 ; i < results.length ; i++) {
                    $('#message_list').append("<div>" + setMessageUI(results[i])+"</div>");
                }
                $('#count_label').text(results.length + "/" + totalCount);
            }, error: function(err) {
                console.log(err);
            }
        });
    });

    $('#message_after_btn').click(function(evt){
        var startDate = $('#start_date').val().replace(/-/gi, "");
        var startTime = $('#start_time').val();

        var endDate = $('#end_date').val().replace(/-/gi, "");
        var endTime = $('#end_time').val();

        var start = makeTermString(startDate, startTime);
        var end = makeTermString(endDate, endTime);

        $.adminGlob.page++;
        $.adminGlob.logHelper.listMessage(AhMessage.TYPE.TALK, start, end, $.adminGlob.page, {
            success: function(results, totalCount) {
                $.adminGlob.messageList = $.merge($.adminGlob.messageList, results);
                for(var i = 0 ; i < results.length ; i++) {
                    $('#message_list').append("<div>" + setMessageUI(results[i])+"</div>");
                }
                $('#count_label').text($.adminGlob.messageList.length + "/" + totalCount);
            }, error: function(err) {
                console.log(err);
            }
        });
    });


    $('#export_chat').click(function(evt){
        var startDate = $('#start_date').val();
        var startTime = $('#start_time').val();

        var endDate = $('#end_date').val();
        var endTime = $('#end_time').val();

        var filename = "[Chat]" + startDate + "-"+startTime + "_" + endDate + "-" + endTime;

        DownloadJSON2CSV($.adminGlob.messageList, filename);
    });



    $.each($('#csv_div .hour'), function(index, value){
        for(var i = 0 ; i < 24 ; i++) {
            $(this).append("<option value='"+i+"'>"+i+"</option>");
        }
    });

    $.each($('#select_name_log'), function(index, value){
        $(this).append("<option value='ALL'>-ALL-</option>");
        for (var i in LogHelper.NAME) {
            $(this).append("<option value='"+i+"'>"+i+"</option>");
        }
    });

    $.each($('#select_method_log'), function(index, value){
        $(this).append("<option value='ALL'>-ALL-</option>");
        for (var i in LogHelper.METHOD) {
            $(this).append("<option value='"+i+"'>"+i+"</option>");
        }
    });



    $('#search_btn_log').click(function(evt){
        var startDate = $('#start_date_log').val().replace(/-/gi, "");
        var startTime = $('#start_time_log').val();

        var endDate = $('#end_date_log').val().replace(/-/gi, "");
        var endTime = $('#end_time_log').val();

        var start = makeTermString(startDate, startTime);
        var end = makeTermString(endDate, endTime);

        var eventName = $('#select_name_log').val();
        var eventMethod = $('#select_method_log').val();
        if (eventName == 'ALL') eventName = undefined;
        if (eventMethod == 'ALL') eventMethod = undefined;

        $.adminGlob.pageLog = 0;

        $.adminGlob.logHelper.listLog(eventName, eventMethod, start, end, $.adminGlob.pageLog, {
            success: function(results, totalCount) {
                $.adminGlob.logList = results;
                $('#count_log_label').text($.adminGlob.logList.length + "/" + totalCount);
            }, error: function(err) {
                console.log(err);
            }
        });
    });

    $('#log_next_btn').click(function(evt){
        var startDate = $('#start_date_log').val().replace(/-/gi, "");
        var startTime = $('#start_time_log').val();

        var endDate = $('#end_date_log').val().replace(/-/gi, "");
        var endTime = $('#end_time_log').val();

        var start = makeTermString(startDate, startTime);
        var end = makeTermString(endDate, endTime);

        var eventName = $('#select_name_log').val();
        var eventMethod = $('#select_method_log').val();
        if (eventName == 'ALL') eventName = undefined;
        if (eventMethod == 'ALL') eventMethod = undefined;

        $.adminGlob.pageLog++;
        $.adminGlob.logHelper.listLog(eventName, eventMethod, start, end, $.adminGlob.pageLog, {
            success: function(results, totalCount) {
                $.adminGlob.logList = $.merge($.adminGlob.logList, results);
                $('#count_log_label').text($.adminGlob.logList.length + "/" + totalCount);
            }, error: function(err) {
                console.log(err);
            }
        });
    });

    $('#export_log_btn').click(function(evt){
        var startDate = $('#start_date_log').val();
        var startTime = $('#start_time_log').val();

        var endDate = $('#end_date_log').val();
        var endTime = $('#end_time_log').val();

        var filename = "[Log]"+startDate + "-"+startTime + "_" + endDate + "-" + endTime;

        DownloadJSON2CSV($.adminGlob.logList, filename);

//        var id01 = '5DA1C13E-4144-4230-9EDA-5A74AF820CD4';
//        var id02 = 'ED3B43BF-032B-4B59-97AE-E2ADBAB06283';
//        var id03 = '3B99B504-440A-4A44-AB70-39ACD23F5D62';
//
//        $.adminGlob.logHelper.get(id01, {
//            success: function(results) {
//                console.log(results);
//            }, error: function(err) {
//                console.log(err);
//            }
//        });
    });
}

function setMessageUI(item) {
    var user = $.adminGlob.logHelper.getUserLocal(item["senderId"]);

    if (user == null) {
        user = {
            id : "276668BC-1C16-4B6A-A05D-9EE32CDED887",
            isMale : "Unkown",
            age : "Unkown"
        };
    }
//    user.id = "276668BC-1C16-4B6A-A05D-9EE32CDED887";
    var genderHtml = user.isMale ? "<img src='/chupamanager/img/chat_gender_m.png'/>" : "<img src='/chupamanager/img/chat_gender_w.png'/>";
    if (user.isMale == 'Unkown') genderHtml = "";
    var timeStr = item["event_time"].substring(5, item['event_time'].length);
    timeStr = timeStr.substring(0, timeStr.length-4) + "]";
    var html = "" +
        "<div class='message_container'>" +
        "<div class='message_info'>" +
        "<div class='message_detail'>" +
        "<div class='message_sender'>" + item["sender"] + "</div>" +
        "<div class='message_age'>[" + user.age+ "]</div>" +
        "<div class='message_gender'>" + genderHtml+ "</div>" +
        "</div>" +
        "<div class='message_time'>"+timeStr+"</div>" +
        "<div class='message_content'>"+item["content"] +"</div>" +

        "</div>" +
        "</div>";

    return html;
}

function DownloadJSON2CSV(objArray, filename)
{
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    if (filename == undefined) filename = "download";
    var keys = Object.keys(array[0]);
    var obj = {};
    for (var i = 0 ; i < keys.length ; i++) {
        obj["key"+i] = keys[i];
    }
    array.unshift(obj);
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';

        for (var index in array[i]) {
            if (typeof(array[i][index]) == 'string' && array[i][index].contains('\n')) array[i][index] = array[i][index].replace(/\n/gi, "");
            line += (array[i][index]) + ',';
        }

        // Here is an example where you would wrap the values in double quotes
        // for (var index in array[i]) {
        //    line += '"' + array[i][index] + '",';
        // }

        line.slice(0,line.length-1);

        str += line + '\r\n';

    }
    var blob = new Blob([str], {
        type: "text/csv;charset=utf-8;"
    });
    saveAs(blob, filename + ".csv");
}

function doCommonServerInit() {
    mask.open();
    $.adminGlob.userHelper = new UserHelper($.adminGlob.client.getClient());
    $.adminGlob.squareHelper = new SquareHelper($.adminGlob.client.getClient());
    $.adminGlob.messageHelper = new MessageHelper($.adminGlob.client.getClient());
    $.adminGlob.ahIdUserHelper = new AhIdUserHelper($.adminGlob.client.getClient());
    $.adminGlob.appVersionHelper = new AppVersionHelper($.adminGlob.client.getClient());
    $.adminGlob.logHelper = new LogHelper($.adminGlob.client.getClient());

    $.adminGlob.userHelper.list({
        success: function(results) {
            $.adminGlob.ahUserGrid.setList(results);
        }, error: function(err) {
            GlobalVariables.Log(err);
        }
    });

    $.adminGlob.squareHelper.list({
        success: function(results) {
//            var ddd = {id : "id",
//                    name : "name",
//                whoMade:"whoMade",
//                isAdmin:"isAdmin",
//                code:"code",
//                maleNum:"maleNum",
//                femaleNum:"femaleNum",
//                longitude:"longitude",
//                latitude:"latitude",
//                distance:"distance"};
//            var arr = [ddd];
//            arr = arr.concat(results);
            $.adminGlob.squareGrid.setList(results);
            $.adminGlob.squareGrid.removeList([{id: "id"}]);
        }, error: function(err) {
            GlobalVariables.Log(err);
        }
    });

    $.adminGlob.ahIdUserHelper.list({
        success: function(results) {
            $.adminGlob.ahIdUserGrid.setList(results);
        }, error: function(err) {
            GlobalVariables.Log(err);
        }
    });

    $.adminGlob.appVersionHelper.get({
        success: function(result) {
            $('#AppVersionCode').text(result.version);
            $('#AppVersionOptionEdit').val(result.type);
            $('#AppVersionId').val(result.id);
        }, error: function(err) {
            GlobalVariables.Log(err);
        }
    });
    mask.close();
}




/*
    onCreateAhUserGrid
 */
function onCreateAhUserGrid() {
    var ahUserGrid = new AXGrid();
    $.adminGlob.ahUserGrid = ahUserGrid;

    ahUserGrid.setConfig({
        targetID : "AhUserGrid",
        // fitToWidth:true,
        colGroup : [
            {key:"id", label:"id", width:"140", align:"center"},
            {key:"nickName", label:"nickName", width:"180", align: "center"},
            {key:"isMale", label:"isMale", width:"100", align: "center"},
            {key:"age", label:"age", width:"80", align: "center"},
            {key:"companyNum", label:"companyNum", width:"120", align: "center"},
            {key:"squareId", label:"squareId", width:"130", align: "center"},
            {key:"ahIdUserKey", label:"ahIdUserKey", width:"130", align: "center"},
            {key:"isChupaEnable", label:"ChupaEnable", width:"130", align: "center"},
            {key:"registrationId", label:"registrationId", width:"70", align: "center"},
            {key:"mobileId", label:"mobileId", width:"70", align: "center"},
            {key:"profilePic", label:"profilePic", width:"70", align: "center"}
        ],
        colHeadAlign:"center",
        body : {
            onclick: function(){
//                toast.push(Object.toJSON(this.item));
                // squareGrid.setEditor(this.item, 1);
//                console.log(contextMenu);
            },
            oncheck: function(){

            }
        },
        editor: {
            rows: [
                [
                    {
                        colSeq:0, align:"center", valign:"middle",
                        formatter: function(){
                            return this.item.id;
                        }
                    },
                    {colSeq:1, align:"center", valign:"middle", form:{type:"text", value:"itemValue"}},
                    {colSeq:2, align:"center", valign:"middle", form:{type:"select", options:[
                        {value:'true', text:'true'},
                        {value:'false', text:'false'}
                    ]}
                    },
                    {colSeq:3, align:"center", valign:"middle", form:{type:"text", value:"itemValue"}, AXBind:{type:"number"}},
                    {colSeq:4, align:"center", valign:"middle", form:{type:"text", value:"itemValue"}, AXBind:{type:"number"}},
                    {
                        colSeq:5, align:"center", valign:"middle",
                        formatter: function(){
                            return this.item.squareId;
                        }
                    },
                    {
                        colSeq:6, align:"center", valign:"middle",
                        formatter: function(){
                            return this.item.ahIdUserKey;
                        }
                    },
                    {colSeq:7, align:"center", valign:"middle", form:{type:"select", options:[
                        {value:'true', text:'true'},
                        {value:'false', text:'false'}
                    ]}
                    },
                    {colSeq:8, align:"center", valign:"middle",formatter: null},
                    {colSeq:9, align:"center", valign:"middle",formatter: null},
                    {colSeq:10, align:"center", valign:"middle",formatter: null}
                ]
            ],
            response: function(){ // ajax 응답에 대해 예외 처리 필요시 response 구현
                // response에서 처리 할 수 있는 객체 들
                //trace({res:this.res, index:this.index, insertIndex:this.insertIndex, list:this.list, page:this.page});
                if(this.index == null){ // 추가

                }else{ // 수정
                    var item = this.res.item;
                    delete item["requestType"];
                    AXUtil.overwriteObject(this.list[this.index], this.res.item, true); // this.list[this.index] object 에 this.res.item 값 덮어쓰기
                    ahUserGrid.updateList(this.index, this.list[this.index]);

                    $.adminGlob.userHelper.update(item, {
                        success: function(result) {
                            $.adminGlob.userHelper.list({
                                success: function(results) {
                                    $.adminGlob.ahUserGrid.setList(results);
                                }, error: function(err) {
                                    GlobalVariables.Log(err);
                                }
                            });
                        }, error: function(err) {
                            GlobalVariables.Log(err);
                        }
                    });
                }
            }
        },
        contextMenu: {
            theme:"AXContextMenu", // 선택항목
            width:"150", // 선택항목
            menu:[
                {
                    userType:1, label:"강퇴하기", className:"cut", onclick:function(){
                        if(this.sendObj){

                            if(!confirm(this.sendObj.item.nickName+"님을 정말 강퇴 하시겠습니까?")) return;
                            var removeList = [];
                            var message = new AhMessage.Builder()
                                .setType(AhMessage.TYPE.FORCED_LOGOUT)
                                .setContent("FORCED_LOGOUT")
                                .setSender(GlobalVariables.OWNER.sender)
                                .setSenderId(GlobalVariables.OWNER.senderId)
                                .setReceiver(this.sendObj.item.nickName)
                                .setReceiverId(this.sendObj.item.id)
                                .build()

                            // do server job
                            $.adminGlob.messageHelper.sendMessage(message, {
                                success: function(result) {
                                    $.adminGlob.userHelper.list({
                                        success: function(results) {
                                            $.adminGlob.userHelper.list({
                                                success: function(_results) {
                                                    $.adminGlob.ahUserGrid.setList(_results);
                                                }, error: function(err) {
                                                    GlobalVariables.Log(err);
                                                }
                                            });
                                        }, error: function(err) {
                                            GlobalVariables.Log(err);
                                        }
                                    });

                                }, error: function(err) {
                                    GlobalVariables.Log(err);
                                    console.log(err);
                                }
                            });

                        }
                    }
                },
                {
                    userType:1, label:"수정하기", className:"edit", onclick:function(){

                        if(this.sendObj){
                            ahUserGrid.setEditor(this.sendObj.item, this.sendObj.index);
                            $('#AhUserGrid_AX_editorButtons').css({top: "35px"});
                        }
                    }
                },
                {
                    userType:1, label:"삭제하기", className:"minus", onclick:function(){
                        if(this.sendObj){

                            if(!confirm("정말 삭제 하시겠습니까?")) return;

                            var item = this.sendObj.item;

                            $.adminGlob.userHelper.delete(item.id, {
                                success: function(result) {
                                    ahUserGrid.removeList([{id:item.id}]);
                                }, error: function(err) {
                                    GlobalVariables.Log(err);
                                    console.log(err);
                                }
                            });
                        }
                    }
                },
                {
                    userType:1, label:"상세보기", className:"docline", onclick:function(){
                        if (!this.sendObj) return;
                        $("#detail_dialog").css("display", "block");
                        var item = this.sendObj.item;
                        var message = "";
                        for (var key in item) {
                            message += "<div>[" + key + "] : "+item[key] + "\n</div>";
                        }

                        $("#detail_dialog").append("<div>" + message +"</div>");

                        $.adminGlob.myModal.openDiv({
                            modalID:"modalDiv01",
                            targetID:"detail_dialog",
                            width:500,
                            top:50,
                            closeByEscKey: true
                        });
                    }
                }
            ],
            filter: function(id){
                return true;
            }
        }
    });
}


/*
    onCreateSquareGrid
 */

function onCreateSquareGrid() {
    var squareGrid = new AXGrid();
    $.adminGlob.squareGrid = squareGrid;

    squareGrid.setConfig({
        targetID : "SquareGrid",
        // fitToWidth:true,
        colGroup : [
            {key:"id", label:"id", width:"100", align:"middle", align:"center"},
            {key:"name", label:"name", width:"160", align:"center"},
            {key:"whoMade", label:"whoMade", width:"160", align:"center"},
            {key:"isAdmin", label:"isAdmin", width:"90", align:"center"},
            {key:"code", label:"code", width:"120", align:"center"},
            {key:"maleNum", label:"maleNum", width:"100", align:"center"},
            {key:"femaleNum", label:"femaleNum", width:"100", align:"center"},
            {key:"longitude", label:"longitude", width:"120", align:"center"},
            {key:"latitude", label:"latitude", width:"120", align:"center"},
            {key:"distance", label:"distance", width:"70", align:"center"}
        ],
        colHeadAlign:"center",
        body : {
            onclick: function(){
                // toast.push(Object.toJSON(this.item));
                // squareGrid.setEditor(this.item, 1);
            },
            oncheck: function(){

            }
        },
        editor: {
            rows: [
                [
                    {
                        colSeq:0, align:"center", valign:"bottom",
                        formatter: function(){
                            return this.item.id;
                        }
                    },
                    {colSeq:1, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}},
                    {colSeq:2, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}},
                    {colSeq:3, align:"center", valign:"middle", form:{type:"select", options:[
                        {value:'true', text:'true'},
                        {value:'false', text:'false'}
                    ]}
                    },
                    {colSeq:4, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}},
                    {colSeq:5, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}, AXBind:{type:"number"}},
                    {colSeq:6, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}, AXBind:{type:"number"}},
                    {colSeq:7, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}, AXBind:{type:"number"}},
                    {colSeq:8, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}, AXBind:{type:"number"}},
                    {colSeq:9, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}, AXBind:{type:"number"}}
                ]
            ],
            response: function(){ // ajax 응답에 대해 예외 처리 필요시 response 구현

                if(this.index == null){ // 추가
                    var item = this.res.item;

                    delete item["requestType"];

                    $.adminGlob.squareHelper.add(item, {
                        success: function(result) {
                            $.adminGlob.squareHelper.list({
                                success: function(results) {
                                    $.adminGlob.squareGrid.setList(results);
                                }, error: function(err) {
                                    GlobalVariables.Log(err);
                                }
                            });
                        }, error: function(err) {
                            GlobalVariables.Log(err);
                        }
                    });

                }else{ // 수정

                    AXUtil.overwriteObject(this.list[this.index], this.res.item, true); // this.list[this.index] object 에 this.res.item 값 덮어쓰기
                    squareGrid.updateList(this.index, this.list[this.index]);

                    delete this.res.item["requestType"];

                    $.adminGlob.squareHelper.update(this.res.item, {
                        success: function(result) {
                            $.adminGlob.squareHelper.list({
                                success: function(results) {
                                    $.adminGlob.squareGrid.setList(results);
                                }, error: function(err) {
                                    GlobalVariables.Log(err);
                                }
                            });
                        }, error: function(err) {
                            GlobalVariables.Log(err);
                        }
                    });
//                    var query = squareTable.update(this.res.item)
//                        .done(function (results) {
//                            refreshSquareList();
//                        }, function (error) {
//                            console.log(error);
//                            $('#errorlog').append($('<li>').text(error.message));
//                        });

                }

            }
        },
        contextMenu: {
            theme:"AXContextMenu", // 선택항목
            width:"150", // 선택항목
            menu:[
                {
                    userType:1, label:"추가하기", className:"plus", onclick:function(){
                        squareGrid.appendList(null);
//                        $('#SquareGrid_AX_editorButtons').css({top: "40px"});
                    }
                },
                {
                    userType:1, label:"삭제하기", className:"minus", onclick:function(){
                        if(this.sendObj){

                            if(!confirm("정말 삭제 하시겠습니까?")) return;
                            var itemId = this.sendObj.item.id;
                            $.adminGlob.squareHelper.delete(itemId, {
                               success: function(result) {
                                   squareGrid.removeList([{id:itemId}]);
                               }, error: function(err) {
                                    GlobalVariables.Log(err);
                                }
                            });
                        }
                    }
                },
                {
                    userType:1, label:"수정하기", className:"edit", onclick:function(){
                        console.log(this, this.sendObj);
                        if(this.sendObj){
                            squareGrid.setEditor(this.sendObj.item, this.sendObj.index);
                            $('#SquareGrid_AX_editorButtons').css({top: "40px"});
                        }
                    }
                },
                {
                    userType:1, label:"상세보기", className:"docline", onclick:function(){

                        if (!this.sendObj) return;
                        $("#detail_dialog").css("display", "block");
                        var item = this.sendObj.item;
                        var message = "";
                        for (var key in item) {
                            message += "<div>[" + key + "] : "+item[key] + "\n</div>";
                        }

                        $("#detail_dialog").append("<div>" + message +"</div>");

                        $.adminGlob.myModal.openDiv({
                            modalID:"modalDiv01",
                            targetID:"detail_dialog",
                            width:500,
                            top:50,
                            closeByEscKey: true
                        });
                    }
                }
            ],
            filter:function(id){
                return true;
            }
        }
    });
}




/*
    onCreateAhIdUserGrid
 */
function onCreateAhIdUserGrid() {
    var ahIdUserGrid = new AXGrid();
    $.adminGlob.ahIdUserGrid = ahIdUserGrid;

    ahIdUserGrid.setConfig({
        targetID : "AhIdUserGrid",
        // fitToWidth:true,
        colGroup : [
            {key:"id", label:"id", width:"300", align:"middle"},
            {key:"ahId", label:"ahId", width:"300"},
            {key:"androidId", label:"androidId", width:"300"},
            {key:"password", label:"password", width:"300"}
        ],
        colHeadAlign:"center",
        body : {
            onclick: function(){

            },
            oncheck: function(){

            }
        },
        editor: {
            rows: [
                [
                    {
                        colSeq:0, align:"center", valign:"bottom",
                        formatter: function(){
                            return this.item.id;
                        }
                    },
                    {colSeq:1, align:"center", valign:"bottom", formatter: null},
                    {colSeq:2, align:"center", valign:"bottom", formatter: null},
                    {colSeq:3, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}}
                ]
            ],
            response: function(){ // ajax 응답에 대해 예외 처리 필요시 response 구현

                if(this.index == null){ // 추가


                }else{ // 수정

                    AXUtil.overwriteObject(this.list[this.index], this.res.item, true); // this.list[this.index] object 에 this.res.item 값 덮어쓰기
                    ahIdUserGrid.updateList(this.index, this.list[this.index]);

                    var item = this.res.item;
                    delete item["requestType"];

                    $.adminGlob.ahIdUserHelper.update(item, {
                        success: function(results) {
                            $.adminGlob.ahIdUserHelper.list({
                                success: function(results) {
                                    $.adminGlob.ahIdUserGrid.setList(results);
                                }, error: function(err) {
                                    GlobalVariables.Log(err);
                                }
                            });
                        }, error: function(err) {
                            GlobalVariables.Log(err);
                        }
                    });

                }

            }
        },
        contextMenu: {
            theme:"AXContextMenu", // 선택항목
            width:"150", // 선택항목
            menu:[
                {
                    userType:1, label:"상세보기", className:"docline", onclick:function(){
                        $("#detail_dialog").css("display", "block");
                        var item = this.sendObj.item;
                        var message = "";
                        for (var key in item) {
                            message += "<div>[" + key + "] : "+item[key] + "\n</div>";
                        }

                        $("#detail_dialog").append("<div>" + message +"</div>");

                        $.adminGlob.myModal.openDiv({
                            modalID:"modalDiv01",
                            targetID:"detail_dialog",
                            width:500,
                            top:50,
                            closeByEscKey: true
                        });
                    }
                },
                {
                    userType:1, label:"삭제하기", className:"minus", onclick:function(){
                        if(this.sendObj){

                            if(!confirm("정말 삭제 하시겠습니까? 잘못하면 ERROR남. 책임 안짐.")) return;

                            var item = this.sendObj.item;

                            $.adminGlob.ahIdUserHelper.delete(item.id, {
                                success: function(results) {
                                    $.adminGlob.ahIdUserGrid.removeList([{id:item.id}]);
                                }, error: function(err) {
                                    GlobalVariables.Log(err);
                                }
                            });

                        }
                    }
                },
                {
                    userType:1, label:"수정하기", className:"edit", onclick:function(){

                    if(this.sendObj){
                        $.adminGlob.ahIdUserGrid.setEditor(this.sendObj.item, this.sendObj.index);
                        $('#AhIdUserGrid_AX_editorButtons').css({top: "40px"});

                    }
                }
                }
            ],
            filter:function(id){
                return true;
            }
        }
    });
}

function doBindingJobs() {

    $('#AppVersionCode').click(function(evt){
        if(!localStorage.codeClick)
            alert('수정할려면 입력후 엔터, 취소는 다른 곳 클릭! 형아 두번 말 안한다.');
        localStorage.setItem("codeClick", true);
        $('#AppVersionCodeEdit').val($('#AppVersionCode').text());
        $('#AppVersionCode').hide();
        $('#AppVersionCodeEdit').show();
        $('#AppVersionCodeEdit').focus();
    });

    $('#AppVersionCodeEdit').keypress(function(evt){
        // Enter
        if ( evt.which == 13 ) {
            var newVersion = $('#AppVersionCodeEdit').val();
            var appVersion = {
                id : $('#AppVersionId').val(),
                version : newVersion,
                type : $('#AppVersionOptionEdit').val()
            };
            $('#AppVersionCode').show();
            $('#AppVersionCodeEdit').hide();
            $.adminGlob.appVersionHelper.update(appVersion, {
                success: function(result) {
                    $('#AppVersionCode').text(newVersion);
                }, error: function(err) {
                    GlobalVariables.Log(err);
                }
            });
        }
    });

    $('#AppVersionCodeEdit').focusout(function(evt){
        $('#AppVersionCode').show();
        $('#AppVersionCodeEdit').hide();
        evt.preventDefault();
    });





    $('#AppVersionOptionEdit').change(function(evt){

        var appVersion = {
            id : $('#AppVersionId').val(),
            version : $('#AppVersionCode').text(),
            type : $('#AppVersionOptionEdit').val()
        };
        $.adminGlob.appVersionHelper.update(appVersion, {
            success: function(result) {
            }, error: function(err) {
                console.log(err);
                GlobalVariables.Log(err);
            }
        });

    });

    jQuery.fn.extend({
        addOption: function(id, item) {
            $(this).append("<option id='" + id + "'>"+item+"</option>>")
        }
    });

    jQuery.extend({
        ahFindById: function(id) {

            if (id==null || id==undefined) return null;

            var list = $.adminGlob.ahUserGrid.list;
            for(var i = 0 ; i < list.length ; i++) {
                if (list[i].id == id) return list[i];
            }
            list = $.adminGlob.squareGrid.list;
            for(var i = 0 ; i < list.length ; i++) {
                if (list[i].id == id) return list[i];
            }

            if (id == GlobalVariables.OWNER.senderId) return GlobalVariables.OWNER;
            return null;
        }
    });



    $('#message_type').change(function(evt) {

        var type = $('#message_type').val();
        if (type == AhMessage.TYPE.MESSAGE_READ || type == AhMessage.TYPE.UPDATE_USER_INFO) {
            alert('NOT IMPLEMENTED YET');
            $('#message_type').val("-Message TYPE-");
            return;
        }

        var list = $.adminGlob.ahUserGrid.list;
        $('#message_from').empty();
        $('#message_from').addOption("-","-FROM-");
        $('#message_from').addOption(GlobalVariables.OWNER.senderId,"["+GlobalVariables.OWNER.sender+"]");
        for(var i = 0 ; i < list.length ; i++) {
            $('#message_from').addOption(list[i].id, list[i].nickName);
        }

    });

    $('#message_from').change(function(evt) {

        var type = $('#message_type').val();
        $('#message_to').empty();
        $('#message_to').addOption("-","-TO-");

        // 1 to many
        if (type == AhMessage.TYPE.TALK || type == AhMessage.TYPE.ENTER_SQUARE
            || type == AhMessage.TYPE.EXIT_SQUARE || type == AhMessage.TYPE.ADMIN_MESSAGE) {
            var list = $.adminGlob.squareGrid.list;
            for(var i = 0 ; i < list.length ; i++) {
                $('#message_to').addOption(list[i].id, list[i].name);
            }
        // 1 to 1
        } else if (type == AhMessage.TYPE.CHUPA || type == AhMessage.TYPE.FORCED_LOGOUT) {
            var list = $.adminGlob.ahUserGrid.list;
            for(var i = 0 ; i < list.length ; i++) {
                $('#message_to').addOption(list[i].id, list[i].nickName);
            }
        } else {
            // NOT IMPLEMENTED YET
        }
    });

    $('#message_to').change(function(evt) {
        var sender = $('#message_from').val();
        var receiver = $('#message_to').val();
        if (sender == receiver) return;
        
//        $('#message_send').removeAttr('disabled');

    });


    $('#message_content').keypress(function(evt){
        if ( evt.which == 13 ) {
            _sendMessage();
        }
    });

    $('#message_send').click(function(evt){
        _sendMessage();
    });

    function _sendMessage() {
        var type = $('#message_type').val();
        var fromId = $('#message_from').children(":selected").attr("id");
        var toId   = $('#message_to').children(":selected").attr("id");
        var content = $('#message_content').val();

        var senderObj = $.ahFindById(fromId);
        var sender = senderObj.nickName;
        var senderId = senderObj.id;


        var receiverObj = $.ahFindById(toId);
        var receiver = receiverObj.nickName;
        if (receiver == undefined) receiver = "";
        var receiverId = receiverObj.id;

        // if the sender is Administrator
        if (fromId == GlobalVariables.OWNER.senderId) {
            sender = GlobalVariables.OWNER.sender;
            senderId = receiverObj.squareId;
        }

        var message = new AhMessage.Builder()
            .setType(type)
            .setContent(content)
            .setSender(sender)
            .setSenderId(senderId)
            .setReceiver(receiver)
            .setReceiverId(receiverId)
            .build()

        // do server job
        $.adminGlob.messageHelper.sendMessage(message, {
            success: function(result) {
//                alert('메세지 전송 성공');
                console.log(message);
            }, error: function(err) {
                GlobalVariables.Log(err);
                console.log(err);
            }
        });

        $('#message_content').val('');
    }

}

function makeTermString(date, time) {
    var num = ""+date + (LogHelper.getDigit(time) == 1 ? "0"+time : time);
    return LogHelper.fillZero(num, 14);
}



