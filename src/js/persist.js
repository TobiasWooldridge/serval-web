var $convoStore = (function() {
	var _activeConversations  = [];
	var _oldConversations = [];

	// Public methods are declared on the 'self' object
	var $convoStore = {};

	$convoStore.getActive = function() {
		return _activeConversations;
	};
	$convoStore.getOld = function() {
		return _oldConversations;
	};

	return $convoStore;
})();