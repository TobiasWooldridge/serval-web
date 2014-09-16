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
        this.timer = setInterval(this.retrieveContacts, 5000);
    },
    componentWillUnmount: function() {
        clearInterval(this.timer);
    },
    render: function() {
        var contactNodes = this.state.contacts.map(function (contact) {
            return (
                <li className="list-group-item" key={ "contact-" + contact.sid }><Contact their_sid={ contact.sid } /></li>
            );
          }.bind(this));

        return (
            <div className="contactList">
                <h2>Nodes I Can See</h2>       
                <ul className="list-group">{ contactNodes }</ul>
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
        $conversationStore.startConversation(this.state.sid);
        $conversationStore.notify();
    },
    getInitialState: function() {
        return {
            name: "Unknown",
            sid: this.props.their_sid
        };
    },
    render: function() {
        return (
            <span className="contact">
                <span ref="sid" onClick={ this.openContact } className="sid"  title={ this.state.sid }><span>{ this.state.sid }</span></span>
                <span ref="name" onClick={ this.openContact } className="name"> { this.state.name }</span>
                <input type="button" value="Rename" className="btn btn-default rename" onClick={this.handleRename} />
                <input type="button" value="Start Conversation" className="btn btn-primary startConversation" onClick={this.startConversation} />
            </span>
        );
    }
});

var Messages = React.createClass({
    scrollToBottom: function() {
        this.refs.messages.getDOMNode().scrollTop = this.refs.messages.getDOMNode().scrollHeight;
    },
    render: function() {
        if (!this.props.messages) this.props.messages = [];
        
        var messageNodes = this.props.messages.map(function (message) {
            return <li key={ message.token }><Message message={ message } /></li>;
        });

        return (
            <div className="messages" ref="messages"><ul>{ messageNodes }</ul></div>
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

        $serval.sendMessage(this.props.their_sid, text, function() {});

        return false;
    },
    render: function() {
           return (
               <form className="messageForm" onSubmit={ this.handleSubmit }>
                   <input type="text" className="form-control" placeholder="New message..." ref="text" />
               </form>
           );
    }
});

var Message = React.createClass({
     render: function() {
        var className = 'message' + (this.props.message.delivered ? ' delivered' : ' sending') + ' ' + this.props.message.wordedType();

        if (!this.props.message.is_message()) return <div className={ className }><hr className="ack" /></div>;
        else return (
            <div className={ className }>
                <span className="sender"><Contact their_sid={ this.props.message.sender() } /></span>
                &nbsp;{ this.props.message.text }            
                <span className="delivery status">{ this.props.message.status() }</span>
            </div>
        );
     }
});

var ConversationHeader = React.createClass({
    collapse: function() {
        this.props.conversation.collapsed = !this.props.conversation.collapsed;
        $conversationStore.notify();
    },
    render: function() {
        var className = "glyphicon glyphicon-chevron-" + (this.props.conversation.collapsed ? "down" : "up");

        return (
            <header onClick={ this.collapse }>
                <Contact their_sid={ this.props.conversation.their_sid} />
                <button type="button" className="btn close"><span className={ className }></span></button>
            </header>
        );
    }
});

var Conversation = React.createClass({
    retrieveMessages: function() {
        $serval.getConversation(this.props.conversation.their_sid, function(result) {
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
        this.timer = setInterval(this.retrieveMessages, 1000);
    },
    componentWillUnmount: function() {
        clearInterval(this.timer);
    },
    componentDidUpdate: function(prevProps, prevState) {
        // Scroll to bottom when we add a new message
        if (!prevState.lastMessage || prevState.lastMessage.timestamp < this.state.lastMessage.timestamp) {
            if (this.refs.messages) {
                this.refs.messages.scrollToBottom();
            }
        }
    },
    // shouldComponentUpdate: function(nextProps, nextState) {
    //     if (nextState.messages.length != this.state.messages.length) {
    //         return true;
    //     }
    //     if (this.state.lastMessage.serial() != nextState.lastMessage.serial()) {
    //         return true;
    //     }

    //     return false;
    // },
    render: function() {
        if (this.props.conversation.collapsed) {
            return (
                <div className="conversation">
                    <ConversationHeader conversation={this.props.conversation} />
                </div>
            );
        }

        return (
            <div className="conversation">
                <ConversationHeader conversation={this.props.conversation} />

                <Messages messages={this.state.messages} ref="messages" />
                <MessageForm their_sid={this.props.conversation.their_sid} />
            </div>
        );
     }
});

var Conversations = React.createClass({
    retrieveConversations: function() {
        this.setState({ conversations: $conversationStore.getConversations() });   
    },
    getInitialState: function() {
        return { conversations: [] };
    },
    componentDidMount: function() {
        this.retrieveConversations();
        this.subscription = $conversationStore.subscribe(this.retrieveConversations);
    },
    componentWillUnmount: function() {
        $conversationStore.unsubscribe(this.subscription);
    },
    render: function() {
        var conversationNodes = this.state.conversations.map(function (conversation) {
            return <li key={ conversation.their_sid + conversation.collapsed }><Conversation conversation={ conversation } /></li>;
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
        return { identity: null };
    },

    componentDidMount: function() {
        $serval.getIdentity(function(result) {
            if (this.isMounted()) {
                this.setState({
                    identity: result
                });
            }
        }.bind(this));
    },

     render: function() {
            if (this.state.identity) return (
                <div className="identities">
                    <Identity identity={ this.state.identity } />
                </div>
            );
            else return (
                <div className="identities">
                    <p>No identities loaded.</p>
                </div>
            );
     }
});


var $serval;
$servalRest.getIdentity(function(identity) {
    $serval = ServalClient(identity);
    React.renderComponent(<Identities />, document.getElementById('identities'));
}, function() {
    React.renderComponent((
        <h1>Error! Could not get identities from servald. Has the service been started?</h1>
    ), document.getElementById('identities'));
});
    
