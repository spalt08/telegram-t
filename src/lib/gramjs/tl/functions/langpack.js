/*! File generated by TLObjects' generator. All changes will be ERASED !*/
const { TLObject } = require('../tlobject');
const { TLRequest } = require('../tlobject');
const struct = require('python-struct');
const { readBigIntFromBuffer, 
        readBufferFromBigInt, generateRandomBytes } = require('../../Helpers')


class GetLangPackRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0xf2f2330a;
    static SUBCLASS_OF_ID = 0x52662d55;

    /**
    :returns LangPackDifference: Instance of LangPackDifference
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xf2f2330a;
        this.SUBCLASS_OF_ID = 0x52662d55;

        this.langPack = args.langPack;
        this.langCode = args.langCode;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("0a33f2f2","hex"),
            TLObject.serializeBytes(this.langPack),
            TLObject.serializeBytes(this.langCode),
            ])
        }
    static fromReader(reader) {
        let _lang_pack;
        let _lang_code;
        let _x;
        let len;
        _lang_pack = reader.tgReadString();
        _lang_code = reader.tgReadString();
        return new this({langPack:_lang_pack,
	langCode:_lang_code})
    }
}


class GetStringsRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0xefea3803;
    static SUBCLASS_OF_ID = 0xc7b7353d;

    /**
    :returns Vector<LangPackString>: This type has no constructors.
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xefea3803;
        this.SUBCLASS_OF_ID = 0xc7b7353d;

        this.langPack = args.langPack;
        this.langCode = args.langCode;
        this.keys = args.keys;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("0338eaef","hex"),
            TLObject.serializeBytes(this.langPack),
            TLObject.serializeBytes(this.langCode),
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.keys.length),Buffer.concat(this.keys.map(x => TLObject.serializeBytes(x))),
            ])
        }
    static fromReader(reader) {
        let _lang_pack;
        let _lang_code;
        let _keys;
        let _x;
        let len;
        _lang_pack = reader.tgReadString();
        _lang_code = reader.tgReadString();
        reader.readInt();
        _keys = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadString();
            _keys.push(_x);
            }
            return new this({langPack:_lang_pack,
	langCode:_lang_code,
	keys:_keys})
        }
    }


class GetDifferenceRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0xcd984aa5;
    static SUBCLASS_OF_ID = 0x52662d55;

    /**
    :returns LangPackDifference: Instance of LangPackDifference
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xcd984aa5;
        this.SUBCLASS_OF_ID = 0x52662d55;

        this.langPack = args.langPack;
        this.langCode = args.langCode;
        this.fromVersion = args.fromVersion;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("a54a98cd","hex"),
            TLObject.serializeBytes(this.langPack),
            TLObject.serializeBytes(this.langCode),
            struct.pack('<i', this.fromVersion),
            ])
        }
    static fromReader(reader) {
        let _lang_pack;
        let _lang_code;
        let _from_version;
        let _x;
        let len;
        _lang_pack = reader.tgReadString();
        _lang_code = reader.tgReadString();
        _from_version = reader.readInt();
        return new this({langPack:_lang_pack,
	langCode:_lang_code,
	fromVersion:_from_version})
    }
}


class GetLanguagesRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0x42c6978f;
    static SUBCLASS_OF_ID = 0x280912c9;

    /**
    :returns Vector<LangPackLanguage>: This type has no constructors.
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x42c6978f;
        this.SUBCLASS_OF_ID = 0x280912c9;

        this.langPack = args.langPack;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("8f97c642","hex"),
            TLObject.serializeBytes(this.langPack),
            ])
        }
    static fromReader(reader) {
        let _lang_pack;
        let _x;
        let len;
        _lang_pack = reader.tgReadString();
        return new this({langPack:_lang_pack})
    }
}


class GetLanguageRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0x6a596502;
    static SUBCLASS_OF_ID = 0xabac89b7;

    /**
    :returns LangPackLanguage: Instance of LangPackLanguage
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x6a596502;
        this.SUBCLASS_OF_ID = 0xabac89b7;

        this.langPack = args.langPack;
        this.langCode = args.langCode;
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("0265596a","hex"),
            TLObject.serializeBytes(this.langPack),
            TLObject.serializeBytes(this.langCode),
            ])
        }
    static fromReader(reader) {
        let _lang_pack;
        let _lang_code;
        let _x;
        let len;
        _lang_pack = reader.tgReadString();
        _lang_code = reader.tgReadString();
        return new this({langPack:_lang_pack,
	langCode:_lang_code})
    }
}

module.exports = {
    GetLangPackRequest,
    GetStringsRequest,
    GetDifferenceRequest,
    GetLanguagesRequest,
    GetLanguageRequest,
};
