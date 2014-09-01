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
        var key = ui.newPanel.selector.substring(1, ui.newPanel.selector.length)
        $.adminGlob.onTabClick[key]();
    });

    onCreateAhUserGrid();
    onCreateSquareGrid();
    onCreateAhIdUserGrid();
});

/*
    Event Handlers
 */
function onTestServerClick() {
}

function onRealSeverClick() {
}

function onStatisticsClick() {
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
            {key:"id", label:"id", width:"200", align:"left"},
            {key:"nickName", label:"nickName", width:"200"},
            {key:"isMale", label:"isMale", width:"100"},
            {key:"age", label:"age", width:"100"},
            {key:"squareId", label:"squareId", width:"100"},
            {key:"ahIdUserKey", label:"ahIdUserKey", width:"100"},
            {key:"isChupaEnable", label:"isChupaEnable", width:"100"},
            {key:"isChatEnable", label:"isChatEnable", width:"100"},
            {key:"registrationId", label:"registrationId", width:"70"},
            {key:"mobileId", label:"mobileId", width:"70"},
            {key:"profilePic", label:"profilePic", width:"70"}
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
            {key:"id", label:"id", width:"200", align:"left"},
            {key:"nickName", label:"nickName", width:"200"},
            {key:"isMale", label:"isMale", width:"100"},
            {key:"age", label:"age", width:"100"},
            {key:"squareId", label:"squareId", width:"100"},
            {key:"ahIdUserKey", label:"ahIdUserKey", width:"100"},
            {key:"isChupaEnable", label:"isChupaEnable", width:"100"},
            {key:"isChatEnable", label:"isChatEnable", width:"100"},
            {key:"registrationId", label:"registrationId", width:"70"},
            {key:"mobileId", label:"mobileId", width:"70"},
            {key:"profilePic", label:"profilePic", width:"70"}
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
            {key:"id", label:"id", width:"200", align:"left"},
            {key:"nickName", label:"nickName", width:"200"},
            {key:"isMale", label:"isMale", width:"100"},
            {key:"age", label:"age", width:"100"},
            {key:"squareId", label:"squareId", width:"100"},
            {key:"ahIdUserKey", label:"ahIdUserKey", width:"100"},
            {key:"isChupaEnable", label:"isChupaEnable", width:"100"},
            {key:"isChatEnable", label:"isChatEnable", width:"100"},
            {key:"registrationId", label:"registrationId", width:"70"},
            {key:"mobileId", label:"mobileId", width:"70"},
            {key:"profilePic", label:"profilePic", width:"70"}
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





