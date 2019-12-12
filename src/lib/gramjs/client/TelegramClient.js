const Logger = require('../extensions/Logger')
const { sleep } = require('../Helpers')
const errors = require('../errors')
const MemorySession = require('../sessions/Memory')
const Helpers = require('../Helpers')
const { BinaryWriter } = require('../extensions')
const utils = require('../Utils')
const Session = require('../sessions/Abstract')
const os = require('os')
const { LAYER } = require('../tl/AllTLObjects')
const { constructors, requests } = require('../tl')
const { computeCheck } = require('../Password')
const MTProtoSender = require('../network/MTProtoSender')
const { FloodWaitError } = require('../errors/RPCErrorList')
const { ConnectionTCPObfuscated } = require('../network/connection/TCPObfuscated')

const DEFAULT_DC_ID = 2
const DEFAULT_IPV4_IP = 'venus.web.telegram.org'
const DEFAULT_IPV6_IP = '[2001:67c:4e8:f002::a]'

// Chunk sizes for upload.getFile must be multiples of the smallest size
const MIN_CHUNK_SIZE = 4096
const MAX_CHUNK_SIZE = 512 * 1024
const DEFAULT_CHUNK_SIZE = 64 // kb


class TelegramClient {
    static DEFAULT_OPTIONS = {
        connection: ConnectionTCPObfuscated,
        useIPV6: false,
        proxy: null,
        timeout: 10,
        requestRetries: 5,
        connectionRetries: 5,
        retryDelay: 1,
        autoReconnect: true,
        sequentialUpdates: false,
        floodSleepLimit: 60,
        deviceModel: null,
        systemVersion: null,
        appVersion: null,
        langCode: 'en',
        systemLangCode: 'en',
        baseLogger: 'gramjs',
        useWSS: false,
    }

    /**
     *
     * @param session {StringSession|LocalStorageSession}
     * @param apiId
     * @param apiHash
     * @param opts
     */
    constructor(session, apiId, apiHash, opts = TelegramClient.DEFAULT_OPTIONS) {
        if (apiId === undefined || apiHash === undefined) {
            throw Error('Your API ID or Hash are invalid. Please read "Requirements" on README.md')
        }
        const args = { ...TelegramClient.DEFAULT_OPTIONS, ...opts }
        this.apiId = apiId
        this.apiHash = apiHash
        this._useIPV6 = args.useIPV6
        this._entityCache = new Set()
        if (typeof args.baseLogger == 'string') {
            this._log = new Logger()
        } else {
            this._log = args.baseLogger
        }
        // Determine what session we will use
        if (typeof session === 'string' || !session) {
            try {
                throw new Error('not implemented')
            } catch (e) {
                console.log(e)
                session = new MemorySession()
            }
        } else if (!(session instanceof Session)) {
            throw new Error('The given session must be str or a session instance')
        }
        if (!session.serverAddress || (session.serverAddress.includes(':') !== this._useIPV6)) {
            session.setDC(DEFAULT_DC_ID, this._useIPV6 ? DEFAULT_IPV6_IP : DEFAULT_IPV4_IP, args.useWSS ? 443 : 80)
        }
        this.floodSleepLimit = args.floodSleepLimit
        this._eventBuilders = []

        this._phoneCodeHash = {}
        this.session = session
        // this._entityCache = EntityCache();
        this.apiId = parseInt(apiId)
        this.apiHash = apiHash

        this._requestRetries = args.requestRetries
        this._connectionRetries = args.connectionRetries
        this._retryDelay = args.retryDelay || 0
        if (args.proxy) {
            this._log.warn('proxies are not supported')
        }
        this._proxy = args.proxy
        this._timeout = args.timeout
        this._autoReconnect = args.autoReconnect

        this._connection = args.connection
        // TODO add proxy support

        this._floodWaitedRequests = {}

        this._initWith = (x) => {
            return new requests.InvokeWithLayer({
                layer: LAYER,
                query: new requests.InitConnection({
                    apiId: this.apiId,
                    deviceModel: args.deviceModel || os.type()
                        .toString() || 'Unknown',
                    systemVersion: args.systemVersion || os.release()
                        .toString() || '1.0',
                    appVersion: args.appVersion || '1.0',
                    langCode: args.langCode,
                    langPack: '', // this should be left empty.
                    systemLangCode: args.systemLangCode,
                    query: x,
                    proxy: null, // no proxies yet.
                }),
            })
        }
        // These will be set later
        this._config = null
        this.phoneCodeHashes = []
        this._borrowedSenderPromises = {}
    }


    // region Connecting

    /**
     * Connects to the Telegram servers, executing authentication if required.
     * Note that authenticating to the Telegram servers is not the same as authenticating
     * the app, which requires to send a code first.
     * @returns {Promise<void>}
     */
    async connect() {
        //await this.session.load()

        this._sender = new MTProtoSender(this.session.getAuthKey(), {
            logger: this._log,
            dcId:this.session.dcId,
            retries: this._connectionRetries,
            delay: this._retryDelay,
            autoReconnect: this._autoReconnect,
            connectTimeout: this._timeout,
            authKeyCallback: this._authKeyCallback.bind(this),
            updateCallback: this._handleUpdate.bind(this),

        })
        const connection = new this._connection(this.session.serverAddress
            , this.session.port, this.session.dcId, this._log)
        if (!await this._sender.connect(connection)) {
            return
        }
        this.session.setAuthKey(this._sender.authKey)
        await this._sender.send(this._initWith(
            new requests.help.GetConfig({}),
        ))
        this._updateLoop()
    }

    async _updateLoop() {
        while (this.isConnected()) {
            const rnd = Helpers.getRandomInt(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
            await Helpers.sleep(1000 * 60)
            // We don't care about the result we just want to send it every
            // 60 seconds so telegram doesn't stop the connection
            try {
                this._sender.send(new requests.Ping({
                    pingId: rnd,
                }))
            } catch (e) {
                console.log('err is ', e)
            }

            // We need to send some content-related request at least hourly
            // for Telegram to keep delivering updates, otherwise they will
            // just stop even if we're connected. Do so every 30 minutes.

            // TODO Call getDifference instead since it's more relevant
            if (new Date().getTime() - this._lastRequest > 30 * 60 * 1000) {
                try {
                    await this.invoke(new requests.updates.GetState())
                } catch (e) {
                    console.log('err is ', e)
                }
            }
        }
    }

    /**
     * Disconnects from the Telegram server
     * @returns {Promise<void>}
     */
    async disconnect() {
        if (this._sender) {
            await this._sender.disconnect()
        }
    }


    async _switchDC(newDc) {
        this._log.info(`Reconnecting to new data center ${newDc}`)
        const DC = utils.getDC(newDc)
        this.session.setDC(newDc, DC.ipAddress, DC.port)
        // authKey's are associated with a server, which has now changed
        // so it's not valid anymore. Set to None to force recreating it.
        await this._sender.authKey.setKey(null)
        this.session.setAuthKey(null)
        await this.disconnect()
        return this.connect()
    }

    async _authKeyCallback(authKey,dcId) {
        this.session.setAuthKey(authKey,dcId)
    }

    // endregion
    // export region

    async _borrowExportedSender(dcId, retries = 5) {
        let sender = this._borrowedSenderPromises[dcId]
        if (!sender) {
            sender = this._createExportedSender(dcId, retries)
            this._borrowedSenderPromises[dcId] = sender
        }
        return sender
    }

    async _createExportedSender(dcId, retries) {
        const dc = utils.getDC(dcId)
        const sender = new MTProtoSender(this.session.getAuthKey(dcId),
            { logger: this._log,
                dcId:dcId,
                retries: this._connectionRetries,
                delay: this._retryDelay,
                autoReconnect: this._autoReconnect,
                connectTimeout: this._timeout,
                authKeyCallback: this._authKeyCallback.bind(this),
            })
        for (let i = 0; i < retries; i++) {
            try {
                await sender.connect(new this._connection(
                    dc.ipAddress,
                    dc.port,
                    dcId,
                    this._log,
                ))
                if (this.session.dcId !== dcId) {
                    this._log.info(`Exporting authorization for data center ${dc.ipAddress}`)
                    const auth = await this.invoke(new requests.auth.ExportAuthorization({ dcId: dcId }))
                    const req = this._initWith(new requests.auth.ImportAuthorization({
                            id: auth.id,
                            bytes: auth.bytes,
                        },
                    ))
                    await sender.send(req)
                }
                sender.dcId = dcId
                return sender
            } catch (e) {
                console.log(e)
                await sender.disconnect()
            }
        }
        return null
    }

    // end region

    // download region

    /**
     * Complete flow to download a file.
     * @param inputLocation {constructors.InputFileLocation}
     * @param [args[partSizeKb] {number}]
     * @param [args[fileSize] {number}]
     * @param [args[progressCallback] {Function}]
     * @param [args[dcId] {number}]
     * @returns {Promise<Buffer>}
     */
    async downloadFile(inputLocation, args = {}) {
        let { partSizeKb, fileSize } = args
        const { dcId } = args

        if (!partSizeKb) {
            if (!fileSize) {
                partSizeKb = DEFAULT_CHUNK_SIZE
            } else {
                partSizeKb = utils.getAppropriatedPartSize(fileSize)
            }
        }
        const partSize = parseInt(partSizeKb * 1024)
        if (partSize % MIN_CHUNK_SIZE !== 0) {
            throw new Error('The part size must be evenly divisible by 4096')
        }

        const fileWriter = new BinaryWriter(Buffer.alloc(0))
        const res = utils.getInputLocation(inputLocation)
        let exported = dcId && this.session.dcId !== dcId

        let sender
        if (exported) {
            try {
                sender = await this._borrowExportedSender(dcId)
            } catch (e) {
                if (e.message === 'DC_ID_INVALID') {
                    // Can't export a sender for the ID we are currently in
                    sender = this._sender
                    exported = false
                } else {
                    throw e
                }
            }
        } else {
            sender = this._sender
        }

        this._log.info(`Downloading file in chunks of ${partSize} bytes`)

        try {
            let offset = 0
            // eslint-disable-next-line no-constant-condition
            while (true) {
                let result
                try {
                    result = await sender.send(new requests.upload.GetFile({
                        location: res.inputLocation,
                        offset: offset,
                        limit: partSize,
                    }))
                    if (result instanceof constructors.upload.FileCdnRedirect) {
                        throw new Error('not implemented')
                    }
                } catch (e) {
                    if (e instanceof errors.FileMigrateError) {
                        this._log.info('File lives in another DC')
                        sender = await this._borrowExportedSender(e.newDc)
                        exported = true
                        continue
                    } else {
                        throw e
                    }
                }
                offset += partSize

                if (result.bytes.length) {
                    this._log.debug(`Saving ${result.bytes.length} more bytes`)

                    fileWriter.write(result.bytes)

                    if (args.progressCallback) {
                        await args.progressCallback(fileWriter.getValue().length, fileSize)
                    }
                }

                // Last chunk.
                if (result.bytes.length < partSize) {
                    return fileWriter.getValue()
                }
            }
        } finally {
            // TODO
        }
    }

    async downloadMedia(message, args = {
        sizeType: null,
        progressCallback: null,
    }) {
        let date
        let media
        if (message instanceof constructors.Message) {
            date = message.date
            media = message.media
        } else {
            date = new Date().getTime()
            media = message
        }
        if (typeof media == 'string') {
            throw new Error('not implemented')
        }

        if (media instanceof constructors.MessageMediaWebPage) {
            if (media.webpage instanceof constructors.WebPage) {
                media = media.webpage.document || media.webpage.photo
            }
        }
        if (media instanceof constructors.MessageMediaPhoto || media instanceof constructors.Photo) {
            return this._downloadPhoto(media, args)
        } else if (media instanceof constructors.MessageMediaDocument || media instanceof constructors.Document) {
            return this._downloadDocument(media, args, media.dcId)
        } else if (media instanceof constructors.MessageMediaContact) {
            return this._downloadContact(media, args)
        } else if (media instanceof constructors.WebDocument || media instanceof constructors.WebDocumentNoProxy) {
            return this._downloadWebDocument(media, args)
        }
    }

    async downloadProfilePhoto(entity, isBig = false) {
        // ('User', 'Chat', 'UserFull', 'ChatFull')
        const ENTITIES = [0x2da17977, 0xc5af5d94, 0x1f4661b9, 0xd49a2697]
        // ('InputPeer', 'InputUser', 'InputChannel')
        // const INPUTS = [0xc91c90b6, 0xe669bf46, 0x40f202fd]
        // Todo account for input methods
        const sizeType = isBig ? 'x' : 'm'
        let photo
        if (!(ENTITIES.includes(entity.SUBCLASS_OF_ID))) {
            photo = entity
        } else {
            if (!entity.photo) {
                // Special case: may be a ChatFull with photo:Photo
                if (!entity.chatPhoto) {
                    return null
                }

                return this._downloadPhoto(
                    entity.chatPhoto, { sizeType },
                )
            }
            photo = entity.photo
        }
        let dcId
        let loc
        if (photo instanceof constructors.UserProfilePhoto || photo instanceof constructors.ChatPhoto) {
            dcId = photo.dcId
            const size = isBig ? photo.photoBig : photo.photoSmall
            loc = new constructors.InputPeerPhotoFileLocation({
                peer: await this.getInputEntity(entity),
                localId: size.localId,
                volumeId: size.volumeId,
                big: isBig,
            })
        } else {
            // It doesn't make any sense to check if `photo` can be used
            // as input location, because then this method would be able
            // to "download the profile photo of a message", i.e. its
            // media which should be done with `download_media` instead.
            return null
        }
        try {
            return this.downloadFile(loc, {
                dcId: dcId,
            })
        } catch (e) {
            if (e.message === 'LOCATION_INVALID') {
                const ie = await this.getInputEntity(entity)
                if (ie instanceof constructors.InputPeerChannel) {
                    const full = await this.invoke(new requests.channels.GetFullChannel({
                        channel: ie,
                    }))
                    return this._downloadPhoto(full.fullChat.chatPhoto, { sizeType })
                } else {
                    return null
                }
            } else {
                throw e
            }
        }


    }

    _pickFileSize(sizes, sizeType) {
        if (!sizeType || !sizes || !sizes.length) {
            return null
        }

        return sizes.find((s) => s.type === sizeType)
    }


    _downloadCachedPhotoSize(size) {
        // No need to download anything, simply write the bytes
        let data
        if (size instanceof constructors.PhotoStrippedSize) {
            data = utils.strippedPhotoToJpg(size.bytes)
        } else {
            data = size.bytes
        }
        return data
    }

    async _downloadPhoto(photo, args) {
        if (photo instanceof constructors.MessageMediaPhoto) {
            photo = photo.photo
        }
        if (!(photo instanceof constructors.Photo)) {
            return
        }
        const size = this._pickFileSize(photo.sizes, args.sizeType)
        if (!size || (size instanceof constructors.PhotoSizeEmpty)) {
            return
        }

        if (size instanceof constructors.PhotoCachedSize || size instanceof constructors.PhotoStrippedSize) {
            return this._downloadCachedPhotoSize(size)
        }

        return this.downloadFile(
            new constructors.InputPhotoFileLocation({
                id: photo.id,
                accessHash: photo.accessHash,
                fileReference: photo.fileReference,
                thumbSize: size.type,
            }),
            {
                dcId: photo.dcId,
                fileSize: size.size,
                progressCallback: args.progressCallback,
            },
        )
    }

    async _downloadDocument(media, args) {
        if (!(media instanceof constructors.MessageMediaDocument)) {
            return
        }

        const doc = media.document

        if (!(doc instanceof constructors.Document)) {
            return
        }

        const size = doc.thumbs ? this._pickFileSize(doc.thumbs, args.sizeType) : null
        if (size && (size instanceof constructors.PhotoCachedSize || size instanceof constructors.PhotoStrippedSize)) {
            return this._downloadCachedPhotoSize(size)
        }

        return this.downloadFile(
            new constructors.InputDocumentFileLocation({
                id: doc.id,
                accessHash: doc.accessHash,
                fileReference: doc.fileReference,
                thumbSize: size ? size.type : '',
            }),
            {
                fileSize: size ? size.size : doc.size,
                progressCallback: args.progressCallback,
                dcId: doc.dcId,
            },
        )
    }

    _downloadContact(media, args) {
        throw new Error('not implemented')
    }

    _downloadWebDocument(media, args) {
        throw new Error('not implemented')
    }

    // region Invoking Telegram request
    /**
     * Invokes a MTProtoRequest (sends and receives it) and returns its result
     * @param request
     * @returns {Promise}
     */
    async invoke(request) {
        if (request.classType !== 'request') {
            throw new Error('You can only invoke MTProtoRequests')
        }
        await request.resolve(this, utils)

        if (request.CONSTRUCTOR_ID in this._floodWaitedRequests) {
            const due = this._floodWaitedRequests[request.CONSTRUCTOR_ID]
            const diff = Math.round(due - new Date().getTime() / 1000)
            if (diff <= 3) {
                delete this._floodWaitedRequests[request.CONSTRUCTOR_ID]
            } else if (diff <= this.floodSleepLimit) {
                this._log.info(`Sleeping early for ${diff}s on flood wait`)
                await sleep(diff)
                delete this._floodWaitedRequests[request.CONSTRUCTOR_ID]
            } else {
                throw new FloodWaitError({
                    request: request,
                    capture: diff,
                })
            }
        }
        this._lastRequest = new Date().getTime()
        let attempt = 0
        for (attempt = 0; attempt < this._requestRetries; attempt++) {
            try {
                const promise = this._sender.send(request)
                const result = await promise
                this.session.processEntities(result)
                this._entityCache.add(result)
                return result
            } catch (e) {
                if (e instanceof errors.ServerError || e.message === 'RPC_CALL_FAIL' ||
                    e.message === 'RPC_MCGET_FAIL') {
                    this._log.warn(`Telegram is having internal issues ${e.constructor.name}`)
                    await sleep(2000)
                } else if (e instanceof errors.FloodWaitError || e instanceof errors.FloodTestPhoneWaitError) {
                    this._floodWaitedRequests[request.CONSTRUCTOR_ID] = new Date().getTime() / 1000 + e.seconds
                    if (e.seconds <= this.floodSleepLimit) {
                        this._log.info(`Sleeping for ${e.seconds}s on flood wait`)
                        await sleep(e.seconds * 1000)
                    } else {
                        throw e
                    }
                } else if (e instanceof errors.PhoneMigrateError || e instanceof errors.NetworkMigrateError ||
                    e instanceof errors.UserMigrateError) {
                    this._log.info(`Phone migrated to ${e.newDc}`)
                    const shouldRaise = e instanceof errors.PhoneMigrateError || e instanceof errors.NetworkMigrateError
                    if (shouldRaise && await this.isUserAuthorized()) {
                        throw e
                    }
                    await this._switchDC(e.newDc)
                } else {
                    throw e
                }
            }
        }
        throw new Error(`Request was unsuccessful ${attempt} time(s)`)
    }

    async getMe() {
        const me = (await this.invoke(new requests.users
            .GetUsers({ id: [new constructors.InputUserSelf()] })))[0]
        return me
    }


    async start(args = {
        phone: null,
        code: null,
        password: null,
        botToken: null,
        forceSMS: null,
        firstName: null,
        lastName: null,
        maxAttempts: 5,
    }) {
        args.maxAttempts = args.maxAttempts || 5
        if (!this.isConnected()) {
            await this.connect()
        }
        if (await this.isUserAuthorized()) {
            return this
        }
        if (args.code == null && !args.botToken) {
            throw new Error('Please pass a promise to the code arg')
        }
        if (!args.botToken && !args.phone) {
            throw new Error('Please provide either a phone or a bot token')
        }
        if (!args.botToken) {
            while (typeof args.phone == 'function') {
                const value = await args.phone()
                if (value.indexOf(':') !== -1) {
                    args.botToken = value
                    break
                }
                args.phone = utils.parsePhone(value) || args.phone
            }
        }
        if (args.botToken) {
            await this.signIn({
                botToken: args.botToken,
            })
            return this
        }

        let me
        let attempts = 0
        let twoStepDetected = false

        await this.sendCodeRequest(args.phone, args.forceSMS)

        let signUp = false
        while (attempts < args.maxAttempts) {
            try {
                const value = await args.code()
                if (!value) {
                    throw new Error('the phone code is empty')
                }

                if (signUp) {
                    me = await this.signUp({
                        code: value,
                        firstName: args.firstName,
                        lastName: args.lastName,
                    })
                } else {
                    // this throws SessionPasswordNeededError if 2FA enabled
                    me = await this.signIn({
                        phone: args.phone,
                        code: value,
                    })
                }
                break
            } catch (e) {
                if (e.message === 'SESSION_PASSWORD_NEEDED') {
                    twoStepDetected = true
                    break
                } else if (e.message === 'PHONE_NUMBER_OCCUPIED') {
                    signUp = true
                } else if (e.message === 'PHONE_NUMBER_UNOCCUPIED') {
                    signUp = true
                } else if (e.message === 'PHONE_CODE_EMPTY' ||
                    e.message === 'PHONE_CODE_EXPIRED' ||
                    e.message === 'PHONE_CODE_HASH_EMPTY' ||
                    e.message === 'PHONE_CODE_INVALID') {
                    console.log('Invalid code. Please try again.')
                } else {
                    throw e
                }
            }
            attempts++
        }
        if (attempts >= args.maxAttempts) {
            throw new Error(`${args.maxAttempts} consecutive sign-in attempts failed. Aborting`)
        }
        if (twoStepDetected) {
            if (!args.password) {
                throw new Error('Two-step verification is enabled for this account. ' +
                    'Please provide the \'password\' argument to \'start()\'.')
            }
            if (typeof args.password == 'function') {
                try {
                    me = await this.signIn({
                        phone: args.phone,
                        password: args.password,
                    })
                } catch (e) {
                    console.log(e)
                    console.log('Invalid password. Please try again')
                }
            } else {
                me = await this.signIn({
                    phone: args.phone,
                    password: args.password,
                })
            }

        }
        const name = utils.getDisplayName(me)
        console.log('Signed in successfully as', name)

        return this
    }

    async signIn(args = {
        phone: null,
        code: null,
        password: null,
        botToken: null,
        phoneCodeHash: null,
    }) {
        let result
        if (args.phone && !args.code && !args.password) {
            return this.sendCodeRequest(args.phone)
        } else if (args.code) {
            const [phone, phoneCodeHash] =
                this._parsePhoneAndHash(args.phone, args.phoneCodeHash)
            // May raise PhoneCodeEmptyError, PhoneCodeExpiredError,
            // PhoneCodeHashEmptyError or PhoneCodeInvalidError.
            result = await this.invoke(new requests.auth.SignIn({
                phoneNumber: phone,
                phoneCodeHash: phoneCodeHash,
                phoneCode: args.code.toString(),
            }))
        } else if (args.password) {
            for (let i = 0; i < 5; i++) {
                try {
                    const pwd = await this.invoke(new requests.account.GetPassword())
                    result = await this.invoke(new requests.auth.CheckPassword({
                        password: await computeCheck(pwd, await args.password()),
                    }))
                    break
                } catch (err) {
                    console.error(`Password check attempt ${i + 1} of 5 failed. Reason: `, err)
                }
            }
        } else if (args.botToken) {
            result = await this.invoke(new requests.auth.ImportBotAuthorization(
                {
                    flags: 0,
                    botAuthToken: args.botToken,
                    apiId: this.apiId,
                    apiHash: this.apiHash,
                },
            ))
        } else {
            throw new Error('You must provide a phone and a code the first time, ' +
                'and a password only if an RPCError was raised before.')
        }
        return this._onLogin(result.user)
    }


    _parsePhoneAndHash(phone, phoneHash) {
        phone = utils.parsePhone(phone) || this._phone
        if (!phone) {
            throw new Error('Please make sure to call send_code_request first.')
        }
        phoneHash = phoneHash || this._phoneCodeHash[phone]
        if (!phoneHash) {
            throw new Error('You also need to provide a phone_code_hash.')
        }

        return [phone, phoneHash]
    }

    // endregion
    async isUserAuthorized() {
        if (this._authorized === undefined || this._authorized === null) {
            try {
                await this.invoke(new requests.updates.GetState())
                this._authorized = true
            } catch (e) {
                this._authorized = false
            }
        }
        return this._authorized
    }

    /**
     * Callback called whenever the login or sign up process completes.
     * Returns the input user parameter.
     * @param user
     * @private
     */
    _onLogin(user) {
        this._bot = Boolean(user.bot)
        this._authorized = true
        return user
    }

    async sendCodeRequest(phone, forceSMS = false) {
        let result
        phone = utils.parsePhone(phone) || this._phone
        let phoneHash = this._phoneCodeHash[phone]

        if (!phoneHash) {
            try {
                result = await this.invoke(new requests.auth.SendCode({
                    phoneNumber: phone,
                    apiId: this.apiId,
                    apiHash: this.apiHash,
                    settings: new constructors.CodeSettings(),
                }))
            } catch (e) {
                if (e.message === 'AUTH_RESTART') {
                    return this.sendCodeRequest(phone, forceSMS)
                }
                throw e
            }

            // If we already sent a SMS, do not resend the code (hash may be empty)
            if (result.type instanceof constructors.auth.SentCodeTypeSms) {
                forceSMS = false
            }
            if (result.phoneCodeHash) {
                this._phoneCodeHash[phone] = phoneHash = result.phoneCodeHash
            }
        } else {
            forceSMS = true
        }
        this._phone = phone
        if (forceSMS) {
            result = await this.invoke(new requests.auth.ResendCode({
                phone: phone,
                phoneHash: phoneHash,
            }))

            this._phoneCodeHash[phone] = result.phoneCodeHash
        }
        return result
    }


    // event region
    addEventHandler(callback, event) {
        this._eventBuilders.push([event, callback])
    }

    _handleUpdate(update) {
        this.session.processEntities(update)
        this._entityCache.add(update)

        if (update instanceof constructors.Updates || update instanceof constructors.UpdatesCombined) {
            // TODO deal with entities
            const entities = {}
            for (const x of [...update.users, ...update.chats]) {
                entities[utils.getPeerId(x)] = x
            }
            for (const u of update.updates) {
                this._processUpdate(u, update.updates, entities)
            }
        } else if (update instanceof constructors.UpdateShort) {
            this._processUpdate(update.update, null)
        } else {
            this._processUpdate(update, null)
        }
        // TODO add caching
        // this._stateCache.update(update)
    }

    _processUpdate(update, others, entities) {
        update._entities = entities || {}
        const args = {
            update: update,
            others: others,
        }
        this._dispatchUpdate(args)
    }


    // endregion

    // region private methods

    /**
     Gets a full entity from the given string, which may be a phone or
     a username, and processes all the found entities on the session.
     The string may also be a user link, or a channel/chat invite link.

     This method has the side effect of adding the found users to the
     session database, so it can be queried later without API calls,
     if this option is enabled on the session.

     Returns the found entity, or raises TypeError if not found.
     * @param string {string}
     * @returns {Promise<void>}
     * @private
     */
    async _getEntityFromString(string) {
        const phone = utils.parsePhone(string)
        if (phone) {
            try {
                for (const user of (await this.invoke(
                    new requests.contacts.GetContacts(0))).users) {
                    if (user.phone === phone) {
                        return user
                    }
                }
            } catch (e) {
                if (e.message === 'BOT_METHOD_INVALID') {
                    throw new Error('Cannot get entity by phone number as a ' +
                        'bot (try using integer IDs, not strings)')
                }
                throw e
            }
        } else if (['me', 'this'].includes(string.toLowerCase())) {
            return this.getMe()
        } else {
            const { username, isJoinChat } = utils.parseUsername(string)
            if (isJoinChat) {
                const invite = await this.invoke(new requests.messages.CheckChatInvite({
                    'hash': username,
                }))
                if (invite instanceof constructors.ChatInvite) {
                    throw new Error('Cannot get entity from a channel (or group) ' +
                        'that you are not part of. Join the group and retry',
                    )
                } else if (invite instanceof constructors.ChatInviteAlready) {
                    return invite.chat
                }
            } else if (username) {
                try {
                    const result = await this.invoke(
                        new requests.contacts.ResolveUsername(username))
                    const pid = utils.getPeerId(result.peer, false)
                    if (result.peer instanceof constructors.PeerUser) {
                        for (const x of result.users) {
                            if (x.id === pid) {
                                return x
                            }
                        }
                    } else {
                        for (const x of result.chats) {
                            if (x.id === pid) {
                                return x
                            }
                        }
                    }
                } catch (e) {
                    if (e.message === 'USERNAME_NOT_OCCUPIED') {
                        throw new Error(`No user has "${username}" as username`)
                    }
                    throw e
                }
            }
        }
        throw new Error(`Cannot find any entity corresponding to "${string}"`)
    }

    // endregion


    // users region
    /**
     Turns the given entity into its input entity version.

     Most requests use this kind of :tl:`InputPeer`, so this is the most
     suitable call to make for those cases. **Generally you should let the
     library do its job** and don't worry about getting the input entity
     first, but if you're going to use an entity often, consider making the
     call:

     Arguments
     entity (`str` | `int` | :tl:`Peer` | :tl:`InputPeer`):
     If a username or invite link is given, **the library will
     use the cache**. This means that it's possible to be using
     a username that *changed* or an old invite link (this only
     happens if an invite link for a small group chat is used
     after it was upgraded to a mega-group).

     If the username or ID from the invite link is not found in
     the cache, it will be fetched. The same rules apply to phone
     numbers (``'+34 123456789'``) from people in your contact list.

     If an exact name is given, it must be in the cache too. This
     is not reliable as different people can share the same name
     and which entity is returned is arbitrary, and should be used
     only for quick tests.

     If a positive integer ID is given, the entity will be searched
     in cached users, chats or channels, without making any call.

     If a negative integer ID is given, the entity will be searched
     exactly as either a chat (prefixed with ``-``) or as a channel
     (prefixed with ``-100``).

     If a :tl:`Peer` is given, it will be searched exactly in the
     cache as either a user, chat or channel.

     If the given object can be turned into an input entity directly,
     said operation will be done.

     Unsupported types will raise ``TypeError``.

     If the entity can't be found, ``ValueError`` will be raised.

     Returns
     :tl:`InputPeerUser`, :tl:`InputPeerChat` or :tl:`InputPeerChannel`
     or :tl:`InputPeerSelf` if the parameter is ``'me'`` or ``'self'``.

     If you need to get the ID of yourself, you should use
     `get_me` with ``input_peer=True``) instead.

     Example
     .. code-block:: python

     // If you're going to use "username" often in your code
     // (make a lot of calls), consider getting its input entity
     // once, and then using the "user" everywhere instead.
     user = await client.get_input_entity('username')

     // The same applies to IDs, chats or channels.
     chat = await client.get_input_entity(-123456789)

     * @param peer
     * @returns {Promise<>}
     */
    async getInputEntity(peer) {
        // Short-circuit if the input parameter directly maps to an InputPeer
        try {
            return utils.getInputPeer(peer)
            // eslint-disable-next-line no-empty
        } catch (e) {
        }
        // Next in priority is having a peer (or its ID) cached in-memory
        try {
            // 0x2d45687 == crc32(b'Peer')
            if (typeof peer === 'number' || peer.SUBCLASS_OF_ID === 0x2d45687) {
                if (this._entityCache.has(peer)) {
                    return this._entityCache[peer]
                }
            }
            // eslint-disable-next-line no-empty
        } catch (e) {
        }
        // Then come known strings that take precedence
        if (['me', 'this'].includes(peer)) {
            return new constructors.InputPeerSelf()
        }
        // No InputPeer, cached peer, or known string. Fetch from disk cache
        try {
            return this.session.getInputEntity(peer)
            // eslint-disable-next-line no-empty
        } catch (e) {
        }
        // Only network left to try
        if (typeof peer === 'string') {
            return utils.getInputPeer(await this._getEntityFromString(peer))
        }
        // If we're a bot and the user has messaged us privately users.getUsers
        // will work with access_hash = 0. Similar for channels.getChannels.
        // If we're not a bot but the user is in our contacts, it seems to work
        // regardless. These are the only two special-cased requests.
        peer = utils.getPeer(peer)
        if (peer instanceof constructors.PeerUser) {
            const users = await this.invoke(new requests.users.GetUsers({
                id: [new constructors.InputUser({
                    userId: peer.userId,
                    accessHash: 0,
                })],
            }))
            if (users && !(users[0] instanceof constructors.UserEmpty)) {
                // If the user passed a valid ID they expect to work for
                // channels but would be valid for users, we get UserEmpty.
                // Avoid returning the invalid empty input peer for that.
                //
                // We *could* try to guess if it's a channel first, and if
                // it's not, work as a chat and try to validate it through
                // another request, but that becomes too much work.
                return utils.getInputPeer(users[0])
            }
        } else if (peer instanceof constructors.PeerChat) {
            return new constructors.InputPeerChat({
                chatId: peer.chatId,
            })
        } else if (peer instanceof constructors.PeerChannel) {
            try {
                const channels = await this.invoke(new requests.channels.GetChannels({
                    id: [new constructors.InputChannel({
                        channelId: peer.channelId,
                        accessHash: 0,
                    })],
                }))

                return utils.getInputPeer(channels.chats[0])
                // eslint-disable-next-line no-empty
            } catch (e) {
                console.log(e)
            }
        }
        throw new Error(`Could not find the input entity for ${peer.id || peer.channelId || peer.chatId || peer.userId}.
         Please read https://` +
            'docs.telethon.dev/en/latest/concepts/entities.html to' +
            ' find out more details.',
        )
    }


    // endregion


    async _dispatchUpdate(args = {
        update: null,
        others: null,
        channelId: null,
        ptsDate: null,
    }) {
        for (const [builder, callback] of this._eventBuilders) {
            const event = builder.build(args.update)
            if (event) {
                await callback(event)
            }
        }
    }

    isConnected() {
        if (this._sender) {
            if (this._sender.isConnected()) {
                return true
            }
        }
        return false
    }

    async signUp() {

    }
}

module.exports = TelegramClient
