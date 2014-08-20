$(function() {



    function doSquareAXISJ() {
        squareGrid = new AXGrid();
        squareGrid.setConfig({
            targetID : "SquareGrid",
            // fitToWidth:true,
            colGroup : [
                {key:"id", label:"id", width:"200", align:"left"},
                {key:"name", label:"name", width:"200"},
                {key:"whoMade", label:"whoMade", width:"100"},
                {key:"malenum", label:"malenum", width:"100"},
                {key:"femalenum", label:"femalenum", width:"100"},
                {key:"isAdmin", label:"isAdmin", width:"100"},
                {key:"code", label:"code", width:"100"},
                {key:"distance", label:"distance", width:"70"},
                {key:"latitude", label:"latitude", width:"70"},
                {key:"longitude", label:"longitude", width:"70"},
                {key:"talkTo", label:"talkTo", width:"70", formatter:"radio", align:"center" }
                
            ],
            colHeadAlign:"center",
            body : {
                onclick: function(){
                    // toast.push(Object.toJSON(this.item));
                    // squareGrid.setEditor(this.item, 1);
                },
                oncheck: function(){
                    //사용 가능한 변수
                    //this.itemIndex
                    //this.target
                    //this.checked
                    //this.r
                    //this.c
                    //this.list
                    //this.item
                    //toast.push(this.checked);

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
                        {colSeq:5, align:"center", valign:"bottom", form:{type:"radio", value:"itemValue", options:[
                            {value:'true', text:'true'},
                            {value:'false', text:'false'}
                            ]}
                        },
                        {colSeq:6, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}},
                        {colSeq:7, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}},
                        {colSeq:8, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}},
                        {colSeq:9, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}}

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

                        console.log(this.res.item);
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





    function doUserAXISJ() {
        userGrid = new AXGrid();
        userGrid.setConfig({
            targetID : "UserGrid",
            // fitToWidth:true,
            colGroup : [
                {key:"id", label:"id", width:"200", align:"left"},
                {key:"age", label:"age", width:"50"},
                {key:"squareId", label:"squareId", width:"150"},
                {key:"registrationId", label:"registrationId", width:"150"},
                {key:"mobileId", label:"mobileId", width:"100"},
                {key:"nickName", label:"nickName", width:"150"},
                {key:"isMale", label:"isMale", width:"60"},
                {key:"companyNum", label:"companyNum", width:"70"},
                {key:"isChupaEnable", label:"isChupaEnable", width:"70"},
                {key:"profilePic", label:"profilePic", width:"70"},
                {key:"sender", label:"sender", width:"70", formatter:"radio", align:"center" },
                {key:"receiver", label:"receiver", width:"70", formatter:"radio", align:"center" }
                
            ],
            colHeadAlign:"center",
            body : {
                onclick: function(){
                    // toast.push(Object.toJSON(this.item));
                    // squareGrid.setEditor(this.item, 1);
                },
                oncheck: function(){
                    
                    
                    userGrid.checkedColSeq(this.c, false);
                    userGrid.checkedColSeq(this.c, true, this.index);
                    

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
                        {colSeq:1, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}, AXBind:{type:"number"}},
                        {colSeq:2, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}},
                        {colSeq:3, align:"center", valign:"bottom", 
                            formatter: function(){
                                return this.item.registrationId;
                            }
                        },
                        {colSeq:4, align:"center", valign:"bottom", form:{type:"radio", options:[
                            {value:'iOS', text:'iOS'},
                            {value:'Android', text:'Android'}
                            ]}
                        },

                        {colSeq:5, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}},
                        {colSeq:6, align:"center", valign:"bottom", form:{type:"radio", options:[
                            {value:'true', text:'true'},
                            {value:'false', text:'false'}
                            ]}
                        },
                        {colSeq:7, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}, AXBind:{type:"number"}},
                        {colSeq:8, align:"center", valign:"bottom", form:{type:"radio", options:[
                            {value:'true', text:'true'},
                            {value:'false', text:'false'}
                            ]}
                        },
                        {colSeq:9, align:"center", valign:"bottom", form:{type:"text", value:"itemValue"}}

                    ]
                ],
                response: function(){ // ajax 응답에 대해 예외 처리 필요시 response 구현
                    // response에서 처리 할 수 있는 객체 들
                    //trace({res:this.res, index:this.index, insertIndex:this.insertIndex, list:this.list, page:this.page});
                    if(this.index == null){ // 추가
                        // var addItem = this.res.item;
                        // delete addItem["requestType"];
                        
                        // squareTable.insert(
                        //     addItem
                        // ).done(function (insertedAndUpdated) {
                        //    refreshList();
                        // }, function(error) {
                        //     console.log(error);
                        //     $('#errorlog').append($('<li>').text(error.message));
                        // });                        
                    }else{ // 수정
                        //trace(this.res.item);
                        AXUtil.overwriteObject(this.list[this.index], this.res.item, true); // this.list[this.index] object 에 this.res.item 값 덮어쓰기
                        userGrid.updateList(this.index, this.list[this.index]);

                        
                        delete this.res.item["requestType"];
                        delete this.res.item["sender"];
                        delete this.res.item["receiver"];
                        var query = userTable.update(this.res.item)
                                    .done(function (results) {
                                        refreshUserList();
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
                    // {
                    //     userType:1, label:"추가하기", className:"plus", onclick:function(){
                    //         squareGrid.appendList(null);
                    //         //myGrid.appendList(item, index);
                            
                    //         var removeList = [];
                    //             removeList.push({no:this.sendObj.item.no});
                    //         myGrid.removeList(removeList); // 전달한 개체와 비교하여 일치하는 대상을 제거 합니다. 이때 고유한 값이 아닌 항목을 전달 할 때에는 에러가 발생 할 수 있습니다.
                            

                    //         $('#UserGrid_AX_editorButtons').css({top: "40px"});
                    //     }
                    // },
                    {
                        userType:1, label:"상세보기", className:"docline", onclick:function(){
                            
                            //dialog.push(Object.toJSON(this.sendObj.item));
                            this.sendObj.item.profilePic = this.sendObj.item.profilePic.substring(0,20);
                            this.sendObj.item.registrationId = this.sendObj.item.registrationId.substring(0,20);
                            alert(Object.toJSON(this.sendObj.item));
                        }
                    },
                    {
                        userType:1, label:"삭제하기", className:"minus", onclick:function(){
                            if(this.sendObj){
                                
                                if(!confirm("정말 삭제 하시겠습니까?")) return;
                                var removeList = [];
                                
                                removeList.push({id:this.sendObj.item.id});
                                userGrid.removeList(removeList); // 전달한 개체와 비교하여 일치하는 대상을 제거 합니다. 이때 고유한 값이 아닌 항목을 전달 할 때에는 에러가 발생 할 수 있습니다.

                                userTable.del({
                                   id: this.sendObj.item.id
                                }).done(function () {
                                   refreshUserList();
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
                            if(this.sendObj){
                                // console.log(userGrid.setEditor);
                                userGrid.setEditor(this.sendObj.item, this.sendObj.index);
                                $('#UserGrid_AX_editorButtons').css({top: "40px"});
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



    client = new WindowsAzure.MobileServiceClient('https://athere.azure-mobile.net/', 'AyHtUuHXEwDSTuuLvvSYZtVSQZxtnT17');
    squareTable = client.getTable('Square');
    userTable = client.getTable('AhUser');
    function refreshSquareList() {
        
        var query = squareTable.read()
                .done(function (results) {
                    squareGrid.setList(results);
                }, function (error) {
                    console.log(error);
                    $('#errorlog').append($('<li>').text(error.message));
                });
    }
    function refreshUserList() {
        
        var query = userTable.read()
                .done(function (results) {

                    userGrid.setList(results);
                }, function (error) {
                    console.log(error);
                    $('#errorlog').append($('<li>').text(error.message));
                });
    }
    
    refreshSquareList();
    refreshUserList();
    // Read current data and rebuild UI.
    // If you plan to generate complex UIs like this, consider using a JavaScript templating library.
    // function refreshTodoItems() {
    //     var query = todoItemTable.where({ complete: false });

    //     query.read().then(function(todoItems) {
    //         var listItems = $.map(todoItems, function(item) {
    //             return $('<li>')
    //                 .attr('data-todoitem-id', item.id)
    //                 .append($('<button class="item-delete">Delete</button>'))
    //                 .append($('<input type="checkbox" class="item-complete">').prop('checked', item.complete))
    //                 .append($('<div>').append($('<input class="item-text">').val(item.text)));
    //         });

    //         $('#todo-items').empty().append(listItems).toggle(listItems.length > 0);
    //         $('#summary').html('<strong>' + todoItems.length + '</strong> item(s)');
    //     }, handleError);
    // }

    // function handleError(error) {
    //     var text = error + (error.request ? ' - ' + error.request.status : '');
    //     $('#errorlog').append($('<li>').text(text));
    // }

    // function getTodoItemId(formElement) {
    //     return $(formElement).closest('li').attr('data-todoitem-id');
    // }
    $('#deleteAllUser').click(function(evt) {

        

        // userTable.read().done(function (results) {

        //    for (var item in results) {
        //     console.log(item.id);
        //         userTable.del({
        //            id: item.id
        //         }).done(function () {

        //         }, function (error) {
        //            console.log(error);
        //             $('#errorlog').append($('<li>').text(error.message));
        //         });    
        //    }
        // }, function (error) {
        //    $('#errorlog').append($('<li>').text(error.message));
        // });

        

    });
    // Handle insert
    sendCount = 0;
    $('#content').keypress(function(evt){
        if ( event.which == 13 ) {
            sendMessage();
            evt.preventDefault();
        }
        
    });
    $('#add-item').click(function(evt) {

        sendMessage();
        evt.preventDefault();
    });

    function sendMessage(){
        var content = $('#content');
        var contentVal = content.val();
        
        var type = $('#type');
        var typeVal = type.val();
        
        var talkToList = squareGrid.getCheckedList(10);// talkTo
        var senderList = userGrid.getCheckedList(10);// sender
        var receiverList = userGrid.getCheckedList(11);// receiver

        if (senderList.length != 1) {
            alert('Only one!' + senderList);
            console.log(senderList);
            return;
        }

        var sender = senderList[0];

        var toWhom = "";
        if (typeVal == "TALK") {
            toWhom = talkToList[0].id;
        } else if (typeVal == "CHUPA"){
            var receiver = receiverList[0];
            toWhom = receiver.id;
            if (sender.id == toWhom) {
                alert('Same!');
                console.log(receiver.id, sender.id);
                return;
            }
        } else if (typeVal == "ENTER_SQUARE"){
            var receiver = talkToList[0];
            toWhom = receiver.id;
            if (sender.id == toWhom) {
                alert('Same!');
                console.log(receiver.id, sender.id);
                return;
            }
        } else if (typeVal == "EXIT_SQUARE"){
            var receiver = talkToList[0];
            toWhom = receiver.id;
            if (sender.id == toWhom) {
                alert('Same!');
                console.log(receiver.id, sender.id);
                return;
            }
        }
        var d = new Date();
        var hh = d.getUTCHours() + 9;
        var mm = d.getMinutes();
        var timeStampTime = hh + ":" + mm;
        var message = {
            type : typeVal,
            content : contentVal,
            sender : sender.nickName,
            senderId : sender.id,
            receiver : "receiver",
            receiverId : toWhom,
            timeStamp : timeStampTime,
            chupaCommunId : sender.id > toWhom ? sender.id + toWhom : toWhom + sender.id
        };

        console.log(message);
        client.invokeApi("send_message", {
            body: message,
            method: "post"
        }).done(function (results) {
            console.log(results);
            $('#errorlog').append($('<li>').text(results.response));         
        }, function(error) {
            console.log(error);
            $('#errorlog').append($('<li>').text(error.message));         
        });

        console.log($('#content').val());
        $('#content').val( $('#content').val() + sendCount++);


    }

    // // Handle update
    // $(document.body).on('change', '.item-text', function() {
    //     var newText = $(this).val();
    //     todoItemTable.update({ id: getTodoItemId(this), text: newText }).then(null, handleError);
    // });

    // $(document.body).on('change', '.item-complete', function() {
    //     var isComplete = $(this).prop('checked');
    //     todoItemTable.update({ id: getTodoItemId(this), complete: isComplete }).then(refreshTodoItems, handleError);
    // });

    // // Handle delete
    // $(document.body).on('click', '.item-delete', function () {
    //     todoItemTable.del({ id: getTodoItemId(this) }).then(refreshTodoItems, handleError);
    // });

    // // On initial load, start by fetching the current data
    // refreshTodoItems();



    doSquareAXISJ();
    doUserAXISJ();
});