/** @jsx React.DOM */
var ContactList = React.createClass({displayName: 'ContactList',
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
            return React.DOM.li( {key: "contact-" + contact.sid }, Contact( {my_sid: this.props.sid,  their_sid: contact.sid } ));
          }.bind(this));

        return (
            React.DOM.div( {className:"contactList"}, 
                React.DOM.h2(null, "Contact List"),       
                React.DOM.ul(null,  contactNodes )
            )
        );
    }
});

var Contact = React.createClass({displayName: 'Contact',
    handleRename: function() {
        if (this.isMounted()) {
            this.setState({
                name: "Mooo"
            });
        }
    },
    sayHi: function() {
        $serval.sendMessage(this.props.my_sid, this.props.their_sid, "Hi!", function() {});
    },
    getInitialState: function() {
        return { name: "Unknown" };
    },
    render: function() {
        return (
            React.DOM.span( {className:"contact"}, 
                React.DOM.span( {ref:"name", title: this.props.their_sid,  onClick: this.openContact,  className:"name"}, 
                     this.state.name,  " (", this.props.their_sid.slice(0,6), ")"
                ),
                React.DOM.input( {type:"button", value:"Rename", className:"rename", onClick:this.handleRename} ),
                React.DOM.input( {type:"button", value:"Start Conversation", className:"startConversation", onClick:this.sayHi} )
            )
        );
    }
});

var MessageForm = React.createClass({displayName: 'MessageForm',
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
               React.DOM.form( {className:"messageForm", onSubmit: this.handleSubmit }, 
                   React.DOM.input( {type:"text", placeholder:"New message...", ref:"text"} ),
                   React.DOM.input( {type:"submit", value:"Send"} )
               )
           );
    }
});

var Message = React.createClass({displayName: 'Message',
     render: function() {
        var className = 'message ' + (this.props.message.delivered ? 'delivered' : 'sending');

        if (!this.props.message.is_message()) return React.DOM.div(null);
        else return (
            React.DOM.div( {className: className }, 
                React.DOM.span( {className:"sender"}, Contact( {my_sid: this.props.message.receiver(),  their_sid: this.props.message.sender() } )),
                " ", this.props.message.text,             
                React.DOM.span( {className:"delivery status"},  this.props.message.status() )
            )
        );
     }
});

var Conversation = React.createClass({displayName: 'Conversation',
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
            return React.DOM.li( {key: message.token }, Message( {message: message } ));
          });

        return (
            React.DOM.div( {className:"conversation"}, 
                Contact( {my_sid: this.props.conversation.my_sid, their_sid: this.props.conversation.their_sid} ),

                React.DOM.div( {className:"messages", ref:"messages"}, React.DOM.ul(null,  messageNodes )),

                MessageForm( {conversation:this.props.conversation} )
            )
        );
     }
});

var Conversations = React.createClass({displayName: 'Conversations',
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
            return React.DOM.li( {key: conversation._id }, Conversation( {conversation: conversation } ));
          });


        return (
            React.DOM.div( {className:"conversations"}, 
                React.DOM.h2(null, "Conversations"),
                React.DOM.ul(null,  conversationNodes )
            )
        );
     }
});

var Identity = React.createClass({displayName: 'Identity',
     render: function() {
            return (
                React.DOM.div( {className:"identity"}, 
                    React.DOM.h1(null, "Your Identity: ",  this.props.identity.name || this.props.identity.sid.slice(0,6) + "..." ),
                    ContactList( {sid: this.props.identity.sid } ),
                    Conversations( {sid: this.props.identity.sid } )
                )
            );
     }
});

var Identities = React.createClass({displayName: 'Identities',
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
                    Identity( {key: identity.sid,  identity: identity } )
                );
              });

            return (
                React.DOM.div( {className:"identities"}, 
                     identityNodes 
                )
            );
     }
});

React.renderComponent(
Identities(null ),
     document.getElementById('identities')
);
