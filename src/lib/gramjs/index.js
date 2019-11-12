require('regenerator-runtime/runtime')
require('regenerator-runtime')

const TelegramClient = require('./client/TelegramClient')
const connection = require('./network/index')
const tl = require('./tl/index')
const version = require('./Version')
const events = require('./events/index')
const utils = require('./Utils')
const errors = require('./errors/index')
const session = require('./sessions/index')

module.exports = {
    TelegramClient, session, connection,
    tl, version, events, utils, errors,
}
