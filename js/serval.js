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

    
        function Message(obj) {"use strict";
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

        Message.prototype.is_message=function() {"use strict";
            return this.type == "<" || this.type == ">";
        };

        Message.prototype.sender=function() {"use strict";
            if (this.type == "<") {
                return this.my_sid;
            }
            else if (this.type == ">") {
                return this.their_sid;
            }
            return undefined;
        };

        Message.prototype.receiver=function() {"use strict";
            if (this.type == "<") {
                return this.their_sid;
            }
            else if (this.type == ">") {
                return this.my_sid;
            }
            return undefined;
        };

        Message.prototype.status=function() {"use strict";
            return (this.read ? "Read" : (this.delivered ? "Delivered" : "Sending"));
        };

        Message.prototype.serial=function() {"use strict";
            return this.token + "," + this.delivered + "," + this.read;
        };
    


    var self = {};

    self.getPeers = function(success) {
        $http.getJson("http://localhost:4110/restful/mesh/routablepeers.json", function (status, response) {
            success(assembleServalJson(response));
        });
    };


    self.getIdentities = function(success) {
        $http.getJson("http://localhost:4110/restful/keyring/identities.json", function (status, response) {
            success(assembleServalJson(response));
        });
    };

    self.getConversations = function(sid, success) {
        $http.getJson("http://localhost:4110/restful/meshms/" + escape(sid) + "/conversationlist.json", function (status, response) {
            success(assembleServalJson(response));
        });
    };

    self.getConversation = function(mySid, theirSid, success) {
        $http.getJson("http://localhost:4110/restful/meshms/" + escape(mySid) + "/"  + escape(theirSid) + "/messagelist.json", function (status, response) {
            success(assembleServalJson(response).reverse().map(function(x)  {return new Message(x);}));
        });
    };

    self.sendMessage = function(mySid, theirSid, message, success) {
        $http.post("http://localhost:4110/restful/meshms/" + escape(mySid) + "/"  + escape(theirSid) + "/sendmessage", { message: message }, function (status, response) {
            success(response);
        });
    };

    return self;
})();