/*! File generated by TLObjects' generator. All changes will be ERASED !*/
const { TLObject } = require('../tlobject');
const { TLRequest } = require('../tlobject');
const struct = require('python-struct');
const { readBigIntFromBuffer, 
        readBufferFromBigInt, generateRandomBytes } = require('../../Helpers')


class GetContactIDsRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0x2caa4a42;
    static SUBCLASS_OF_ID = 0x5026710f;

    /**
    :returns Vector<int>: This type has no constructors.
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x2caa4a42;
        this.SUBCLASS_OF_ID = 0x5026710f;

        this.hash = args.hash;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("424aaa2c","hex"),
            struct.pack('<i', this.hash),
            ])
        }
    static fromReader(reader) {
        let _hash;
        let _x;
        let len;
        _hash = reader.readInt();
        return new this({hash:_hash})
    }
    readResult(reader){
        reader.readInt();  // Vector ID
        let temp = [];
        let len = reader.readInt(); //fix this
        for (let i=0;i<len;i++){
            temp.push(reader.readInt())
        }
        return temp
    }
}


class GetStatusesRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0xc4a353ee;
    static SUBCLASS_OF_ID = 0xdf815c90;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0xc4a353ee;
        this.SUBCLASS_OF_ID = 0xdf815c90;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("ee53a3c4","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}


class GetContactsRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0xc023849f;
    static SUBCLASS_OF_ID = 0x38be25f6;

    /**
    :returns contacts.Contacts: Instance of either ContactsNotModified, Contacts
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xc023849f;
        this.SUBCLASS_OF_ID = 0x38be25f6;

        this.hash = args.hash;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("9f8423c0","hex"),
            struct.pack('<i', this.hash),
            ])
        }
    static fromReader(reader) {
        let _hash;
        let _x;
        let len;
        _hash = reader.readInt();
        return new this({hash:_hash})
    }
}


class ImportContactsRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0x2c800be5;
    static SUBCLASS_OF_ID = 0x8172ad93;

    /**
    :returns contacts.ImportedContacts: Instance of ImportedContacts
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x2c800be5;
        this.SUBCLASS_OF_ID = 0x8172ad93;

        this.contacts = args.contacts;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("e50b802c","hex"),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.contacts.length),Buffer.concat(this.contacts.map(x => x.bytes)),
            ])
        }
    static fromReader(reader) {
        let _contacts;
        let _x;
        let len;
        reader.readInt();
        _contacts = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadObject();
            _contacts.push(_x);
            }
            return new this({contacts:_contacts})
        }
    }


class DeleteContactsRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0x096a0e00;
    static SUBCLASS_OF_ID = 0x8af52aac;

    /**
    :returns Updates: Instance of either UpdatesTooLong, UpdateShortMessage, UpdateShortChatMessage, UpdateShort, UpdatesCombined, Updates, UpdateShortSentMessage
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x096a0e00;
        this.SUBCLASS_OF_ID = 0x8af52aac;

        this.id = args.id;
    }
    async resolve(client, utils) {
        const _tmp = [];for (const _x of this.id) {
            _tmp.push(utils.getInputUser(await client.getInputEntity(_x)));
        }
        this.id = _tmp;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("000e6a09","hex"),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.id.length),Buffer.concat(this.id.map(x => x.bytes)),
            ])
        }
    static fromReader(reader) {
        let _id;
        let _x;
        let len;
        reader.readInt();
        _id = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadObject();
            _id.push(_x);
            }
            return new this({id:_id})
        }
    }


class DeleteByPhonesRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0x1013fd9e;
    static SUBCLASS_OF_ID = 0xf5b399ac;

    /**
    :returns Bool: This type has no constructors.
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x1013fd9e;
        this.SUBCLASS_OF_ID = 0xf5b399ac;

        this.phones = args.phones;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("9efd1310","hex"),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.phones.length),Buffer.concat(this.phones.map(x => TLObject.serializeBytes(x))),
            ])
        }
    static fromReader(reader) {
        let _phones;
        let _x;
        let len;
        reader.readInt();
        _phones = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadString();
            _phones.push(_x);
            }
            return new this({phones:_phones})
        }
    }


class BlockRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0x332b49fc;
    static SUBCLASS_OF_ID = 0xf5b399ac;

    /**
    :returns Bool: This type has no constructors.
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x332b49fc;
        this.SUBCLASS_OF_ID = 0xf5b399ac;

        this.id = args.id;
    }
    async resolve(client, utils) {
        this.id = utils.getInputUser(await client.getInputEntity(this.id))
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("fc492b33","hex"),
            this.id.bytes,
            ])
        }
    static fromReader(reader) {
        let _id;
        let _x;
        let len;
        _id = reader.tgReadObject();
        return new this({id:_id})
    }
}


class UnblockRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0xe54100bd;
    static SUBCLASS_OF_ID = 0xf5b399ac;

    /**
    :returns Bool: This type has no constructors.
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xe54100bd;
        this.SUBCLASS_OF_ID = 0xf5b399ac;

        this.id = args.id;
    }
    async resolve(client, utils) {
        this.id = utils.getInputUser(await client.getInputEntity(this.id))
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("bd0041e5","hex"),
            this.id.bytes,
            ])
        }
    static fromReader(reader) {
        let _id;
        let _x;
        let len;
        _id = reader.tgReadObject();
        return new this({id:_id})
    }
}


class GetBlockedRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0xf57c350f;
    static SUBCLASS_OF_ID = 0xffba4f4f;

    /**
    :returns contacts.Blocked: Instance of either Blocked, BlockedSlice
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xf57c350f;
        this.SUBCLASS_OF_ID = 0xffba4f4f;

        this.offset = args.offset;
        this.limit = args.limit;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("0f357cf5","hex"),
            struct.pack('<i', this.offset),
            struct.pack('<i', this.limit),
            ])
        }
    static fromReader(reader) {
        let _offset;
        let _limit;
        let _x;
        let len;
        _offset = reader.readInt();
        _limit = reader.readInt();
        return new this({offset:_offset,
	limit:_limit})
    }
}


class SearchRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0x11f812d8;
    static SUBCLASS_OF_ID = 0x4386a2e3;

    /**
    :returns contacts.Found: Instance of Found
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x11f812d8;
        this.SUBCLASS_OF_ID = 0x4386a2e3;

        this.q = args.q;
        this.limit = args.limit;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("d812f811","hex"),
            TLObject.serializeBytes(this.q),
            struct.pack('<i', this.limit),
            ])
        }
    static fromReader(reader) {
        let _q;
        let _limit;
        let _x;
        let len;
        _q = reader.tgReadString();
        _limit = reader.readInt();
        return new this({q:_q,
	limit:_limit})
    }
}


class ResolveUsernameRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0xf93ccba3;
    static SUBCLASS_OF_ID = 0xf065b3a8;

    /**
    :returns contacts.ResolvedPeer: Instance of ResolvedPeer
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xf93ccba3;
        this.SUBCLASS_OF_ID = 0xf065b3a8;

        this.username = args.username;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("a3cb3cf9","hex"),
            TLObject.serializeBytes(this.username),
            ])
        }
    static fromReader(reader) {
        let _username;
        let _x;
        let len;
        _username = reader.tgReadString();
        return new this({username:_username})
    }
}


class GetTopPeersRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0xd4982db5;
    static SUBCLASS_OF_ID = 0x9ee8bb88;

    /**
    :returns contacts.TopPeers: Instance of either TopPeersNotModified, TopPeers, TopPeersDisabled
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xd4982db5;
        this.SUBCLASS_OF_ID = 0x9ee8bb88;

        this.forwardChats = args.forwardChats || null;
        this.limit = args.limit;
        this.offset = args.offset;
        this.hash = args.hash;
        this.botsPm = args.botsPm || null;
        this.botsInline = args.botsInline || null;
        this.channels = args.channels || null;
        this.groups = args.groups || null;
        this.correspondents = args.correspondents || null;
        this.forwardUsers = args.forwardUsers || null;
        this.phoneCalls = args.phoneCalls || null;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("b52d98d4","hex"),
            struct.pack('<I', (this.forwardChats === undefined || this.forwardChats === false || this.forwardChats === null) ? 0 : 32 | (this.botsPm === undefined || this.botsPm === false || this.botsPm === null) ? 0 : 2 | (this.botsInline === undefined || this.botsInline === false || this.botsInline === null) ? 0 : 4 | (this.channels === undefined || this.channels === false || this.channels === null) ? 0 : 32768 | (this.groups === undefined || this.groups === false || this.groups === null) ? 0 : 1024 | (this.correspondents === undefined || this.correspondents === false || this.correspondents === null) ? 0 : 1 | (this.forwardUsers === undefined || this.forwardUsers === false || this.forwardUsers === null) ? 0 : 16 | (this.phoneCalls === undefined || this.phoneCalls === false || this.phoneCalls === null) ? 0 : 8),
            struct.pack('<i', this.limit),
            struct.pack('<i', this.offset),
            struct.pack('<i', this.hash),
            ])
        }
    static fromReader(reader) {
        let _forward_chats;
        let _flags;
        let _limit;
        let _offset;
        let _hash;
        let _bots_pm;
        let _bots_inline;
        let _channels;
        let _groups;
        let _correspondents;
        let _forward_users;
        let _phone_calls;
        let _x;
        let len;
        _forward_chats = Boolean(flags & 32);
        let flags = reader.readInt();

        _limit = reader.readInt();
        _offset = reader.readInt();
        _hash = reader.readInt();
        _bots_pm = Boolean(flags & 2);
        _bots_inline = Boolean(flags & 4);
        _channels = Boolean(flags & 32768);
        _groups = Boolean(flags & 1024);
        _correspondents = Boolean(flags & 1);
        _forward_users = Boolean(flags & 16);
        _phone_calls = Boolean(flags & 8);
        return new this({forwardChats:_forward_chats,
	limit:_limit,
	offset:_offset,
	hash:_hash,
	botsPm:_bots_pm,
	botsInline:_bots_inline,
	channels:_channels,
	groups:_groups,
	correspondents:_correspondents,
	forwardUsers:_forward_users,
	phoneCalls:_phone_calls})
    }
}


class ResetTopPeerRatingRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0x1ae373ac;
    static SUBCLASS_OF_ID = 0xf5b399ac;

    /**
    :returns Bool: This type has no constructors.
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x1ae373ac;
        this.SUBCLASS_OF_ID = 0xf5b399ac;

        this.category = args.category;
        this.peer = args.peer;
    }
    async resolve(client, utils) {
        this.peer = utils.getInputPeer(await client.getInputEntity(this.peer))
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("ac73e31a","hex"),
            this.category.bytes,
            this.peer.bytes,
            ])
        }
    static fromReader(reader) {
        let _category;
        let _peer;
        let _x;
        let len;
        _category = reader.tgReadObject();
        _peer = reader.tgReadObject();
        return new this({category:_category,
	peer:_peer})
    }
}


class ResetSavedRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0x879537f1;
    static SUBCLASS_OF_ID = 0xf5b399ac;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0x879537f1;
        this.SUBCLASS_OF_ID = 0xf5b399ac;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("f1379587","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}


class GetSavedRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0x82f1e39f;
    static SUBCLASS_OF_ID = 0x975dbef;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0x82f1e39f;
        this.SUBCLASS_OF_ID = 0x975dbef;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("9fe3f182","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}


class ToggleTopPeersRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0x8514bdda;
    static SUBCLASS_OF_ID = 0xf5b399ac;

    /**
    :returns Bool: This type has no constructors.
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x8514bdda;
        this.SUBCLASS_OF_ID = 0xf5b399ac;

        this.enabled = args.enabled;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("dabd1485","hex"),
            this.enabled ? 0xb5757299 : 0x379779bc,
            ])
        }
    static fromReader(reader) {
        let _enabled;
        let _x;
        let len;
        _enabled = reader.tgReadBool();
        return new this({enabled:_enabled})
    }
}


class AddContactRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0xe8f463d0;
    static SUBCLASS_OF_ID = 0x8af52aac;

    /**
    :returns Updates: Instance of either UpdatesTooLong, UpdateShortMessage, UpdateShortChatMessage, UpdateShort, UpdatesCombined, Updates, UpdateShortSentMessage
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xe8f463d0;
        this.SUBCLASS_OF_ID = 0x8af52aac;

        this.id = args.id;
        this.firstName = args.firstName;
        this.lastName = args.lastName;
        this.phone = args.phone;
        this.addPhonePrivacyException = args.addPhonePrivacyException || null;
    }
    async resolve(client, utils) {
        this.id = utils.getInputUser(await client.getInputEntity(this.id))
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("d063f4e8","hex"),
            struct.pack('<I', (this.addPhonePrivacyException === undefined || this.addPhonePrivacyException === false || this.addPhonePrivacyException === null) ? 0 : 1),
            this.id.bytes,
            TLObject.serializeBytes(this.firstName),
            TLObject.serializeBytes(this.lastName),
            TLObject.serializeBytes(this.phone),
            ])
        }
    static fromReader(reader) {
        let _flags;
        let _id;
        let _first_name;
        let _last_name;
        let _phone;
        let _add_phone_privacy_exception;
        let _x;
        let len;
        let flags = reader.readInt();

        _id = reader.tgReadObject();
        _first_name = reader.tgReadString();
        _last_name = reader.tgReadString();
        _phone = reader.tgReadString();
        _add_phone_privacy_exception = Boolean(flags & 1);
        return new this({id:_id,
	firstName:_first_name,
	lastName:_last_name,
	phone:_phone,
	addPhonePrivacyException:_add_phone_privacy_exception})
    }
}


class AcceptContactRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0xf831a20f;
    static SUBCLASS_OF_ID = 0x8af52aac;

    /**
    :returns Updates: Instance of either UpdatesTooLong, UpdateShortMessage, UpdateShortChatMessage, UpdateShort, UpdatesCombined, Updates, UpdateShortSentMessage
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xf831a20f;
        this.SUBCLASS_OF_ID = 0x8af52aac;

        this.id = args.id;
    }
    async resolve(client, utils) {
        this.id = utils.getInputUser(await client.getInputEntity(this.id))
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("0fa231f8","hex"),
            this.id.bytes,
            ])
        }
    static fromReader(reader) {
        let _id;
        let _x;
        let len;
        _id = reader.tgReadObject();
        return new this({id:_id})
    }
}


class GetLocatedRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0x0a356056;
    static SUBCLASS_OF_ID = 0x8af52aac;

    /**
    :returns Updates: Instance of either UpdatesTooLong, UpdateShortMessage, UpdateShortChatMessage, UpdateShort, UpdatesCombined, Updates, UpdateShortSentMessage
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x0a356056;
        this.SUBCLASS_OF_ID = 0x8af52aac;

        this.geoPoint = args.geoPoint;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("5660350a","hex"),
            this.geoPoint.bytes,
            ])
        }
    static fromReader(reader) {
        let _geo_point;
        let _x;
        let len;
        _geo_point = reader.tgReadObject();
        return new this({geoPoint:_geo_point})
    }
}

module.exports = {
    GetContactIDsRequest,
    GetStatusesRequest,
    GetContactsRequest,
    ImportContactsRequest,
    DeleteContactsRequest,
    DeleteByPhonesRequest,
    BlockRequest,
    UnblockRequest,
    GetBlockedRequest,
    SearchRequest,
    ResolveUsernameRequest,
    GetTopPeersRequest,
    ResetTopPeerRatingRequest,
    ResetSavedRequest,
    GetSavedRequest,
    ToggleTopPeersRequest,
    AddContactRequest,
    AcceptContactRequest,
    GetLocatedRequest,
};
