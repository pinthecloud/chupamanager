
// client = new WindowsAzure.MobileServiceClient('https://athere.azure-mobile.net/', 'AyHtUuHXEwDSTuuLvvSYZtVSQZxtnT17');

function MobileClient(url, key) {
	this.client = new WindowsAzure.MobileServiceClient(url, key);
}

MobileClient.prototype.getClient = function () {
	return this.client;
};

MobileClient.prototype.login = function (info, callback) {
    this.client.invokeApi("login_manager_page", {
        body: info,
        method: "post"
    }).done(function (results) {
        if (callback.success != null)
            callback.success(results);
    }, function(err) {
        if (callback.error != null)
            callback.error(err);
    });
};

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
        	if (callback.success != undefined) {
                UserHelper.prototype.userList = results;
                callback.success(results);
            }
        }, function (err) {
        	if (callback.error != undefined)
            	callback.error(err);
        });
};

UserHelper.prototype.get = function (id, callback) {
    this.table.where({ squareId: id })
        .read()
        .done(function (results) {
            if (callback == undefined) return;
            if (callback.success != undefined)
                callback.success(results);
        }, function (err) {
            if (callback == undefined) return;
            if (callback.error != undefined)
                callback.error(err);
        });
};

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
};

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
};

UserHelper.prototype.getUserLocal = function(id) {
    var userList = UserHelper.prototype.userList;

    for (var i = 0 ; i < userList.length ; i++) {
        console.log(userList[i].id, id);
        if (userList[i].id == id) return userList[i];
    }
    return null;
};

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
};

SquareHelper.prototype.getSqure = function (id, callback) {
    this.table.where({id : id})
        .read()
        .done(function (results) {
            if (results.length == 1) {
                if (callback.success != null)
                    callback.success(results[0]);
            }
            else {
                if (callback.error != null)
                    callback.error(results);
            }
        }, function (err) {
            if (callback.error != null)
                callback.error(err);
        });
};

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
};

SquareHelper.prototype.update = function (user, callback) {
	this.table.update(user)
        .done(function (results) {
            if (callback.success != null)
        		callback.success(results);
        }, function (err) {
            if (callback.error != null)
            	callback.error(err);
        });
};

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
};




/*
    AhIdUserHelper
 */

function AhIdUserHelper(client){
    this.client = client;
    this.table = client.getTable('AhIdUser');
}

AhIdUserHelper.prototype.list = function (callback) {
    this.table.read()
        .done(function (results) {
            if (callback.success != null)
                callback.success(results);
        }, function (err) {
            if (callback.error != null)
                callback.error(err);
        });
};

AhIdUserHelper.prototype.update = function (user, callback) {
    delete user["requestType"];

    this.table.update(user)
        .done(function (results) {
            if (callback.success != null)
                callback.success(results);
        }, function (err) {
            if (callback.error != null)
                callback.error(err);
        });
};

AhIdUserHelper.prototype.delete = function (userId, callback) {
    this.table.del({
        id: userId
    }).done(function () {
        if (callback.success != null)
            callback.success(null);
    }, function (err) {
        if (callback.error != null)
            callback.error(err);
    });
};




/*
    AppVersionHelper
 */

function AppVersionHelper(client){
    this.client = client;
    this.table = client.getTable('AppVersion');
}

AppVersionHelper.prototype.get = function (callback) {
    this.table.read()
        .done(function (results) {
            if (results.length == 1) {
                if (callback.success != null)
                    callback.success(results[0]);
            } else {
                if (callback.error != null)
                    callback.error(err);
            }
        }, function (err) {
            if (callback.error != null)
                callback.error(err);
        });
};

AppVersionHelper.prototype.update = function (appVersion, callback) {

    this.table.update(appVersion)
        .done(function (results) {
            if (callback.success != null)
                callback.success(results);
        }, function (err) {
            if (callback.error != null)
                callback.error(err);
        });
};


/*
	MessageHelper
*/

function MessageHelper(client) {
	this.client = client;
}

MessageHelper.prototype.sendMessage = function (message, callback) {
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
};

function LogHelper(client) {
    this.client = client;
    this.table = client.getTable('AhLog');
}


LogHelper.NAME = {
    AH_USER : "AH_USER",
    AH_ID_USER : "AH_ID_USER",
    SQUARE : "SQUARE",
    MESSAGE : "MESSAGE",
    FORCED_LOGOUT : "FORCED_LOGOUT"
};

LogHelper.METHOD = {
    ENTER : "ENTER",
    EXIT : "EXIT",
    INSERT : "INSERT",
    DELETE : "DELETE",
    UPDATE : "UPDATE",
    READ : "READ",
    EXECUTE : "EXECUTE"
};


LogHelper.prototype.list = function(callback) {
    this.table.read()
        .done(function (results) {
            console.log(results.length);
            if (callback.success != undefined) {
                callback.success(results);
            }
        }, function (err) {
            if (callback.error != undefined)
                callback.error(err);
        });
};

LogHelper.prototype.listByName = function(name, callback) {
    this.table.where({event_name : name})
        .read()
        .done(function (results) {
            if (callback.success != undefined) {
                callback.success(results);
            }
        }, function (err) {
            if (callback.error != undefined)
                callback.error(err);
        });
};

LogHelper.prototype.listByMethod = function(method, callback) {
    this.table.where({event_method : method})
        .read()
        .done(function (results) {
            if (callback.success != undefined) {
                callback.success(results);
            }
        }, function (err) {
            if (callback.error != undefined)
                callback.error(err);
        });
};

LogHelper.prototype.getUserLocal = function(id) {
    var userList = $.adminGlob.logHelper.userList;

    for (var i = 0 ; i < userList.length ; i++) {
        if (userList[i]['orig_id'] == id) {
            userList[i].id = id;
            return userList[i];
        }
    }
    return null;
}

LogHelper.removeUnusedItem = function(list) {
    for (var i = 0 ; i < list.length ; i++) {
        var item = list[i];
        var keys = Object.keys(item);
        for (var j = 0 ; j < keys.length ; j++) {
            var value = item[keys[j]];
            if (value == null || value == undefined || value == "" || value == "NULL_VALUE" || value == "null") {
                delete item[keys[j]];
            }
        }
    }
    return list;
};

//LogHelper.filterByName = function(list, name) {
//    return list.filter(function(item){
//        if (item['event_name'] == name) return item;
//    });
//}

Array.prototype.filterByName = function(name) {
    return this.filter(function(item){
        if (item['event_name'] == name) return item;
    });
};

Array.prototype.filterByMethod = function(method) {
    return this.filter(function(item){
        if (item['event_method'] == method) return item;
    });
};

Array.prototype.filterAny = function(any) {
    return this.filter(function(item){
        if (item['event_name'] == any || item['event_method'] == any) return item;
    });
};

Array.prototype.filterTerm = function(start, end) {

    var start = LogHelper.fillZero(start, 14);
    var end = LogHelper.fillZero(end, 14);
    console.log(start, end);
    return this.filter(function(item){
        if (item['event_time_int'] >= start && item['event_time_int'] <= end) {
            console.log(item['event_time']);
            return item;
        }
    });
}

LogHelper.fillZero = function(_num, digit) {
    var num = _num
    var k = 1;
    var sub = parseInt(digit - LogHelper.getDigit(num));
    while(sub != 0) {
        k *= 10;
        sub--;
    }

    num *= k;
    return num;
};

LogHelper.getDigit = function(_num) {
    var num = parseInt(_num);
    var digit = 0;
    var flag = true;
    while (flag) {
        num /= 10;
        num = parseInt(num);
        digit++;
        if (num <= 0) flag = false;
    }

    return digit;
};