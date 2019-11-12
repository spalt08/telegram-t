/*! File generated by TLObjects' generator. All changes will be ERASED !*/
const { TLObject } = require('../tlobject');
const { TLRequest } = require('../tlobject');
const struct = require('python-struct');
const { readBigIntFromBuffer, 
        readBufferFromBigInt, generateRandomBytes } = require('../../Helpers')


class GetUsersRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0x0d91a548;
    static SUBCLASS_OF_ID = 0x406da4d;

    /**
    :returns Vector<User>: This type has no constructors.
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x0d91a548;
        this.SUBCLASS_OF_ID = 0x406da4d;

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
            Buffer.from("48a5910d","hex"),
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


class GetFullUserRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0xca30a5b1;
    static SUBCLASS_OF_ID = 0x1f4661b9;

    /**
    :returns UserFull: Instance of UserFull
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0xca30a5b1;
        this.SUBCLASS_OF_ID = 0x1f4661b9;

        this.id = args.id;
    }
    async resolve(client, utils) {
        this.id = utils.getInputUser(await client.getInputEntity(this.id))
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("b1a530ca","hex"),
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


class SetSecureValueErrorsRequest extends TLRequest {
    static CONSTRUCTOR_ID = 0x90c894b5;
    static SUBCLASS_OF_ID = 0xf5b399ac;

    /**
    :returns Bool: This type has no constructors.
    */
    constructor(args) {
        super();
        args = args || {}
        this.CONSTRUCTOR_ID = 0x90c894b5;
        this.SUBCLASS_OF_ID = 0xf5b399ac;

        this.id = args.id;
        this.errors = args.errors;
    }
    async resolve(client, utils) {
        this.id = utils.getInputUser(await client.getInputEntity(this.id))
    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("b594c890","hex"),
            this.id.bytes,
            Buffer.from('15c4b51c', 'hex'),struct.pack('<i', this.errors.length),Buffer.concat(this.errors.map(x => x.bytes)),
            ])
        }
    static fromReader(reader) {
        let _id;
        let _errors;
        let _x;
        let len;
        _id = reader.tgReadObject();
        reader.readInt();
        _errors = [];
        len = reader.readInt();
        for (let i=0;i<len;i++){
            _x = reader.tgReadObject();
            _errors.push(_x);
            }
            return new this({id:_id,
	errors:_errors})
        }
    }

module.exports = {
    GetUsersRequest,
    GetFullUserRequest,
    SetSecureValueErrorsRequest,
};
