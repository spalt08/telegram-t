const types = require('./types/index')
const functions = require('./functions/index')
const custom = require('./custom/index')
const patched = null
const { TLObject, TLRequest } = require('./tlobject')
module.exports = {
    types,
    functions,
    custom,
    patched,
    TLObject,
    TLRequest,
}
