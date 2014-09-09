var $persist = (function() {
	class ServalContact {
	    subscribers = [];

	    constructor(obj) {
	        this.sid = obj.sid;
	        this.name = obj.name;
	    }

	    onChange(callback) {
	        subscribers.push(callback);
	    }

	    removeOnChange(callback) {
	        subscribers.splice(subscribers.indexOf(callback), 1);
	    }
	}

	var contacts  = {};

	// Public methods are declared on the 'self' object
	var self = {};

	self.getContact = function(sid) {
		if (contacts[sid] == undefined) {
			contacts[sid] = new ServalContact({
				sid: sid,
				name: "Unknown"
			});
		}

		var contact = contacts[sid];

		return contact;
	};

	return self;
})();