declare namespace MTP {
  // @ajaxy
  export type PeerType = peerUser['_'] | peerChat['_'] | peerChannel['_'];
  
  type int = number;
  type double = number;
  type bytes = string | Uint8Array;
  type long = number[] | string;
  type int128 = number;
  type int256 = number;
  
  type InvokeOptions = {
    dcID: number;
    createNetworker: boolean;
    noErrorBox: boolean;
  };
  
  export type resPQ = {
    _?: 'resPQ';
    nonce: int128;
    serverNonce: int128;
    pq: string;
    serverPublicKeyFingerprints: Vector<long>;
  };
  export type pQInnerData = {
    _?: 'pQInnerData';
    pq: string;
    p: string;
    q: string;
    nonce: int128;
    serverNonce: int128;
    newNonce: int256;
  };
  export type serverDHParamsFail = {
    _?: 'serverDHParamsFail';
    nonce: int128;
    serverNonce: int128;
    newNonceHash: int128;
  };
  export type serverDHParamsOk = {
    _?: 'serverDHParamsOk';
    nonce: int128;
    serverNonce: int128;
    encryptedAnswer: string;
  };
  export type serverDHInnerData = {
    _?: 'serverDHInnerData';
    nonce: int128;
    serverNonce: int128;
    g: int;
    dhPrime: string;
    gA: string;
    serverTime: int;
  };
  export type clientDHInnerData = {
    _?: 'clientDHInnerData';
    nonce: int128;
    serverNonce: int128;
    retryId: long;
    gB: string;
  };
  export type dhGenOk = {
    _?: 'dhGenOk';
    nonce: int128;
    serverNonce: int128;
    newNonceHash1: int128;
  };
  export type dhGenRetry = {
    _?: 'dhGenRetry';
    nonce: int128;
    serverNonce: int128;
    newNonceHash2: int128;
  };
  export type dhGenFail = {
    _?: 'dhGenFail';
    nonce: int128;
    serverNonce: int128;
    newNonceHash3: int128;
  };
  export type destroyAuthKeyOk = {
    _?: 'destroyAuthKeyOk';
    
  };
  export type destroyAuthKeyNone = {
    _?: 'destroyAuthKeyNone';
    
  };
  export type destroyAuthKeyFail = {
    _?: 'destroyAuthKeyFail';
    
  };
  export type msgsAck = {
    _?: 'msgsAck';
    msgIds: Vector<long>;
  };
  export type badMsgNotification = {
    _?: 'badMsgNotification';
    badMsgId: long;
    badMsgSeqno: int;
    errorCode: int;
  };
  export type badServerSalt = {
    _?: 'badServerSalt';
    badMsgId: long;
    badMsgSeqno: int;
    errorCode: int;
    newServerSalt: long;
  };
  export type msgsStateReq = {
    _?: 'msgsStateReq';
    msgIds: Vector<long>;
  };
  export type msgsStateInfo = {
    _?: 'msgsStateInfo';
    reqMsgId: long;
    info: string;
  };
  export type msgsAllInfo = {
    _?: 'msgsAllInfo';
    msgIds: Vector<long>;
    info: string;
  };
  export type msgDetailedInfo = {
    _?: 'msgDetailedInfo';
    msgId: long;
    answerMsgId: long;
    bytes: int;
    status: int;
  };
  export type msgNewDetailedInfo = {
    _?: 'msgNewDetailedInfo';
    answerMsgId: long;
    bytes: int;
    status: int;
  };
  export type msgResendReq = {
    _?: 'msgResendReq';
    msgIds: Vector<long>;
  };
  export type rpcError = {
    _?: 'rpcError';
    errorCode: int;
    errorMessage: string;
  };
  export type rpcAnswerUnknown = {
    _?: 'rpcAnswerUnknown';
    
  };
  export type rpcAnswerDroppedRunning = {
    _?: 'rpcAnswerDroppedRunning';
    
  };
  export type rpcAnswerDropped = {
    _?: 'rpcAnswerDropped';
    msgId: long;
    seqNo: int;
    bytes: int;
  };
  export type futureSalt = {
    _?: 'futureSalt';
    validSince: int;
    validUntil: int;
    salt: long;
  };
  export type futureSalts = {
    _?: 'futureSalts';
    reqMsgId: long;
    now: int;
    salts: vector<futureSalt>;
  };
  export type pong = {
    _?: 'pong';
    msgId: long;
    pingId: long;
  };
  export type destroySessionOk = {
    _?: 'destroySessionOk';
    sessionId: long;
  };
  export type destroySessionNone = {
    _?: 'destroySessionNone';
    sessionId: long;
  };
  export type newSessionCreated = {
    _?: 'newSessionCreated';
    firstMsgId: long;
    uniqueId: long;
    serverSalt: long;
  };
  export type httpWait = {
    _?: 'httpWait';
    maxDelay: int;
    waitAfter: int;
    maxWait: int;
  };
  export type vector<t> = Array<t>;
  export type error = {
    _?: 'error';
    code: int;
    text: string;
  };
  export type inputPeerEmpty = {
    _?: 'inputPeerEmpty';
    
  };
  export type inputPeerSelf = {
    _?: 'inputPeerSelf';
    
  };
  export type inputPeerChat = {
    _?: 'inputPeerChat';
    chatId: int;
  };
  export type inputPeerUser = {
    _?: 'inputPeerUser';
    userId: int;
    accessHash: long;
  };
  export type inputPeerChannel = {
    _?: 'inputPeerChannel';
    channelId: int;
    accessHash: long;
  };
  export type inputUserEmpty = {
    _?: 'inputUserEmpty';
    
  };
  export type inputUserSelf = {
    _?: 'inputUserSelf';
    
  };
  export type inputUser = {
    _?: 'inputUser';
    userId: int;
    accessHash: long;
  };
  export type inputPhoneContact = {
    _?: 'inputPhoneContact';
    clientId: long;
    phone: string;
    firstName: string;
    lastName: string;
  };
  export type inputFile = {
    _?: 'inputFile';
    id: long;
    parts: int;
    name: string;
    md5Checksum: string;
  };
  export type inputFileBig = {
    _?: 'inputFileBig';
    id: long;
    parts: int;
    name: string;
  };
  export type inputMediaEmpty = {
    _?: 'inputMediaEmpty';
    
  };
  export type inputMediaUploadedPhoto = {
    _?: 'inputMediaUploadedPhoto';
    flags: number;
    file: InputFile;
    caption: string;
    stickers?: Vector<InputDocument>;
  };
  export type inputMediaPhoto = {
    _?: 'inputMediaPhoto';
    id: InputPhoto;
    caption: string;
  };
  export type inputMediaGeoPoint = {
    _?: 'inputMediaGeoPoint';
    geoPoint: InputGeoPoint;
  };
  export type inputMediaContact = {
    _?: 'inputMediaContact';
    phoneNumber: string;
    firstName: string;
    lastName: string;
  };
  export type inputMediaUploadedDocument = {
    _?: 'inputMediaUploadedDocument';
    flags: number;
    file: InputFile;
    mimeType: string;
    attributes: Vector<DocumentAttribute>;
    caption: string;
    stickers?: Vector<InputDocument>;
  };
  export type inputMediaUploadedThumbDocument = {
    _?: 'inputMediaUploadedThumbDocument';
    flags: number;
    file: InputFile;
    thumb: InputFile;
    mimeType: string;
    attributes: Vector<DocumentAttribute>;
    caption: string;
    stickers?: Vector<InputDocument>;
  };
  export type inputMediaDocument = {
    _?: 'inputMediaDocument';
    id: InputDocument;
    caption: string;
  };
  export type inputMediaVenue = {
    _?: 'inputMediaVenue';
    geoPoint: InputGeoPoint;
    title: string;
    address: string;
    provider: string;
    venueId: string;
  };
  export type inputMediaGifExternal = {
    _?: 'inputMediaGifExternal';
    url: string;
    q: string;
  };
  export type inputMediaPhotoExternal = {
    _?: 'inputMediaPhotoExternal';
    url: string;
    caption: string;
  };
  export type inputMediaDocumentExternal = {
    _?: 'inputMediaDocumentExternal';
    url: string;
    caption: string;
  };
  export type inputMediaGame = {
    _?: 'inputMediaGame';
    id: InputGame;
  };
  export type inputMediaInvoice = {
    _?: 'inputMediaInvoice';
    flags: number;
    title: string;
    description: string;
    photo?: InputWebDocument;
    invoice: Invoice;
    payload: bytes;
    provider: string;
    startParam: string;
  };
  export type inputChatPhotoEmpty = {
    _?: 'inputChatPhotoEmpty';
    
  };
  export type inputChatUploadedPhoto = {
    _?: 'inputChatUploadedPhoto';
    file: InputFile;
  };
  export type inputChatPhoto = {
    _?: 'inputChatPhoto';
    id: InputPhoto;
  };
  export type inputGeoPointEmpty = {
    _?: 'inputGeoPointEmpty';
    
  };
  export type inputGeoPoint = {
    _?: 'inputGeoPoint';
    lat: double;
    long: double;
  };
  export type inputPhotoEmpty = {
    _?: 'inputPhotoEmpty';
    
  };
  export type inputPhoto = {
    _?: 'inputPhoto';
    id: long;
    accessHash: long;
  };
  export type inputFileLocation = {
    _?: 'inputFileLocation';
    volumeId: long;
    localId: int;
    secret: long;
  };
  export type inputEncryptedFileLocation = {
    _?: 'inputEncryptedFileLocation';
    id: long;
    accessHash: long;
  };
  export type inputDocumentFileLocation = {
    _?: 'inputDocumentFileLocation';
    id: long;
    accessHash: long;
    version: int;
  };
  export type inputAppEvent = {
    _?: 'inputAppEvent';
    time: double;
    type: string;
    peer: long;
    data: string;
  };
  export type peerUser = {
    _?: 'peerUser';
    userId: int;
  };
  export type peerChat = {
    _?: 'peerChat';
    chatId: int;
  };
  export type peerChannel = {
    _?: 'peerChannel';
    channelId: int;
  };
  export type storage$fileUnknown = {
    _?: 'storage.fileUnknown';
    
  };
  export type storage$filePartial = {
    _?: 'storage.filePartial';
    
  };
  export type storage$fileJpeg = {
    _?: 'storage.fileJpeg';
    
  };
  export type storage$fileGif = {
    _?: 'storage.fileGif';
    
  };
  export type storage$filePng = {
    _?: 'storage.filePng';
    
  };
  export type storage$filePdf = {
    _?: 'storage.filePdf';
    
  };
  export type storage$fileMp3 = {
    _?: 'storage.fileMp3';
    
  };
  export type storage$fileMov = {
    _?: 'storage.fileMov';
    
  };
  export type storage$fileMp4 = {
    _?: 'storage.fileMp4';
    
  };
  export type storage$fileWebp = {
    _?: 'storage.fileWebp';
    
  };
  export type fileLocationUnavailable = {
    _?: 'fileLocationUnavailable';
    volumeId: long;
    localId: int;
    secret: long;
  };
  export type fileLocation = {
    _?: 'fileLocation';
    dcId: int;
    volumeId: long;
    localId: int;
    secret: long;
  };
  export type userEmpty = {
    _?: 'userEmpty';
    id: int;
  };
  export type user = {
    _?: 'user';
    flags: number;
    self?: true;
    contact?: true;
    mutualContact?: true;
    deleted?: true;
    bot?: true;
    botChatHistory?: true;
    botNochats?: true;
    verified?: true;
    restricted?: true;
    min?: true;
    botInlineGeo?: true;
    id: int;
    accessHash?: long;
    firstName?: string;
    lastName?: string;
    username?: string;
    phone?: string;
    photo?: UserProfilePhoto;
    status?: UserStatus;
    botInfoVersion?: int;
    restrictionReason?: string;
    botInlinePlaceholder?: string;
    langCode?: string;
  };
  export type userProfilePhotoEmpty = {
    _?: 'userProfilePhotoEmpty';
    
  };
  export type userProfilePhoto = {
    _?: 'userProfilePhoto';
    photoId: long;
    photoSmall: FileLocation;
    photoBig: FileLocation;
  };
  export type userStatusEmpty = {
    _?: 'userStatusEmpty';
    
  };
  export type userStatusOnline = {
    _?: 'userStatusOnline';
    expires: int;
  };
  export type userStatusOffline = {
    _?: 'userStatusOffline';
    wasOnline: int;
  };
  export type userStatusRecently = {
    _?: 'userStatusRecently';
    
  };
  export type userStatusLastWeek = {
    _?: 'userStatusLastWeek';
    
  };
  export type userStatusLastMonth = {
    _?: 'userStatusLastMonth';
    
  };
  export type chatEmpty = {
    _?: 'chatEmpty';
    id: int;
  };
  export type chat = {
    _?: 'chat';
    flags: number;
    creator?: true;
    kicked?: true;
    left?: true;
    adminsEnabled?: true;
    admin?: true;
    deactivated?: true;
    id: int;
    title: string;
    photo: ChatPhoto;
    participantsCount: int;
    date: int;
    version: int;
    migratedTo?: InputChannel;
  };
  export type chatForbidden = {
    _?: 'chatForbidden';
    id: int;
    title: string;
  };
  export type channel = {
    _?: 'channel';
    flags: number;
    creator?: true;
    kicked?: true;
    left?: true;
    editor?: true;
    moderator?: true;
    broadcast?: true;
    verified?: true;
    megagroup?: true;
    restricted?: true;
    democracy?: true;
    signatures?: true;
    min?: true;
    id: int;
    accessHash?: long;
    title: string;
    username?: string;
    photo: ChatPhoto;
    date: int;
    version: int;
    restrictionReason?: string;
  };
  export type channelForbidden = {
    _?: 'channelForbidden';
    flags: number;
    broadcast?: true;
    megagroup?: true;
    id: int;
    accessHash: long;
    title: string;
  };
  export type chatFull = {
    _?: 'chatFull';
    id: int;
    participants: ChatParticipants;
    chatPhoto: Photo;
    notifySettings: PeerNotifySettings;
    exportedInvite: ExportedChatInvite;
    botInfo: Vector<BotInfo>;
  };
  export type channelFull = {
    _?: 'channelFull';
    flags: number;
    canViewParticipants?: true;
    canSetUsername?: true;
    id: int;
    about: string;
    participantsCount?: int;
    adminsCount?: int;
    kickedCount?: int;
    readInboxMaxId: int;
    readOutboxMaxId: int;
    unreadCount: int;
    chatPhoto: Photo;
    notifySettings: PeerNotifySettings;
    exportedInvite: ExportedChatInvite;
    botInfo: Vector<BotInfo>;
    migratedFromChatId?: int;
    migratedFromMaxId?: int;
    pinnedMsgId?: int;
  };
  export type chatParticipant = {
    _?: 'chatParticipant';
    userId: int;
    inviterId: int;
    date: int;
  };
  export type chatParticipantCreator = {
    _?: 'chatParticipantCreator';
    userId: int;
  };
  export type chatParticipantAdmin = {
    _?: 'chatParticipantAdmin';
    userId: int;
    inviterId: int;
    date: int;
  };
  export type chatParticipantsForbidden = {
    _?: 'chatParticipantsForbidden';
    flags: number;
    chatId: int;
    selfParticipant?: ChatParticipant;
  };
  export type chatParticipants = {
    _?: 'chatParticipants';
    chatId: int;
    participants: Vector<ChatParticipant>;
    version: int;
  };
  export type chatPhotoEmpty = {
    _?: 'chatPhotoEmpty';
    
  };
  export type chatPhoto = {
    _?: 'chatPhoto';
    photoSmall: FileLocation;
    photoBig: FileLocation;
  };
  export type messageEmpty = {
    _?: 'messageEmpty';
    id: int;
  };
  export type message = {
    _?: 'message';
    flags: number;
    out?: true;
    mentioned?: true;
    mediaUnread?: true;
    silent?: true;
    post?: true;
    id: int;
    fromId?: int;
    toId: Peer;
    fwdFrom?: MessageFwdHeader;
    viaBotId?: int;
    replyToMsgId?: int;
    date: int;
    message: string;
    media?: MessageMedia;
    replyMarkup?: ReplyMarkup;
    entities?: Vector<MessageEntity>;
    views?: int;
    editDate?: int;
  };
  export type messageService = {
    _?: 'messageService';
    flags: number;
    out?: true;
    mentioned?: true;
    mediaUnread?: true;
    silent?: true;
    post?: true;
    id: int;
    fromId?: int;
    toId: Peer;
    replyToMsgId?: int;
    date: int;
    action: MessageAction;
  };
  export type messageMediaEmpty = {
    _?: 'messageMediaEmpty';
    
  };
  export type messageMediaPhoto = {
    _?: 'messageMediaPhoto';
    photo: Photo;
    caption: string;
  };
  export type messageMediaGeo = {
    _?: 'messageMediaGeo';
    geo: GeoPoint;
  };
  export type messageMediaContact = {
    _?: 'messageMediaContact';
    phoneNumber: string;
    firstName: string;
    lastName: string;
    userId: int;
  };
  export type messageMediaUnsupported = {
    _?: 'messageMediaUnsupported';
    
  };
  export type messageMediaDocument = {
    _?: 'messageMediaDocument';
    document: Document;
    caption: string;
  };
  export type messageMediaWebPage = {
    _?: 'messageMediaWebPage';
    webpage: WebPage;
  };
  export type messageMediaVenue = {
    _?: 'messageMediaVenue';
    geo: GeoPoint;
    title: string;
    address: string;
    provider: string;
    venueId: string;
  };
  export type messageMediaGame = {
    _?: 'messageMediaGame';
    game: Game;
  };
  export type messageMediaInvoice = {
    _?: 'messageMediaInvoice';
    flags: number;
    shippingAddressRequested?: true;
    test?: true;
    title: string;
    description: string;
    photo?: WebDocument;
    receiptMsgId?: int;
    currency: string;
    totalAmount: long;
    startParam: string;
  };
  export type messageActionEmpty = {
    _?: 'messageActionEmpty';
    
  };
  export type messageActionChatCreate = {
    _?: 'messageActionChatCreate';
    title: string;
    users: Vector<int>;
  };
  export type messageActionChatEditTitle = {
    _?: 'messageActionChatEditTitle';
    title: string;
  };
  export type messageActionChatEditPhoto = {
    _?: 'messageActionChatEditPhoto';
    photo: Photo;
  };
  export type messageActionChatDeletePhoto = {
    _?: 'messageActionChatDeletePhoto';
    
  };
  export type messageActionChatAddUser = {
    _?: 'messageActionChatAddUser';
    users: Vector<int>;
  };
  export type messageActionChatDeleteUser = {
    _?: 'messageActionChatDeleteUser';
    userId: int;
  };
  export type messageActionChatJoinedByLink = {
    _?: 'messageActionChatJoinedByLink';
    inviterId: int;
  };
  export type messageActionChannelCreate = {
    _?: 'messageActionChannelCreate';
    title: string;
  };
  export type messageActionChatMigrateTo = {
    _?: 'messageActionChatMigrateTo';
    channelId: int;
  };
  export type messageActionChannelMigrateFrom = {
    _?: 'messageActionChannelMigrateFrom';
    title: string;
    chatId: int;
  };
  export type messageActionPinMessage = {
    _?: 'messageActionPinMessage';
    
  };
  export type messageActionHistoryClear = {
    _?: 'messageActionHistoryClear';
    
  };
  export type messageActionGameScore = {
    _?: 'messageActionGameScore';
    gameId: long;
    score: int;
  };
  export type messageActionPaymentSentMe = {
    _?: 'messageActionPaymentSentMe';
    flags: number;
    currency: string;
    totalAmount: long;
    payload: bytes;
    info?: PaymentRequestedInfo;
    shippingOptionId?: string;
    charge: PaymentCharge;
  };
  export type messageActionPaymentSent = {
    _?: 'messageActionPaymentSent';
    currency: string;
    totalAmount: long;
  };
  export type messageActionPhoneCall = {
    _?: 'messageActionPhoneCall';
    flags: number;
    callId: long;
    reason?: PhoneCallDiscardReason;
    duration?: int;
  };
  export type dialog = {
    _?: 'dialog';
    flags: number;
    pinned?: true;
    peer: Peer;
    topMessage: int;
    readInboxMaxId: int;
    readOutboxMaxId: int;
    unreadCount: int;
    notifySettings: PeerNotifySettings;
    pts?: int;
    draft?: DraftMessage;
  };
  export type photoEmpty = {
    _?: 'photoEmpty';
    id: long;
  };
  export type photo = {
    _?: 'photo';
    flags: number;
    hasStickers?: true;
    id: long;
    accessHash: long;
    date: int;
    sizes: Vector<PhotoSize>;
  };
  export type photoSizeEmpty = {
    _?: 'photoSizeEmpty';
    type: string;
  };
  export type photoSize = {
    _?: 'photoSize';
    type: string;
    location: FileLocation;
    w: int;
    h: int;
    size: int;
  };
  export type photoCachedSize = {
    _?: 'photoCachedSize';
    type: string;
    location: FileLocation;
    w: int;
    h: int;
    bytes: bytes;
  };
  export type geoPointEmpty = {
    _?: 'geoPointEmpty';
    
  };
  export type geoPoint = {
    _?: 'geoPoint';
    long: double;
    lat: double;
  };
  export type auth$checkedPhone = {
    _?: 'auth.checkedPhone';
    phoneRegistered: boolean;
  };
  export type auth$sentCode = {
    _?: 'auth.sentCode';
    flags: number;
    phoneRegistered?: true;
    type: auth$SentCodeType;
    phoneCodeHash: string;
    nextType?: auth$CodeType;
    timeout?: int;
  };
  export type auth$authorization = {
    _?: 'auth.authorization';
    flags: number;
    tmpSessions?: int;
    user: User;
  };
  export type auth$exportedAuthorization = {
    _?: 'auth.exportedAuthorization';
    id: int;
    bytes: bytes;
  };
  export type inputNotifyPeer = {
    _?: 'inputNotifyPeer';
    peer: InputPeer;
  };
  export type inputNotifyUsers = {
    _?: 'inputNotifyUsers';
    
  };
  export type inputNotifyChats = {
    _?: 'inputNotifyChats';
    
  };
  export type inputNotifyAll = {
    _?: 'inputNotifyAll';
    
  };
  export type inputPeerNotifyEventsEmpty = {
    _?: 'inputPeerNotifyEventsEmpty';
    
  };
  export type inputPeerNotifyEventsAll = {
    _?: 'inputPeerNotifyEventsAll';
    
  };
  export type inputPeerNotifySettings = {
    _?: 'inputPeerNotifySettings';
    flags: number;
    showPreviews?: true;
    silent?: true;
    muteUntil: int;
    sound: string;
  };
  export type peerNotifyEventsEmpty = {
    _?: 'peerNotifyEventsEmpty';
    
  };
  export type peerNotifyEventsAll = {
    _?: 'peerNotifyEventsAll';
    
  };
  export type peerNotifySettingsEmpty = {
    _?: 'peerNotifySettingsEmpty';
    
  };
  export type peerNotifySettings = {
    _?: 'peerNotifySettings';
    flags: number;
    showPreviews?: true;
    silent?: true;
    muteUntil: int;
    sound: string;
  };
  export type peerSettings = {
    _?: 'peerSettings';
    flags: number;
    reportSpam?: true;
  };
  export type wallPaper = {
    _?: 'wallPaper';
    id: int;
    title: string;
    sizes: Vector<PhotoSize>;
    color: int;
  };
  export type wallPaperSolid = {
    _?: 'wallPaperSolid';
    id: int;
    title: string;
    bgColor: int;
    color: int;
  };
  export type inputReportReasonSpam = {
    _?: 'inputReportReasonSpam';
    
  };
  export type inputReportReasonViolence = {
    _?: 'inputReportReasonViolence';
    
  };
  export type inputReportReasonPornography = {
    _?: 'inputReportReasonPornography';
    
  };
  export type inputReportReasonOther = {
    _?: 'inputReportReasonOther';
    text: string;
  };
  export type userFull = {
    _?: 'userFull';
    flags: number;
    blocked?: true;
    phoneCallsAvailable?: true;
    phoneCallsPrivate?: true;
    user: User;
    about?: string;
    link: contacts$Link;
    profilePhoto?: Photo;
    notifySettings: PeerNotifySettings;
    botInfo?: BotInfo;
    commonChatsCount: int;
  };
  export type contact = {
    _?: 'contact';
    userId: int;
    mutual: boolean;
  };
  export type importedContact = {
    _?: 'importedContact';
    userId: int;
    clientId: long;
  };
  export type contactBlocked = {
    _?: 'contactBlocked';
    userId: int;
    date: int;
  };
  export type contactStatus = {
    _?: 'contactStatus';
    userId: int;
    status: UserStatus;
  };
  export type contacts$link = {
    _?: 'contacts.link';
    myLink: ContactLink;
    foreignLink: ContactLink;
    user: User;
  };
  export type contacts$contactsNotModified = {
    _?: 'contacts.contactsNotModified';
    
  };
  export type contacts$contacts = {
    _?: 'contacts.contacts';
    contacts: Vector<Contact>;
    users: Vector<User>;
  };
  export type contacts$importedContacts = {
    _?: 'contacts.importedContacts';
    imported: Vector<ImportedContact>;
    retryContacts: Vector<long>;
    users: Vector<User>;
  };
  export type contacts$blocked = {
    _?: 'contacts.blocked';
    blocked: Vector<ContactBlocked>;
    users: Vector<User>;
  };
  export type contacts$blockedSlice = {
    _?: 'contacts.blockedSlice';
    count: int;
    blocked: Vector<ContactBlocked>;
    users: Vector<User>;
  };
  export type messages$dialogs = {
    _?: 'messages.dialogs';
    dialogs: Vector<Dialog>;
    messages: Vector<Message>;
    chats: Vector<Chat>;
    users: Vector<User>;
  };
  export type messages$dialogsSlice = {
    _?: 'messages.dialogsSlice';
    count: int;
    dialogs: Vector<Dialog>;
    messages: Vector<Message>;
    chats: Vector<Chat>;
    users: Vector<User>;
  };
  export type messages$messages = {
    _?: 'messages.messages';
    messages: Vector<Message>;
    chats: Vector<Chat>;
    users: Vector<User>;
  };
  export type messages$messagesSlice = {
    _?: 'messages.messagesSlice';
    count: int;
    messages: Vector<Message>;
    chats: Vector<Chat>;
    users: Vector<User>;
  };
  export type messages$channelMessages = {
    _?: 'messages.channelMessages';
    flags: number;
    pts: int;
    count: int;
    messages: Vector<Message>;
    chats: Vector<Chat>;
    users: Vector<User>;
  };
  export type messages$chats = {
    _?: 'messages.chats';
    chats: Vector<Chat>;
  };
  export type messages$chatsSlice = {
    _?: 'messages.chatsSlice';
    count: int;
    chats: Vector<Chat>;
  };
  export type messages$chatFull = {
    _?: 'messages.chatFull';
    fullChat: ChatFull;
    chats: Vector<Chat>;
    users: Vector<User>;
  };
  export type messages$affectedHistory = {
    _?: 'messages.affectedHistory';
    pts: int;
    ptsCount: int;
    offset: int;
  };
  export type inputMessagesFilterEmpty = {
    _?: 'inputMessagesFilterEmpty';
    
  };
  export type inputMessagesFilterPhotos = {
    _?: 'inputMessagesFilterPhotos';
    
  };
  export type inputMessagesFilterVideo = {
    _?: 'inputMessagesFilterVideo';
    
  };
  export type inputMessagesFilterPhotoVideo = {
    _?: 'inputMessagesFilterPhotoVideo';
    
  };
  export type inputMessagesFilterPhotoVideoDocuments = {
    _?: 'inputMessagesFilterPhotoVideoDocuments';
    
  };
  export type inputMessagesFilterDocument = {
    _?: 'inputMessagesFilterDocument';
    
  };
  export type inputMessagesFilterUrl = {
    _?: 'inputMessagesFilterUrl';
    
  };
  export type inputMessagesFilterGif = {
    _?: 'inputMessagesFilterGif';
    
  };
  export type inputMessagesFilterVoice = {
    _?: 'inputMessagesFilterVoice';
    
  };
  export type inputMessagesFilterMusic = {
    _?: 'inputMessagesFilterMusic';
    
  };
  export type inputMessagesFilterChatPhotos = {
    _?: 'inputMessagesFilterChatPhotos';
    
  };
  export type inputMessagesFilterPhoneCalls = {
    _?: 'inputMessagesFilterPhoneCalls';
    flags: number;
    missed?: true;
  };
  export type inputMessagesFilterRoundVoice = {
    _?: 'inputMessagesFilterRoundVoice';
    
  };
  export type inputMessagesFilterRoundVideo = {
    _?: 'inputMessagesFilterRoundVideo';
    
  };
  export type updateNewMessage = {
    _?: 'updateNewMessage';
    message: Message;
    pts: int;
    ptsCount: int;
  };
  export type updateMessageID = {
    _?: 'updateMessageID';
    id: int;
    randomId: long;
  };
  export type updateDeleteMessages = {
    _?: 'updateDeleteMessages';
    messages: Vector<int>;
    pts: int;
    ptsCount: int;
  };
  export type updateUserTyping = {
    _?: 'updateUserTyping';
    userId: int;
    action: SendMessageAction;
  };
  export type updateChatUserTyping = {
    _?: 'updateChatUserTyping';
    chatId: int;
    userId: int;
    action: SendMessageAction;
  };
  export type updateChatParticipants = {
    _?: 'updateChatParticipants';
    participants: ChatParticipants;
  };
  export type updateUserStatus = {
    _?: 'updateUserStatus';
    userId: int;
    status: UserStatus;
  };
  export type updateUserName = {
    _?: 'updateUserName';
    userId: int;
    firstName: string;
    lastName: string;
    username: string;
  };
  export type updateUserPhoto = {
    _?: 'updateUserPhoto';
    userId: int;
    date: int;
    photo: UserProfilePhoto;
    previous: boolean;
  };
  export type updateContactRegistered = {
    _?: 'updateContactRegistered';
    userId: int;
    date: int;
  };
  export type updateContactLink = {
    _?: 'updateContactLink';
    userId: int;
    myLink: ContactLink;
    foreignLink: ContactLink;
  };
  export type updateNewEncryptedMessage = {
    _?: 'updateNewEncryptedMessage';
    message: EncryptedMessage;
    qts: int;
  };
  export type updateEncryptedChatTyping = {
    _?: 'updateEncryptedChatTyping';
    chatId: int;
  };
  export type updateEncryption = {
    _?: 'updateEncryption';
    chat: EncryptedChat;
    date: int;
  };
  export type updateEncryptedMessagesRead = {
    _?: 'updateEncryptedMessagesRead';
    chatId: int;
    maxDate: int;
    date: int;
  };
  export type updateChatParticipantAdd = {
    _?: 'updateChatParticipantAdd';
    chatId: int;
    userId: int;
    inviterId: int;
    date: int;
    version: int;
  };
  export type updateChatParticipantDelete = {
    _?: 'updateChatParticipantDelete';
    chatId: int;
    userId: int;
    version: int;
  };
  export type updateDcOptions = {
    _?: 'updateDcOptions';
    dcOptions: Vector<DcOption>;
  };
  export type updateUserBlocked = {
    _?: 'updateUserBlocked';
    userId: int;
    blocked: boolean;
  };
  export type updateNotifySettings = {
    _?: 'updateNotifySettings';
    peer: NotifyPeer;
    notifySettings: PeerNotifySettings;
  };
  export type updateServiceNotification = {
    _?: 'updateServiceNotification';
    flags: number;
    popup?: true;
    inboxDate?: int;
    type: string;
    message: string;
    media: MessageMedia;
    entities: Vector<MessageEntity>;
  };
  export type updatePrivacy = {
    _?: 'updatePrivacy';
    key: PrivacyKey;
    rules: Vector<PrivacyRule>;
  };
  export type updateUserPhone = {
    _?: 'updateUserPhone';
    userId: int;
    phone: string;
  };
  export type updateReadHistoryInbox = {
    _?: 'updateReadHistoryInbox';
    peer: Peer;
    maxId: int;
    pts: int;
    ptsCount: int;
  };
  export type updateReadHistoryOutbox = {
    _?: 'updateReadHistoryOutbox';
    peer: Peer;
    maxId: int;
    pts: int;
    ptsCount: int;
  };
  export type updateWebPage = {
    _?: 'updateWebPage';
    webpage: WebPage;
    pts: int;
    ptsCount: int;
  };
  export type updateReadMessagesContents = {
    _?: 'updateReadMessagesContents';
    messages: Vector<int>;
    pts: int;
    ptsCount: int;
  };
  export type updateChannelTooLong = {
    _?: 'updateChannelTooLong';
    flags: number;
    channelId: int;
    pts?: int;
  };
  export type updateChannel = {
    _?: 'updateChannel';
    channelId: int;
  };
  export type updateNewChannelMessage = {
    _?: 'updateNewChannelMessage';
    message: Message;
    pts: int;
    ptsCount: int;
  };
  export type updateReadChannelInbox = {
    _?: 'updateReadChannelInbox';
    channelId: int;
    maxId: int;
  };
  export type updateDeleteChannelMessages = {
    _?: 'updateDeleteChannelMessages';
    channelId: int;
    messages: Vector<int>;
    pts: int;
    ptsCount: int;
  };
  export type updateChannelMessageViews = {
    _?: 'updateChannelMessageViews';
    channelId: int;
    id: int;
    views: int;
  };
  export type updateChatAdmins = {
    _?: 'updateChatAdmins';
    chatId: int;
    enabled: boolean;
    version: int;
  };
  export type updateChatParticipantAdmin = {
    _?: 'updateChatParticipantAdmin';
    chatId: int;
    userId: int;
    isAdmin: boolean;
    version: int;
  };
  export type updateNewStickerSet = {
    _?: 'updateNewStickerSet';
    stickerset: messages$StickerSet;
  };
  export type updateStickerSetsOrder = {
    _?: 'updateStickerSetsOrder';
    flags: number;
    masks?: true;
    order: Vector<long>;
  };
  export type updateStickerSets = {
    _?: 'updateStickerSets';
    
  };
  export type updateSavedGifs = {
    _?: 'updateSavedGifs';
    
  };
  export type updateBotInlineQuery = {
    _?: 'updateBotInlineQuery';
    flags: number;
    queryId: long;
    userId: int;
    query: string;
    geo?: GeoPoint;
    offset: string;
  };
  export type updateBotInlineSend = {
    _?: 'updateBotInlineSend';
    flags: number;
    userId: int;
    query: string;
    geo?: GeoPoint;
    id: string;
    msgId?: InputBotInlineMessageID;
  };
  export type updateEditChannelMessage = {
    _?: 'updateEditChannelMessage';
    message: Message;
    pts: int;
    ptsCount: int;
  };
  export type updateChannelPinnedMessage = {
    _?: 'updateChannelPinnedMessage';
    channelId: int;
    id: int;
  };
  export type updateBotCallbackQuery = {
    _?: 'updateBotCallbackQuery';
    flags: number;
    queryId: long;
    userId: int;
    peer: Peer;
    msgId: int;
    chatInstance: long;
    data?: bytes;
    gameShortName?: string;
  };
  export type updateEditMessage = {
    _?: 'updateEditMessage';
    message: Message;
    pts: int;
    ptsCount: int;
  };
  export type updateInlineBotCallbackQuery = {
    _?: 'updateInlineBotCallbackQuery';
    flags: number;
    queryId: long;
    userId: int;
    msgId: InputBotInlineMessageID;
    chatInstance: long;
    data?: bytes;
    gameShortName?: string;
  };
  export type updateReadChannelOutbox = {
    _?: 'updateReadChannelOutbox';
    channelId: int;
    maxId: int;
  };
  export type updateDraftMessage = {
    _?: 'updateDraftMessage';
    peer: Peer;
    draft: DraftMessage;
  };
  export type updateReadFeaturedStickers = {
    _?: 'updateReadFeaturedStickers';
    
  };
  export type updateRecentStickers = {
    _?: 'updateRecentStickers';
    
  };
  export type updateConfig = {
    _?: 'updateConfig';
    
  };
  export type updatePtsChanged = {
    _?: 'updatePtsChanged';
    
  };
  export type updateChannelWebPage = {
    _?: 'updateChannelWebPage';
    channelId: int;
    webpage: WebPage;
    pts: int;
    ptsCount: int;
  };
  export type updateDialogPinned = {
    _?: 'updateDialogPinned';
    flags: number;
    pinned?: true;
    peer: Peer;
  };
  export type updatePinnedDialogs = {
    _?: 'updatePinnedDialogs';
    flags: number;
    order?: Vector<Peer>;
  };
  export type updateBotWebhookJSON = {
    _?: 'updateBotWebhookJSON';
    data: DataJSON;
  };
  export type updateBotWebhookJSONQuery = {
    _?: 'updateBotWebhookJSONQuery';
    queryId: long;
    data: DataJSON;
    timeout: int;
  };
  export type updateBotShippingQuery = {
    _?: 'updateBotShippingQuery';
    queryId: long;
    userId: int;
    payload: bytes;
    shippingAddress: PostAddress;
  };
  export type updateBotPrecheckoutQuery = {
    _?: 'updateBotPrecheckoutQuery';
    flags: number;
    queryId: long;
    userId: int;
    payload: bytes;
    info?: PaymentRequestedInfo;
    shippingOptionId?: string;
    currency: string;
    totalAmount: long;
  };
  export type updatePhoneCall = {
    _?: 'updatePhoneCall';
    phoneCall: PhoneCall;
  };
  export type updateLangPackTooLong = {
    _?: 'updateLangPackTooLong';
    
  };
  export type updateLangPack = {
    _?: 'updateLangPack';
    difference: LangPackDifference;
  };
  export type updates$state = {
    _?: 'updates.state';
    pts: int;
    qts: int;
    date: int;
    seq: int;
    unreadCount: int;
  };
  export type updates$differenceEmpty = {
    _?: 'updates.differenceEmpty';
    date: int;
    seq: int;
  };
  export type updates$difference = {
    _?: 'updates.difference';
    newMessages: Vector<Message>;
    newEncryptedMessages: Vector<EncryptedMessage>;
    otherUpdates: Vector<Update>;
    chats: Vector<Chat>;
    users: Vector<User>;
    state: updates$State;
  };
  export type updates$differenceSlice = {
    _?: 'updates.differenceSlice';
    newMessages: Vector<Message>;
    newEncryptedMessages: Vector<EncryptedMessage>;
    otherUpdates: Vector<Update>;
    chats: Vector<Chat>;
    users: Vector<User>;
    intermediateState: updates$State;
  };
  export type updates$differenceTooLong = {
    _?: 'updates.differenceTooLong';
    pts: int;
  };
  export type updatesTooLong = {
    _?: 'updatesTooLong';
    
  };
  export type updateShortMessage = {
    _?: 'updateShortMessage';
    flags: number;
    out?: true;
    mentioned?: true;
    mediaUnread?: true;
    silent?: true;
    id: int;
    userId: int;
    message: string;
    pts: int;
    ptsCount: int;
    date: int;
    fwdFrom?: MessageFwdHeader;
    viaBotId?: int;
    replyToMsgId?: int;
    entities?: Vector<MessageEntity>;
  };
  export type updateShortChatMessage = {
    _?: 'updateShortChatMessage';
    flags: number;
    out?: true;
    mentioned?: true;
    mediaUnread?: true;
    silent?: true;
    id: int;
    fromId: int;
    chatId: int;
    message: string;
    pts: int;
    ptsCount: int;
    date: int;
    fwdFrom?: MessageFwdHeader;
    viaBotId?: int;
    replyToMsgId?: int;
    entities?: Vector<MessageEntity>;
  };
  export type updateShort = {
    _?: 'updateShort';
    update: Update;
    date: int;
  };
  export type updatesCombined = {
    _?: 'updatesCombined';
    updates: Vector<Update>;
    users: Vector<User>;
    chats: Vector<Chat>;
    date: int;
    seqStart: int;
    seq: int;
  };
  export type updates = {
    _?: 'updates';
    updates: Vector<Update>;
    users: Vector<User>;
    chats: Vector<Chat>;
    date: int;
    seq: int;
  };
  export type updateShortSentMessage = {
    _?: 'updateShortSentMessage';
    flags: number;
    out?: true;
    id: int;
    pts: int;
    ptsCount: int;
    date: int;
    media?: MessageMedia;
    entities?: Vector<MessageEntity>;
  };
  export type photos$photos = {
    _?: 'photos.photos';
    photos: Vector<Photo>;
    users: Vector<User>;
  };
  export type photos$photosSlice = {
    _?: 'photos.photosSlice';
    count: int;
    photos: Vector<Photo>;
    users: Vector<User>;
  };
  export type photos$photo = {
    _?: 'photos.photo';
    photo: Photo;
    users: Vector<User>;
  };
  export type upload$file = {
    _?: 'upload.file';
    type: storage$FileType;
    mtime: int;
    bytes: bytes;
  };
  export type upload$fileCdnRedirect = {
    _?: 'upload.fileCdnRedirect';
    dcId: int;
    fileToken: bytes;
    encryptionKey: bytes;
    encryptionIv: bytes;
  };
  export type dcOption = {
    _?: 'dcOption';
    flags: number;
    ipv6?: true;
    mediaOnly?: true;
    tcpoOnly?: true;
    cdn?: true;
    id: int;
    ipAddress: string;
    port: int;
  };
  export type config = {
    _?: 'config';
    flags: number;
    phonecallsEnabled?: true;
    date: int;
    expires: int;
    testMode: boolean;
    thisDc: int;
    dcOptions: Vector<DcOption>;
    chatSizeMax: int;
    megagroupSizeMax: int;
    forwardedCountMax: int;
    onlineUpdatePeriodMs: int;
    offlineBlurTimeoutMs: int;
    offlineIdleTimeoutMs: int;
    onlineCloudTimeoutMs: int;
    notifyCloudDelayMs: int;
    notifyDefaultDelayMs: int;
    chatBigSize: int;
    pushChatPeriodMs: int;
    pushChatLimit: int;
    savedGifsLimit: int;
    editTimeLimit: int;
    ratingEDecay: int;
    stickersRecentLimit: int;
    tmpSessions?: int;
    pinnedDialogsCountMax: int;
    callReceiveTimeoutMs: int;
    callRingTimeoutMs: int;
    callConnectTimeoutMs: int;
    callPacketTimeoutMs: int;
    meUrlPrefix: string;
    suggestedLangCode?: string;
    langPackVersion?: int;
    disabledFeatures: Vector<DisabledFeature>;
  };
  export type nearestDc = {
    _?: 'nearestDc';
    country: string;
    thisDc: int;
    nearestDc: int;
  };
  export type help$appUpdate = {
    _?: 'help.appUpdate';
    id: int;
    critical: boolean;
    url: string;
    text: string;
  };
  export type help$noAppUpdate = {
    _?: 'help.noAppUpdate';
    
  };
  export type help$inviteText = {
    _?: 'help.inviteText';
    message: string;
  };
  export type encryptedChatEmpty = {
    _?: 'encryptedChatEmpty';
    id: int;
  };
  export type encryptedChatWaiting = {
    _?: 'encryptedChatWaiting';
    id: int;
    accessHash: long;
    date: int;
    adminId: int;
    participantId: int;
  };
  export type encryptedChatRequested = {
    _?: 'encryptedChatRequested';
    id: int;
    accessHash: long;
    date: int;
    adminId: int;
    participantId: int;
    gA: bytes;
  };
  export type encryptedChat = {
    _?: 'encryptedChat';
    id: int;
    accessHash: long;
    date: int;
    adminId: int;
    participantId: int;
    gAOrB: bytes;
    keyFingerprint: long;
  };
  export type encryptedChatDiscarded = {
    _?: 'encryptedChatDiscarded';
    id: int;
  };
  export type inputEncryptedChat = {
    _?: 'inputEncryptedChat';
    chatId: int;
    accessHash: long;
  };
  export type encryptedFileEmpty = {
    _?: 'encryptedFileEmpty';
    
  };
  export type encryptedFile = {
    _?: 'encryptedFile';
    id: long;
    accessHash: long;
    size: int;
    dcId: int;
    keyFingerprint: int;
  };
  export type inputEncryptedFileEmpty = {
    _?: 'inputEncryptedFileEmpty';
    
  };
  export type inputEncryptedFileUploaded = {
    _?: 'inputEncryptedFileUploaded';
    id: long;
    parts: int;
    md5Checksum: string;
    keyFingerprint: int;
  };
  export type inputEncryptedFile = {
    _?: 'inputEncryptedFile';
    id: long;
    accessHash: long;
  };
  export type inputEncryptedFileBigUploaded = {
    _?: 'inputEncryptedFileBigUploaded';
    id: long;
    parts: int;
    keyFingerprint: int;
  };
  export type encryptedMessage = {
    _?: 'encryptedMessage';
    randomId: long;
    chatId: int;
    date: int;
    bytes: bytes;
    file: EncryptedFile;
  };
  export type encryptedMessageService = {
    _?: 'encryptedMessageService';
    randomId: long;
    chatId: int;
    date: int;
    bytes: bytes;
  };
  export type messages$dhConfigNotModified = {
    _?: 'messages.dhConfigNotModified';
    random: bytes;
  };
  export type messages$dhConfig = {
    _?: 'messages.dhConfig';
    g: int;
    p: bytes;
    version: int;
    random: bytes;
  };
  export type messages$sentEncryptedMessage = {
    _?: 'messages.sentEncryptedMessage';
    date: int;
  };
  export type messages$sentEncryptedFile = {
    _?: 'messages.sentEncryptedFile';
    date: int;
    file: EncryptedFile;
  };
  export type inputDocumentEmpty = {
    _?: 'inputDocumentEmpty';
    
  };
  export type inputDocument = {
    _?: 'inputDocument';
    id: long;
    accessHash: long;
  };
  export type documentEmpty = {
    _?: 'documentEmpty';
    id: long;
  };
  export type document = {
    _?: 'document';
    id: long;
    accessHash: long;
    date: int;
    mimeType: string;
    size: int;
    thumb: PhotoSize;
    dcId: int;
    version: int;
    attributes: Vector<DocumentAttribute>;
  };
  export type help$support = {
    _?: 'help.support';
    phoneNumber: string;
    user: User;
  };
  export type notifyPeer = {
    _?: 'notifyPeer';
    peer: Peer;
  };
  export type notifyUsers = {
    _?: 'notifyUsers';
    
  };
  export type notifyChats = {
    _?: 'notifyChats';
    
  };
  export type notifyAll = {
    _?: 'notifyAll';
    
  };
  export type sendMessageTypingAction = {
    _?: 'sendMessageTypingAction';
    
  };
  export type sendMessageCancelAction = {
    _?: 'sendMessageCancelAction';
    
  };
  export type sendMessageRecordVideoAction = {
    _?: 'sendMessageRecordVideoAction';
    
  };
  export type sendMessageUploadVideoAction = {
    _?: 'sendMessageUploadVideoAction';
    progress: int;
  };
  export type sendMessageRecordAudioAction = {
    _?: 'sendMessageRecordAudioAction';
    
  };
  export type sendMessageUploadAudioAction = {
    _?: 'sendMessageUploadAudioAction';
    progress: int;
  };
  export type sendMessageUploadPhotoAction = {
    _?: 'sendMessageUploadPhotoAction';
    progress: int;
  };
  export type sendMessageUploadDocumentAction = {
    _?: 'sendMessageUploadDocumentAction';
    progress: int;
  };
  export type sendMessageGeoLocationAction = {
    _?: 'sendMessageGeoLocationAction';
    
  };
  export type sendMessageChooseContactAction = {
    _?: 'sendMessageChooseContactAction';
    
  };
  export type sendMessageGamePlayAction = {
    _?: 'sendMessageGamePlayAction';
    
  };
  export type sendMessageRecordRoundAction = {
    _?: 'sendMessageRecordRoundAction';
    
  };
  export type sendMessageUploadRoundAction = {
    _?: 'sendMessageUploadRoundAction';
    progress: int;
  };
  export type contacts$found = {
    _?: 'contacts.found';
    results: Vector<Peer>;
    chats: Vector<Chat>;
    users: Vector<User>;
  };
  export type inputPrivacyKeyStatusTimestamp = {
    _?: 'inputPrivacyKeyStatusTimestamp';
    
  };
  export type inputPrivacyKeyChatInvite = {
    _?: 'inputPrivacyKeyChatInvite';
    
  };
  export type inputPrivacyKeyPhoneCall = {
    _?: 'inputPrivacyKeyPhoneCall';
    
  };
  export type privacyKeyStatusTimestamp = {
    _?: 'privacyKeyStatusTimestamp';
    
  };
  export type privacyKeyChatInvite = {
    _?: 'privacyKeyChatInvite';
    
  };
  export type privacyKeyPhoneCall = {
    _?: 'privacyKeyPhoneCall';
    
  };
  export type inputPrivacyValueAllowContacts = {
    _?: 'inputPrivacyValueAllowContacts';
    
  };
  export type inputPrivacyValueAllowAll = {
    _?: 'inputPrivacyValueAllowAll';
    
  };
  export type inputPrivacyValueAllowUsers = {
    _?: 'inputPrivacyValueAllowUsers';
    users: Vector<InputUser>;
  };
  export type inputPrivacyValueDisallowContacts = {
    _?: 'inputPrivacyValueDisallowContacts';
    
  };
  export type inputPrivacyValueDisallowAll = {
    _?: 'inputPrivacyValueDisallowAll';
    
  };
  export type inputPrivacyValueDisallowUsers = {
    _?: 'inputPrivacyValueDisallowUsers';
    users: Vector<InputUser>;
  };
  export type privacyValueAllowContacts = {
    _?: 'privacyValueAllowContacts';
    
  };
  export type privacyValueAllowAll = {
    _?: 'privacyValueAllowAll';
    
  };
  export type privacyValueAllowUsers = {
    _?: 'privacyValueAllowUsers';
    users: Vector<int>;
  };
  export type privacyValueDisallowContacts = {
    _?: 'privacyValueDisallowContacts';
    
  };
  export type privacyValueDisallowAll = {
    _?: 'privacyValueDisallowAll';
    
  };
  export type privacyValueDisallowUsers = {
    _?: 'privacyValueDisallowUsers';
    users: Vector<int>;
  };
  export type account$privacyRules = {
    _?: 'account.privacyRules';
    rules: Vector<PrivacyRule>;
    users: Vector<User>;
  };
  export type accountDaysTTL = {
    _?: 'accountDaysTTL';
    days: int;
  };
  export type documentAttributeImageSize = {
    _?: 'documentAttributeImageSize';
    w: int;
    h: int;
  };
  export type documentAttributeAnimated = {
    _?: 'documentAttributeAnimated';
    
  };
  export type documentAttributeSticker = {
    _?: 'documentAttributeSticker';
    flags: number;
    mask?: true;
    alt: string;
    stickerset: InputStickerSet;
    maskCoords?: MaskCoords;
  };
  export type documentAttributeVideo = {
    _?: 'documentAttributeVideo';
    flags: number;
    roundMessage?: true;
    duration: int;
    w: int;
    h: int;
  };
  export type documentAttributeAudio = {
    _?: 'documentAttributeAudio';
    flags: number;
    voice?: true;
    duration: int;
    title?: string;
    performer?: string;
    waveform?: bytes;
  };
  export type documentAttributeFilename = {
    _?: 'documentAttributeFilename';
    fileName: string;
  };
  export type documentAttributeHasStickers = {
    _?: 'documentAttributeHasStickers';
    
  };
  export type messages$stickersNotModified = {
    _?: 'messages.stickersNotModified';
    
  };
  export type messages$stickers = {
    _?: 'messages.stickers';
    hash: string;
    stickers: Vector<Document>;
  };
  export type stickerPack = {
    _?: 'stickerPack';
    emoticon: string;
    documents: Vector<long>;
  };
  export type messages$allStickersNotModified = {
    _?: 'messages.allStickersNotModified';
    
  };
  export type messages$allStickers = {
    _?: 'messages.allStickers';
    hash: int;
    sets: Vector<StickerSet>;
  };
  export type disabledFeature = {
    _?: 'disabledFeature';
    feature: string;
    description: string;
  };
  export type messages$affectedMessages = {
    _?: 'messages.affectedMessages';
    pts: int;
    ptsCount: int;
  };
  export type contactLinkUnknown = {
    _?: 'contactLinkUnknown';
    
  };
  export type contactLinkNone = {
    _?: 'contactLinkNone';
    
  };
  export type contactLinkHasPhone = {
    _?: 'contactLinkHasPhone';
    
  };
  export type contactLinkContact = {
    _?: 'contactLinkContact';
    
  };
  export type webPageEmpty = {
    _?: 'webPageEmpty';
    id: long;
  };
  export type webPagePending = {
    _?: 'webPagePending';
    id: long;
    date: int;
  };
  export type webPage = {
    _?: 'webPage';
    flags: number;
    id: long;
    url: string;
    displayUrl: string;
    hash: int;
    type?: string;
    siteName?: string;
    title?: string;
    description?: string;
    photo?: Photo;
    embedUrl?: string;
    embedType?: string;
    embedWidth?: int;
    embedHeight?: int;
    duration?: int;
    author?: string;
    document?: Document;
    cachedPage?: Page;
  };
  export type webPageNotModified = {
    _?: 'webPageNotModified';
    
  };
  export type authorization = {
    _?: 'authorization';
    hash: long;
    flags: int;
    deviceModel: string;
    platform: string;
    systemVersion: string;
    apiId: int;
    appName: string;
    appVersion: string;
    dateCreated: int;
    dateActive: int;
    ip: string;
    country: string;
    region: string;
  };
  export type account$authorizations = {
    _?: 'account.authorizations';
    authorizations: Vector<Authorization>;
  };
  export type account$noPassword = {
    _?: 'account.noPassword';
    newSalt: bytes;
    emailUnconfirmedPattern: string;
  };
  export type account$password = {
    _?: 'account.password';
    currentSalt: bytes;
    newSalt: bytes;
    hint: string;
    hasRecovery: boolean;
    emailUnconfirmedPattern: string;
  };
  export type account$passwordSettings = {
    _?: 'account.passwordSettings';
    email: string;
  };
  export type account$passwordInputSettings = {
    _?: 'account.passwordInputSettings';
    flags: number;
    newSalt?: bytes;
    newPasswordHash?: bytes;
    hint?: string;
    email?: string;
  };
  export type auth$passwordRecovery = {
    _?: 'auth.passwordRecovery';
    emailPattern: string;
  };
  export type receivedNotifyMessage = {
    _?: 'receivedNotifyMessage';
    id: int;
    flags: int;
  };
  export type chatInviteEmpty = {
    _?: 'chatInviteEmpty';
    
  };
  export type chatInviteExported = {
    _?: 'chatInviteExported';
    link: string;
  };
  export type chatInviteAlready = {
    _?: 'chatInviteAlready';
    chat: Chat;
  };
  export type chatInvite = {
    _?: 'chatInvite';
    flags: number;
    channel?: true;
    broadcast?: true;
    public?: true;
    megagroup?: true;
    title: string;
    photo: ChatPhoto;
    participantsCount: int;
    participants?: Vector<User>;
  };
  export type inputStickerSetEmpty = {
    _?: 'inputStickerSetEmpty';
    
  };
  export type inputStickerSetID = {
    _?: 'inputStickerSetID';
    id: long;
    accessHash: long;
  };
  export type inputStickerSetShortName = {
    _?: 'inputStickerSetShortName';
    shortName: string;
  };
  export type stickerSet = {
    _?: 'stickerSet';
    flags: number;
    installed?: true;
    archived?: true;
    official?: true;
    masks?: true;
    id: long;
    accessHash: long;
    title: string;
    shortName: string;
    count: int;
    hash: int;
  };
  export type messages$stickerSet = {
    _?: 'messages.stickerSet';
    set: StickerSet;
    packs: Vector<StickerPack>;
    documents: Vector<Document>;
  };
  export type botCommand = {
    _?: 'botCommand';
    command: string;
    description: string;
  };
  export type botInfo = {
    _?: 'botInfo';
    userId: int;
    description: string;
    commands: Vector<BotCommand>;
  };
  export type keyboardButton = {
    _?: 'keyboardButton';
    text: string;
  };
  export type keyboardButtonUrl = {
    _?: 'keyboardButtonUrl';
    text: string;
    url: string;
  };
  export type keyboardButtonCallback = {
    _?: 'keyboardButtonCallback';
    text: string;
    data: bytes;
  };
  export type keyboardButtonRequestPhone = {
    _?: 'keyboardButtonRequestPhone';
    text: string;
  };
  export type keyboardButtonRequestGeoLocation = {
    _?: 'keyboardButtonRequestGeoLocation';
    text: string;
  };
  export type keyboardButtonSwitchInline = {
    _?: 'keyboardButtonSwitchInline';
    flags: number;
    samePeer?: true;
    text: string;
    query: string;
  };
  export type keyboardButtonGame = {
    _?: 'keyboardButtonGame';
    text: string;
  };
  export type keyboardButtonBuy = {
    _?: 'keyboardButtonBuy';
    text: string;
  };
  export type keyboardButtonRow = {
    _?: 'keyboardButtonRow';
    buttons: Vector<KeyboardButton>;
  };
  export type replyKeyboardHide = {
    _?: 'replyKeyboardHide';
    flags: number;
    selective?: true;
  };
  export type replyKeyboardForceReply = {
    _?: 'replyKeyboardForceReply';
    flags: number;
    singleUse?: true;
    selective?: true;
  };
  export type replyKeyboardMarkup = {
    _?: 'replyKeyboardMarkup';
    flags: number;
    resize?: true;
    singleUse?: true;
    selective?: true;
    rows: Vector<KeyboardButtonRow>;
  };
  export type replyInlineMarkup = {
    _?: 'replyInlineMarkup';
    rows: Vector<KeyboardButtonRow>;
  };
  export type messageEntityUnknown = {
    _?: 'messageEntityUnknown';
    offset: int;
    length: int;
  };
  export type messageEntityMention = {
    _?: 'messageEntityMention';
    offset: int;
    length: int;
  };
  export type messageEntityHashtag = {
    _?: 'messageEntityHashtag';
    offset: int;
    length: int;
  };
  export type messageEntityBotCommand = {
    _?: 'messageEntityBotCommand';
    offset: int;
    length: int;
  };
  export type messageEntityUrl = {
    _?: 'messageEntityUrl';
    offset: int;
    length: int;
  };
  export type messageEntityEmail = {
    _?: 'messageEntityEmail';
    offset: int;
    length: int;
  };
  export type messageEntityBold = {
    _?: 'messageEntityBold';
    offset: int;
    length: int;
  };
  export type messageEntityItalic = {
    _?: 'messageEntityItalic';
    offset: int;
    length: int;
  };
  export type messageEntityCode = {
    _?: 'messageEntityCode';
    offset: int;
    length: int;
  };
  export type messageEntityPre = {
    _?: 'messageEntityPre';
    offset: int;
    length: int;
    language: string;
  };
  export type messageEntityTextUrl = {
    _?: 'messageEntityTextUrl';
    offset: int;
    length: int;
    url: string;
  };
  export type messageEntityMentionName = {
    _?: 'messageEntityMentionName';
    offset: int;
    length: int;
    userId: int;
  };
  export type inputMessageEntityMentionName = {
    _?: 'inputMessageEntityMentionName';
    offset: int;
    length: int;
    userId: InputUser;
  };
  export type inputChannelEmpty = {
    _?: 'inputChannelEmpty';
    
  };
  export type inputChannel = {
    _?: 'inputChannel';
    channelId: int;
    accessHash: long;
  };
  export type contacts$resolvedPeer = {
    _?: 'contacts.resolvedPeer';
    peer: Peer;
    chats: Vector<Chat>;
    users: Vector<User>;
  };
  export type messageRange = {
    _?: 'messageRange';
    minId: int;
    maxId: int;
  };
  export type updates$channelDifferenceEmpty = {
    _?: 'updates.channelDifferenceEmpty';
    flags: number;
    final?: true;
    pts: int;
    timeout?: int;
  };
  export type updates$channelDifferenceTooLong = {
    _?: 'updates.channelDifferenceTooLong';
    flags: number;
    final?: true;
    pts: int;
    timeout?: int;
    topMessage: int;
    readInboxMaxId: int;
    readOutboxMaxId: int;
    unreadCount: int;
    messages: Vector<Message>;
    chats: Vector<Chat>;
    users: Vector<User>;
  };
  export type updates$channelDifference = {
    _?: 'updates.channelDifference';
    flags: number;
    final?: true;
    pts: int;
    timeout?: int;
    newMessages: Vector<Message>;
    otherUpdates: Vector<Update>;
    chats: Vector<Chat>;
    users: Vector<User>;
  };
  export type channelMessagesFilterEmpty = {
    _?: 'channelMessagesFilterEmpty';
    
  };
  export type channelMessagesFilter = {
    _?: 'channelMessagesFilter';
    flags: number;
    excludeNewMessages?: true;
    ranges: Vector<MessageRange>;
  };
  export type channelParticipant = {
    _?: 'channelParticipant';
    userId: int;
    date: int;
  };
  export type channelParticipantSelf = {
    _?: 'channelParticipantSelf';
    userId: int;
    inviterId: int;
    date: int;
  };
  export type channelParticipantModerator = {
    _?: 'channelParticipantModerator';
    userId: int;
    inviterId: int;
    date: int;
  };
  export type channelParticipantEditor = {
    _?: 'channelParticipantEditor';
    userId: int;
    inviterId: int;
    date: int;
  };
  export type channelParticipantKicked = {
    _?: 'channelParticipantKicked';
    userId: int;
    kickedBy: int;
    date: int;
  };
  export type channelParticipantCreator = {
    _?: 'channelParticipantCreator';
    userId: int;
  };
  export type channelParticipantsRecent = {
    _?: 'channelParticipantsRecent';
    
  };
  export type channelParticipantsAdmins = {
    _?: 'channelParticipantsAdmins';
    
  };
  export type channelParticipantsKicked = {
    _?: 'channelParticipantsKicked';
    
  };
  export type channelParticipantsBots = {
    _?: 'channelParticipantsBots';
    
  };
  export type channelRoleEmpty = {
    _?: 'channelRoleEmpty';
    
  };
  export type channelRoleModerator = {
    _?: 'channelRoleModerator';
    
  };
  export type channelRoleEditor = {
    _?: 'channelRoleEditor';
    
  };
  export type channels$channelParticipants = {
    _?: 'channels.channelParticipants';
    count: int;
    participants: Vector<ChannelParticipant>;
    users: Vector<User>;
  };
  export type channels$channelParticipant = {
    _?: 'channels.channelParticipant';
    participant: ChannelParticipant;
    users: Vector<User>;
  };
  export type help$termsOfService = {
    _?: 'help.termsOfService';
    text: string;
  };
  export type foundGif = {
    _?: 'foundGif';
    url: string;
    thumbUrl: string;
    contentUrl: string;
    contentType: string;
    w: int;
    h: int;
  };
  export type foundGifCached = {
    _?: 'foundGifCached';
    url: string;
    photo: Photo;
    document: Document;
  };
  export type messages$foundGifs = {
    _?: 'messages.foundGifs';
    nextOffset: int;
    results: Vector<FoundGif>;
  };
  export type messages$savedGifsNotModified = {
    _?: 'messages.savedGifsNotModified';
    
  };
  export type messages$savedGifs = {
    _?: 'messages.savedGifs';
    hash: int;
    gifs: Vector<Document>;
  };
  export type inputBotInlineMessageMediaAuto = {
    _?: 'inputBotInlineMessageMediaAuto';
    flags: number;
    caption: string;
    replyMarkup?: ReplyMarkup;
  };
  export type inputBotInlineMessageText = {
    _?: 'inputBotInlineMessageText';
    flags: number;
    noWebpage?: true;
    message: string;
    entities?: Vector<MessageEntity>;
    replyMarkup?: ReplyMarkup;
  };
  export type inputBotInlineMessageMediaGeo = {
    _?: 'inputBotInlineMessageMediaGeo';
    flags: number;
    geoPoint: InputGeoPoint;
    replyMarkup?: ReplyMarkup;
  };
  export type inputBotInlineMessageMediaVenue = {
    _?: 'inputBotInlineMessageMediaVenue';
    flags: number;
    geoPoint: InputGeoPoint;
    title: string;
    address: string;
    provider: string;
    venueId: string;
    replyMarkup?: ReplyMarkup;
  };
  export type inputBotInlineMessageMediaContact = {
    _?: 'inputBotInlineMessageMediaContact';
    flags: number;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    replyMarkup?: ReplyMarkup;
  };
  export type inputBotInlineMessageGame = {
    _?: 'inputBotInlineMessageGame';
    flags: number;
    replyMarkup?: ReplyMarkup;
  };
  export type inputBotInlineResult = {
    _?: 'inputBotInlineResult';
    flags: number;
    id: string;
    type: string;
    title?: string;
    description?: string;
    url?: string;
    thumbUrl?: string;
    contentUrl?: string;
    contentType?: string;
    w?: int;
    h?: int;
    duration?: int;
    sendMessage: InputBotInlineMessage;
  };
  export type inputBotInlineResultPhoto = {
    _?: 'inputBotInlineResultPhoto';
    id: string;
    type: string;
    photo: InputPhoto;
    sendMessage: InputBotInlineMessage;
  };
  export type inputBotInlineResultDocument = {
    _?: 'inputBotInlineResultDocument';
    flags: number;
    id: string;
    type: string;
    title?: string;
    description?: string;
    document: InputDocument;
    sendMessage: InputBotInlineMessage;
  };
  export type inputBotInlineResultGame = {
    _?: 'inputBotInlineResultGame';
    id: string;
    shortName: string;
    sendMessage: InputBotInlineMessage;
  };
  export type botInlineMessageMediaAuto = {
    _?: 'botInlineMessageMediaAuto';
    flags: number;
    caption: string;
    replyMarkup?: ReplyMarkup;
  };
  export type botInlineMessageText = {
    _?: 'botInlineMessageText';
    flags: number;
    noWebpage?: true;
    message: string;
    entities?: Vector<MessageEntity>;
    replyMarkup?: ReplyMarkup;
  };
  export type botInlineMessageMediaGeo = {
    _?: 'botInlineMessageMediaGeo';
    flags: number;
    geo: GeoPoint;
    replyMarkup?: ReplyMarkup;
  };
  export type botInlineMessageMediaVenue = {
    _?: 'botInlineMessageMediaVenue';
    flags: number;
    geo: GeoPoint;
    title: string;
    address: string;
    provider: string;
    venueId: string;
    replyMarkup?: ReplyMarkup;
  };
  export type botInlineMessageMediaContact = {
    _?: 'botInlineMessageMediaContact';
    flags: number;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    replyMarkup?: ReplyMarkup;
  };
  export type botInlineResult = {
    _?: 'botInlineResult';
    flags: number;
    id: string;
    type: string;
    title?: string;
    description?: string;
    url?: string;
    thumbUrl?: string;
    contentUrl?: string;
    contentType?: string;
    w?: int;
    h?: int;
    duration?: int;
    sendMessage: BotInlineMessage;
  };
  export type botInlineMediaResult = {
    _?: 'botInlineMediaResult';
    flags: number;
    id: string;
    type: string;
    photo?: Photo;
    document?: Document;
    title?: string;
    description?: string;
    sendMessage: BotInlineMessage;
  };
  export type messages$botResults = {
    _?: 'messages.botResults';
    flags: number;
    gallery?: true;
    queryId: long;
    nextOffset?: string;
    switchPm?: InlineBotSwitchPM;
    results: Vector<BotInlineResult>;
    cacheTime: int;
  };
  export type exportedMessageLink = {
    _?: 'exportedMessageLink';
    link: string;
  };
  export type messageFwdHeader = {
    _?: 'messageFwdHeader';
    flags: number;
    fromId?: int;
    date: int;
    channelId?: int;
    channelPost?: int;
  };
  export type auth$codeTypeSms = {
    _?: 'auth.codeTypeSms';
    
  };
  export type auth$codeTypeCall = {
    _?: 'auth.codeTypeCall';
    
  };
  export type auth$codeTypeFlashCall = {
    _?: 'auth.codeTypeFlashCall';
    
  };
  export type auth$sentCodeTypeApp = {
    _?: 'auth.sentCodeTypeApp';
    length: int;
  };
  export type auth$sentCodeTypeSms = {
    _?: 'auth.sentCodeTypeSms';
    length: int;
  };
  export type auth$sentCodeTypeCall = {
    _?: 'auth.sentCodeTypeCall';
    length: int;
  };
  export type auth$sentCodeTypeFlashCall = {
    _?: 'auth.sentCodeTypeFlashCall';
    pattern: string;
  };
  export type messages$botCallbackAnswer = {
    _?: 'messages.botCallbackAnswer';
    flags: number;
    alert?: true;
    hasUrl?: true;
    message?: string;
    url?: string;
    cacheTime: int;
  };
  export type messages$messageEditData = {
    _?: 'messages.messageEditData';
    flags: number;
    caption?: true;
  };
  export type inputBotInlineMessageID = {
    _?: 'inputBotInlineMessageID';
    dcId: int;
    id: long;
    accessHash: long;
  };
  export type inlineBotSwitchPM = {
    _?: 'inlineBotSwitchPM';
    text: string;
    startParam: string;
  };
  export type messages$peerDialogs = {
    _?: 'messages.peerDialogs';
    dialogs: Vector<Dialog>;
    messages: Vector<Message>;
    chats: Vector<Chat>;
    users: Vector<User>;
    state: updates$State;
  };
  export type topPeer = {
    _?: 'topPeer';
    peer: Peer;
    rating: double;
  };
  export type topPeerCategoryBotsPM = {
    _?: 'topPeerCategoryBotsPM';
    
  };
  export type topPeerCategoryBotsInline = {
    _?: 'topPeerCategoryBotsInline';
    
  };
  export type topPeerCategoryCorrespondents = {
    _?: 'topPeerCategoryCorrespondents';
    
  };
  export type topPeerCategoryGroups = {
    _?: 'topPeerCategoryGroups';
    
  };
  export type topPeerCategoryChannels = {
    _?: 'topPeerCategoryChannels';
    
  };
  export type topPeerCategoryPeers = {
    _?: 'topPeerCategoryPeers';
    category: TopPeerCategory;
    count: int;
    peers: Vector<TopPeer>;
  };
  export type contacts$topPeersNotModified = {
    _?: 'contacts.topPeersNotModified';
    
  };
  export type contacts$topPeers = {
    _?: 'contacts.topPeers';
    categories: Vector<TopPeerCategoryPeers>;
    chats: Vector<Chat>;
    users: Vector<User>;
  };
  export type draftMessageEmpty = {
    _?: 'draftMessageEmpty';
    
  };
  export type draftMessage = {
    _?: 'draftMessage';
    flags: number;
    noWebpage?: true;
    replyToMsgId?: int;
    message: string;
    entities?: Vector<MessageEntity>;
    date: int;
  };
  export type messages$featuredStickersNotModified = {
    _?: 'messages.featuredStickersNotModified';
    
  };
  export type messages$featuredStickers = {
    _?: 'messages.featuredStickers';
    hash: int;
    sets: Vector<StickerSetCovered>;
    unread: Vector<long>;
  };
  export type messages$recentStickersNotModified = {
    _?: 'messages.recentStickersNotModified';
    
  };
  export type messages$recentStickers = {
    _?: 'messages.recentStickers';
    hash: int;
    stickers: Vector<Document>;
  };
  export type messages$archivedStickers = {
    _?: 'messages.archivedStickers';
    count: int;
    sets: Vector<StickerSetCovered>;
  };
  export type messages$stickerSetInstallResultSuccess = {
    _?: 'messages.stickerSetInstallResultSuccess';
    
  };
  export type messages$stickerSetInstallResultArchive = {
    _?: 'messages.stickerSetInstallResultArchive';
    sets: Vector<StickerSetCovered>;
  };
  export type stickerSetCovered = {
    _?: 'stickerSetCovered';
    set: StickerSet;
    cover: Document;
  };
  export type stickerSetMultiCovered = {
    _?: 'stickerSetMultiCovered';
    set: StickerSet;
    covers: Vector<Document>;
  };
  export type maskCoords = {
    _?: 'maskCoords';
    n: int;
    x: double;
    y: double;
    zoom: double;
  };
  export type inputStickeredMediaPhoto = {
    _?: 'inputStickeredMediaPhoto';
    id: InputPhoto;
  };
  export type inputStickeredMediaDocument = {
    _?: 'inputStickeredMediaDocument';
    id: InputDocument;
  };
  export type game = {
    _?: 'game';
    flags: number;
    id: long;
    accessHash: long;
    shortName: string;
    title: string;
    description: string;
    photo: Photo;
    document?: Document;
  };
  export type inputGameID = {
    _?: 'inputGameID';
    id: long;
    accessHash: long;
  };
  export type inputGameShortName = {
    _?: 'inputGameShortName';
    botId: InputUser;
    shortName: string;
  };
  export type highScore = {
    _?: 'highScore';
    pos: int;
    userId: int;
    score: int;
  };
  export type messages$highScores = {
    _?: 'messages.highScores';
    scores: Vector<HighScore>;
    users: Vector<User>;
  };
  export type textEmpty = {
    _?: 'textEmpty';
    
  };
  export type textPlain = {
    _?: 'textPlain';
    text: string;
  };
  export type textBold = {
    _?: 'textBold';
    text: RichText;
  };
  export type textItalic = {
    _?: 'textItalic';
    text: RichText;
  };
  export type textUnderline = {
    _?: 'textUnderline';
    text: RichText;
  };
  export type textStrike = {
    _?: 'textStrike';
    text: RichText;
  };
  export type textFixed = {
    _?: 'textFixed';
    text: RichText;
  };
  export type textUrl = {
    _?: 'textUrl';
    text: RichText;
    url: string;
    webpageId: long;
  };
  export type textEmail = {
    _?: 'textEmail';
    text: RichText;
    email: string;
  };
  export type textConcat = {
    _?: 'textConcat';
    texts: Vector<RichText>;
  };
  export type pageBlockUnsupported = {
    _?: 'pageBlockUnsupported';
    
  };
  export type pageBlockTitle = {
    _?: 'pageBlockTitle';
    text: RichText;
  };
  export type pageBlockSubtitle = {
    _?: 'pageBlockSubtitle';
    text: RichText;
  };
  export type pageBlockAuthorDate = {
    _?: 'pageBlockAuthorDate';
    author: RichText;
    publishedDate: int;
  };
  export type pageBlockHeader = {
    _?: 'pageBlockHeader';
    text: RichText;
  };
  export type pageBlockSubheader = {
    _?: 'pageBlockSubheader';
    text: RichText;
  };
  export type pageBlockParagraph = {
    _?: 'pageBlockParagraph';
    text: RichText;
  };
  export type pageBlockPreformatted = {
    _?: 'pageBlockPreformatted';
    text: RichText;
    language: string;
  };
  export type pageBlockFooter = {
    _?: 'pageBlockFooter';
    text: RichText;
  };
  export type pageBlockDivider = {
    _?: 'pageBlockDivider';
    
  };
  export type pageBlockAnchor = {
    _?: 'pageBlockAnchor';
    name: string;
  };
  export type pageBlockList = {
    _?: 'pageBlockList';
    ordered: boolean;
    items: Vector<RichText>;
  };
  export type pageBlockBlockquote = {
    _?: 'pageBlockBlockquote';
    text: RichText;
    caption: RichText;
  };
  export type pageBlockPullquote = {
    _?: 'pageBlockPullquote';
    text: RichText;
    caption: RichText;
  };
  export type pageBlockPhoto = {
    _?: 'pageBlockPhoto';
    photoId: long;
    caption: RichText;
  };
  export type pageBlockVideo = {
    _?: 'pageBlockVideo';
    flags: number;
    autoplay?: true;
    loop?: true;
    videoId: long;
    caption: RichText;
  };
  export type pageBlockCover = {
    _?: 'pageBlockCover';
    cover: PageBlock;
  };
  export type pageBlockEmbed = {
    _?: 'pageBlockEmbed';
    flags: number;
    fullWidth?: true;
    allowScrolling?: true;
    url?: string;
    html?: string;
    posterPhotoId?: long;
    w: int;
    h: int;
    caption: RichText;
  };
  export type pageBlockEmbedPost = {
    _?: 'pageBlockEmbedPost';
    url: string;
    webpageId: long;
    authorPhotoId: long;
    author: string;
    date: int;
    blocks: Vector<PageBlock>;
    caption: RichText;
  };
  export type pageBlockCollage = {
    _?: 'pageBlockCollage';
    items: Vector<PageBlock>;
    caption: RichText;
  };
  export type pageBlockSlideshow = {
    _?: 'pageBlockSlideshow';
    items: Vector<PageBlock>;
    caption: RichText;
  };
  export type pageBlockChannel = {
    _?: 'pageBlockChannel';
    channel: Chat;
  };
  export type pagePart = {
    _?: 'pagePart';
    blocks: Vector<PageBlock>;
    photos: Vector<Photo>;
    videos: Vector<Document>;
  };
  export type pageFull = {
    _?: 'pageFull';
    blocks: Vector<PageBlock>;
    photos: Vector<Photo>;
    videos: Vector<Document>;
  };
  export type phoneCallDiscardReasonMissed = {
    _?: 'phoneCallDiscardReasonMissed';
    
  };
  export type phoneCallDiscardReasonDisconnect = {
    _?: 'phoneCallDiscardReasonDisconnect';
    
  };
  export type phoneCallDiscardReasonHangup = {
    _?: 'phoneCallDiscardReasonHangup';
    
  };
  export type phoneCallDiscardReasonBusy = {
    _?: 'phoneCallDiscardReasonBusy';
    
  };
  export type dataJSON = {
    _?: 'dataJSON';
    data: string;
  };
  export type labeledPrice = {
    _?: 'labeledPrice';
    label: string;
    amount: long;
  };
  export type invoice = {
    _?: 'invoice';
    flags: number;
    test?: true;
    nameRequested?: true;
    phoneRequested?: true;
    emailRequested?: true;
    shippingAddressRequested?: true;
    flexible?: true;
    currency: string;
    prices: Vector<LabeledPrice>;
  };
  export type paymentCharge = {
    _?: 'paymentCharge';
    id: string;
    providerChargeId: string;
  };
  export type postAddress = {
    _?: 'postAddress';
    streetLine1: string;
    streetLine2: string;
    city: string;
    state: string;
    countryIso2: string;
    postCode: string;
  };
  export type paymentRequestedInfo = {
    _?: 'paymentRequestedInfo';
    flags: number;
    name?: string;
    phone?: string;
    email?: string;
    shippingAddress?: PostAddress;
  };
  export type paymentSavedCredentialsCard = {
    _?: 'paymentSavedCredentialsCard';
    id: string;
    title: string;
  };
  export type webDocument = {
    _?: 'webDocument';
    url: string;
    accessHash: long;
    size: int;
    mimeType: string;
    attributes: Vector<DocumentAttribute>;
    dcId: int;
  };
  export type inputWebDocument = {
    _?: 'inputWebDocument';
    url: string;
    size: int;
    mimeType: string;
    attributes: Vector<DocumentAttribute>;
  };
  export type inputWebFileLocation = {
    _?: 'inputWebFileLocation';
    url: string;
    accessHash: long;
  };
  export type upload$webFile = {
    _?: 'upload.webFile';
    size: int;
    mimeType: string;
    fileType: storage$FileType;
    mtime: int;
    bytes: bytes;
  };
  export type payments$paymentForm = {
    _?: 'payments.paymentForm';
    flags: number;
    canSaveCredentials?: true;
    passwordMissing?: true;
    botId: int;
    invoice: Invoice;
    providerId: int;
    url: string;
    nativeProvider?: string;
    nativeParams?: DataJSON;
    savedInfo?: PaymentRequestedInfo;
    savedCredentials?: PaymentSavedCredentials;
    users: Vector<User>;
  };
  export type payments$validatedRequestedInfo = {
    _?: 'payments.validatedRequestedInfo';
    flags: number;
    id?: string;
    shippingOptions?: Vector<ShippingOption>;
  };
  export type payments$paymentResult = {
    _?: 'payments.paymentResult';
    updates: Updates;
  };
  export type payments$paymentVerficationNeeded = {
    _?: 'payments.paymentVerficationNeeded';
    url: string;
  };
  export type payments$paymentReceipt = {
    _?: 'payments.paymentReceipt';
    flags: number;
    date: int;
    botId: int;
    invoice: Invoice;
    providerId: int;
    info?: PaymentRequestedInfo;
    shipping?: ShippingOption;
    currency: string;
    totalAmount: long;
    credentialsTitle: string;
    users: Vector<User>;
  };
  export type payments$savedInfo = {
    _?: 'payments.savedInfo';
    flags: number;
    hasSavedCredentials?: true;
    savedInfo?: PaymentRequestedInfo;
  };
  export type inputPaymentCredentialsSaved = {
    _?: 'inputPaymentCredentialsSaved';
    id: string;
    tmpPassword: bytes;
  };
  export type inputPaymentCredentials = {
    _?: 'inputPaymentCredentials';
    flags: number;
    save?: true;
    data: DataJSON;
  };
  export type account$tmpPassword = {
    _?: 'account.tmpPassword';
    tmpPassword: bytes;
    validUntil: int;
  };
  export type shippingOption = {
    _?: 'shippingOption';
    id: string;
    title: string;
    prices: Vector<LabeledPrice>;
  };
  export type inputStickerSetItem = {
    _?: 'inputStickerSetItem';
    flags: number;
    document: InputDocument;
    emoji: string;
    maskCoords?: MaskCoords;
  };
  export type inputPhoneCall = {
    _?: 'inputPhoneCall';
    id: long;
    accessHash: long;
  };
  export type phoneCallEmpty = {
    _?: 'phoneCallEmpty';
    id: long;
  };
  export type phoneCallWaiting = {
    _?: 'phoneCallWaiting';
    flags: number;
    id: long;
    accessHash: long;
    date: int;
    adminId: int;
    participantId: int;
    protocol: PhoneCallProtocol;
    receiveDate?: int;
  };
  export type phoneCallRequested = {
    _?: 'phoneCallRequested';
    id: long;
    accessHash: long;
    date: int;
    adminId: int;
    participantId: int;
    gAHash: bytes;
    protocol: PhoneCallProtocol;
  };
  export type phoneCallAccepted = {
    _?: 'phoneCallAccepted';
    id: long;
    accessHash: long;
    date: int;
    adminId: int;
    participantId: int;
    gB: bytes;
    protocol: PhoneCallProtocol;
  };
  export type phoneCall = {
    _?: 'phoneCall';
    id: long;
    accessHash: long;
    date: int;
    adminId: int;
    participantId: int;
    gAOrB: bytes;
    keyFingerprint: long;
    protocol: PhoneCallProtocol;
    connection: PhoneConnection;
    alternativeConnections: Vector<PhoneConnection>;
    startDate: int;
  };
  export type phoneCallDiscarded = {
    _?: 'phoneCallDiscarded';
    flags: number;
    needRating?: true;
    needDebug?: true;
    id: long;
    reason?: PhoneCallDiscardReason;
    duration?: int;
  };
  export type phoneConnection = {
    _?: 'phoneConnection';
    id: long;
    ip: string;
    ipv6: string;
    port: int;
    peerTag: bytes;
  };
  export type phoneCallProtocol = {
    _?: 'phoneCallProtocol';
    flags: number;
    udpP2p?: true;
    udpReflector?: true;
    minLayer: int;
    maxLayer: int;
  };
  export type phone$phoneCall = {
    _?: 'phone.phoneCall';
    phoneCall: PhoneCall;
    users: Vector<User>;
  };
  export type upload$cdnFileReuploadNeeded = {
    _?: 'upload.cdnFileReuploadNeeded';
    requestToken: bytes;
  };
  export type upload$cdnFile = {
    _?: 'upload.cdnFile';
    bytes: bytes;
  };
  export type cdnPublicKey = {
    _?: 'cdnPublicKey';
    dcId: int;
    publicKey: string;
  };
  export type cdnConfig = {
    _?: 'cdnConfig';
    publicKeys: Vector<CdnPublicKey>;
  };
  export type langPackString = {
    _?: 'langPackString';
    key: string;
    value: string;
  };
  export type langPackStringPluralized = {
    _?: 'langPackStringPluralized';
    flags: number;
    key: string;
    zeroValue?: string;
    oneValue?: string;
    twoValue?: string;
    fewValue?: string;
    manyValue?: string;
    otherValue: string;
  };
  export type langPackStringDeleted = {
    _?: 'langPackStringDeleted';
    key: string;
  };
  export type langPackDifference = {
    _?: 'langPackDifference';
    langCode: string;
    fromVersion: int;
    version: int;
    strings: Vector<LangPackString>;
  };
  export type langPackLanguage = {
    _?: 'langPackLanguage';
    name: string;
    nativeName: string;
    langCode: string;
  };
  export type ResPQ = resPQ;
  export type PQInnerData = pQInnerData;
  export type ServerDHParams = serverDHParamsFail | serverDHParamsOk;
  export type ServerDHInnerData = serverDHInnerData;
  export type ClientDHInnerData = clientDHInnerData;
  export type SetClientDHParamsAnswer = dhGenOk | dhGenRetry | dhGenFail;
  export type DestroyAuthKeyRes = destroyAuthKeyOk | destroyAuthKeyNone | destroyAuthKeyFail;
  export type MsgsAck = msgsAck;
  export type BadMsgNotification = badMsgNotification | badServerSalt;
  export type MsgsStateReq = msgsStateReq;
  export type MsgsStateInfo = msgsStateInfo;
  export type MsgsAllInfo = msgsAllInfo;
  export type MsgDetailedInfo = msgDetailedInfo | msgNewDetailedInfo;
  export type MsgResendReq = msgResendReq;
  export type RpcError = rpcError;
  export type RpcDropAnswer = rpcAnswerUnknown | rpcAnswerDroppedRunning | rpcAnswerDropped;
  export type FutureSalt = futureSalt;
  export type FutureSalts = futureSalts;
  export type Pong = pong;
  export type DestroySessionRes = destroySessionOk | destroySessionNone;
  export type NewSession = newSessionCreated;
  export type HttpWait = httpWait;
  export type Vector<t> = vector<t>;
  export type Error = error;
  export type InputPeer = inputPeerEmpty | inputPeerSelf | inputPeerChat | inputPeerUser | inputPeerChannel;
  export type InputUser = inputUserEmpty | inputUserSelf | inputUser;
  export type InputContact = inputPhoneContact;
  export type InputFile = inputFile | inputFileBig;
  export type InputMedia =
    inputMediaEmpty
    | inputMediaUploadedPhoto
    | inputMediaPhoto
    | inputMediaGeoPoint
    | inputMediaContact
    | inputMediaUploadedDocument
    | inputMediaUploadedThumbDocument
    | inputMediaDocument
    | inputMediaVenue
    | inputMediaGifExternal
    | inputMediaPhotoExternal
    | inputMediaDocumentExternal
    | inputMediaGame
    | inputMediaInvoice;
  export type InputChatPhoto = inputChatPhotoEmpty | inputChatUploadedPhoto | inputChatPhoto;
  export type InputGeoPoint = inputGeoPointEmpty | inputGeoPoint;
  export type InputPhoto = inputPhotoEmpty | inputPhoto;
  export type InputFileLocation = inputFileLocation | inputEncryptedFileLocation | inputDocumentFileLocation;
  export type InputAppEvent = inputAppEvent;
  export type Peer = peerUser | peerChat | peerChannel;
  export type storage$FileType =
    storage$fileUnknown
    | storage$filePartial
    | storage$fileJpeg
    | storage$fileGif
    | storage$filePng
    | storage$filePdf
    | storage$fileMp3
    | storage$fileMov
    | storage$fileMp4
    | storage$fileWebp;
  export type FileLocation = fileLocationUnavailable | fileLocation;
  export type User = userEmpty | user;
  export type UserProfilePhoto = userProfilePhotoEmpty | userProfilePhoto;
  export type UserStatus =
    userStatusEmpty
    | userStatusOnline
    | userStatusOffline
    | userStatusRecently
    | userStatusLastWeek
    | userStatusLastMonth;
  export type Chat = chatEmpty | chat | chatForbidden | channel | channelForbidden;
  export type ChatFull = chatFull | channelFull;
  export type ChatParticipant = chatParticipant | chatParticipantCreator | chatParticipantAdmin;
  export type ChatParticipants = chatParticipantsForbidden | chatParticipants;
  export type ChatPhoto = chatPhotoEmpty | chatPhoto;
  export type Message = messageEmpty | message | messageService;
  export type MessageMedia =
    messageMediaEmpty
    | messageMediaPhoto
    | messageMediaGeo
    | messageMediaContact
    | messageMediaUnsupported
    | messageMediaDocument
    | messageMediaWebPage
    | messageMediaVenue
    | messageMediaGame
    | messageMediaInvoice;
  export type MessageAction =
    messageActionEmpty
    | messageActionChatCreate
    | messageActionChatEditTitle
    | messageActionChatEditPhoto
    | messageActionChatDeletePhoto
    | messageActionChatAddUser
    | messageActionChatDeleteUser
    | messageActionChatJoinedByLink
    | messageActionChannelCreate
    | messageActionChatMigrateTo
    | messageActionChannelMigrateFrom
    | messageActionPinMessage
    | messageActionHistoryClear
    | messageActionGameScore
    | messageActionPaymentSentMe
    | messageActionPaymentSent
    | messageActionPhoneCall;
  export type Dialog = dialog;
  export type Photo = photoEmpty | photo;
  export type PhotoSize = photoSizeEmpty | photoSize | photoCachedSize;
  export type GeoPoint = geoPointEmpty | geoPoint;
  export type auth$CheckedPhone = auth$checkedPhone;
  export type auth$SentCode = auth$sentCode;
  export type auth$Authorization = auth$authorization;
  export type auth$ExportedAuthorization = auth$exportedAuthorization;
  export type InputNotifyPeer = inputNotifyPeer | inputNotifyUsers | inputNotifyChats | inputNotifyAll;
  export type InputPeerNotifyEvents = inputPeerNotifyEventsEmpty | inputPeerNotifyEventsAll;
  export type InputPeerNotifySettings = inputPeerNotifySettings;
  export type PeerNotifyEvents = peerNotifyEventsEmpty | peerNotifyEventsAll;
  export type PeerNotifySettings = peerNotifySettingsEmpty | peerNotifySettings;
  export type PeerSettings = peerSettings;
  export type WallPaper = wallPaper | wallPaperSolid;
  export type ReportReason =
    inputReportReasonSpam
    | inputReportReasonViolence
    | inputReportReasonPornography
    | inputReportReasonOther;
  export type UserFull = userFull;
  export type Contact = contact;
  export type ImportedContact = importedContact;
  export type ContactBlocked = contactBlocked;
  export type ContactStatus = contactStatus;
  export type contacts$Link = contacts$link;
  export type contacts$Contacts = contacts$contactsNotModified | contacts$contacts;
  export type contacts$ImportedContacts = contacts$importedContacts;
  export type contacts$Blocked = contacts$blocked | contacts$blockedSlice;
  export type messages$Dialogs = messages$dialogs | messages$dialogsSlice;
  export type messages$Messages = messages$messages | messages$messagesSlice | messages$channelMessages;
  export type messages$Chats = messages$chats | messages$chatsSlice;
  export type messages$ChatFull = messages$chatFull;
  export type messages$AffectedHistory = messages$affectedHistory;
  export type MessagesFilter =
    inputMessagesFilterEmpty
    | inputMessagesFilterPhotos
    | inputMessagesFilterVideo
    | inputMessagesFilterPhotoVideo
    | inputMessagesFilterPhotoVideoDocuments
    | inputMessagesFilterDocument
    | inputMessagesFilterUrl
    | inputMessagesFilterGif
    | inputMessagesFilterVoice
    | inputMessagesFilterMusic
    | inputMessagesFilterChatPhotos
    | inputMessagesFilterPhoneCalls
    | inputMessagesFilterRoundVoice
    | inputMessagesFilterRoundVideo;
  export type Update =
    updateNewMessage
    | updateMessageID
    | updateDeleteMessages
    | updateUserTyping
    | updateChatUserTyping
    | updateChatParticipants
    | updateUserStatus
    | updateUserName
    | updateUserPhoto
    | updateContactRegistered
    | updateContactLink
    | updateNewEncryptedMessage
    | updateEncryptedChatTyping
    | updateEncryption
    | updateEncryptedMessagesRead
    | updateChatParticipantAdd
    | updateChatParticipantDelete
    | updateDcOptions
    | updateUserBlocked
    | updateNotifySettings
    | updateServiceNotification
    | updatePrivacy
    | updateUserPhone
    | updateReadHistoryInbox
    | updateReadHistoryOutbox
    | updateWebPage
    | updateReadMessagesContents
    | updateChannelTooLong
    | updateChannel
    | updateNewChannelMessage
    | updateReadChannelInbox
    | updateDeleteChannelMessages
    | updateChannelMessageViews
    | updateChatAdmins
    | updateChatParticipantAdmin
    | updateNewStickerSet
    | updateStickerSetsOrder
    | updateStickerSets
    | updateSavedGifs
    | updateBotInlineQuery
    | updateBotInlineSend
    | updateEditChannelMessage
    | updateChannelPinnedMessage
    | updateBotCallbackQuery
    | updateEditMessage
    | updateInlineBotCallbackQuery
    | updateReadChannelOutbox
    | updateDraftMessage
    | updateReadFeaturedStickers
    | updateRecentStickers
    | updateConfig
    | updatePtsChanged
    | updateChannelWebPage
    | updateDialogPinned
    | updatePinnedDialogs
    | updateBotWebhookJSON
    | updateBotWebhookJSONQuery
    | updateBotShippingQuery
    | updateBotPrecheckoutQuery
    | updatePhoneCall
    | updateLangPackTooLong
    | updateLangPack;
  export type updates$State = updates$state;
  export type updates$Difference =
    updates$differenceEmpty
    | updates$difference
    | updates$differenceSlice
    | updates$differenceTooLong;
  export type Updates =
    updatesTooLong
    | updateShortMessage
    | updateShortChatMessage
    | updateShort
    | updatesCombined
    | updates
    | updateShortSentMessage;
  export type photos$Photos = photos$photos | photos$photosSlice;
  export type photos$Photo = photos$photo;
  export type upload$File = upload$file | upload$fileCdnRedirect;
  export type DcOption = dcOption;
  export type Config = config;
  export type NearestDc = nearestDc;
  export type help$AppUpdate = help$appUpdate | help$noAppUpdate;
  export type help$InviteText = help$inviteText;
  export type EncryptedChat =
    encryptedChatEmpty
    | encryptedChatWaiting
    | encryptedChatRequested
    | encryptedChat
    | encryptedChatDiscarded;
  export type InputEncryptedChat = inputEncryptedChat;
  export type EncryptedFile = encryptedFileEmpty | encryptedFile;
  export type InputEncryptedFile =
    inputEncryptedFileEmpty
    | inputEncryptedFileUploaded
    | inputEncryptedFile
    | inputEncryptedFileBigUploaded;
  export type EncryptedMessage = encryptedMessage | encryptedMessageService;
  export type messages$DhConfig = messages$dhConfigNotModified | messages$dhConfig;
  export type messages$SentEncryptedMessage = messages$sentEncryptedMessage | messages$sentEncryptedFile;
  export type InputDocument = inputDocumentEmpty | inputDocument;
  export type Document = documentEmpty | document;
  export type help$Support = help$support;
  export type NotifyPeer = notifyPeer | notifyUsers | notifyChats | notifyAll;
  export type SendMessageAction =
    sendMessageTypingAction
    | sendMessageCancelAction
    | sendMessageRecordVideoAction
    | sendMessageUploadVideoAction
    | sendMessageRecordAudioAction
    | sendMessageUploadAudioAction
    | sendMessageUploadPhotoAction
    | sendMessageUploadDocumentAction
    | sendMessageGeoLocationAction
    | sendMessageChooseContactAction
    | sendMessageGamePlayAction
    | sendMessageRecordRoundAction
    | sendMessageUploadRoundAction;
  export type contacts$Found = contacts$found;
  export type InputPrivacyKey = inputPrivacyKeyStatusTimestamp | inputPrivacyKeyChatInvite | inputPrivacyKeyPhoneCall;
  export type PrivacyKey = privacyKeyStatusTimestamp | privacyKeyChatInvite | privacyKeyPhoneCall;
  export type InputPrivacyRule =
    inputPrivacyValueAllowContacts
    | inputPrivacyValueAllowAll
    | inputPrivacyValueAllowUsers
    | inputPrivacyValueDisallowContacts
    | inputPrivacyValueDisallowAll
    | inputPrivacyValueDisallowUsers;
  export type PrivacyRule =
    privacyValueAllowContacts
    | privacyValueAllowAll
    | privacyValueAllowUsers
    | privacyValueDisallowContacts
    | privacyValueDisallowAll
    | privacyValueDisallowUsers;
  export type account$PrivacyRules = account$privacyRules;
  export type AccountDaysTTL = accountDaysTTL;
  export type DocumentAttribute =
    documentAttributeImageSize
    | documentAttributeAnimated
    | documentAttributeSticker
    | documentAttributeVideo
    | documentAttributeAudio
    | documentAttributeFilename
    | documentAttributeHasStickers;
  export type messages$Stickers = messages$stickersNotModified | messages$stickers;
  export type StickerPack = stickerPack;
  export type messages$AllStickers = messages$allStickersNotModified | messages$allStickers;
  export type DisabledFeature = disabledFeature;
  export type messages$AffectedMessages = messages$affectedMessages;
  export type ContactLink = contactLinkUnknown | contactLinkNone | contactLinkHasPhone | contactLinkContact;
  export type WebPage = webPageEmpty | webPagePending | webPage | webPageNotModified;
  export type Authorization = authorization;
  export type account$Authorizations = account$authorizations;
  export type account$Password = account$noPassword | account$password;
  export type account$PasswordSettings = account$passwordSettings;
  export type account$PasswordInputSettings = account$passwordInputSettings;
  export type auth$PasswordRecovery = auth$passwordRecovery;
  export type ReceivedNotifyMessage = receivedNotifyMessage;
  export type ExportedChatInvite = chatInviteEmpty | chatInviteExported;
  export type ChatInvite = chatInviteAlready | chatInvite;
  export type InputStickerSet = inputStickerSetEmpty | inputStickerSetID | inputStickerSetShortName;
  export type StickerSet = stickerSet;
  export type messages$StickerSet = messages$stickerSet;
  export type BotCommand = botCommand;
  export type BotInfo = botInfo;
  export type KeyboardButton =
    keyboardButton
    | keyboardButtonUrl
    | keyboardButtonCallback
    | keyboardButtonRequestPhone
    | keyboardButtonRequestGeoLocation
    | keyboardButtonSwitchInline
    | keyboardButtonGame
    | keyboardButtonBuy;
  export type KeyboardButtonRow = keyboardButtonRow;
  export type ReplyMarkup = replyKeyboardHide | replyKeyboardForceReply | replyKeyboardMarkup | replyInlineMarkup;
  export type MessageEntity =
    messageEntityUnknown
    | messageEntityMention
    | messageEntityHashtag
    | messageEntityBotCommand
    | messageEntityUrl
    | messageEntityEmail
    | messageEntityBold
    | messageEntityItalic
    | messageEntityCode
    | messageEntityPre
    | messageEntityTextUrl
    | messageEntityMentionName
    | inputMessageEntityMentionName;
  export type InputChannel = inputChannelEmpty | inputChannel;
  export type contacts$ResolvedPeer = contacts$resolvedPeer;
  export type MessageRange = messageRange;
  export type updates$ChannelDifference =
    updates$channelDifferenceEmpty
    | updates$channelDifferenceTooLong
    | updates$channelDifference;
  export type ChannelMessagesFilter = channelMessagesFilterEmpty | channelMessagesFilter;
  export type ChannelParticipant =
    channelParticipant
    | channelParticipantSelf
    | channelParticipantModerator
    | channelParticipantEditor
    | channelParticipantKicked
    | channelParticipantCreator;
  export type ChannelParticipantsFilter =
    channelParticipantsRecent
    | channelParticipantsAdmins
    | channelParticipantsKicked
    | channelParticipantsBots;
  export type ChannelParticipantRole = channelRoleEmpty | channelRoleModerator | channelRoleEditor;
  export type channels$ChannelParticipants = channels$channelParticipants;
  export type channels$ChannelParticipant = channels$channelParticipant;
  export type help$TermsOfService = help$termsOfService;
  export type FoundGif = foundGif | foundGifCached;
  export type messages$FoundGifs = messages$foundGifs;
  export type messages$SavedGifs = messages$savedGifsNotModified | messages$savedGifs;
  export type InputBotInlineMessage =
    inputBotInlineMessageMediaAuto
    | inputBotInlineMessageText
    | inputBotInlineMessageMediaGeo
    | inputBotInlineMessageMediaVenue
    | inputBotInlineMessageMediaContact
    | inputBotInlineMessageGame;
  export type InputBotInlineResult =
    inputBotInlineResult
    | inputBotInlineResultPhoto
    | inputBotInlineResultDocument
    | inputBotInlineResultGame;
  export type BotInlineMessage =
    botInlineMessageMediaAuto
    | botInlineMessageText
    | botInlineMessageMediaGeo
    | botInlineMessageMediaVenue
    | botInlineMessageMediaContact;
  export type BotInlineResult = botInlineResult | botInlineMediaResult;
  export type messages$BotResults = messages$botResults;
  export type ExportedMessageLink = exportedMessageLink;
  export type MessageFwdHeader = messageFwdHeader;
  export type auth$CodeType = auth$codeTypeSms | auth$codeTypeCall | auth$codeTypeFlashCall;
  export type auth$SentCodeType =
    auth$sentCodeTypeApp
    | auth$sentCodeTypeSms
    | auth$sentCodeTypeCall
    | auth$sentCodeTypeFlashCall;
  export type messages$BotCallbackAnswer = messages$botCallbackAnswer;
  export type messages$MessageEditData = messages$messageEditData;
  export type InputBotInlineMessageID = inputBotInlineMessageID;
  export type InlineBotSwitchPM = inlineBotSwitchPM;
  export type messages$PeerDialogs = messages$peerDialogs;
  export type TopPeer = topPeer;
  export type TopPeerCategory =
    topPeerCategoryBotsPM
    | topPeerCategoryBotsInline
    | topPeerCategoryCorrespondents
    | topPeerCategoryGroups
    | topPeerCategoryChannels;
  export type TopPeerCategoryPeers = topPeerCategoryPeers;
  export type contacts$TopPeers = contacts$topPeersNotModified | contacts$topPeers;
  export type DraftMessage = draftMessageEmpty | draftMessage;
  export type messages$FeaturedStickers = messages$featuredStickersNotModified | messages$featuredStickers;
  export type messages$RecentStickers = messages$recentStickersNotModified | messages$recentStickers;
  export type messages$ArchivedStickers = messages$archivedStickers;
  export type messages$StickerSetInstallResult =
    messages$stickerSetInstallResultSuccess
    | messages$stickerSetInstallResultArchive;
  export type StickerSetCovered = stickerSetCovered | stickerSetMultiCovered;
  export type MaskCoords = maskCoords;
  export type InputStickeredMedia = inputStickeredMediaPhoto | inputStickeredMediaDocument;
  export type Game = game;
  export type InputGame = inputGameID | inputGameShortName;
  export type HighScore = highScore;
  export type messages$HighScores = messages$highScores;
  export type RichText =
    textEmpty
    | textPlain
    | textBold
    | textItalic
    | textUnderline
    | textStrike
    | textFixed
    | textUrl
    | textEmail
    | textConcat;
  export type PageBlock =
    pageBlockUnsupported
    | pageBlockTitle
    | pageBlockSubtitle
    | pageBlockAuthorDate
    | pageBlockHeader
    | pageBlockSubheader
    | pageBlockParagraph
    | pageBlockPreformatted
    | pageBlockFooter
    | pageBlockDivider
    | pageBlockAnchor
    | pageBlockList
    | pageBlockBlockquote
    | pageBlockPullquote
    | pageBlockPhoto
    | pageBlockVideo
    | pageBlockCover
    | pageBlockEmbed
    | pageBlockEmbedPost
    | pageBlockCollage
    | pageBlockSlideshow
    | pageBlockChannel;
  export type Page = pagePart | pageFull;
  export type PhoneCallDiscardReason =
    phoneCallDiscardReasonMissed
    | phoneCallDiscardReasonDisconnect
    | phoneCallDiscardReasonHangup
    | phoneCallDiscardReasonBusy;
  export type DataJSON = dataJSON;
  export type LabeledPrice = labeledPrice;
  export type Invoice = invoice;
  export type PaymentCharge = paymentCharge;
  export type PostAddress = postAddress;
  export type PaymentRequestedInfo = paymentRequestedInfo;
  export type PaymentSavedCredentials = paymentSavedCredentialsCard;
  export type WebDocument = webDocument;
  export type InputWebDocument = inputWebDocument;
  export type InputWebFileLocation = inputWebFileLocation;
  export type upload$WebFile = upload$webFile;
  export type payments$PaymentForm = payments$paymentForm;
  export type payments$ValidatedRequestedInfo = payments$validatedRequestedInfo;
  export type payments$PaymentResult = payments$paymentResult | payments$paymentVerficationNeeded;
  export type payments$PaymentReceipt = payments$paymentReceipt;
  export type payments$SavedInfo = payments$savedInfo;
  export type InputPaymentCredentials = inputPaymentCredentialsSaved | inputPaymentCredentials;
  export type account$TmpPassword = account$tmpPassword;
  export type ShippingOption = shippingOption;
  export type InputStickerSetItem = inputStickerSetItem;
  export type InputPhoneCall = inputPhoneCall;
  export type PhoneCall =
    phoneCallEmpty
    | phoneCallWaiting
    | phoneCallRequested
    | phoneCallAccepted
    | phoneCall
    | phoneCallDiscarded;
  export type PhoneConnection = phoneConnection;
  export type PhoneCallProtocol = phoneCallProtocol;
  export type phone$PhoneCall = phone$phoneCall;
  export type upload$CdnFile = upload$cdnFileReuploadNeeded | upload$cdnFile;
  export type CdnPublicKey = cdnPublicKey;
  export type CdnConfig = cdnConfig;
  export type LangPackString = langPackString | langPackStringPluralized | langPackStringDeleted;
  export type LangPackDifference = langPackDifference;
  export type LangPackLanguage = langPackLanguage;
  
  export type InvokeType = {
    
    (method: 'reqPq', params: {
      nonce: int128;
    }, options?: InvokeOptions): Promise<ResPQ>;
    
    (method: 'reqDHParams', params: {
      nonce: int128;
      serverNonce: int128;
      p: string;
      q: string;
      publicKeyFingerprint: long;
      encryptedData: string;
    }, options?: InvokeOptions): Promise<ServerDHParams>;
    
    (method: 'setClientDHParams', params: {
      nonce: int128;
      serverNonce: int128;
      encryptedData: string;
    }, options?: InvokeOptions): Promise<SetClientDHParamsAnswer>;
    
    (method: 'destroyAuthKey', params?: {}, options?: InvokeOptions): Promise<DestroyAuthKeyRes>;
    
    (method: 'rpcDropAnswer', params: {
      reqMsgId: long;
    }, options?: InvokeOptions): Promise<RpcDropAnswer>;
    
    (method: 'getFutureSalts', params: {
      num: int;
    }, options?: InvokeOptions): Promise<FutureSalts>;
    
    (method: 'ping', params: {
      pingId: long;
    }, options?: InvokeOptions): Promise<Pong>;
    
    (method: 'pingDelayDisconnect', params: {
      pingId: long;
      disconnectDelay: int;
    }, options?: InvokeOptions): Promise<Pong>;
    
    (method: 'destroySession', params: {
      sessionId: long;
    }, options?: InvokeOptions): Promise<DestroySessionRes>;
    
    (method: 'contest.saveDeveloperInfo', params: {
      vkId: int;
      name: string;
      phoneNumber: string;
      age: int;
      city: string;
    }, options?: InvokeOptions): Promise<boolean>;
    
    <X>(method: 'invokeAfterMsg', params: {
      msgId: long;
      query: X;
    }, options?: InvokeOptions): Promise<X>;
    
    <X>(method: 'invokeAfterMsgs', params: {
      msgIds: Vector<long>;
      query: X;
    }, options?: InvokeOptions): Promise<X>;
    
    <X>(method: 'initConnection', params: {
      apiId: int;
      deviceModel: string;
      systemVersion: string;
      appVersion: string;
      systemLangCode: string;
      langPack: string;
      langCode: string;
      query: X;
    }, options?: InvokeOptions): Promise<X>;
    
    <X>(method: 'invokeWithLayer', params: {
      layer: int;
      query: X;
    }, options?: InvokeOptions): Promise<X>;
    
    <X>(method: 'invokeWithoutUpdates', params: {
      query: X;
    }, options?: InvokeOptions): Promise<X>;
    
    (method: 'auth.checkPhone', params: {
      phoneNumber: string;
    }, options?: InvokeOptions): Promise<auth$CheckedPhone>;
    
    (method: 'auth.sendCode', params: {
      allowFlashcall?: true;
      phoneNumber: string;
      currentNumber?: boolean;
      apiId: int;
      apiHash: string;
    }, options?: InvokeOptions): Promise<auth$SentCode>;
    
    (method: 'auth.signUp', params: {
      phoneNumber: string;
      phoneCodeHash: string;
      phoneCode: string;
      firstName: string;
      lastName: string;
    }, options?: InvokeOptions): Promise<auth$Authorization>;
    
    (method: 'auth.signIn', params: {
      phoneNumber: string;
      phoneCodeHash: string;
      phoneCode: string;
    }, options?: InvokeOptions): Promise<auth$Authorization>;
    
    (method: 'auth.logOut', params?: {}, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'auth.resetAuthorizations', params?: {}, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'auth.sendInvites', params: {
      phoneNumbers: Vector<string>;
      message: string;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'auth.exportAuthorization', params: {
      dcId: int;
    }, options?: InvokeOptions): Promise<auth$ExportedAuthorization>;
    
    (method: 'auth.importAuthorization', params: {
      id: int;
      bytes: bytes;
    }, options?: InvokeOptions): Promise<auth$Authorization>;
    
    (method: 'auth.bindTempAuthKey', params: {
      permAuthKeyId: long;
      nonce: long;
      expiresAt: int;
      encryptedMessage: bytes;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'auth.importBotAuthorization', params: {
      apiId: int;
      apiHash: string;
      botAuthToken: string;
    }, options?: InvokeOptions): Promise<auth$Authorization>;
    
    (method: 'auth.checkPassword', params: {
      passwordHash: bytes;
    }, options?: InvokeOptions): Promise<auth$Authorization>;
    
    (method: 'auth.requestPasswordRecovery', params?: {}, options?: InvokeOptions): Promise<auth$PasswordRecovery>;
    
    (method: 'auth.recoverPassword', params: {
      code: string;
    }, options?: InvokeOptions): Promise<auth$Authorization>;
    
    (method: 'auth.resendCode', params: {
      phoneNumber: string;
      phoneCodeHash: string;
    }, options?: InvokeOptions): Promise<auth$SentCode>;
    
    (method: 'auth.cancelCode', params: {
      phoneNumber: string;
      phoneCodeHash: string;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'auth.dropTempAuthKeys', params: {
      exceptAuthKeys: Vector<long>;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'account.registerDevice', params: {
      tokenType: int;
      token: string;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'account.unregisterDevice', params: {
      tokenType: int;
      token: string;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'account.updateNotifySettings', params: {
      peer: InputNotifyPeer;
      settings: InputPeerNotifySettings;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'account.getNotifySettings', params: {
      peer: InputNotifyPeer;
    }, options?: InvokeOptions): Promise<PeerNotifySettings>;
    
    (method: 'account.resetNotifySettings', params?: {}, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'account.updateProfile', params: {
      firstName?: string;
      lastName?: string;
      about?: string;
    }, options?: InvokeOptions): Promise<User>;
    
    (method: 'account.updateStatus', params: {
      offline: boolean;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'account.getWallPapers', params?: {}, options?: InvokeOptions): Promise<Vector<WallPaper>>;
    
    (method: 'account.reportPeer', params: {
      peer: InputPeer;
      reason: ReportReason;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'account.checkUsername', params: {
      username: string;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'account.updateUsername', params: {
      username: string;
    }, options?: InvokeOptions): Promise<User>;
    
    (method: 'account.getPrivacy', params: {
      key: InputPrivacyKey;
    }, options?: InvokeOptions): Promise<account$PrivacyRules>;
    
    (method: 'account.setPrivacy', params: {
      key: InputPrivacyKey;
      rules: Vector<InputPrivacyRule>;
    }, options?: InvokeOptions): Promise<account$PrivacyRules>;
    
    (method: 'account.deleteAccount', params: {
      reason: string;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'account.getAccountTTL', params?: {}, options?: InvokeOptions): Promise<AccountDaysTTL>;
    
    (method: 'account.setAccountTTL', params: {
      ttl: AccountDaysTTL;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'account.sendChangePhoneCode', params: {
      allowFlashcall?: true;
      phoneNumber: string;
      currentNumber?: boolean;
    }, options?: InvokeOptions): Promise<auth$SentCode>;
    
    (method: 'account.changePhone', params: {
      phoneNumber: string;
      phoneCodeHash: string;
      phoneCode: string;
    }, options?: InvokeOptions): Promise<User>;
    
    (method: 'account.updateDeviceLocked', params: {
      period: int;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'account.getAuthorizations', params?: {}, options?: InvokeOptions): Promise<account$Authorizations>;
    
    (method: 'account.resetAuthorization', params: {
      hash: long;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'account.getPassword', params?: {}, options?: InvokeOptions): Promise<account$Password>;
    
    (method: 'account.getPasswordSettings', params: {
      currentPasswordHash: bytes;
    }, options?: InvokeOptions): Promise<account$PasswordSettings>;
    
    (method: 'account.updatePasswordSettings', params: {
      currentPasswordHash: bytes;
      newSettings: account$PasswordInputSettings;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'account.sendConfirmPhoneCode', params: {
      allowFlashcall?: true;
      hash: string;
      currentNumber?: boolean;
    }, options?: InvokeOptions): Promise<auth$SentCode>;
    
    (method: 'account.confirmPhone', params: {
      phoneCodeHash: string;
      phoneCode: string;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'account.getTmpPassword', params: {
      passwordHash: bytes;
      period: int;
    }, options?: InvokeOptions): Promise<account$TmpPassword>;
    
    (method: 'users.getUsers', params: {
      id: Vector<InputUser>;
    }, options?: InvokeOptions): Promise<Vector<User>>;
    
    (method: 'users.getFullUser', params: {
      id: InputUser;
    }, options?: InvokeOptions): Promise<UserFull>;
    
    (method: 'contacts.getStatuses', params?: {}, options?: InvokeOptions): Promise<Vector<ContactStatus>>;
    
    (method: 'contacts.getContacts', params: {
      hash: string;
    }, options?: InvokeOptions): Promise<contacts$Contacts>;
    
    (method: 'contacts.importContacts', params: {
      contacts: Vector<InputContact>;
      replace: boolean;
    }, options?: InvokeOptions): Promise<contacts$ImportedContacts>;
    
    (method: 'contacts.deleteContact', params: {
      id: InputUser;
    }, options?: InvokeOptions): Promise<contacts$Link>;
    
    (method: 'contacts.deleteContacts', params: {
      id: Vector<InputUser>;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'contacts.block', params: {
      id: InputUser;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'contacts.unblock', params: {
      id: InputUser;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'contacts.getBlocked', params: {
      offset: int;
      limit: int;
    }, options?: InvokeOptions): Promise<contacts$Blocked>;
    
    (method: 'contacts.exportCard', params?: {}, options?: InvokeOptions): Promise<Vector<int>>;
    
    (method: 'contacts.importCard', params: {
      exportCard: Vector<int>;
    }, options?: InvokeOptions): Promise<User>;
    
    (method: 'contacts.search', params: {
      q: string;
      limit: int;
    }, options?: InvokeOptions): Promise<contacts$Found>;
    
    (method: 'contacts.resolveUsername', params: {
      username: string;
    }, options?: InvokeOptions): Promise<contacts$ResolvedPeer>;
    
    (method: 'contacts.getTopPeers', params: {
      correspondents?: true;
      botsPm?: true;
      botsInline?: true;
      groups?: true;
      channels?: true;
      offset: int;
      limit: int;
      hash: int;
    }, options?: InvokeOptions): Promise<contacts$TopPeers>;
    
    (method: 'contacts.resetTopPeerRating', params: {
      category: TopPeerCategory;
      peer: InputPeer;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.getMessages', params: {
      id: Vector<int>;
    }, options?: InvokeOptions): Promise<messages$Messages>;
    
    (method: 'messages.getDialogs', params: {
      excludePinned?: true;
      offsetDate: int;
      offsetId: int;
      offsetPeer: InputPeer;
      limit: int;
    }, options?: InvokeOptions): Promise<messages$Dialogs>;
    
    (method: 'messages.getHistory', params: {
      peer: InputPeer;
      offsetId: int;
      offsetDate: int;
      addOffset: int;
      limit: int;
      maxId: int;
      minId: int;
    }, options?: InvokeOptions): Promise<messages$Messages>;
    
    (method: 'messages.search', params: {
      peer: InputPeer;
      q: string;
      filter: MessagesFilter;
      minDate: int;
      maxDate: int;
      offset: int;
      maxId: int;
      limit: int;
    }, options?: InvokeOptions): Promise<messages$Messages>;
    
    (method: 'messages.readHistory', params: {
      peer: InputPeer;
      maxId: int;
    }, options?: InvokeOptions): Promise<messages$AffectedMessages>;
    
    (method: 'messages.deleteHistory', params: {
      justClear?: true;
      peer: InputPeer;
      maxId: int;
    }, options?: InvokeOptions): Promise<messages$AffectedHistory>;
    
    (method: 'messages.deleteMessages', params: {
      revoke?: true;
      id: Vector<int>;
    }, options?: InvokeOptions): Promise<messages$AffectedMessages>;
    
    (method: 'messages.receivedMessages', params: {
      maxId: int;
    }, options?: InvokeOptions): Promise<Vector<ReceivedNotifyMessage>>;
    
    (method: 'messages.setTyping', params: {
      peer: InputPeer;
      action: SendMessageAction;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.sendMessage', params: {
      noWebpage?: true;
      silent?: true;
      background?: true;
      clearDraft?: true;
      peer: InputPeer;
      replyToMsgId?: int;
      message: string;
      randomId: long;
      replyMarkup?: ReplyMarkup;
      entities?: Vector<MessageEntity>;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'messages.sendMedia', params: {
      silent?: true;
      background?: true;
      clearDraft?: true;
      peer: InputPeer;
      replyToMsgId?: int;
      media: InputMedia;
      randomId: long;
      replyMarkup?: ReplyMarkup;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'messages.forwardMessages', params: {
      silent?: true;
      background?: true;
      withMyScore?: true;
      fromPeer: InputPeer;
      id: Vector<int>;
      randomId: Vector<long>;
      toPeer: InputPeer;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'messages.reportSpam', params: {
      peer: InputPeer;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.hideReportSpam', params: {
      peer: InputPeer;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.getPeerSettings', params: {
      peer: InputPeer;
    }, options?: InvokeOptions): Promise<PeerSettings>;
    
    (method: 'messages.getChats', params: {
      id: Vector<int>;
    }, options?: InvokeOptions): Promise<messages$Chats>;
    
    (method: 'messages.getFullChat', params: {
      chatId: int;
    }, options?: InvokeOptions): Promise<messages$ChatFull>;
    
    (method: 'messages.editChatTitle', params: {
      chatId: int;
      title: string;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'messages.editChatPhoto', params: {
      chatId: int;
      photo: InputChatPhoto;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'messages.addChatUser', params: {
      chatId: int;
      userId: InputUser;
      fwdLimit: int;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'messages.deleteChatUser', params: {
      chatId: int;
      userId: InputUser;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'messages.createChat', params: {
      users: Vector<InputUser>;
      title: string;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'messages.forwardMessage', params: {
      peer: InputPeer;
      id: int;
      randomId: long;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'messages.getDhConfig', params: {
      version: int;
      randomLength: int;
    }, options?: InvokeOptions): Promise<messages$DhConfig>;
    
    (method: 'messages.requestEncryption', params: {
      userId: InputUser;
      randomId: int;
      gA: bytes;
    }, options?: InvokeOptions): Promise<EncryptedChat>;
    
    (method: 'messages.acceptEncryption', params: {
      peer: InputEncryptedChat;
      gB: bytes;
      keyFingerprint: long;
    }, options?: InvokeOptions): Promise<EncryptedChat>;
    
    (method: 'messages.discardEncryption', params: {
      chatId: int;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.setEncryptedTyping', params: {
      peer: InputEncryptedChat;
      typing: boolean;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.readEncryptedHistory', params: {
      peer: InputEncryptedChat;
      maxDate: int;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.sendEncrypted', params: {
      peer: InputEncryptedChat;
      randomId: long;
      data: bytes;
    }, options?: InvokeOptions): Promise<messages$SentEncryptedMessage>;
    
    (method: 'messages.sendEncryptedFile', params: {
      peer: InputEncryptedChat;
      randomId: long;
      data: bytes;
      file: InputEncryptedFile;
    }, options?: InvokeOptions): Promise<messages$SentEncryptedMessage>;
    
    (method: 'messages.sendEncryptedService', params: {
      peer: InputEncryptedChat;
      randomId: long;
      data: bytes;
    }, options?: InvokeOptions): Promise<messages$SentEncryptedMessage>;
    
    (method: 'messages.receivedQueue', params: {
      maxQts: int;
    }, options?: InvokeOptions): Promise<Vector<long>>;
    
    (method: 'messages.reportEncryptedSpam', params: {
      peer: InputEncryptedChat;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.readMessageContents', params: {
      id: Vector<int>;
    }, options?: InvokeOptions): Promise<messages$AffectedMessages>;
    
    (method: 'messages.getAllStickers', params: {
      hash: int;
    }, options?: InvokeOptions): Promise<messages$AllStickers>;
    
    (method: 'messages.getWebPagePreview', params: {
      message: string;
    }, options?: InvokeOptions): Promise<MessageMedia>;
    
    (method: 'messages.exportChatInvite', params: {
      chatId: int;
    }, options?: InvokeOptions): Promise<ExportedChatInvite>;
    
    (method: 'messages.checkChatInvite', params: {
      hash: string;
    }, options?: InvokeOptions): Promise<ChatInvite>;
    
    (method: 'messages.importChatInvite', params: {
      hash: string;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'messages.getStickerSet', params: {
      stickerset: InputStickerSet;
    }, options?: InvokeOptions): Promise<messages$StickerSet>;
    
    (method: 'messages.installStickerSet', params: {
      stickerset: InputStickerSet;
      archived: boolean;
    }, options?: InvokeOptions): Promise<messages$StickerSetInstallResult>;
    
    (method: 'messages.uninstallStickerSet', params: {
      stickerset: InputStickerSet;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.startBot', params: {
      bot: InputUser;
      peer: InputPeer;
      randomId: long;
      startParam: string;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'messages.getMessagesViews', params: {
      peer: InputPeer;
      id: Vector<int>;
      increment: boolean;
    }, options?: InvokeOptions): Promise<Vector<int>>;
    
    (method: 'messages.toggleChatAdmins', params: {
      chatId: int;
      enabled: boolean;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'messages.editChatAdmin', params: {
      chatId: int;
      userId: InputUser;
      isAdmin: boolean;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.migrateChat', params: {
      chatId: int;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'messages.searchGlobal', params: {
      q: string;
      offsetDate: int;
      offsetPeer: InputPeer;
      offsetId: int;
      limit: int;
    }, options?: InvokeOptions): Promise<messages$Messages>;
    
    (method: 'messages.reorderStickerSets', params: {
      masks?: true;
      order: Vector<long>;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.getDocumentByHash', params: {
      sha256: bytes;
      size: int;
      mimeType: string;
    }, options?: InvokeOptions): Promise<Document>;
    
    (method: 'messages.searchGifs', params: {
      q: string;
      offset: int;
    }, options?: InvokeOptions): Promise<messages$FoundGifs>;
    
    (method: 'messages.getSavedGifs', params: {
      hash: int;
    }, options?: InvokeOptions): Promise<messages$SavedGifs>;
    
    (method: 'messages.saveGif', params: {
      id: InputDocument;
      unsave: boolean;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.getInlineBotResults', params: {
      bot: InputUser;
      peer: InputPeer;
      geoPoint?: InputGeoPoint;
      query: string;
      offset: string;
    }, options?: InvokeOptions): Promise<messages$BotResults>;
    
    (method: 'messages.setInlineBotResults', params: {
      gallery?: true;
      private?: true;
      queryId: long;
      results: Vector<InputBotInlineResult>;
      cacheTime: int;
      nextOffset?: string;
      switchPm?: InlineBotSwitchPM;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.sendInlineBotResult', params: {
      silent?: true;
      background?: true;
      clearDraft?: true;
      peer: InputPeer;
      replyToMsgId?: int;
      randomId: long;
      queryId: long;
      id: string;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'messages.getMessageEditData', params: {
      peer: InputPeer;
      id: int;
    }, options?: InvokeOptions): Promise<messages$MessageEditData>;
    
    (method: 'messages.editMessage', params: {
      noWebpage?: true;
      peer: InputPeer;
      id: int;
      message?: string;
      replyMarkup?: ReplyMarkup;
      entities?: Vector<MessageEntity>;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'messages.editInlineBotMessage', params: {
      noWebpage?: true;
      id: InputBotInlineMessageID;
      message?: string;
      replyMarkup?: ReplyMarkup;
      entities?: Vector<MessageEntity>;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.getBotCallbackAnswer', params: {
      game?: true;
      peer: InputPeer;
      msgId: int;
      data?: bytes;
    }, options?: InvokeOptions): Promise<messages$BotCallbackAnswer>;
    
    (method: 'messages.setBotCallbackAnswer', params: {
      alert?: true;
      queryId: long;
      message?: string;
      url?: string;
      cacheTime: int;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.getPeerDialogs', params: {
      peers: Vector<InputPeer>;
    }, options?: InvokeOptions): Promise<messages$PeerDialogs>;
    
    (method: 'messages.saveDraft', params: {
      noWebpage?: true;
      replyToMsgId?: int;
      peer: InputPeer;
      message: string;
      entities?: Vector<MessageEntity>;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.getAllDrafts', params?: {}, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'messages.getFeaturedStickers', params: {
      hash: int;
    }, options?: InvokeOptions): Promise<messages$FeaturedStickers>;
    
    (method: 'messages.readFeaturedStickers', params: {
      id: Vector<long>;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.getRecentStickers', params: {
      attached?: true;
      hash: int;
    }, options?: InvokeOptions): Promise<messages$RecentStickers>;
    
    (method: 'messages.saveRecentSticker', params: {
      attached?: true;
      id: InputDocument;
      unsave: boolean;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.clearRecentStickers', params: {
      attached?: true;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.getArchivedStickers', params: {
      masks?: true;
      offsetId: long;
      limit: int;
    }, options?: InvokeOptions): Promise<messages$ArchivedStickers>;
    
    (method: 'messages.getMaskStickers', params: {
      hash: int;
    }, options?: InvokeOptions): Promise<messages$AllStickers>;
    
    (method: 'messages.getAttachedStickers', params: {
      media: InputStickeredMedia;
    }, options?: InvokeOptions): Promise<Vector<StickerSetCovered>>;
    
    (method: 'messages.setGameScore', params: {
      editMessage?: true;
      force?: true;
      peer: InputPeer;
      id: int;
      userId: InputUser;
      score: int;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'messages.setInlineGameScore', params: {
      editMessage?: true;
      force?: true;
      id: InputBotInlineMessageID;
      userId: InputUser;
      score: int;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.getGameHighScores', params: {
      peer: InputPeer;
      id: int;
      userId: InputUser;
    }, options?: InvokeOptions): Promise<messages$HighScores>;
    
    (method: 'messages.getInlineGameHighScores', params: {
      id: InputBotInlineMessageID;
      userId: InputUser;
    }, options?: InvokeOptions): Promise<messages$HighScores>;
    
    (method: 'messages.getCommonChats', params: {
      userId: InputUser;
      maxId: int;
      limit: int;
    }, options?: InvokeOptions): Promise<messages$Chats>;
    
    (method: 'messages.getAllChats', params: {
      exceptIds: Vector<int>;
    }, options?: InvokeOptions): Promise<messages$Chats>;
    
    (method: 'messages.getWebPage', params: {
      url: string;
      hash: int;
    }, options?: InvokeOptions): Promise<WebPage>;
    
    (method: 'messages.toggleDialogPin', params: {
      pinned?: true;
      peer: InputPeer;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.reorderPinnedDialogs', params: {
      force?: true;
      order: Vector<InputPeer>;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.getPinnedDialogs', params?: {}, options?: InvokeOptions): Promise<messages$PeerDialogs>;
    
    (method: 'messages.setBotShippingResults', params: {
      queryId: long;
      error?: string;
      shippingOptions?: Vector<ShippingOption>;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.setBotPrecheckoutResults', params: {
      success?: true;
      queryId: long;
      error?: string;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'messages.uploadMedia', params: {
      peer: InputPeer;
      media: InputMedia;
    }, options?: InvokeOptions): Promise<MessageMedia>;
    
    (method: 'updates.getState', params?: {}, options?: InvokeOptions): Promise<updates$State>;
    
    (method: 'updates.getDifference', params: {
      pts: int;
      ptsTotalLimit?: int;
      date: int;
      qts: int;
    }, options?: InvokeOptions): Promise<updates$Difference>;
    
    (method: 'updates.getChannelDifference', params: {
      force?: true;
      channel: InputChannel;
      filter: ChannelMessagesFilter;
      pts: int;
      limit: int;
    }, options?: InvokeOptions): Promise<updates$ChannelDifference>;
    
    (method: 'photos.updateProfilePhoto', params: {
      id: InputPhoto;
    }, options?: InvokeOptions): Promise<UserProfilePhoto>;
    
    (method: 'photos.uploadProfilePhoto', params: {
      file: InputFile;
    }, options?: InvokeOptions): Promise<photos$Photo>;
    
    (method: 'photos.deletePhotos', params: {
      id: Vector<InputPhoto>;
    }, options?: InvokeOptions): Promise<Vector<long>>;
    
    (method: 'photos.getUserPhotos', params: {
      userId: InputUser;
      offset: int;
      maxId: long;
      limit: int;
    }, options?: InvokeOptions): Promise<photos$Photos>;
    
    (method: 'upload.saveFilePart', params: {
      fileId: long;
      filePart: int;
      bytes: bytes;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'upload.getFile', params: {
      location: InputFileLocation;
      offset: int;
      limit: int;
    }, options?: InvokeOptions): Promise<upload$File>;
    
    (method: 'upload.saveBigFilePart', params: {
      fileId: long;
      filePart: int;
      fileTotalParts: int;
      bytes: bytes;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'upload.getWebFile', params: {
      location: InputWebFileLocation;
      offset: int;
      limit: int;
    }, options?: InvokeOptions): Promise<upload$WebFile>;
    
    (method: 'upload.getCdnFile', params: {
      fileToken: bytes;
      offset: int;
      limit: int;
    }, options?: InvokeOptions): Promise<upload$CdnFile>;
    
    (method: 'upload.reuploadCdnFile', params: {
      fileToken: bytes;
      requestToken: bytes;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'help.getConfig', params?: {}, options?: InvokeOptions): Promise<Config>;
    
    (method: 'help.getNearestDc', params?: {}, options?: InvokeOptions): Promise<NearestDc>;
    
    (method: 'help.getAppUpdate', params?: {}, options?: InvokeOptions): Promise<help$AppUpdate>;
    
    (method: 'help.saveAppLog', params: {
      events: Vector<InputAppEvent>;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'help.getInviteText', params?: {}, options?: InvokeOptions): Promise<help$InviteText>;
    
    (method: 'help.getSupport', params?: {}, options?: InvokeOptions): Promise<help$Support>;
    
    (method: 'help.getAppChangelog', params: {
      prevAppVersion: string;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'help.getTermsOfService', params?: {}, options?: InvokeOptions): Promise<help$TermsOfService>;
    
    (method: 'help.setBotUpdatesStatus', params: {
      pendingUpdatesCount: int;
      message: string;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'help.getCdnConfig', params?: {}, options?: InvokeOptions): Promise<CdnConfig>;
    
    (method: 'channels.readHistory', params: {
      channel: InputChannel;
      maxId: int;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'channels.deleteMessages', params: {
      channel: InputChannel;
      id: Vector<int>;
    }, options?: InvokeOptions): Promise<messages$AffectedMessages>;
    
    (method: 'channels.deleteUserHistory', params: {
      channel: InputChannel;
      userId: InputUser;
    }, options?: InvokeOptions): Promise<messages$AffectedHistory>;
    
    (method: 'channels.reportSpam', params: {
      channel: InputChannel;
      userId: InputUser;
      id: Vector<int>;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'channels.getMessages', params: {
      channel: InputChannel;
      id: Vector<int>;
    }, options?: InvokeOptions): Promise<messages$Messages>;
    
    (method: 'channels.getParticipants', params: {
      channel: InputChannel;
      filter: ChannelParticipantsFilter;
      offset: int;
      limit: int;
    }, options?: InvokeOptions): Promise<channels$ChannelParticipants>;
    
    (method: 'channels.getParticipant', params: {
      channel: InputChannel;
      userId: InputUser;
    }, options?: InvokeOptions): Promise<channels$ChannelParticipant>;
    
    (method: 'channels.getChannels', params: {
      id: Vector<InputChannel>;
    }, options?: InvokeOptions): Promise<messages$Chats>;
    
    (method: 'channels.getFullChannel', params: {
      channel: InputChannel;
    }, options?: InvokeOptions): Promise<messages$ChatFull>;
    
    (method: 'channels.createChannel', params: {
      broadcast?: true;
      megagroup?: true;
      title: string;
      about: string;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'channels.editAbout', params: {
      channel: InputChannel;
      about: string;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'channels.editAdmin', params: {
      channel: InputChannel;
      userId: InputUser;
      role: ChannelParticipantRole;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'channels.editTitle', params: {
      channel: InputChannel;
      title: string;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'channels.editPhoto', params: {
      channel: InputChannel;
      photo: InputChatPhoto;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'channels.checkUsername', params: {
      channel: InputChannel;
      username: string;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'channels.updateUsername', params: {
      channel: InputChannel;
      username: string;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'channels.joinChannel', params: {
      channel: InputChannel;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'channels.leaveChannel', params: {
      channel: InputChannel;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'channels.inviteToChannel', params: {
      channel: InputChannel;
      users: Vector<InputUser>;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'channels.kickFromChannel', params: {
      channel: InputChannel;
      userId: InputUser;
      kicked: boolean;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'channels.exportInvite', params: {
      channel: InputChannel;
    }, options?: InvokeOptions): Promise<ExportedChatInvite>;
    
    (method: 'channels.deleteChannel', params: {
      channel: InputChannel;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'channels.toggleInvites', params: {
      channel: InputChannel;
      enabled: boolean;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'channels.exportMessageLink', params: {
      channel: InputChannel;
      id: int;
    }, options?: InvokeOptions): Promise<ExportedMessageLink>;
    
    (method: 'channels.toggleSignatures', params: {
      channel: InputChannel;
      enabled: boolean;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'channels.updatePinnedMessage', params: {
      silent?: true;
      channel: InputChannel;
      id: int;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'channels.getAdminedPublicChannels', params?: {}, options?: InvokeOptions): Promise<messages$Chats>;
    
    (method: 'bots.sendCustomRequest', params: {
      customMethod: string;
      params: DataJSON;
    }, options?: InvokeOptions): Promise<DataJSON>;
    
    (method: 'bots.answerWebhookJSONQuery', params: {
      queryId: long;
      data: DataJSON;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'payments.getPaymentForm', params: {
      msgId: int;
    }, options?: InvokeOptions): Promise<payments$PaymentForm>;
    
    (method: 'payments.getPaymentReceipt', params: {
      msgId: int;
    }, options?: InvokeOptions): Promise<payments$PaymentReceipt>;
    
    (method: 'payments.validateRequestedInfo', params: {
      save?: true;
      msgId: int;
      info: PaymentRequestedInfo;
    }, options?: InvokeOptions): Promise<payments$ValidatedRequestedInfo>;
    
    (method: 'payments.sendPaymentForm', params: {
      msgId: int;
      requestedInfoId?: string;
      shippingOptionId?: string;
      credentials: InputPaymentCredentials;
    }, options?: InvokeOptions): Promise<payments$PaymentResult>;
    
    (method: 'payments.getSavedInfo', params?: {}, options?: InvokeOptions): Promise<payments$SavedInfo>;
    
    (method: 'payments.clearSavedInfo', params: {
      credentials?: true;
      info?: true;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'stickers.createStickerSet', params: {
      masks?: true;
      userId: InputUser;
      title: string;
      shortName: string;
      stickers: Vector<InputStickerSetItem>;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'phone.getCallConfig', params?: {}, options?: InvokeOptions): Promise<DataJSON>;
    
    (method: 'phone.requestCall', params: {
      userId: InputUser;
      randomId: int;
      gAHash: bytes;
      protocol: PhoneCallProtocol;
    }, options?: InvokeOptions): Promise<phone$PhoneCall>;
    
    (method: 'phone.acceptCall', params: {
      peer: InputPhoneCall;
      gB: bytes;
      protocol: PhoneCallProtocol;
    }, options?: InvokeOptions): Promise<phone$PhoneCall>;
    
    (method: 'phone.confirmCall', params: {
      peer: InputPhoneCall;
      gA: bytes;
      keyFingerprint: long;
      protocol: PhoneCallProtocol;
    }, options?: InvokeOptions): Promise<phone$PhoneCall>;
    
    (method: 'phone.receivedCall', params: {
      peer: InputPhoneCall;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'phone.discardCall', params: {
      peer: InputPhoneCall;
      duration: int;
      reason: PhoneCallDiscardReason;
      connectionId: long;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'phone.setCallRating', params: {
      peer: InputPhoneCall;
      rating: int;
      comment: string;
    }, options?: InvokeOptions): Promise<Updates>;
    
    (method: 'phone.saveCallDebug', params: {
      peer: InputPhoneCall;
      debug: DataJSON;
    }, options?: InvokeOptions): Promise<boolean>;
    
    (method: 'langpack.getLangPack', params: {
      langCode: string;
    }, options?: InvokeOptions): Promise<LangPackDifference>;
    
    (method: 'langpack.getStrings', params: {
      langCode: string;
      keys: Vector<string>;
    }, options?: InvokeOptions): Promise<Vector<LangPackString>>;
    
    (method: 'langpack.getDifference', params: {
      fromVersion: int;
    }, options?: InvokeOptions): Promise<LangPackDifference>;
    
    (method: 'langpack.getLanguages', params?: {}, options?: InvokeOptions): Promise<Vector<LangPackLanguage>>;
  };
}
