var $conversationStore = (function() {
	var _activeConversations  = [];
	var _oldConversations = [];

	// Public methods are declared on the 'self' object
	var $conversationStore = {};

	$conversationStore.getActive = function() {
		return _activeConversations;
	};
	$conversationStore.getClosed = function() {
		return _closedConversations;
	};

	return $conversationStore;
})();
