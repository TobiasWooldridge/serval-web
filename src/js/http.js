var $http = (function() {
    var http = {};

    http.get = function (address, success, failure) {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    success(xhr.status, xhr.response);
                }
                else {
                    failure(xhr.status);
                }
            }
        };

        var username = 'demouser';
        var password = 'demopassword';

        xhr.open("GET", address);
        xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ":" + password));
        xhr.send();
    };

    http.getJson = function (address, success, failure) {
        http.get(address, function(status, response) {
            success(status, JSON.parse(response));
        }, failure);
    };

    http.post = function (address, data, success, failure) {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (200 <= xhr.status && xhr.status < 300) {
                    success(xhr.status, xhr.response);
                }
                else {
                    failure(xhr.status);
                }
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
