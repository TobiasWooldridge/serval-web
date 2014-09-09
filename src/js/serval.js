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


    // Public methods are declared on the 'self' object
    var self = {};

    self.getPeers = function(success, failure) {
        $http.getJson("http://localhost:4110/restful/mesh/routablepeers.json", function (status, response) {
            success(assembleServalJson(response));
        }, failure);
    };

    getIdentities = function(success, failure) {
        $http.getJson("http://localhost:4110/restful/keyring/identities.json", function (status, response) {
            success(assembleServalJson(response));
        }, failure);
    };

    self.getIdentity = function(success, failure) {
        getIdentities(function(response) {
            if (!response.length) failure("Could not get a valid identity from serval-dna");
            else success(response[0]);
        }, failure);
    };

    self.getConversations = function(sid, success, failure) {
        $http.getJson("http://localhost:4110/restful/meshms/" + escape(sid) + "/conversationlist.json", function (status, response) {
            success(assembleServalJson(response));
        }, failure);
    };

    self.getConversation = function(mySid, theirSid, success, failure) {
        $http.getJson("http://localhost:4110/restful/meshms/" + escape(mySid) + "/"  + escape(theirSid) + "/messagelist.json", function (status, response) {
            success(assembleServalJson(response).reverse().map(x => new ServalMessage(x)));
        }, failure);
    };

    self.sendMessage = function(mySid, theirSid, message, success, failure) {
        $http.post("http://localhost:4110/restful/meshms/" + escape(mySid) + "/"  + escape(theirSid) + "/sendmessage", { message: message }, function (status, response) {
            success(response);
        }, failure);
    };

    return self;
})();
    
