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
    sayHi: function() {
        $serval.sendMessage(this.props.their_sid, "Hi!", function() {});
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
                <span className="id">
                    <span ref="sid" onClick={ this.openContact } className="sid"  title={ this.state.sid }><span>{ this.state.sid }</span></span>
                    <span ref="name" onClick={ this.openContact } className="name"> { this.state.name }</span>
                </span>
                <input type="button" value="Rename" className="rename" onClick={this.handleRename} />
                <input type="button" value="Start Conversation" className="startConversation" onClick={this.sayHi} />
            </span>
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
        var className = 'message' + (this.props.message.delivered ? ' delivered' : ' sending') + ' ' + this.props.message.wordedType();

        if (!this.props.message.is_message()) return <div className={ className }></div>;
        else return (
            <div className={ className }>
                <span className="sender"><Contact my_sid={ this.props.message.receiver() } their_sid={ this.props.message.sender() } /></span>
                &nbsp;{ this.props.message.text }            
                <span className="delivery status">{ this.props.message.status() }</span>
            </div>
        );
     }
});

var Conversation = React.createClass({
    retrieveMessages: function() {
        $serval.getConversation(this.props.conversation.my_sid, this.props.conversation.their_sid, function(result) {
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
    // shouldComponentUpdate: function(nextProps, nextState) {
    //     if (nextState.messages.length != this.state.messages.length) {
    //         return true;
    //     }
    //     console.log(this.state.lastMessage.serial());
    //     console.log(nextState.lastMessage.serial());
    //     if (this.state.lastMessage.serial() != nextState.lastMessage.serial()) {
    //         return true;
    //     }

    //     return false;
    // },
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

React.renderComponent(
<Identities />,
     document.getElementById('identities')
);
