var MessageForm = React.createClass({
    handleSubmit: function() {
        var text = this.refs.text.getDOMNode().value.trim();
        if (!text) {
            return false;
        }
        this.refs.text.getDOMNode().value = '';

        $serval.sendMessage(this.props.conversation.my_sid, this.props.conversation.their_sid, text, function() {
        });

        return false;
    },
    render: function() {
           return (
               <form className="messageForm" onSubmit={this.handleSubmit}>
                   <input type="text" placeholder="New message..." ref="text" />
                   <input type="submit" value="Post" />
               </form>
           );
    }
});

var Message = React.createClass({
     render: function() {
            return (
                <div className="message">
                    <span className="direction">You { this.props.message.type } Them</span> { this.props.message.text }
                </div>
            );
     }
});

var Conversation = React.createClass({
    retrieveMessages: function() {
        $serval.getConversation(this.props.conversation.my_sid, this.props.conversation.their_sid, function(result) {
            if (this.isMounted()) {
                this.setState({
                    messages: result
                });
            }
        }.bind(this));
    },
    getInitialState: function() {
        return { messages: [] };
    },
    componentDidMount: function() {
        this.retrieveMessages();
        setInterval(this.retrieveMessages, 100000);
    },
     render: function() {

            var messageNodes = this.state.messages.map(function (message) {
                return <li><Message message={ message } /></li>;
              });

            return (
                <div className="conversation">
                    { this.props.conversation.their_sid.slice(0,6) }...

                    <ul>{ messageNodes }</ul>

                    <MessageForm conversation={this.props.conversation} />
                </div>
            );
     }
});

var Conversations = React.createClass({
    getInitialState: function() {
        return { conversations: [] };
    },


    componentDidMount: function() {
        $serval.getConversations(this.props.sid, function(result) {
            if (this.isMounted()) {
                this.setState({
                    conversations: result
                });
            }
        }.bind(this));
    },

     render: function() {
            var conversationNodes = this.state.conversations.map(function (conversation) {
                return <li><Conversation conversation={ conversation } /></li>;
              });


            return (
                <div className="conversations">
                    <h2>Conversations</h2>
                    <ul>{ conversationNodes }</ul>
                </div>
            );
     }
});

var Identity = React.createClass({
     render: function() {
            return (
                <div className="identity">
                    <h1>Your Identity: { this.props.identity.name || this.props.identity.sid.slice(0,6) + "..." }</h1>
                    <Conversations sid={ this.props.identity.sid } />
                </div>
            );
     }
});

var Identities = React.createClass({

    getInitialState: function() {
        return { identities: [] };
    },

    componentDidMount: function() {
        $serval.getIdentities(function(result) {
            if (this.isMounted()) {
                this.setState({
                    identities: result
                });
            }
        }.bind(this));
    },

     render: function() {
            var identityNodes = this.state.identities.map(function (identity) {
                return <Identity identity={ identity } />;
              });

            return (
                <div className="identities">
                    { identityNodes }
                </div>
            );
     }
});

React.renderComponent(
<Identities />,
     document.getElementById('messages')
);
