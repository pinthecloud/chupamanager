/**
 * Created by hongkunyoo on 2014. 8. 30..
 */
$(function($){
    $.ownerGlob = {};
    var filter_arr = ['id', 'age', 'nickName', 'isMale','companyNum', 'isChupaEnable', 'enterTime'];
    var owner = {};
    owner.sender = "관리자";
    owner.senderId = GlobalVariables.OWNER.senderId
    $.ownerGlob.owner = owner;


    var id = window.location.search.split("&")[0];
    id = id.split("=")[1];
    mask.open();
//    $('#pbar').css("display", "block");
    var mClient = new MobileClient(GlobalVariables.REAL_URL,GlobalVariables.REAL_KEY);
    var userHelper = new UserHelper(mClient.getClient());
    var squareHelper = new SquareHelper(mClient.getClient());
    var messageHelper = new MessageHelper(mClient.getClient());
    $.ownerGlob.messageHelper = messageHelper;
    $.ownerGlob.squareHelper = squareHelper;
    var userGrid = makeUserGrid();
    ///////////////////////////////
    // Set up Default Dash Board
    ///////////////////////////////
    squareHelper.getSqure(id, {
        success: function(result) {
            $.ownerGlob.owner.square = result;
            $('#nick_name').text(result.whoMade);
            $('#name').text(result.name);
            $('#code').val(result.code);
            userHelper.get($.ownerGlob.owner.square.id, {
                success: function(results) {
                    results = results.map(function(item){
                        item["isMale"] = item["isMale"] ? "남" : "여";
                        item["isChupaEnable"] = item["isChupaEnable"] ? "ON" : "OFF";
                        return item;
                    });
                    userGrid.setList(results);
                    var malenum = 0, femalenum = 0, total_malenum = 0, total_femalenum = 0;
                    for(var i = 0 ; i < results.length ; i++) {
                        var user = results[i];
                        if (user.isMale) {
                            malenum++;
                            total_malenum += user.companyNum;
                        } else {
                            femalenum++;
                            total_femalenum += user.companyNum;
                        }
                    }
                    $('#malenum').text(malenum+"("+total_malenum+")");
                    $('#femalenum').text(femalenum+"("+total_femalenum+")");

                    mask.close();
                },error: function (err) {
                    console.log(err);
                    GlobalVariables.Log(err);
                }
            });

        },error: function (err) {
            console.log(err);
            GlobalVariables.Log(err);
        }
    });

    /////////////////////////////////
    // Set up Key Event Binding Jobs
    /////////////////////////////////
    doKeyBindingJobs();
});

function doKeyBindingJobs() {

    /*
        send Admin Message to All
     */
    $('#admin_message_input').keypress(function(evt){
        if ( evt.which == 13 ) {
            send_ADMIN_MESSAGE_ALL();
            evt.preventDefault();
        }
    });

    $('#admin_message_btn').click(function(evt){
        send_ADMIN_MESSAGE_ALL();
    });




    $("#message_dialog").css("display", "none");


    /*
     send Admin Message to individual
     */
    $('#message_dialog_btn').click(function(evt){
        send_ADMIN_MESSAGE();
    });

    $('#message_dialog_input').keypress(function(evt){
        if ( evt.which == 13 ) {
            send_ADMIN_MESSAGE();
            evt.preventDefault();
        }
    });

    var onCodeClick = function (evt){
        $('#code').attr("type","text");
        $('#code').attr("class", "code-field");
        $('#code_span').append("<input id='code_btn_ok' type='button' value='Change' class='code_btn'/>");
        $('#code_span').append("<input id='code_btn_cancel' type='button' value='Cancel' class='code_btn'/>");
        $('#code').unbind( "click" );
        $('#code_btn_ok').click(function(e){
            var newCode = $('#code').val();
            if ($.ownerGlob.owner.square.code != newCode) {
                $.ownerGlob.owner.square.code = newCode;
                mask.open();
                $.ownerGlob.squareHelper.update($.ownerGlob.owner.square, {
                    success: function(result) {
                        $('#code').val(newCode);
                        $('#code').attr("type","button");
                        $('#code').click(onCodeClick);
                        $('#code_btn_ok').remove();
                        $('#code_btn_cancel').remove();
                        $('#code').attr("class", "code_btn");
                        mask.close();
                    }, error: function (err) {
                        GlobalVariables.Log(err);
                    }
                });
            }



        });
        $('#code_btn_cancel').click(function(e){
            $('#code').attr("type","button");
            $('#code').val($.ownerGlob.owner.square.code);
            $('#code').click(onCodeClick);
            $('#code_btn_ok').remove();
            $('#code_btn_cancel').remove();
            $('#code').attr("class", "code_btn");
        });
    }
    $('#code').click(onCodeClick);
}
function send_ADMIN_MESSAGE_ALL() {

    var content = $('#admin_message_input').val();
    $('#admin_message_input').val("");
    var id = $.ownerGlob.owner.square.id;
    var type = AhMessage.TYPE.ADMIN_MESSAGE;

    var message = new AhMessage.Builder()
        .setType(type)
        .setContent(content)
        .setSender($.ownerGlob.owner.sender)
        .setSenderId($.ownerGlob.owner.senderId)
        .setReceiver("")
        .setReceiverId(id)
        .build()
    console.log(message);
    // do server job
    $.ownerGlob.messageHelper.sendMessage(message, {
        success: function(result) {
            alert('전제 공지를 전송하였습니다.');

        }, error: function(err) {
            alert('전제 공지를 실패');
            GlobalVariables.Log(err);
            console.log(err);
        }
    });
}

function send_ADMIN_MESSAGE() {

    var content = $('#message_dialog_input').val();
    $('#message_dialog_input').val("");
    var id = $('#message_dialog_id').val();
    $('#message_dialog_id').val("");

    var type = AhMessage.TYPE.CHUPA;
    var message = new AhMessage.Builder()
        .setType(type)
        .setContent(content)
        .setSender($.ownerGlob.owner.sender)
        .setSenderId($.ownerGlob.owner.senderId)
        .setReceiver("")
        .setReceiverId(id)
        .build()

    // do server job
    $.ownerGlob.messageHelper.sendMessage(message, {
        success: function(result) {
            alert('메세지를 전송하였습니다.');
//            GlobalVariables.Log(result);
        }, error: function(err) {
            alert('전제 공지를 실패');
            GlobalVariables.Log(err);
            console.log(err);
        }
    });
}


/////////////////////////////////
// Make User Grid Method
/////////////////////////////////
function makeUserGrid() {

    var myModal = new AXModal();
    myModal.setConfig({
        windowID:"myModalCT", width:740,
        displayLoading:true
    });
    var userGrid = new AXGrid();
    $.ownerGlob.userGrid;
    userGrid.setConfig({
        targetID : "UserGrid",
        colGroup : [
            {key:"id", label:"id", width:"300", align:"middle"},
            {key:"age", label:"나이", width:"70", align: "middle"},
            {key:"nickName", label:"닉네임", width:"200", align: "middle"},
            {key:"isMale", label:"성별", width:"70", align: "middle"},
            {key:"companyNum", label:"동행인 수", width:"120", align: "middle"},
            {key:"isChupaEnable", label:"추파 알람", width:"120", align: "middle"},
            {key:"enterTime", label:"입장 시간", width:"150", align: "middle"}
        ],
        colHeadAlign:"center",
        body : {
            onclick: function(){
                // toast.push(Object.toJSON(this.item));
                // squareGrid.setEditor(this.item, 1);
            },
            oncheck: function(){
//                userGrid.checkedColSeq(this.c, false);
//                userGrid.checkedColSeq(this.c, true, this.index);
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
                    {colSeq:1, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}, AXBind:{type:"number"}},
                    {colSeq:2, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}},
                    {colSeq:3, align:"center", valign:"bottom", form:{type:"radio", options:[
                        {value:'true', text:'true'},
                        {value:'false', text:'false'}
                    ]}
                    },
                    {colSeq:4, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}, AXBind:{type:"number"}},
                    {colSeq:5, align:"center", valign:"bottom", form:{type:"radio", options:[
                        {value:'true', text:'true'},
                        {value:'false', text:'false'}
                    ]}
                    }
                ]
            ],
            response: function(){ // ajax 응답에 대해 예외 처리 필요시 response 구현
                // response에서 처리 할 수 있는 객체 들
                //trace({res:this.res, index:this.index, insertIndex:this.insertIndex, list:this.list, page:this.page});
                if(this.index == null){ // 추가

                }else{ // 수정

//                    AXUtil.overwriteObject(this.list[this.index], this.res.item, true); // this.list[this.index] object 에 this.res.item 값 덮어쓰기
//                    userGrid.updateList(this.index, this.list[this.index]);
//
//                    delete this.res.item["requestType"];
//                    delete this.res.item["sender"];
//                    delete this.res.item["receiver"];
                    // do server job
                }

            }                    },
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
                                .setSender($.ownerGlob.owner.sender)
                                .setSenderId($.ownerGlob.owner.senderId)
                                .setReceiver(this.sendObj.item.nickName)
                                .setReceiverId(this.sendObj.item.id)
                                .build()

                            // do server job
                            $.ownerGlob.messageHelper.sendMessage(message, {
                                success: function(result) {
                                    removeList.push({id:message.receiverId});
                                    userGrid.removeList(removeList);
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
                    userType:1, label:"메세지 보내기", className:"right", onclick:function(){
                        if(!this.sendObj) return;

                        $("#message_dialog").css("display", "block");
                        $('#message_dialog_id').val(this.sendObj.item.id);
                        myModal.openDiv({
                            modalID:"modalDiv01",
                            targetID:"message_dialog",
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
    return userGrid;
}