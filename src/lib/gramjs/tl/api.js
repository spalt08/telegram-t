const struct = require('python-struct')
const { readFileSync } = require('fs')
const {
    parseTl,
    serializeBytes,
    serializeDate
} = require('./generationHelpers')
const { readBufferFromBigInt } = require('../Helpers')

const NAMED_AUTO_CASTS = new Set([
    'chatId,int'
])
const NAMED_BLACKLIST = new Set([
    'discardEncryption'
])
const AUTO_CASTS = new Set([
    'InputPeer',
    'InputChannel',
    'InputUser',
    'InputDialogPeer',
    'InputNotifyPeer',
    'InputMedia',
    'InputPhoto',
    'InputMessage',
    'InputDocument',
    'InputChatPhoto'
])

function buildApiFromTlSchema() {
    const tlContent = readFileSync('./static/api.tl', 'utf-8')
    const [constructorParamsApi, functionParamsApi] = extractParams(tlContent)
    const schemeContent = readFileSync('./static/schema.tl', 'utf-8')
    const [constructorParamsSchema, functionParamsSchema] = extractParams(schemeContent)
    const constructors = [].concat(constructorParamsApi, constructorParamsSchema)
    const requests = [].concat(functionParamsApi, functionParamsSchema)
    return mergeWithNamespaces(
        createClasses('constructor', constructors),
        createClasses('request', requests)
    )
}

function mergeWithNamespaces(obj1, obj2) {
    const result = { ...obj1 }

    Object.keys(obj2).forEach((key) => {
        if (typeof obj2[key] === 'function' || !result[key]) {
            result[key] = obj2[key]
        } else {
            Object.assign(result[key], obj2[key])
        }
    })

    return result
}

function extractParams(fileContent) {
    const f = parseTl(fileContent, 105)
    const constructors = []
    const functions = []
    for (const d of f) {
        d.isFunction ? functions.push(d) : constructors.push(d)
    }
    return [constructors, functions]
}

function argToBytes(x, type) {
    switch (type) {
        case 'int':
            return (struct.pack('<i', x))
        case 'long':
            return (readBufferFromBigInt(x, 8, true, true))
        case 'int128':
            return (readBufferFromBigInt(x, 16, true, true))
        case 'int256':
            return (readBufferFromBigInt(x, 32, true, true))
        case 'double':
            return (struct.pack('<d', x.toString()))
        case 'string':
            return serializeBytes(x)
        case 'Bool':
            return (x ? Buffer.from('b5757299', 'hex') : Buffer.from('379779bc', 'hex'))
        case 'true':
            return Buffer.alloc(0)
        case 'bytes':
            return serializeBytes(x)
        case 'date':
            return serializeDate(x)
        default:
            throw new Error('unsupported')
    }
}

async function getInputFromResolve(utils, client, peer, peerType) {
    switch (peerType) {
        case 'InputPeer':
            return utils.getInputPeer(await client.getInputEntity(peer))
        case 'InputChannel':
            return utils.getInputChannel(await client.getInputEntity(peer))
        case 'InputUser':
            return utils.getInputUser(await client.getInputEntity(peer))
        case 'InputDialogPeer':
            return await client._getInputDialog(peer)
        case 'InputNotifyPeer':
            return await client._getInputNotify(peer)
        case 'InputMedia':
            return utils.getInputMedia(peer)
        case 'InputPhoto':
            return utils.getInputPhoto(peer)
        case 'InputMessage':
            return utils.getInputMessage(peer)
        case 'InputDocument':
            return utils.getInputDocument(peer)
        case 'InputChatPhoto':
            return utils.getInputChatPhoto(peer)
        case 'chatId,int' :
            return await client.getPeerId(peer, false)
        default:
            throw new Error('unsupported peer type : ' + peerType)
    }
}

function getArgFromReader(reader, arg) {
    if (arg.isVector) {
        if (arg.useVectorId) {
            reader.readInt()
        }
        const temp = []
        const len = reader.readInt()
        arg.isVector = false
        for (let i = 0; i < len; i++) {
            temp.push(getArgFromReader(reader, arg))
        }
        arg.isVector = true
        return temp
    } else if (arg.flagIndicator) {
        return reader.readInt()
    } else {
        switch (arg.type) {
            case 'int':
                return reader.readInt()
            case 'long':
                return reader.readLong()
            case 'int128':
                return reader.readLargeInt(128)
            case 'int256':
                return reader.readLargeInt(256)
            case 'double':
                return reader.readDouble()
            case 'string':
                return reader.tgReadString()
            case 'Bool':
                return reader.tgReadBool()
            case 'true':
                return true
            case 'bytes':
                return reader.tgReadBytes()
            case 'date':
                return reader.tgReadDate()
            default:
                if (!arg.skipConstructorId) {
                    return reader.tgReadObject()
                } else {
                    return api.constructors[arg.type].fromReader(reader)
                }
        }
    }
}

function createClasses(classesType, params) {
    const classes = {}
    for (const classParams of params) {
        const { name, constructorId, subclassOfId, argsConfig, namespace, result } = classParams

        class VirtualClass {
            static CONSTRUCTOR_ID = constructorId
            static SUBCLASS_OF_ID = subclassOfId
            static className = name
            static classType = classesType

            CONSTRUCTOR_ID = constructorId
            SUBCLASS_OF_ID = subclassOfId
            className = name
            classType = classesType

            constructor(args) {
                args = args || {}
                Object.keys(args)
                    .forEach((argName) => {
                        this[argName] = args[argName]
                    })
            }

            static fromReader(reader) {

                const args = {}

                for (const argName in argsConfig) {
                    if (argsConfig.hasOwnProperty(argName)) {
                        const arg = argsConfig[argName]
                        if (arg.isFlag) {
                            if (arg.type === 'true') {
                                args[argName] = Boolean(args['flags'] & 1 << arg.flagIndex)
                                continue
                            }
                            if (args['flags'] & 1 << arg.flagIndex) {
                                args[argName] = getArgFromReader(reader, arg)
                            } else {
                                args[argName] = null
                            }
                        } else {
                            if (arg.flagIndicator) {
                                arg.name = 'flags'
                            }
                            args[argName] = getArgFromReader(reader, arg)
                        }
                    }
                }
                return new VirtualClass(args)
            }

            getBytes() {
                // The next is pseudo-code:
                const idForBytes = this.CONSTRUCTOR_ID
                const buffers = [struct.pack('<I', idForBytes)]
                for (const arg in argsConfig) {
                    if (argsConfig.hasOwnProperty(arg)) {
                        if (argsConfig[arg].isFlag) {
                            const tempBuffers = []
                            if (argsConfig[arg] === 'true') {

                            } else if (argsConfig[arg].isVector) {
                                if (argsConfig[arg].useVectorId) {
                                    tempBuffers.push(Buffer.from('15c4b51c', 'hex'))
                                }
                                buffers.push((!this[arg] ? Buffer.alloc(0) : Buffer.concat([...tempBuffers,
                                    struct.pack('<i', this[arg].length), Buffer.concat(this[arg].map(x => argToBytes(x, argsConfig[arg].type)))])))
                            }
                        } else if (argsConfig[arg].isVector && !argsConfig[arg].isFlag) {
                            if (argsConfig[arg].isVector) {
                                buffers.push(Buffer.from('15c4b51c', 'hex'))
                            }
                            buffers.push(struct.pack('<i', this[arg].length), Buffer.concat(this[arg].map(x => argToBytes(x, argsConfig[arg].type))))
                        } else if (argsConfig[arg].flagIndicator) {
                            // @ts-ignore
                            if (!Object.values(argsConfig)
                                .some((f) => f.isFlag)) {
                                buffers.push(Buffer.alloc(4))
                            } else {
                                let flagCalculate = 0
                                for (const f of Object.values(argsConfig)) {
                                    if (f.isFlag) {
                                        if (!this[f.name]) {
                                            flagCalculate |= 0
                                        } else {
                                            flagCalculate |= f.flagIndex
                                        }
                                    }
                                }
                                buffers.push(struct.pack('<I', flagCalculate))
                            }
                        } else {

                            switch (argsConfig[arg].type) {
                                case 'int':
                                    buffers.push(struct.pack('<i', this[arg]))
                                    break
                                case 'long':
                                    buffers.push(readBufferFromBigInt(this[arg], 8, true, true))
                                    break
                                case 'int128':
                                    buffers.push(readBufferFromBigInt(this[arg], 16, true, true))
                                    break
                                case 'int256':
                                    buffers.push(readBufferFromBigInt(this[arg], 32, true, true))
                                    break
                                case 'double':
                                    buffers.push(struct.pack('<d', this[arg].toString()))
                                    break
                                case 'string':
                                    buffers.push(serializeBytes(this[arg]))
                                    break
                                case 'Bool':
                                    buffers.push(this[arg] ? Buffer.from('b5757299', 'hex') : Buffer.from('379779bc', 'hex'))
                                    break
                                case 'true':
                                    break
                                case 'bytes':
                                    buffers.push(serializeBytes(this[arg]))
                                    break
                                case 'date':
                                    buffers.push(serializeDate(this[arg]))
                                    break
                                default:
                                    buffers.push(this[arg].getBytes())
                                    let boxed = (argsConfig[arg].type.charAt(argsConfig[arg].type.indexOf('.') + 1))
                                    boxed = boxed === boxed.toUpperCase()
                                    if (!boxed) {
                                        buffers.shift()
                                    }
                            }
                        }
                    }

                }
                return Buffer.concat(buffers)
            }

            readResult(reader) {
                if (classesType !== 'request') {
                    throw new Error('`readResult()` called for non-request instance')
                }

                const m = result.match(/Vector<(int|long)>/)
                if (m) {
                    reader.readInt()
                    let temp = []
                    let len = reader.readInt()
                    if (m[1] === 'int') {
                        for (let i = 0; i < len; i++) {
                            temp.push(reader.readInt())
                        }
                    } else {
                        for (let i = 0; i < len; i++) {
                            temp.push(reader.readLong())
                        }
                    }
                    return temp
                } else {
                    return reader.tgReadObject()
                }
            }

            async resolve(client, utils) {
                if (classesType !== 'request') {
                    throw new Error('`resolve()` called for non-request instance')
                }

                for (const arg in argsConfig) {
                    if (argsConfig.hasOwnProperty(arg)) {
                        if (!AUTO_CASTS.has(argsConfig[arg].type)) {
                            if (!NAMED_AUTO_CASTS.has(`${argsConfig[arg].name},${argsConfig[arg].type}`)) {
                                continue
                            }
                        }
                        if (argsConfig[arg].isFlag) {
                            if (!this[arg]) {
                                continue
                            }
                        }
                        if (argsConfig[arg].isVector) {
                            const temp = []
                            for (const x of this[arg]) {
                                temp.push(await getInputFromResolve(utils, client, this[arg], argsConfig[arg].type))
                            }
                            this[arg] = temp
                        } else {
                            this[arg] = await getInputFromResolve(utils, client, this[arg], argsConfig[arg].type)
                        }
                    }
                }
            }
        }

        if (namespace) {
            if (!classes[namespace]) {
                // @ts-ignore
                classes[namespace] = {}
            }
            classes[namespace][name] = VirtualClass

        } else {
            classes[name] = VirtualClass
        }
    }

    return classes
}

module.exports = buildApiFromTlSchema()