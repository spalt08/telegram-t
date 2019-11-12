/*! File generated by TLObjects' generator. All changes will be ERASED !*/
const { TLObject } = require('../tlobject');
const struct = require('python-struct');
const { readBigIntFromBuffer, 
        readBufferFromBigInt, generateRandomBytes } = require('../../Helpers')


class State extends TLObject {
    static CONSTRUCTOR_ID = 0xa56c2a3e;
    static SUBCLASS_OF_ID = 0x23df1a01;

    /**
    Constructor for updates.State: Instance of State
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xa56c2a3e;
        this.SUBCLASS_OF_ID = 0x23df1a01;

        this.pts = args.pts;
        this.qts = args.qts;
        this.date = args.date;
        this.seq = args.seq;
        this.unreadCount = args.unreadCount;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("3e2a6ca5","hex"),
            struct.pack('<i', this.pts),
            struct.pack('<i', this.qts),
            struct.pack('<i', this.date),
            struct.pack('<i', this.seq),
            struct.pack('<i', this.unreadCount),
            ])
        }
    static fromReader(reader) {
        let _pts;
        let _qts;
        let _date;
        let _seq;
        let _unread_count;
        let _x;
        let len;
        _pts = reader.readInt();
        _qts = reader.readInt();
        _date = reader.readInt();
        _seq = reader.readInt();
        _unread_count = reader.readInt();
        return new this({pts:_pts,
	qts:_qts,
	date:_date,
	seq:_seq,
	unreadCount:_unread_count})
    }
}


class DifferenceEmpty extends TLObject {
    static CONSTRUCTOR_ID = 0x5d75a138;
    static SUBCLASS_OF_ID = 0x20482874;

    /**
    Constructor for updates.Difference: Instance of either DifferenceEmpty, Difference, DifferenceSlice, DifferenceTooLong
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x5d75a138;
        this.SUBCLASS_OF_ID = 0x20482874;

        this.date = args.date;
        this.seq = args.seq;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("38a1755d","hex"),
            struct.pack('<i', this.date),
            struct.pack('<i', this.seq),
            ])
        }
    static fromReader(reader) {
        let _date;
        let _seq;
        let _x;
        let len;
        _date = reader.readInt();
        _seq = reader.readInt();
        return new this({date:_date,
	seq:_seq})
    }
}


class Difference extends TLObject {
    static CONSTRUCTOR_ID = 0x00f49ca0;
    static SUBCLASS_OF_ID = 0x20482874;

    /**
    Constructor for updates.Difference: Instance of either DifferenceEmpty, Difference, DifferenceSlice, DifferenceTooLong
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x00f49ca0;
        this.SUBCLASS_OF_ID = 0x20482874;

        this.newMessages = args.newMessages;
        this.newEncryptedMessages = args.newEncryptedMessages;
        this.otherUpdates = args.otherUpdates;
        this.chats = args.chats;
        this.users = args.users;
        this.state = args.state;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("a09cf400","hex"),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.newMessages.length),Buffer.concat(this.newMessages.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.newEncryptedMessages.length),Buffer.concat(this.newEncryptedMessages.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.otherUpdates.length),Buffer.concat(this.otherUpdates.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.chats.length),Buffer.concat(this.chats.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.users.length),Buffer.concat(this.users.map(x => x.bytes)),
            this.state.bytes,
            ])
        }
    static fromReader(reader) {
        let _new_messages;
        let _new_encrypted_messages;
        let _other_updates;
        let _chats;
        let _users;
        let _state;
        let _x;
        let len;
        reader.readInt();
        _new_messages = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadObject();
            _new_messages.push(_x);
            }
            reader.readInt();
            _new_encrypted_messages = [];
            len = reader.readInt();
            for (let i=0;i<len;i++){
                _x = reader.tgReadObject();
                _new_encrypted_messages.push(_x);
                }
                reader.readInt();
                _other_updates = [];
                len = reader.readInt();
                for (let i=0;i<len;i++){
                    _x = reader.tgReadObject();
                    _other_updates.push(_x);
                    }
                    reader.readInt();
                    _chats = [];
                    len = reader.readInt();
                    for (let i=0;i<len;i++){
                        _x = reader.tgReadObject();
                        _chats.push(_x);
                        }
                        reader.readInt();
                        _users = [];
                        len = reader.readInt();
                        for (let i=0;i<len;i++){
                            _x = reader.tgReadObject();
                            _users.push(_x);
                            }
                            _state = reader.tgReadObject();
                            return new this({newMessages:_new_messages,
	newEncryptedMessages:_new_encrypted_messages,
	otherUpdates:_other_updates,
	chats:_chats,
	users:_users,
	state:_state})
                        }
                    }


class DifferenceSlice extends TLObject {
    static CONSTRUCTOR_ID = 0xa8fb1981;
    static SUBCLASS_OF_ID = 0x20482874;

    /**
    Constructor for updates.Difference: Instance of either DifferenceEmpty, Difference, DifferenceSlice, DifferenceTooLong
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xa8fb1981;
        this.SUBCLASS_OF_ID = 0x20482874;

        this.newMessages = args.newMessages;
        this.newEncryptedMessages = args.newEncryptedMessages;
        this.otherUpdates = args.otherUpdates;
        this.chats = args.chats;
        this.users = args.users;
        this.intermediateState = args.intermediateState;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("8119fba8","hex"),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.newMessages.length),Buffer.concat(this.newMessages.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.newEncryptedMessages.length),Buffer.concat(this.newEncryptedMessages.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.otherUpdates.length),Buffer.concat(this.otherUpdates.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.chats.length),Buffer.concat(this.chats.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.users.length),Buffer.concat(this.users.map(x => x.bytes)),
            this.intermediateState.bytes,
            ])
        }
    static fromReader(reader) {
        let _new_messages;
        let _new_encrypted_messages;
        let _other_updates;
        let _chats;
        let _users;
        let _intermediate_state;
        let _x;
        let len;
        reader.readInt();
        _new_messages = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadObject();
            _new_messages.push(_x);
            }
            reader.readInt();
            _new_encrypted_messages = [];
            len = reader.readInt();
            for (let i=0;i<len;i++){
                _x = reader.tgReadObject();
                _new_encrypted_messages.push(_x);
                }
                reader.readInt();
                _other_updates = [];
                len = reader.readInt();
                for (let i=0;i<len;i++){
                    _x = reader.tgReadObject();
                    _other_updates.push(_x);
                    }
                    reader.readInt();
                    _chats = [];
                    len = reader.readInt();
                    for (let i=0;i<len;i++){
                        _x = reader.tgReadObject();
                        _chats.push(_x);
                        }
                        reader.readInt();
                        _users = [];
                        len = reader.readInt();
                        for (let i=0;i<len;i++){
                            _x = reader.tgReadObject();
                            _users.push(_x);
                            }
                            _intermediate_state = reader.tgReadObject();
                            return new this({newMessages:_new_messages,
	newEncryptedMessages:_new_encrypted_messages,
	otherUpdates:_other_updates,
	chats:_chats,
	users:_users,
	intermediateState:_intermediate_state})
                        }
                    }


class DifferenceTooLong extends TLObject {
    static CONSTRUCTOR_ID = 0x4afe8f6d;
    static SUBCLASS_OF_ID = 0x20482874;

    /**
    Constructor for updates.Difference: Instance of either DifferenceEmpty, Difference, DifferenceSlice, DifferenceTooLong
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x4afe8f6d;
        this.SUBCLASS_OF_ID = 0x20482874;

        this.pts = args.pts;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("6d8ffe4a","hex"),
            struct.pack('<i', this.pts),
            ])
        }
    static fromReader(reader) {
        let _pts;
        let _x;
        let len;
        _pts = reader.readInt();
        return new this({pts:_pts})
    }
}


class ChannelDifferenceEmpty extends TLObject {
    static CONSTRUCTOR_ID = 0x3e11affb;
    static SUBCLASS_OF_ID = 0x29896f5d;

    /**
    Constructor for updates.ChannelDifference: Instance of either ChannelDifferenceEmpty, ChannelDifferenceTooLong, ChannelDifference
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x3e11affb;
        this.SUBCLASS_OF_ID = 0x29896f5d;

        this.pts = args.pts;
        this.timeout = args.timeout || null;
        this.final = args.final || null;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("fbaf113e","hex"),
            struct.pack('<I', (this.timeout === undefined || this.timeout === false || this.timeout === null) ? 0 : 2 | (this.final === undefined || this.final === false || this.final === null) ? 0 : 1),
            struct.pack('<i', this.pts),
            (this.timeout === undefined || this.timeout === false || this.timeout ===null) ? Buffer.alloc(0) : [struct.pack('<i', this.timeout)],
            ])
        }
    static fromReader(reader) {
        let _flags;
        let _pts;
        let _timeout;
        let _final;
        let _x;
        let len;
        let flags = reader.readInt();

        _pts = reader.readInt();
        if (flags & 2) {
            _timeout = reader.readInt();
        }
        else {
            _timeout = null
        }
        _final = Boolean(flags & 1);
        return new this({pts:_pts,
	timeout:_timeout,
	final:_final})
    }
}


class ChannelDifferenceTooLong extends TLObject {
    static CONSTRUCTOR_ID = 0xa4bcc6fe;
    static SUBCLASS_OF_ID = 0x29896f5d;

    /**
    Constructor for updates.ChannelDifference: Instance of either ChannelDifferenceEmpty, ChannelDifferenceTooLong, ChannelDifference
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xa4bcc6fe;
        this.SUBCLASS_OF_ID = 0x29896f5d;

        this.dialog = args.dialog;
        this.messages = args.messages;
        this.chats = args.chats;
        this.users = args.users;
        this.timeout = args.timeout || null;
        this.final = args.final || null;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("fec6bca4","hex"),
            struct.pack('<I', (this.timeout === undefined || this.timeout === false || this.timeout === null) ? 0 : 2 | (this.final === undefined || this.final === false || this.final === null) ? 0 : 1),
            this.dialog.bytes,
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.messages.length),Buffer.concat(this.messages.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.chats.length),Buffer.concat(this.chats.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.users.length),Buffer.concat(this.users.map(x => x.bytes)),
            (this.timeout === undefined || this.timeout === false || this.timeout ===null) ? Buffer.alloc(0) : [struct.pack('<i', this.timeout)],
            ])
        }
    static fromReader(reader) {
        let _flags;
        let _dialog;
        let _messages;
        let _chats;
        let _users;
        let _timeout;
        let _final;
        let _x;
        let len;
        let flags = reader.readInt();

        _dialog = reader.tgReadObject();
        reader.readInt();
        _messages = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadObject();
            _messages.push(_x);
            }
            reader.readInt();
            _chats = [];
            len = reader.readInt();
            for (let i=0;i<len;i++){
                _x = reader.tgReadObject();
                _chats.push(_x);
                }
                reader.readInt();
                _users = [];
                len = reader.readInt();
                for (let i=0;i<len;i++){
                    _x = reader.tgReadObject();
                    _users.push(_x);
                    }
                    if (flags & 2) {
                        _timeout = reader.readInt();
                    }
                    else {
                        _timeout = null
                    }
                    _final = Boolean(flags & 1);
                    return new this({dialog:_dialog,
	messages:_messages,
	chats:_chats,
	users:_users,
	timeout:_timeout,
	final:_final})
                }
            }


class ChannelDifference extends TLObject {
    static CONSTRUCTOR_ID = 0x2064674e;
    static SUBCLASS_OF_ID = 0x29896f5d;

    /**
    Constructor for updates.ChannelDifference: Instance of either ChannelDifferenceEmpty, ChannelDifferenceTooLong, ChannelDifference
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x2064674e;
        this.SUBCLASS_OF_ID = 0x29896f5d;

        this.pts = args.pts;
        this.newMessages = args.newMessages;
        this.otherUpdates = args.otherUpdates;
        this.chats = args.chats;
        this.users = args.users;
        this.timeout = args.timeout || null;
        this.final = args.final || null;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("4e676420","hex"),
            struct.pack('<I', (this.timeout === undefined || this.timeout === false || this.timeout === null) ? 0 : 2 | (this.final === undefined || this.final === false || this.final === null) ? 0 : 1),
            struct.pack('<i', this.pts),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.newMessages.length),Buffer.concat(this.newMessages.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.otherUpdates.length),Buffer.concat(this.otherUpdates.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.chats.length),Buffer.concat(this.chats.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.users.length),Buffer.concat(this.users.map(x => x.bytes)),
            (this.timeout === undefined || this.timeout === false || this.timeout ===null) ? Buffer.alloc(0) : [struct.pack('<i', this.timeout)],
            ])
        }
    static fromReader(reader) {
        let _flags;
        let _pts;
        let _new_messages;
        let _other_updates;
        let _chats;
        let _users;
        let _timeout;
        let _final;
        let _x;
        let len;
        let flags = reader.readInt();

        _pts = reader.readInt();
        reader.readInt();
        _new_messages = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadObject();
            _new_messages.push(_x);
            }
            reader.readInt();
            _other_updates = [];
            len = reader.readInt();
            for (let i=0;i<len;i++){
                _x = reader.tgReadObject();
                _other_updates.push(_x);
                }
                reader.readInt();
                _chats = [];
                len = reader.readInt();
                for (let i=0;i<len;i++){
                    _x = reader.tgReadObject();
                    _chats.push(_x);
                    }
                    reader.readInt();
                    _users = [];
                    len = reader.readInt();
                    for (let i=0;i<len;i++){
                        _x = reader.tgReadObject();
                        _users.push(_x);
                        }
                        if (flags & 2) {
                            _timeout = reader.readInt();
                        }
                        else {
                            _timeout = null
                        }
                        _final = Boolean(flags & 1);
                        return new this({pts:_pts,
	newMessages:_new_messages,
	otherUpdates:_other_updates,
	chats:_chats,
	users:_users,
	timeout:_timeout,
	final:_final})
                    }
                }

module.exports = {
    State,
    DifferenceEmpty,
    Difference,
    DifferenceSlice,
    DifferenceTooLong,
    ChannelDifferenceEmpty,
    ChannelDifferenceTooLong,
    ChannelDifference,
};
