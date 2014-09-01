$(function() {

    // Set Admin Page Global Variables
    $.adminGlob = {};
    $.adminGlob.onTabClick = {
        tabs_1 : onTestServerClick,
        tabs_2 : onRealSeverClick,
        tabs_3 : onStatisticsClick
    };

    // Set Tabs
    $("#tabs").tabs();

    // Set Event Handler for activating Tabs
    $( "#tabs" ).on( "tabsactivate", function( event, ui ) {
        var old = ui.oldPanel.selector.substring(1, ui.newPanel.selector.length);
        var key = ui.newPanel.selector.substring(1, ui.newPanel.selector.length)
        $.adminGlob.onTabClick[key](old, key);
    });

    onCreateAhUserGrid();
    onCreateSquareGrid();
    onCreateAhIdUserGrid();

    initTestServer();
});

/*
    Event Handlers
 */
function onTestServerClick(old, _new) {
    $('#tabs_1 div').replaceWith($('#'+old).children()[0]);
    $('#'+old).append('<div></div>');

    initTestServer();
}

function onRealSeverClick(old, _new) {
    $('#tabs_2 div').replaceWith($('#'+old).children()[0]);
    $('#'+old).append('<div></div>');

    initRealServer();
}

function onStatisticsClick(old, _new) {
    $('#tabs_3 div').replaceWith($('#'+old).children()[0]);
    $('#'+old).append('<div></div>');

    initStatistics();
}


function initTestServer() {
    $.adminGlob.client = new MobileClient(GlobalVariables.TEST_URL, GlobalVariables.TEST_KEY);
    $.adminGlob.userHelper = new UserHelper($.adminGlob.client.getClient());
    $.adminGlob.SquareHelper = new SquareHelper($.adminGlob.client.getClient());
    $.adminGlob.messageHelper = new MessageHelper($.adminGlob.client.getClient());
    $.adminGlob.userHelper.list({
        success: function(results) {
           $.adminGlob.ahUserGrid.setList(results);
       }, error: function(err) {
            GlobalVariables.Log(err);
        }
    });
}

function initRealServer() {

}

function initStatistics() {

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
            {key:"isChatEnable", label:"ChatEnable", width:"120", align: "center"},
            {key:"registrationId", label:"registrationId", width:"70", align: "center"},
            {key:"mobileId", label:"mobileId", width:"70", align: "center"},
            {key:"profilePic", label:"profilePic", width:"70", align: "center"}
        ],
        colHeadAlign:"center",
        body : {
            onclick: function(){
                toast.push(Object.toJSON(this.item));
                // squareGrid.setEditor(this.item, 1);
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
                    var addItem = this.res.item;
                    delete addItem["requestType"];

                    squareTable.insert(
                        addItem
                    ).done(function (insertedAndUpdated) {
                            refreshSquareList();
                        }, function(error) {
                            console.log(error);
                            $('#errorlog').append($('<li>').text(error.message));
                        });


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
                    userType:1, label:"강퇴하기", className:"minus", onclick:function(){
                        if(this.sendObj){

                            if(!confirm("정말 강퇴 하시겠습니까?")) return;
                            var removeList = [];
                            var message = new AhMessage.Builder()
                                .setType(AhMessage.TYPE.FORCED_LOGOUT)
                                .setContent("FORCED_LOGOUT")
                                .setSender(param.owner.sender)
                                .setSenderId(param.owner.senderId)
                                .setReceiver(this.sendObj.item.nickName)
                                .setReceiverId(this.sendObj.item.id)
                                .build()

                            // do server job
                            param.messageHelper.sendMessage(message, {
                                success: function(result) {
                                    removeList.push({id:message.receiverId});
//                                    userGrid.removeList(removeList);
                                    alert(message.receiver+'님을 강퇴하였습니다.');
    //                                    GlobalVariables.Log(result);
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
                            var removeList = [];

                            removeList.push({id:this.sendObj.item.id});
                            squareGrid.removeList(removeList); // 전달한 개체와 비교하여 일치하는 대상을 제거 합니다. 이때 고유한 값이 아닌 항목을 전달 할 때에는 에러가 발생 할 수 있습니다.

                            squareTable.del({
                                id: this.sendObj.item.id
                            }).done(function () {
                                refreshSquareList();
                            }, function (error) {
                                console.log(error);
                                $('#errorlog').append($('<li>').text(error.message));
                            });

                        }
                    }
                },
                {
                    userType:1, label:"상세보기", className:"docline", onclick:function(){
                        console.log(this.sendObj.item);
                        dialog.push(Object.toJSON(this.sendObj.item));
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

                squareGrid.checkedColSeq(10, false);
                // userGrid.checkedColSeq(10, false);
                // userGrid.checkedColSeq(11, false);
                squareGrid.checkedColSeq(10, true, this.index);
                console.log(this);
                // this.checked = false;

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
                    {colSeq:3, align:"center", valign:"bottom", form:{type:"radio", options:[
                            {value:'true', text:'true'},
                            {value:'false', text:'false'}
                        ]}
                    },
                    {colSeq:4, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}},
                    {colSeq:5, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}, AXBind:{type:"number"}},
                    {colSeq:6, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}, AXBind:{type:"number"}}
                ]
            ],
            response: function(){ // ajax 응답에 대해 예외 처리 필요시 response 구현
                // response에서 처리 할 수 있는 객체 들
                //trace({res:this.res, index:this.index, insertIndex:this.insertIndex, list:this.list, page:this.page});
                if(this.index == null){ // 추가
                    var addItem = this.res.item;
                    delete addItem["requestType"];

                    squareTable.insert(
                        addItem
                    ).done(function (insertedAndUpdated) {
                            refreshSquareList();
                        }, function(error) {
                            console.log(error);
                            $('#errorlog').append($('<li>').text(error.message));
                        });


                }else{ // 수정
                    //trace(this.res.item);

                    AXUtil.overwriteObject(this.list[this.index], this.res.item, true); // this.list[this.index] object 에 this.res.item 값 덮어쓰기
                    squareGrid.updateList(this.index, this.list[this.index]);


                    delete this.res.item["requestType"];
                    var query = squareTable.update(this.res.item)
                        .done(function (results) {
                            refreshSquareList();
                        }, function (error) {
                            console.log(error);
                            $('#errorlog').append($('<li>').text(error.message));
                        });

                }

            }                    },
        contextMenu: {
            theme:"AXContextMenu", // 선택항목
            width:"150", // 선택항목
            menu:[
                {
                    userType:1, label:"상세보기", className:"docline", onclick:function(){
                    console.log(this.sendObj.item);
                    dialog.push(Object.toJSON(this.sendObj.item));
                }
                },
                {
                    userType:1, label:"추가하기", className:"plus", onclick:function(){
                    squareGrid.appendList(null);
                    //myGrid.appendList(item, index);
                    /*
                     var removeList = [];
                     removeList.push({no:this.sendObj.item.no});
                     myGrid.removeList(removeList); // 전달한 개체와 비교하여 일치하는 대상을 제거 합니다. 이때 고유한 값이 아닌 항목을 전달 할 때에는 에러가 발생 할 수 있습니다.
                     */

                    $('#SquareGrid_AX_editorButtons').css({top: "40px"});
                }
                },
                {
                    userType:1, label:"삭제하기", className:"minus", onclick:function(){
                    if(this.sendObj){

                        if(!confirm("정말 삭제 하시겠습니까?")) return;
                        var removeList = [];

                        removeList.push({id:this.sendObj.item.id});
                        squareGrid.removeList(removeList); // 전달한 개체와 비교하여 일치하는 대상을 제거 합니다. 이때 고유한 값이 아닌 항목을 전달 할 때에는 에러가 발생 할 수 있습니다.

                        squareTable.del({
                            id: this.sendObj.item.id
                        }).done(function () {
                            refreshSquareList();
                        }, function (error) {
                            console.log(error);
                            $('#errorlog').append($('<li>').text(error.message));
                        });

                    }
                }
                },
                {
                    userType:1, label:"수정하기", className:"edit", onclick:function(){
                    //trace(this);
                    // console.log(this.sendObj, squareGrid, $('#SquareGrid_AX_editorButtons'));
                    if(this.sendObj){
                        squareGrid.setEditor(this.sendObj.item, this.sendObj.index);
                        $('#SquareGrid_AX_editorButtons').css({top: "40px"});
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
                // toast.push(Object.toJSON(this.item));
                // squareGrid.setEditor(this.item, 1);
            },
            oncheck: function(){

                squareGrid.checkedColSeq(10, false);
                // userGrid.checkedColSeq(10, false);
                // userGrid.checkedColSeq(11, false);
                squareGrid.checkedColSeq(10, true, this.index);
                console.log(this);
                // this.checked = false;

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
                    {colSeq:3, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}, AXBind:{type:"number"}},
                    {colSeq:4, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}, AXBind:{type:"number"}},
                    {colSeq:5, align:"center", valign:"bottom", form:{type:"radio", options:[
                        {value:'true', text:'true'},
                        {value:'false', text:'false'}
                    ]}
                    },
                    {colSeq:6, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}},
                    {colSeq:7, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}},
                    {colSeq:8, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}},
                    {colSeq:9, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}}
                    // {colSeq:10, align:"center", valign:"bottom", form:{type:"radio", value:"itemValue", options: [
                    //     {value:'true', text:'true'},
                    //     {value:'false', text:'false'}
                    // ]}}

                ]
            ],
            response: function(){ // ajax 응답에 대해 예외 처리 필요시 response 구현
                // response에서 처리 할 수 있는 객체 들
                //trace({res:this.res, index:this.index, insertIndex:this.insertIndex, list:this.list, page:this.page});
                if(this.index == null){ // 추가
                    var addItem = this.res.item;
                    delete addItem["requestType"];

                    squareTable.insert(
                        addItem
                    ).done(function (insertedAndUpdated) {
                            refreshSquareList();
                        }, function(error) {
                            console.log(error);
                            $('#errorlog').append($('<li>').text(error.message));
                        });


                }else{ // 수정
                    //trace(this.res.item);

                    AXUtil.overwriteObject(this.list[this.index], this.res.item, true); // this.list[this.index] object 에 this.res.item 값 덮어쓰기
                    squareGrid.updateList(this.index, this.list[this.index]);


                    delete this.res.item["requestType"];
                    var query = squareTable.update(this.res.item)
                        .done(function (results) {
                            refreshSquareList();
                        }, function (error) {
                            console.log(error);
                            $('#errorlog').append($('<li>').text(error.message));
                        });

                }

            }                    },
        contextMenu: {
            theme:"AXContextMenu", // 선택항목
            width:"150", // 선택항목
            menu:[
                {
                    userType:1, label:"상세보기", className:"docline", onclick:function(){
                    console.log(this.sendObj.item);
                    dialog.push(Object.toJSON(this.sendObj.item));
                }
                },
                {
                    userType:1, label:"추가하기", className:"plus", onclick:function(){
                    squareGrid.appendList(null);
                    //myGrid.appendList(item, index);
                    /*
                     var removeList = [];
                     removeList.push({no:this.sendObj.item.no});
                     myGrid.removeList(removeList); // 전달한 개체와 비교하여 일치하는 대상을 제거 합니다. 이때 고유한 값이 아닌 항목을 전달 할 때에는 에러가 발생 할 수 있습니다.
                     */

                    $('#SquareGrid_AX_editorButtons').css({top: "40px"});
                }
                },
                {
                    userType:1, label:"삭제하기", className:"minus", onclick:function(){
                    if(this.sendObj){

                        if(!confirm("정말 삭제 하시겠습니까?")) return;
                        var removeList = [];

                        removeList.push({id:this.sendObj.item.id});
                        squareGrid.removeList(removeList); // 전달한 개체와 비교하여 일치하는 대상을 제거 합니다. 이때 고유한 값이 아닌 항목을 전달 할 때에는 에러가 발생 할 수 있습니다.

                        squareTable.del({
                            id: this.sendObj.item.id
                        }).done(function () {
                            refreshSquareList();
                        }, function (error) {
                            console.log(error);
                            $('#errorlog').append($('<li>').text(error.message));
                        });

                    }
                }
                },
                {
                    userType:1, label:"수정하기", className:"edit", onclick:function(){
                    //trace(this);
                    // console.log(this.sendObj, squareGrid, $('#SquareGrid_AX_editorButtons'));
                    if(this.sendObj){
                        squareGrid.setEditor(this.sendObj.item, this.sendObj.index);
                        $('#SquareGrid_AX_editorButtons').css({top: "40px"});
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





