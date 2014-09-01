var $serval = (function() {
    function assembleServalJson(decoupled) {
        var header = decoupled.header;
        var rows = decoupled.rows;

        var records = [];

        if (header === undefined || rows === undefined) {
            throw "Undefined rows or headers for Serval object\n" + JSON.stringify(decoupled);
        }

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (row.length != header.length) {
                console.error("Illegal row/header pair in Serval object" +
                    "\n" + JSON.stringify(header) +
                    "\n" + JSON.stringify(row));
                continue;
            }

            var record = {};
            for (var j = 0; j < header.length; j++) {
                record[header[j]] = row[j];
            }
            records.push(record);
        }
        return records;
    }

    class Message {
        constructor(obj) {
            this.type = obj.type;
            this.my_sid = obj.my_sid;
            this.their_sid = obj.their_sid;
            this.offset = obj.offset;
            this.token = obj.token;
            this.text = obj.text;
            this.delivered = obj.delivered;
            this.read = obj.read;
            this.timestamp = obj.timestamp;
            this.ack_offset = obj.ack_offset;
            this.key = obj.token;
        }

        is_message() {
            return this.type == "<" || this.type == ">";
        }

        sender() {
            if (this.type == "<") {
                return this.my_sid;
            }
            else if (this.type == ">") {
                return this.their_sid;
            }
            return undefined;
        }
        
        receiver() {
            if (this.type == "<") {
                return this.their_sid;
            }
            else if (this.type == ">") {
                return this.my_sid;
            }
            return undefined;
        }

        status() {
            return (this.read ? "Read" : (this.delivered ? "Delivered" : "Sending"));
        }
    }


    var self = {};

    self.getIdentities = function(callback) {
        $http.getJson("http://localhost:4110/restful/aardvark/identities.json", function (status, response) {
            callback(assembleServalJson(response));
        });
    };

    self.getConversations = function(sid, callback) {
        $http.getJson("http://localhost:4110/restful/meshms/" + escape(sid) + "/conversationlist.json", function (status, response) {
            callback(assembleServalJson(response));
        });
    };

    self.getConversation = function(mySid, theirSid, callback) {
        $http.getJson("http://localhost:4110/restful/meshms/" + escape(mySid) + "/"  + escape(theirSid) + "/messagelist.json", function (status, response) {
            callback(assembleServalJson(response).reverse().map(x => new Message(x)));
        });
    };

    self.sendMessage = function(mySid, theirSid, message, callback) {
        $http.post("http://localhost:4110/restful/meshms/" + escape(mySid) + "/"  + escape(theirSid) + "/sendmessage", { message: message }, function (status, response) {
            callback(response);
        });
    };

    return self;
})();