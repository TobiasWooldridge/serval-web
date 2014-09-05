var ContactList = React.createClass({
    retrieveContacts: function() {
        $serval.getPeers(function(result) {
            if (this.isMounted()) {
                this.setState({
                    contacts: result
                });
            }
        }.bind(this));
    },
    getInitialState: function() {
        return { contacts: [] };
    },
    componentDidMount: function() {
        this.retrieveContacts();
        this.timer = setInterval(this.retrieveContacts, 2000);
    },
    componentWillUnmount: function() {
        clearInterval(this.timer);
    },
    render: function() {
        var contactNodes = this.state.contacts.map(function (contact) {
            return <li key={ "contact-" + contact.sid }><Contact my_sid={ this.props.sid } their_sid={ contact.sid } /></li>;
          }.bind(this));

        return (
            <div className="contactList">
                <h2>Contact List</h2>
                <ul>{ contactNodes }</ul>
            </div>
        );
    }
});

var Contact = React.createClass({
    handleRename: function() {
        if (this.isMounted()) {
            this.setState({
                name: "Mooo"
            });
        }
    },
    startConversation: function() {
        $serval.sendMessage(this.props.my_sid, this.props.their_sid, "Hi!", function() {});
    },
    getInitialState: function() {
        return { name: "Unknown" };
    },
    render: function() {
        return (
            <div className="contact">
                <span ref="name" title={ this.props.their_sid } onClick={ this.openContact } className="contact">
                    { this.state.name } ({ this.props.their_sid.slice(0,6) })
                </span>
                <input type="button" value="Rename" onClick={this.handleRename} />
                <input type="button" value="Start Conversation" onClick={this.startConversation} />
            </div>
        );
    }
});

var MessageForm = React.createClass({
    handleSubmit: function() {
        var text = this.refs.text.getDOMNode().value.trim();
        if (!text) {
            return false;
        }
        this.refs.text.getDOMNode().value = '';

        $serval.sendMessage(this.props.conversation.my_sid, this.props.conversation.their_sid, text, function() {});

        return false;
    },
    render: function() {
           return (
               <form className="messageForm" onSubmit={ this.handleSubmit }>
                   <input type="text" placeholder="New message..." ref="text" />
                   <input type="submit" value="Send" />
               </form>
           );
    }
});

var Message = React.createClass({
     render: function() {
        var className = 'message ' + (this.props.message.delivered ? 'delivered' : 'sending');

        if (!this.props.message.is_message()) return <div></div>;
        else return (
            <div className={ className }>
                <span className="delivery status">{ this.props.message.status() }</span>
            </div>
        );
     }
});

var Conversation = React.createClass({
    retrieveMessages: function() {
        $serval.getConversation(this.props.conversation.my_sid, this.props.conversation.theirSid, function(result) {
            if (this.isMounted()) {
                this.setState({
                    messages: result,
                    lastMessage: result[result.length - 1]
                });
            }
        }.bind(this));
    },
    getInitialState: function() {
        return { messages: [] };
    },
    componentDidMount: function() {
        this.retrieveMessages();
        this.timer = setInterval(this.retrieveMessages, 100);
    },
    componentWillUnmount: function() {
        clearInterval(this.timer);
    },
    componentDidUpdate: function(prevProps, prevState) {
        // Scroll to bottom when we add a new message
        if (!prevState.lastMessage || prevState.lastMessage.timestamp < this.state.lastMessage.timestamp) {
            this.scrollToBottom();
        }
    },
    shouldComponentUpdate: function(nextProps, nextState) {
        if (nextState.messages.length != this.state.messages.length) {
            return true;
        }
        if (nextState.lastMessage.token != this.state.lastMessage.token) {
            return true;
        }

        return false;
    },
    scrollToBottom: function() {
        // console.log(this.refs.messages);
        this.refs.messages.getDOMNode().scrollTop = this.refs.messages.getDOMNode().scrollHeight;
    },
    render: function() {
        var messageNodes = this.state.messages.map(function (message) {
            return <li key={ message.token }><Message message={ message } /></li>;
          });

        return (
            <div className="conversation">
                <Contact my_sid={ this.props.conversation.my_sid} their_sid={ this.props.conversation.their_sid} />

                <div className="messages" ref="messages"><ul>{ messageNodes }</ul></div>

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
            return <li key={ conversation._id }><Conversation conversation={ conversation } /></li>;
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
                    <ContactList sid={ this.props.identity.sid } />
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
                return (
                    <Identity key={ identity.sid } identity={ identity } />
                );
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
     document.getElementById('identities')
);
