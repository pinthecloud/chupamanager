
// client = new WindowsAzure.MobileServiceClient('https://athere.azure-mobile.net/', 'AyHtUuHXEwDSTuuLvvSYZtVSQZxtnT17');

function MobileClient(url, key) {
	this.client = new WindowsAzure.MobileServiceClient(url, key);
}

MobileClient.prototype.getClient = function () {
	return this.client;
}
/*
	UserHelper
*/

// mobileClient = new MobileClient('','');

function UserHelper(client){
	this.client = client;
	this.table = client.getTable('AhUser');
}

UserHelper.prototype.list = function (callback) {
	this.table.read()
        .done(function (results) {
        	if (callback.success != null)
        		callback.success(results);
        }, function (err) {
        	if (callback.error != null)
            	callback.error(err);
        });
}

UserHelper.prototype.update = function (user, callback) {
	delete user["requestType"];

	this.table.update(user)
        .done(function (results) {
            if (callback.success != null)
        		callback.success(results);
        }, function (err) {
            if (callback.error != null)
            	callback.error(err);
        });
}

UserHelper.prototype.delete = function (userId, callback) {
	this.table.del({
           id: userId
        }).done(function () {
           if (callback.success != null)
        		callback.success(null);
        }, function (err) {
           if (callback.error != null)
            	callback.error(err);
        }); 
}

/*
	SquareHelper
*/


function SquareHelper(client){
	this.client = client;
	this.table = client.getTable('Square');
}

SquareHelper.prototype.list = function (callback) {
	this.table.read()
        .done(function (results) {
        	if (callback.success != null)
        		callback.success(results);
        }, function (err) {
        	if (callback.error != null)
            	callback.error(err);
        });
}

SquareHelper.prototype.add = function (item, callback) {
	delete item["requestType"];

	this.table.insert(
        item
    ).done(function (results) {
       if (callback.success != null)
    		callback.success(results);
    }, function(err) {
        if (callback.error != null)
            	callback.error(err);
    });
}

SquareHelper.prototype.update = function (user, callback) {
	this.table.update(user)
        .done(function (results) {
            if (callback.success != null)
        		callback.success(results);
        }, function (err) {
            if (callback.error != null)
            	callback.error(err);
        });
}

SquareHelper.prototype.delete = function (userId, callback) {
	this.table.del({
           id: userId
        }).done(function () {
           if (callback.success != null)
        		callback.success(null);
        }, function (err) {
           if (callback.error != null)
            	callback.error(err);
        }); 
}



/*
	MessageHelper
*/


function MessageHelper(client) {
	this.client = client;
}

MessageHelper.prototype.sendMessage = function (message, callback) {
	var d = new Date();

    var hh = d.getUTCHours() + 9;
    var mm = d.getMinutes();
    var timeStampTime = hh + ":" + mm;
    // var message = {
    //     type : typeVal,
    //     content : contentVal,
    //     sender : sender.nickName,
    //     senderId : sender.id,
    //     receiver : "receiver",
    //     receiverId : toWhom,
    //     timeStamp : timeStampTime,
    //     chupaCommunId : sender.id > toWhom ? sender.id + toWhom : toWhom + sender.id
    // };

    message['timeStamp'] = timeStampTime;
    message['chupaCommunId'] = message['senderId'] > message['receiverId'] ? 
    					message['senderId'] + message['receiverId'] : message['receiverId'] + message['senderId'];

    
    this.client.invokeApi("send_message", {
        body: message,
        method: "post"
    }).done(function (results) {
        if (callback.success != null)
    		callback.success(results);
    }, function(err) {
        if (callback.error != null)
    		callback.error(err);
    });
}