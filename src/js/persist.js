var $conversationStore = (function() {
	function Conversation(sid) {
		return {
			their_sid: sid,
			collapsed: false
		};
	}

	var state = {
		conversations: []
	};
	var sids = {};

	var subscribers = {};
	var subscriberCounter = 0;
	var timer;

	var localStorageStateKey = "$conversationStates";

		var $conversationStore = {};

	$conversationStore.startConversation = function(sid) {
		var conversation;
		if (sids[sid] === undefined) {
			conversation = Conversation(sid);
			sids[sid] = conversation;
		}
		else {
			conversation = sids[sid];
			state.conversations.splice(state.conversations.indexOf(conversation), 1);
		}

		// The 'started' conversation should always end up at the top and un-collapsed
		state.conversations.unshift(conversation);
		sids[sid].collapsed = false;
	};

	$conversationStore.getConversations = function() {
		return state.conversations;
	};

	$conversationStore.subscribe = function(callback) {
		if (subscriberCounter === 0) {
			startPolling();
		}

		subscribers[++subscriberCounter] = callback;
		return subscriberCounter;
	};
	$conversationStore.unsubscribe = function(subscriber) {
		delete(subscribers[subscriber]);
	};

	$conversationStore.notify = function() {
		for (var subscriber in subscribers) {
			if (subscribers.hasOwnProperty(subscriber)) {
				subscribers[subscriber]();
			}
		}
		save();
	};

	function save() {
		localStorage.setItem(localStorageStateKey, JSON.stringify(state));
	}

	function load() {
		if (localStorage.getItem(localStorageStateKey) !== null) {
			state = JSON.parse(localStorage.getItem(localStorageStateKey));
		}

		for (var i = 0; i < state.conversations.length; i++) {
			sids[state.conversations[i].their_sid] = state.conversations[i];
		}
	}

	function poll() {
	        $serval.getConversations(function(result) {
	        	var conversationSids = result.map(function(x) { return x.their_sid; });

	        	var newConversations = 0;
        		for (var index in conversationSids) {
				if (!conversationSids.hasOwnProperty(index)) continue;

				var sid = conversationSids[index];

				if (sids[sid] !== undefined) continue;

				$conversationStore.startConversation(sid);
				newConversations++;
        		}

        		if (newConversations > 0) {
				$conversationStore.notify();
        		}
	        }.bind(this));
	}

	function startPolling() {
		if (timer === undefined) {
			timer = setInterval(poll, 2000);
			poll();
		}
	}

	function stopPolling() {
		if (timer !== undefined) {
			clearInterval(timer);
		}
	}


	load();

	return $conversationStore;
})();



var $contactStore = (function() {
	function Contact(sid) {
		return {
			sid: sid,
			name: "Unknown"
		};
	}

	var state = {
		contacts: {}
	};

	var subscribers = {};
	var subscriberCounter = 0;
	var timer;

	var localStorageStateKey = "$contactStates";

	var $contactStore = {};

	$contactStore.getContact = function(sid) {
		if (state.contacts[sid] === undefined) {
			state.contacts[sid] = Contact(sid);
		}
		return state.contacts[sid];
	};

	$contactStore.subscribe = function(callback) {
		// if (subscriberCounter === 0) {
		// 	startPolling();
		// }

		subscribers[++subscriberCounter] = callback;
		return subscriberCounter;
	};
	$contactStore.unsubscribe = function(subscriber) {
		delete(subscribers[subscriber]);
	};

	$contactStore.notify = function() {
		for (var subscriber in subscribers) {
			if (subscribers.hasOwnProperty(subscriber)) {
				subscribers[subscriber]();
			}
		}
		save();
	};

	function save() {
		localStorage.setItem(localStorageStateKey, JSON.stringify(state));
	}

	function load() {
		if (localStorage.getItem(localStorageStateKey) !== null) {
			state = JSON.parse(localStorage.getItem(localStorageStateKey));
		}
	}

	load();

	return $contactStore;
})();
