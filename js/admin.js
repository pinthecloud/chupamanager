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
    $('#'+old).append('<div></div>');
    localStorage.setItem("tabIndex", 0);
    $('#tabs_0 div').show();
    initTestServer();
}

function onRealSeverClick(old, _new) {
    $('#tabs_1 div').replaceWith($('#'+old).children()[0]);
    $('#'+old).append('<div></div>');
    localStorage.setItem("tabIndex", 1);
    $('#tabs_1 div').show();
    initRealServer();
}

function onStatisticsClick(old, _new) {
    $('#tabs_2 div').replaceWith($('#'+old).children()[0]);
    $('#'+old).append('<div></div>');
    localStorage.setItem("tabIndex", 2);
    $('#tabs_2 div').hide();
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

//    localStorage.setItem("body", $(this).children()[0]);
}

function doCommonServerInit() {
    mask.open();
    $.adminGlob.userHelper = new UserHelper($.adminGlob.client.getClient());
    $.adminGlob.squareHelper = new SquareHelper($.adminGlob.client.getClient());
    $.adminGlob.messageHelper = new MessageHelper($.adminGlob.client.getClient());
    $.adminGlob.ahIdUserHelper = new AhIdUserHelper($.adminGlob.client.getClient());
    $.adminGlob.appVersionHelper = new AppVersionHelper($.adminGlob.client.getClient());

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
                    {
                        colSeq:4, align:"center", valign:"middle",
                        formatter: function(){
                            return this.item.squareId;
                        }
                    },
                    {
                        colSeq:5, align:"center", valign:"middle",
                        formatter: function(){
                            return this.item.ahIdUserKey;
                        }
                    },
                    {colSeq:6, align:"center", valign:"middle", form:{type:"select", options:[
                        {value:'true', text:'true'},
                        {value:'false', text:'false'}
                    ]}
                    },
                    {colSeq:7, align:"center", valign:"middle",formatter: null},
                    {colSeq:8, align:"center", valign:"middle",formatter: null},
                    {colSeq:9, align:"center", valign:"middle",formatter: null}
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
                },

            ],
            filter:function(id){
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
            {key:"id", label:"id", width:"100", align:"middle"},
            {key:"name", label:"name", width:"180"},
            {key:"whoMade", label:"whoMade", width:"180"},
            {key:"isAdmin", label:"isAdmin", width:"100"},
            {key:"code", label:"code", width:"130"},
            {key:"maleNum", label:"maleNum", width:"130"},
            {key:"femaleNum", label:"femaleNum", width:"130"},
            {key:"longitude", label:"longitude", width:"70"},
            {key:"latitude", label:"latitude", width:"70"},
            {key:"distance", label:"distance", width:"70"}
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
                    {colSeq:7, align:"center", valign:"bottom",
                        formatter: function() {
                            return 0;
                        }},
                    {colSeq:8, align:"center", valign:"bottom",
                        formatter: function() {
                            return 0;
                        }},
                    {colSeq:9, align:"center", valign:"bottom",
                        formatter: function() {
                            return 0;
                        }}
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

    $('#message_send').click(function(evt){
        var type = $('#message_type').val();
        var fromId = $('#message_from').children(":selected").attr("id");
        var toId   = $('#message_to').children(":selected").attr("id");
        var content = $('#message_content').val();

        var senderObj = $.ahFindById(fromId);
        var sender = senderObj.nickName;
        var senderId = senderObj.id;
        if (fromId == GlobalVariables.OWNER.senderId) {
            sender = GlobalVariables.OWNER.sender;
            senderId = GlobalVariables.OWNER.senderId;
        }

        var receiverObj = $.ahFindById(toId);
        var receiver = receiverObj.nickName;
        if (receiver == undefined) receiver = "";
        var receiverId = receiverObj.id;

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
//        $('#message_send').attr('disabled', 'disabled');
    });



}



