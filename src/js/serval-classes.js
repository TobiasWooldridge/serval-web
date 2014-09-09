class ServalMessage {
    constructor(obj) {
        this.type = obj.type;
        this.my_sid = obj.my_sid;
        this.their_sid = obj.their_sid;
        this.offset = obj.offset;
        this.token = obj.token;
        this.text = obj.text;
        this.delivered = obj.delivered;
        this.read = obj.read;
        this.timestamp = obj.timestamp;
        this.ack_offset = obj.ack_offset;
        this.key = obj.token;
    }

    serialize() {
        var obj = {}
        obj.type = this.type;
        obj.my_sid = this.my_sid;
        obj.their_sid = this.their_sid;
        obj.offset = this.offset;
        obj.token = this.token;
        obj.text = this.text;
        obj.delivered = this.delivered;
        obj.read = this.read;
        obj.timestamp = this.timestamp;
        obj.ack_offset = this.ack_offset;
        obj.key = this.token;
        return obj;
    }

    is_message() {
        return this.type == "<" || this.type == ">";
    }

    wordedType() {
        switch(this.type) {
            case "<":
                return "inbound";
            case ">":
                return "outbound";
            case "ACK":
                return "ack";
            default:
                return "other";
        }
    }

    sender() {
        if (this.type == "<") {
            return this.my_sid;
        }
        else if (this.type == ">") {
            return this.their_sid;
        }
        return undefined;
    }

    receiver() {
        if (this.type == "<") {
            return this.their_sid;
        }
        else if (this.type == ">") {
            return this.my_sid;
        }
        return undefined;
    }

    status() {
        return (this.read ? "Read" : (this.delivered ? "Delivered" : "In transit"));
    }

    serial() {
        return this.token + "," + this.delivered + "," + this.read;
    }
}
