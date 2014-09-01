var $http = (function() {
    var http = {};

    http.get = function (address, callback) {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                callback(xhr.status, xhr.response);
            }
        };

        var username = 'demouser';
        var password = 'demopassword';

        xhr.open("GET", address);
        xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ":" + password));
        xhr.send();
    };

    http.getJson = function (address, callback) {
        http.get(address, function(status, response) {
            callback(status, JSON.parse(response));
        });
    };

    http.post = function (address, data, callback) {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                callback(xhr.status, xhr.response);
            }
        };

    var username = 'demouser';
    var password = 'demopassword';

    var params = new FormData();
    for (var key in data) {
    	if (data.hasOwnProperty(key)) {
    		params.append(key, new Blob([data[key]], {type: "text/plain; charset=utf-8"}));
    	}
    }

    xhr.open("POST", address, true);
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ":" + password));
    xhr.send(params);
    };

    return http;
})();
