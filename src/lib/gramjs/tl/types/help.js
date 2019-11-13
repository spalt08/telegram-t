/*! File generated by TLObjects' generator. All changes will be ERASED !*/
const { TLObject } = require('../tlobject');
const struct = require('python-struct');
const { readBigIntFromBuffer, 
        readBufferFromBigInt, generateRandomBytes } = require('../../Helpers')


class AppUpdate extends TLObject {
    static CONSTRUCTOR_ID = 0x1da7158f;
    static SUBCLASS_OF_ID = 0x5897069e;

    /**
    Constructor for help.AppUpdate: Instance of either AppUpdate, NoAppUpdate
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x1da7158f;
        this.SUBCLASS_OF_ID = 0x5897069e;

        this.canNotSkip = args.canNotSkip || null;
        this.id = args.id;
        this.version = args.version;
        this.text = args.text;
        this.entities = args.entities;
        this.document = args.document || null;
        this.url = args.url || null;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("8f15a71d","hex"),
            struct.pack('<I', (this.canNotSkip === undefined || this.canNotSkip === false || this.canNotSkip === null) ? 0 : 1 | (this.document === undefined || this.document === false || this.document === null) ? 0 : 2 | (this.url === undefined || this.url === false || this.url === null) ? 0 : 4),
            struct.pack('<i', this.id),
            TLObject.serializeBytes(this.version),
            TLObject.serializeBytes(this.text),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.entities.length),Buffer.concat(this.entities.map(x => x.bytes)),
            (this.document === undefined || this.document === false || this.document ===null) ? Buffer.alloc(0) : [this.document.bytes],
            (this.url === undefined || this.url === false || this.url ===null) ? Buffer.alloc(0) : [TLObject.serializeBytes(this.url)],
            ])
        }
    static fromReader(reader) {
        let _flags;
        let _can_not_skip;
        let _id;
        let _version;
        let _text;
        let _entities;
        let _document;
        let _url;
        let _x;
        let len;
        let flags = reader.readInt();

        _can_not_skip = Boolean(flags & 1);
        _id = reader.readInt();
        _version = reader.tgReadString();
        _text = reader.tgReadString();
        reader.readInt();
        _entities = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadObject();
            _entities.push(_x);
            }
            if (flags & 2) {
                _document = reader.tgReadObject();
            }
            else {
                _document = null
            }
            if (flags & 4) {
                _url = reader.tgReadString();
            }
            else {
                _url = null
            }
            return new this({canNotSkip:_can_not_skip,
	id:_id,
	version:_version,
	text:_text,
	entities:_entities,
	document:_document,
	url:_url})
        }
    }


class NoAppUpdate extends TLObject {
    static CONSTRUCTOR_ID = 0xc45a6536;
    static SUBCLASS_OF_ID = 0x5897069e;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0xc45a6536;
        this.SUBCLASS_OF_ID = 0x5897069e;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("36655ac4","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}


class InviteText extends TLObject {
    static CONSTRUCTOR_ID = 0x18cb9f78;
    static SUBCLASS_OF_ID = 0xcf70aa35;

    /**
    Constructor for help.InviteText: Instance of InviteText
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x18cb9f78;
        this.SUBCLASS_OF_ID = 0xcf70aa35;

        this.message = args.message;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("789fcb18","hex"),
            TLObject.serializeBytes(this.message),
            ])
        }
    static fromReader(reader) {
        let _message;
        let _x;
        let len;
        _message = reader.tgReadString();
        return new this({message:_message})
    }
}


class Support extends TLObject {
    static CONSTRUCTOR_ID = 0x17c6b5f6;
    static SUBCLASS_OF_ID = 0x7159bceb;

    /**
    Constructor for help.Support: Instance of Support
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x17c6b5f6;
        this.SUBCLASS_OF_ID = 0x7159bceb;

        this.phoneNumber = args.phoneNumber;
        this.user = args.user;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("f6b5c617","hex"),
            TLObject.serializeBytes(this.phoneNumber),
            this.user.bytes,
            ])
        }
    static fromReader(reader) {
        let _phone_number;
        let _user;
        let _x;
        let len;
        _phone_number = reader.tgReadString();
        _user = reader.tgReadObject();
        return new this({phoneNumber:_phone_number,
	user:_user})
    }
}


class TermsOfService extends TLObject {
    static CONSTRUCTOR_ID = 0x780a0310;
    static SUBCLASS_OF_ID = 0x20ee8312;

    /**
    Constructor for help.TermsOfService: Instance of TermsOfService
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x780a0310;
        this.SUBCLASS_OF_ID = 0x20ee8312;

        this.popup = args.popup || null;
        this.id = args.id;
        this.text = args.text;
        this.entities = args.entities;
        this.minAgeConfirm = args.minAgeConfirm || null;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("10030a78","hex"),
            struct.pack('<I', (this.popup === undefined || this.popup === false || this.popup === null) ? 0 : 1 | (this.minAgeConfirm === undefined || this.minAgeConfirm === false || this.minAgeConfirm === null) ? 0 : 2),
            this.id.bytes,
            TLObject.serializeBytes(this.text),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.entities.length),Buffer.concat(this.entities.map(x => x.bytes)),
            (this.minAgeConfirm === undefined || this.minAgeConfirm === false || this.minAgeConfirm ===null) ? Buffer.alloc(0) : [struct.pack('<i', this.minAgeConfirm)],
            ])
        }
    static fromReader(reader) {
        let _flags;
        let _popup;
        let _id;
        let _text;
        let _entities;
        let _min_age_confirm;
        let _x;
        let len;
        let flags = reader.readInt();

        _popup = Boolean(flags & 1);
        _id = reader.tgReadObject();
        _text = reader.tgReadString();
        reader.readInt();
        _entities = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadObject();
            _entities.push(_x);
            }
            if (flags & 2) {
                _min_age_confirm = reader.readInt();
            }
            else {
                _min_age_confirm = null
            }
            return new this({popup:_popup,
	id:_id,
	text:_text,
	entities:_entities,
	minAgeConfirm:_min_age_confirm})
        }
    }


class RecentMeUrls extends TLObject {
    static CONSTRUCTOR_ID = 0x0e0310d7;
    static SUBCLASS_OF_ID = 0xf269c477;

    /**
    Constructor for help.RecentMeUrls: Instance of RecentMeUrls
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x0e0310d7;
        this.SUBCLASS_OF_ID = 0xf269c477;

        this.urls = args.urls;
        this.chats = args.chats;
        this.users = args.users;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("d710030e","hex"),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.urls.length),Buffer.concat(this.urls.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.chats.length),Buffer.concat(this.chats.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.users.length),Buffer.concat(this.users.map(x => x.bytes)),
            ])
        }
    static fromReader(reader) {
        let _urls;
        let _chats;
        let _users;
        let _x;
        let len;
        reader.readInt();
        _urls = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadObject();
            _urls.push(_x);
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
                    return new this({urls:_urls,
	chats:_chats,
	users:_users})
                }
            }


class ProxyDataEmpty extends TLObject {
    static CONSTRUCTOR_ID = 0xe09e1fb8;
    static SUBCLASS_OF_ID = 0x21e2a448;

    /**
    Constructor for help.ProxyData: Instance of either ProxyDataEmpty, ProxyDataPromo
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xe09e1fb8;
        this.SUBCLASS_OF_ID = 0x21e2a448;

        this.expires = args.expires;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("b81f9ee0","hex"),
            struct.pack('<i', this.expires),
            ])
        }
    static fromReader(reader) {
        let _expires;
        let _x;
        let len;
        _expires = reader.readInt();
        return new this({expires:_expires})
    }
}


class ProxyDataPromo extends TLObject {
    static CONSTRUCTOR_ID = 0x2bf7ee23;
    static SUBCLASS_OF_ID = 0x21e2a448;

    /**
    Constructor for help.ProxyData: Instance of either ProxyDataEmpty, ProxyDataPromo
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x2bf7ee23;
        this.SUBCLASS_OF_ID = 0x21e2a448;

        this.expires = args.expires;
        this.peer = args.peer;
        this.chats = args.chats;
        this.users = args.users;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("23eef72b","hex"),
            struct.pack('<i', this.expires),
            this.peer.bytes,
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.chats.length),Buffer.concat(this.chats.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.users.length),Buffer.concat(this.users.map(x => x.bytes)),
            ])
        }
    static fromReader(reader) {
        let _expires;
        let _peer;
        let _chats;
        let _users;
        let _x;
        let len;
        _expires = reader.readInt();
        _peer = reader.tgReadObject();
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
                return new this({expires:_expires,
	peer:_peer,
	chats:_chats,
	users:_users})
            }
        }


class TermsOfServiceUpdateEmpty extends TLObject {
    static CONSTRUCTOR_ID = 0xe3309f7f;
    static SUBCLASS_OF_ID = 0x293c2977;

    /**
    Constructor for help.TermsOfServiceUpdate: Instance of either TermsOfServiceUpdateEmpty, TermsOfServiceUpdate
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xe3309f7f;
        this.SUBCLASS_OF_ID = 0x293c2977;

        this.expires = args.expires;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("7f9f30e3","hex"),
            struct.pack('<i', this.expires),
            ])
        }
    static fromReader(reader) {
        let _expires;
        let _x;
        let len;
        _expires = reader.readInt();
        return new this({expires:_expires})
    }
}


class TermsOfServiceUpdate extends TLObject {
    static CONSTRUCTOR_ID = 0x28ecf961;
    static SUBCLASS_OF_ID = 0x293c2977;

    /**
    Constructor for help.TermsOfServiceUpdate: Instance of either TermsOfServiceUpdateEmpty, TermsOfServiceUpdate
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x28ecf961;
        this.SUBCLASS_OF_ID = 0x293c2977;

        this.expires = args.expires;
        this.termsOfService = args.termsOfService;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("61f9ec28","hex"),
            struct.pack('<i', this.expires),
            this.termsOfService.bytes,
            ])
        }
    static fromReader(reader) {
        let _expires;
        let _terms_of_service;
        let _x;
        let len;
        _expires = reader.readInt();
        _terms_of_service = reader.tgReadObject();
        return new this({expires:_expires,
	termsOfService:_terms_of_service})
    }
}


class DeepLinkInfoEmpty extends TLObject {
    static CONSTRUCTOR_ID = 0x66afa166;
    static SUBCLASS_OF_ID = 0x984aac38;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0x66afa166;
        this.SUBCLASS_OF_ID = 0x984aac38;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("66a1af66","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}


class DeepLinkInfo extends TLObject {
    static CONSTRUCTOR_ID = 0x6a4ee832;
    static SUBCLASS_OF_ID = 0x984aac38;

    /**
    Constructor for help.DeepLinkInfo: Instance of either DeepLinkInfoEmpty, DeepLinkInfo
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x6a4ee832;
        this.SUBCLASS_OF_ID = 0x984aac38;

        this.updateApp = args.updateApp || null;
        this.message = args.message;
        this.entities = args.entities || null;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("32e84e6a","hex"),
            struct.pack('<I', (this.updateApp === undefined || this.updateApp === false || this.updateApp === null) ? 0 : 1 | (this.entities === undefined || this.entities === false || this.entities === null) ? 0 : 2),
            TLObject.serializeBytes(this.message),
            (this.entities === undefined || this.entities === false || this.entities ===null) ? Buffer.alloc(0) :Buffer.concat([Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.entities.length),Buffer.concat(this.entities.map(x => x.bytes))]),
            ])
        }
    static fromReader(reader) {
        let _flags;
        let _update_app;
        let _message;
        let _entities;
        let _x;
        let len;
        let flags = reader.readInt();

        _update_app = Boolean(flags & 1);
        _message = reader.tgReadString();
        if (flags & 2) {
            reader.readInt();
            _entities = [];
            len = reader.readInt();
            for (let i=0;i<len;i++){
                _x = reader.tgReadObject();
                _entities.push(_x);
                }
            }
            else {
                _entities = null
            }
            return new this({updateApp:_update_app,
	message:_message,
	entities:_entities})
        }
    }


class PassportConfigNotModified extends TLObject {
    static CONSTRUCTOR_ID = 0xbfb9f457;
    static SUBCLASS_OF_ID = 0xc666c0ad;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0xbfb9f457;
        this.SUBCLASS_OF_ID = 0xc666c0ad;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("57f4b9bf","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}


class PassportConfig extends TLObject {
    static CONSTRUCTOR_ID = 0xa098d6af;
    static SUBCLASS_OF_ID = 0xc666c0ad;

    /**
    Constructor for help.PassportConfig: Instance of either PassportConfigNotModified, PassportConfig
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xa098d6af;
        this.SUBCLASS_OF_ID = 0xc666c0ad;

        this.hash = args.hash;
        this.countriesLangs = args.countriesLangs;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("afd698a0","hex"),
            struct.pack('<i', this.hash),
            this.countriesLangs.bytes,
            ])
        }
    static fromReader(reader) {
        let _hash;
        let _countries_langs;
        let _x;
        let len;
        _hash = reader.readInt();
        _countries_langs = reader.tgReadObject();
        return new this({hash:_hash,
	countriesLangs:_countries_langs})
    }
}


class SupportName extends TLObject {
    static CONSTRUCTOR_ID = 0x8c05f1c9;
    static SUBCLASS_OF_ID = 0x7f50b7c2;

    /**
    Constructor for help.SupportName: Instance of SupportName
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x8c05f1c9;
        this.SUBCLASS_OF_ID = 0x7f50b7c2;

        this.name = args.name;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("c9f1058c","hex"),
            TLObject.serializeBytes(this.name),
            ])
        }
    static fromReader(reader) {
        let _name;
        let _x;
        let len;
        _name = reader.tgReadString();
        return new this({name:_name})
    }
}


class UserInfoEmpty extends TLObject {
    static CONSTRUCTOR_ID = 0xf3ae2eed;
    static SUBCLASS_OF_ID = 0x5c53d7d8;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0xf3ae2eed;
        this.SUBCLASS_OF_ID = 0x5c53d7d8;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("ed2eaef3","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}


class UserInfo extends TLObject {
    static CONSTRUCTOR_ID = 0x01eb3758;
    static SUBCLASS_OF_ID = 0x5c53d7d8;

    /**
    Constructor for help.UserInfo: Instance of either UserInfoEmpty, UserInfo
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x01eb3758;
        this.SUBCLASS_OF_ID = 0x5c53d7d8;

        this.message = args.message;
        this.entities = args.entities;
        this.author = args.author;
        this.date = args.date;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("5837eb01","hex"),
            TLObject.serializeBytes(this.message),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.entities.length),Buffer.concat(this.entities.map(x => x.bytes)),
            TLObject.serializeBytes(this.author),
            struct.pack('<i', this.date),
            ])
        }
    static fromReader(reader) {
        let _message;
        let _entities;
        let _author;
        let _date;
        let _x;
        let len;
        _message = reader.tgReadString();
        reader.readInt();
        _entities = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadObject();
            _entities.push(_x);
            }
            _author = reader.tgReadString();
            _date = reader.readInt();
            return new this({message:_message,
	entities:_entities,
	author:_author,
	date:_date})
        }
    }


class ConfigSimple extends TLObject {
    static CONSTRUCTOR_ID = 0x5a592a6c;
    static SUBCLASS_OF_ID = 0x29183ac4;

    /**
    Constructor for help.ConfigSimple: Instance of ConfigSimple
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x5a592a6c;
        this.SUBCLASS_OF_ID = 0x29183ac4;

        this.date = args.date;
        this.expires = args.expires;
        this.rules = args.rules;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("6c2a595a","hex"),
            struct.pack('<i', this.date),
            struct.pack('<i', this.expires),
            struct.pack('<i', this.rules.length),Buffer.concat(this.rules.map(x => x.bytes)),
            ])
        }
    static fromReader(reader) {
        let _date;
        let _expires;
        let _rules;
        let _x;
        let len;
        _date = reader.readInt();
        _expires = reader.readInt();
        _rules = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadObject();
            _rules.push(_x);
            }
            return new this({date:_date,
	expires:_expires,
	rules:_rules})
        }
    }

module.exports = {
    AppUpdate,
    NoAppUpdate,
    InviteText,
    Support,
    TermsOfService,
    RecentMeUrls,
    ProxyDataEmpty,
    ProxyDataPromo,
    TermsOfServiceUpdateEmpty,
    TermsOfServiceUpdate,
    DeepLinkInfoEmpty,
    DeepLinkInfo,
    PassportConfigNotModified,
    PassportConfig,
    SupportName,
    UserInfoEmpty,
    UserInfo,
    ConfigSimple,
};
