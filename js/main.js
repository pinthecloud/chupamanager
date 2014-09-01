
function GlobalVariables(){}

GlobalVariables.REAL_URL = 'https://athere.azure-mobile.net/';
GlobalVariables.REAL_KEY = 'AyHtUuHXEwDSTuuLvvSYZtVSQZxtnT17';

GlobalVariables.TEST_URL = 'https://atheresub.azure-mobile.net/';
GlobalVariables.TEST_KEY = 'MRKovlGEFQRPXGTVMFaZCBkeBwQSQA92';

GlobalVariables.Log = function(message) {
    message = JSON.stringify(message);
    $('#error_log').text(message);
}

GlobalVariables.filter_and_get_v1 = function (filter_key_arr, list) {
    for (var i = 0 ; i < list.length ; i++) {
        var item = list[i];
        var keys = Object.keys(item);
        for (var j = 0 ; j < keys.length ; j++) {
            var key = keys[j];
            if (filter_key_arr.indexOf(key) == -1) {
                // this means it should be filtered
                delete item[key];
            }
        }
    }
    return list;
}

function AhMessage(){}

AhMessage.TYPE = {
    TALK: "TALK",
    SHOUTING: "SHOUTING",
    CHUPA: "CHUPA",
    ENTER_SQUARE: "ENTER_SQUARE",
    EXIT_SQUARE: "EXIT_SQUARE",
    UPDATE_USER_INFO: "UPDATE_USER_INFO",
    MESSAGE_READ: "MESSAGE_READ",
    FORCED_LOGOUT: "FORCED_LOGOUT",
    ADMIN_MESSAGE: "ADMIN_MESSAGE"
};

AhMessage.Builder = function () {}

AhMessage.Builder.prototype.setType = function(type) {
    this.type = type;
    return this;
}

AhMessage.Builder.prototype.setContent = function(content) {
    this.content = content;
    return this;
}

AhMessage.Builder.prototype.setSender = function(sender) {
    this.sender = sender;
    return this;
}

AhMessage.Builder.prototype.setSenderId = function(senderId) {
    this.senderId = senderId;
    return this;
}

AhMessage.Builder.prototype.setReceiver = function(receiver) {
    this.receiver = receiver;
    return this;
}

AhMessage.Builder.prototype.setReceiverId = function(receiverId) {
    this.receiverId = receiverId;
    return this;
}

AhMessage.Builder.prototype.build = function() {
    var msg = {};
    msg.type = this.type;
    msg.content = this.content;
    msg.sender = this.sender;
    msg.senderId = this.senderId;
    msg.receiver = this.receiver;
    msg.receiverId = this.receiverId;
    var d= new Date();
    msg.timeStamp = ""+ d.getFullYear() + d.getMonth() + d.getDate() + d.getUTCHours() + d.getMinutes()+d.getSeconds();
    msg.chupaCommunId = this.senderId > this.receiverId ?
        this.senderId + this.receiverId : this.receiverId + this.senderId;
    return msg;
}