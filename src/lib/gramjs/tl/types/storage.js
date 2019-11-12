/*! File generated by TLObjects' generator. All changes will be ERASED !*/
const { TLObject } = require('../tlobject');
const struct = require('python-struct');
const { readBigIntFromBuffer, 
        readBufferFromBigInt, generateRandomBytes } = require('../../Helpers')


class FileUnknown extends TLObject {
    static CONSTRUCTOR_ID = 0xaa963b05;
    static SUBCLASS_OF_ID = 0xf3a1e6f3;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0xaa963b05;
        this.SUBCLASS_OF_ID = 0xf3a1e6f3;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("053b96aa","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}


class FilePartial extends TLObject {
    static CONSTRUCTOR_ID = 0x40bc6f52;
    static SUBCLASS_OF_ID = 0xf3a1e6f3;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0x40bc6f52;
        this.SUBCLASS_OF_ID = 0xf3a1e6f3;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("526fbc40","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}


class FileJpeg extends TLObject {
    static CONSTRUCTOR_ID = 0x007efe0e;
    static SUBCLASS_OF_ID = 0xf3a1e6f3;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0x007efe0e;
        this.SUBCLASS_OF_ID = 0xf3a1e6f3;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("0efe7e00","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}


class FileGif extends TLObject {
    static CONSTRUCTOR_ID = 0xcae1aadf;
    static SUBCLASS_OF_ID = 0xf3a1e6f3;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0xcae1aadf;
        this.SUBCLASS_OF_ID = 0xf3a1e6f3;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("dfaae1ca","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}


class FilePng extends TLObject {
    static CONSTRUCTOR_ID = 0x0a4f63c0;
    static SUBCLASS_OF_ID = 0xf3a1e6f3;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0x0a4f63c0;
        this.SUBCLASS_OF_ID = 0xf3a1e6f3;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("c0634f0a","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}


class FilePdf extends TLObject {
    static CONSTRUCTOR_ID = 0xae1e508d;
    static SUBCLASS_OF_ID = 0xf3a1e6f3;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0xae1e508d;
        this.SUBCLASS_OF_ID = 0xf3a1e6f3;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("8d501eae","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}


class FileMp3 extends TLObject {
    static CONSTRUCTOR_ID = 0x528a0677;
    static SUBCLASS_OF_ID = 0xf3a1e6f3;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0x528a0677;
        this.SUBCLASS_OF_ID = 0xf3a1e6f3;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("77068a52","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}


class FileMov extends TLObject {
    static CONSTRUCTOR_ID = 0x4b09ebbc;
    static SUBCLASS_OF_ID = 0xf3a1e6f3;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0x4b09ebbc;
        this.SUBCLASS_OF_ID = 0xf3a1e6f3;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("bceb094b","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}


class FileMp4 extends TLObject {
    static CONSTRUCTOR_ID = 0xb3cea0e4;
    static SUBCLASS_OF_ID = 0xf3a1e6f3;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0xb3cea0e4;
        this.SUBCLASS_OF_ID = 0xf3a1e6f3;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("e4a0ceb3","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}


class FileWebp extends TLObject {
    static CONSTRUCTOR_ID = 0x1081464c;
    static SUBCLASS_OF_ID = 0xf3a1e6f3;

    constructor() {
        super();
        this.CONSTRUCTOR_ID = 0x1081464c;
        this.SUBCLASS_OF_ID = 0xf3a1e6f3;

    }
    get bytes() {
        return Buffer.concat([
            Buffer.from("4c468110","hex"),
            ])
        }
    static fromReader(reader) {
        let _x;
        let len;
        return new this({})
    }
}

module.exports = {
    FileUnknown,
    FilePartial,
    FileJpeg,
    FileGif,
    FilePng,
    FilePdf,
    FileMp3,
    FileMov,
    FileMp4,
    FileWebp,
};
