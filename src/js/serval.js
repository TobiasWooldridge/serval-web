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
            callback(assembleServalJson(response));
        });
    };

    self.sendMessage = function(mySid, theirSid, message, callback) {
        $http.post("http://localhost:4110/restful/meshms/" + escape(mySid) + "/"  + escape(theirSid) + "/sendmessage", { message: message }, function (status, response) {
            callback(response);
        });
    };

    return self;
})();