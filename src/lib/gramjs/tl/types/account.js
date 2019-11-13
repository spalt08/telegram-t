/*! File generated by TLObjects' generator. All changes will be ERASED !*/
const { TLObject } = require('../tlobject');
const struct = require('python-struct');
const { readBigIntFromBuffer, 
        readBufferFromBigInt, generateRandomBytes } = require('../../Helpers')


class PrivacyRules extends TLObject {
    static CONSTRUCTOR_ID = 0x50a04e45;
    static SUBCLASS_OF_ID = 0xb55aba82;

    /**
    Constructor for account.PrivacyRules: Instance of PrivacyRules
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x50a04e45;
        this.SUBCLASS_OF_ID = 0xb55aba82;

        this.rules = args.rules;
        this.chats = args.chats;
        this.users = args.users;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("454ea050","hex"),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.rules.length),Buffer.concat(this.rules.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.chats.length),Buffer.concat(this.chats.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.users.length),Buffer.concat(this.users.map(x => x.bytes)),
            ])
        }
    static fromReader(reader) {
        let _rules;
        let _chats;
        let _users;
        let _x;
        let len;
        reader.readInt();
        _rules = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadObject();
            _rules.push(_x);
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
                    return new this({rules:_rules,
	chats:_chats,
	users:_users})
                }
            }


class Authorizations extends TLObject {
    static CONSTRUCTOR_ID = 0x1250abde;
    static SUBCLASS_OF_ID = 0xbf5e0ff;

    /**
    Constructor for account.Authorizations: Instance of Authorizations
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x1250abde;
        this.SUBCLASS_OF_ID = 0xbf5e0ff;

        this.authorizations = args.authorizations;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("deab5012","hex"),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.authorizations.length),Buffer.concat(this.authorizations.map(x => x.bytes)),
            ])
        }
    static fromReader(reader) {
        let _authorizations;
        let _x;
        let len;
        reader.readInt();
        _authorizations = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadObject();
            _authorizations.push(_x);
            }
            return new this({authorizations:_authorizations})
        }
    }


class Password extends TLObject {
    static CONSTRUCTOR_ID = 0xad2641f8;
    static SUBCLASS_OF_ID = 0x53a211a3;

    /**
    Constructor for account.Password: Instance of Password
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xad2641f8;
        this.SUBCLASS_OF_ID = 0x53a211a3;

        this.hasRecovery = args.hasRecovery || null;
        this.hasSecureValues = args.hasSecureValues || null;
        this.hasPassword = args.hasPassword || null;
        this.currentAlgo = args.currentAlgo || null;
        this.srp_B = args.srp_B || null;
        this.srpId = args.srpId || null;
        this.hint = args.hint || null;
        this.emailUnconfirmedPattern = args.emailUnconfirmedPattern || null;
        this.newAlgo = args.newAlgo;
        this.newSecureAlgo = args.newSecureAlgo;
        this.secureRandom = args.secureRandom;
    }
    get bytes() {
        if (!((this.has_password || this.has_password!==null && this.current_algo || this.current_algo!==null && this.srp_B || this.srp_B!==null && this.srp_id || this.srp_id!==null) && (this.has_password===null || this.has_password===false && this.current_algo===null || this.current_algo===false && this.srp_B===null || this.srp_B===false && this.srp_id===null || this.srp_id===false)))
	 throw new Error('has_password, current_algo, srp_B, srp_id paramaters must all be false-y or all true')
        return Buffer.concat([
            Buffer.from("f84126ad","hex"),
            struct.pack('<I', (this.hasRecovery === undefined || this.hasRecovery === false || this.hasRecovery === null) ? 0 : 1 | (this.hasSecureValues === undefined || this.hasSecureValues === false || this.hasSecureValues === null) ? 0 : 2 | (this.hasPassword === undefined || this.hasPassword === false || this.hasPassword === null) ? 0 : 4 | (this.currentAlgo === undefined || this.currentAlgo === false || this.currentAlgo === null) ? 0 : 4 | (this.srp_B === undefined || this.srp_B === false || this.srp_B === null) ? 0 : 4 | (this.srpId === undefined || this.srpId === false || this.srpId === null) ? 0 : 4 | (this.hint === undefined || this.hint === false || this.hint === null) ? 0 : 8 | (this.emailUnconfirmedPattern === undefined || this.emailUnconfirmedPattern === false || this.emailUnconfirmedPattern === null) ? 0 : 16),
            (this.currentAlgo === undefined || this.currentAlgo === false || this.currentAlgo ===null) ? Buffer.alloc(0) : [this.currentAlgo.bytes],
            (this.srp_B === undefined || this.srp_B === false || this.srp_B ===null) ? Buffer.alloc(0) : [TLObject.serializeBytes(this.srp_B)],
            (this.srpId === undefined || this.srpId === false || this.srpId ===null) ? Buffer.alloc(0) : [readBufferFromBigInt(this.srpId,8,true,true)],
            (this.hint === undefined || this.hint === false || this.hint ===null) ? Buffer.alloc(0) : [TLObject.serializeBytes(this.hint)],
            (this.emailUnconfirmedPattern === undefined || this.emailUnconfirmedPattern === false || this.emailUnconfirmedPattern ===null) ? Buffer.alloc(0) : [TLObject.serializeBytes(this.emailUnconfirmedPattern)],
            this.newAlgo.bytes,
            this.newSecureAlgo.bytes,
            TLObject.serializeBytes(this.secureRandom),
            ])
        }
    static fromReader(reader) {
        let _flags;
        let _has_recovery;
        let _has_secure_values;
        let _has_password;
        let _current_algo;
        let _srp_B;
        let _srp_id;
        let _hint;
        let _email_unconfirmed_pattern;
        let _new_algo;
        let _new_secure_algo;
        let _secure_random;
        let _x;
        let len;
        let flags = reader.readInt();

        _has_recovery = Boolean(flags & 1);
        _has_secure_values = Boolean(flags & 2);
        _has_password = Boolean(flags & 4);
        if (flags & 4) {
            _current_algo = reader.tgReadObject();
        }
        else {
            _current_algo = null
        }
        if (flags & 4) {
            _srp_B = reader.tgReadBytes();
        }
        else {
            _srp_B = null
        }
        if (flags & 4) {
            _srp_id = reader.readLong();
        }
        else {
            _srp_id = null
        }
        if (flags & 8) {
            _hint = reader.tgReadString();
        }
        else {
            _hint = null
        }
        if (flags & 16) {
            _email_unconfirmed_pattern = reader.tgReadString();
        }
        else {
            _email_unconfirmed_pattern = null
        }
        _new_algo = reader.tgReadObject();
        _new_secure_algo = reader.tgReadObject();
        _secure_random = reader.tgReadBytes();
        return new this({hasRecovery:_has_recovery,
	hasSecureValues:_has_secure_values,
	hasPassword:_has_password,
	currentAlgo:_current_algo,
	srp_B:_srp_B,
	srpId:_srp_id,
	hint:_hint,
	emailUnconfirmedPattern:_email_unconfirmed_pattern,
	newAlgo:_new_algo,
	newSecureAlgo:_new_secure_algo,
	secureRandom:_secure_random})
    }
}


class PasswordSettings extends TLObject {
    static CONSTRUCTOR_ID = 0x9a5c33e5;
    static SUBCLASS_OF_ID = 0xd23fb078;

    /**
    Constructor for account.PasswordSettings: Instance of PasswordSettings
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x9a5c33e5;
        this.SUBCLASS_OF_ID = 0xd23fb078;

        this.email = args.email || null;
        this.secureSettings = args.secureSettings || null;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("e5335c9a","hex"),
            struct.pack('<I', (this.email === undefined || this.email === false || this.email === null) ? 0 : 1 | (this.secureSettings === undefined || this.secureSettings === false || this.secureSettings === null) ? 0 : 2),
            (this.email === undefined || this.email === false || this.email ===null) ? Buffer.alloc(0) : [TLObject.serializeBytes(this.email)],
            (this.secureSettings === undefined || this.secureSettings === false || this.secureSettings ===null) ? Buffer.alloc(0) : [this.secureSettings.bytes],
            ])
        }
    static fromReader(reader) {
        let _flags;
        let _email;
        let _secure_settings;
        let _x;
        let len;
        let flags = reader.readInt();

        if (flags & 1) {
            _email = reader.tgReadString();
        }
        else {
            _email = null
        }
        if (flags & 2) {
            _secure_settings = reader.tgReadObject();
        }
        else {
            _secure_settings = null
        }
        return new this({email:_email,
	secureSettings:_secure_settings})
    }
}


class PasswordInputSettings extends TLObject {
    static CONSTRUCTOR_ID = 0xc23727c9;
    static SUBCLASS_OF_ID = 0xc426ca6;

    /**
    Constructor for account.PasswordInputSettings: Instance of PasswordInputSettings
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xc23727c9;
        this.SUBCLASS_OF_ID = 0xc426ca6;

        this.newAlgo = args.newAlgo || null;
        this.newPasswordHash = args.newPasswordHash || null;
        this.hint = args.hint || null;
        this.email = args.email || null;
        this.newSecureSettings = args.newSecureSettings || null;
    }
    get bytes() {
        if (!((this.new_algo || this.new_algo!==null && this.new_password_hash || this.new_password_hash!==null && this.hint || this.hint!==null) && (this.new_algo===null || this.new_algo===false && this.new_password_hash===null || this.new_password_hash===false && this.hint===null || this.hint===false)))
	 throw new Error('new_algo, new_password_hash, hint paramaters must all be false-y or all true')
        return Buffer.concat([
            Buffer.from("c92737c2","hex"),
            struct.pack('<I', (this.newAlgo === undefined || this.newAlgo === false || this.newAlgo === null) ? 0 : 1 | (this.newPasswordHash === undefined || this.newPasswordHash === false || this.newPasswordHash === null) ? 0 : 1 | (this.hint === undefined || this.hint === false || this.hint === null) ? 0 : 1 | (this.email === undefined || this.email === false || this.email === null) ? 0 : 2 | (this.newSecureSettings === undefined || this.newSecureSettings === false || this.newSecureSettings === null) ? 0 : 4),
            (this.newAlgo === undefined || this.newAlgo === false || this.newAlgo ===null) ? Buffer.alloc(0) : [this.newAlgo.bytes],
            (this.newPasswordHash === undefined || this.newPasswordHash === false || this.newPasswordHash ===null) ? Buffer.alloc(0) : [TLObject.serializeBytes(this.newPasswordHash)],
            (this.hint === undefined || this.hint === false || this.hint ===null) ? Buffer.alloc(0) : [TLObject.serializeBytes(this.hint)],
            (this.email === undefined || this.email === false || this.email ===null) ? Buffer.alloc(0) : [TLObject.serializeBytes(this.email)],
            (this.newSecureSettings === undefined || this.newSecureSettings === false || this.newSecureSettings ===null) ? Buffer.alloc(0) : [this.newSecureSettings.bytes],
            ])
        }
    static fromReader(reader) {
        let _flags;
        let _new_algo;
        let _new_password_hash;
        let _hint;
        let _email;
        let _new_secure_settings;
        let _x;
        let len;
        let flags = reader.readInt();

        if (flags & 1) {
            _new_algo = reader.tgReadObject();
        }
        else {
            _new_algo = null
        }
        if (flags & 1) {
            _new_password_hash = reader.tgReadBytes();
        }
        else {
            _new_password_hash = null
        }
        if (flags & 1) {
            _hint = reader.tgReadString();
        }
        else {
            _hint = null
        }
        if (flags & 2) {
            _email = reader.tgReadString();
        }
        else {
            _email = null
        }
        if (flags & 4) {
            _new_secure_settings = reader.tgReadObject();
        }
        else {
            _new_secure_settings = null
        }
        return new this({newAlgo:_new_algo,
	newPasswordHash:_new_password_hash,
	hint:_hint,
	email:_email,
	newSecureSettings:_new_secure_settings})
    }
}


class TmpPassword extends TLObject {
    static CONSTRUCTOR_ID = 0xdb64fd34;
    static SUBCLASS_OF_ID = 0xb064992d;

    /**
    Constructor for account.TmpPassword: Instance of TmpPassword
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xdb64fd34;
        this.SUBCLASS_OF_ID = 0xb064992d;

        this.tmpPassword = args.tmpPassword;
        this.validUntil = args.validUntil;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("34fd64db","hex"),
            TLObject.serializeBytes(this.tmpPassword),
            struct.pack('<i', this.validUntil),
            ])
        }
    static fromReader(reader) {
        let _tmp_password;
        let _valid_until;
        let _x;
        let len;
        _tmp_password = reader.tgReadBytes();
        _valid_until = reader.readInt();
        return new this({tmpPassword:_tmp_password,
	validUntil:_valid_until})
    }
}


class WebAuthorizations extends TLObject {
    static CONSTRUCTOR_ID = 0xed56c9fc;
    static SUBCLASS_OF_ID = 0x9a365b32;

    /**
    Constructor for account.WebAuthorizations: Instance of WebAuthorizations
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xed56c9fc;
        this.SUBCLASS_OF_ID = 0x9a365b32;

        this.authorizations = args.authorizations;
        this.users = args.users;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("fcc956ed","hex"),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.authorizations.length),Buffer.concat(this.authorizations.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.users.length),Buffer.concat(this.users.map(x => x.bytes)),
            ])
        }
    static fromReader(reader) {
        let _authorizations;
        let _users;
        let _x;
        let len;
        reader.readInt();
        _authorizations = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadObject();
            _authorizations.push(_x);
            }
            reader.readInt();
            _users = [];
            len = reader.readInt();
            for (let i=0;i<len;i++){
                _x = reader.tgReadObject();
                _users.push(_x);
                }
                return new this({authorizations:_authorizations,
	users:_users})
            }
        }


class AuthorizationForm extends TLObject {
    static CONSTRUCTOR_ID = 0xad2e1cd8;
    static SUBCLASS_OF_ID = 0x78049a94;

    /**
    Constructor for account.AuthorizationForm: Instance of AuthorizationForm
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xad2e1cd8;
        this.SUBCLASS_OF_ID = 0x78049a94;

        this.requiredTypes = args.requiredTypes;
        this.values = args.values;
        this.errors = args.errors;
        this.users = args.users;
        this.privacyPolicyUrl = args.privacyPolicyUrl || null;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("d81c2ead","hex"),
            struct.pack('<I', (this.privacyPolicyUrl === undefined || this.privacyPolicyUrl === false || this.privacyPolicyUrl === null) ? 0 : 1),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.requiredTypes.length),Buffer.concat(this.requiredTypes.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.values.length),Buffer.concat(this.values.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.errors.length),Buffer.concat(this.errors.map(x => x.bytes)),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.users.length),Buffer.concat(this.users.map(x => x.bytes)),
            (this.privacyPolicyUrl === undefined || this.privacyPolicyUrl === false || this.privacyPolicyUrl ===null) ? Buffer.alloc(0) : [TLObject.serializeBytes(this.privacyPolicyUrl)],
            ])
        }
    static fromReader(reader) {
        let _flags;
        let _required_types;
        let _values;
        let _errors;
        let _users;
        let _privacy_policy_url;
        let _x;
        let len;
        let flags = reader.readInt();

        reader.readInt();
        _required_types = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadObject();
            _required_types.push(_x);
            }
            reader.readInt();
            _values = [];
            len = reader.readInt();
            for (let i=0;i<len;i++){
                _x = reader.tgReadObject();
                _values.push(_x);
                }
                reader.readInt();
                _errors = [];
                len = reader.readInt();
                for (let i=0;i<len;i++){
                    _x = reader.tgReadObject();
                    _errors.push(_x);
                    }
                    reader.readInt();
                    _users = [];
                    len = reader.readInt();
                    for (let i=0;i<len;i++){
                        _x = reader.tgReadObject();
                        _users.push(_x);
                        }
                        if (flags & 1) {
                            _privacy_policy_url = reader.tgReadString();
                        }
                        else {
                            _privacy_policy_url = null
                        }
                        return new this({requiredTypes:_required_types,
	values:_values,
	errors:_errors,
	users:_users,
	privacyPolicyUrl:_privacy_policy_url})
                    }
                }


class SentEmailCode extends TLObject {
    static CONSTRUCTOR_ID = 0x811f854f;
    static SUBCLASS_OF_ID = 0x69f3c06e;

    /**
    Constructor for account.SentEmailCode: Instance of SentEmailCode
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x811f854f;
        this.SUBCLASS_OF_ID = 0x69f3c06e;

        this.emailPattern = args.emailPattern;
        this.length = args.length;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("4f851f81","hex"),
            TLObject.serializeBytes(this.emailPattern),
            struct.pack('<i', this.length),
            ])
        }
    static fromReader(reader) {
        let _email_pattern;
        let _length;
        let _x;
        let len;
        _email_pattern = reader.tgReadString();
        _length = reader.readInt();
        return new this({emailPattern:_email_pattern,
	length:_length})
    }
}


class Takeout extends TLObject {
    static CONSTRUCTOR_ID = 0x4dba4501;
    static SUBCLASS_OF_ID = 0x843ebe85;

    /**
    Constructor for account.Takeout: Instance of Takeout
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x4dba4501;
        this.SUBCLASS_OF_ID = 0x843ebe85;

        this.id = args.id;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("0145ba4d","hex"),
            readBufferFromBigInt(this.id,8,true,true),
            ])
        }
    static fromReader(reader) {
        let _id;
        let _x;
        let len;
        _id = reader.readLong();
        return new this({id:_id})
    }
}


class WallPapersNotModified extends TLObject {
    static CONSTRUCTOR_ID = 0x1c199183;
    static SUBCLASS_OF_ID = 0xa2c548fd;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0x1c199183;
        this.SUBCLASS_OF_ID = 0xa2c548fd;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("8391191c","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}


class WallPapers extends TLObject {
    static CONSTRUCTOR_ID = 0x702b65a9;
    static SUBCLASS_OF_ID = 0xa2c548fd;

    /**
    Constructor for account.WallPapers: Instance of either WallPapersNotModified, WallPapers
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x702b65a9;
        this.SUBCLASS_OF_ID = 0xa2c548fd;

        this.hash = args.hash;
        this.wallpapers = args.wallpapers;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("a9652b70","hex"),
            struct.pack('<i', this.hash),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.wallpapers.length),Buffer.concat(this.wallpapers.map(x => x.bytes)),
            ])
        }
    static fromReader(reader) {
        let _hash;
        let _wallpapers;
        let _x;
        let len;
        _hash = reader.readInt();
        reader.readInt();
        _wallpapers = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadObject();
            _wallpapers.push(_x);
            }
            return new this({hash:_hash,
	wallpapers:_wallpapers})
        }
    }


class AutoDownloadSettings extends TLObject {
    static CONSTRUCTOR_ID = 0x63cacf26;
    static SUBCLASS_OF_ID = 0x2fb85921;

    /**
    Constructor for account.AutoDownloadSettings: Instance of AutoDownloadSettings
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x63cacf26;
        this.SUBCLASS_OF_ID = 0x2fb85921;

        this.low = args.low;
        this.medium = args.medium;
        this.high = args.high;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("26cfca63","hex"),
            this.low.bytes,
            this.medium.bytes,
            this.high.bytes,
            ])
        }
    static fromReader(reader) {
        let _low;
        let _medium;
        let _high;
        let _x;
        let len;
        _low = reader.tgReadObject();
        _medium = reader.tgReadObject();
        _high = reader.tgReadObject();
        return new this({low:_low,
	medium:_medium,
	high:_high})
    }
}


class ThemesNotModified extends TLObject {
    static CONSTRUCTOR_ID = 0xf41eb622;
    static SUBCLASS_OF_ID = 0x7fc52204;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0xf41eb622;
        this.SUBCLASS_OF_ID = 0x7fc52204;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("22b61ef4","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}


class Themes extends TLObject {
    static CONSTRUCTOR_ID = 0x7f676421;
    static SUBCLASS_OF_ID = 0x7fc52204;

    /**
    Constructor for account.Themes: Instance of either ThemesNotModified, Themes
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x7f676421;
        this.SUBCLASS_OF_ID = 0x7fc52204;

        this.hash = args.hash;
        this.themes = args.themes;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("2164677f","hex"),
            struct.pack('<i', this.hash),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.themes.length),Buffer.concat(this.themes.map(x => x.bytes)),
            ])
        }
    static fromReader(reader) {
        let _hash;
        let _themes;
        let _x;
        let len;
        _hash = reader.readInt();
        reader.readInt();
        _themes = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadObject();
            _themes.push(_x);
            }
            return new this({hash:_hash,
	themes:_themes})
        }
    }

module.exports = {
    PrivacyRules,
    Authorizations,
    Password,
    PasswordSettings,
    PasswordInputSettings,
    TmpPassword,
    WebAuthorizations,
    AuthorizationForm,
    SentEmailCode,
    Takeout,
    WallPapersNotModified,
    WallPapers,
    AutoDownloadSettings,
    ThemesNotModified,
    Themes,
};
