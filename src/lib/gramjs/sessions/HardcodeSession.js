const MemorySession = require('./Memory')
const AuthKey = require('../crypto/AuthKey')
const utils = require('../Utils')

const KEYS = JSON.parse(atob('eyJtYWluRGNJZCI6Miwia2V5cyI6eyIxIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMTY5LDU3LDIyNywxMTYsMjQxLDEyMywyMjMsMTIwLDE5OCwxOTcsNjgsMzksOTQsMjExLDIzMiw4MCwxMjcsMjMxLDUyLDY3LDIyOSw5OSw3MSwxNjEsMTQxLDc5LDEwNCw1OCwxMjEsMTAyLDEsMjM4LDExMiwxMjAsMTM2LDU1LDgyLDIxMCwxMTIsMTg0LDE0NSwxMDIsMTQ3LDY0LDIyNywyMiw1NywzOSwxNTIsMjA0LDIxNCw1OSwzMSwyMDEsNzAsNDQsMjIsMTk4LDE5MiwxNTQsMTI0LDEyMCw2MSwxMjMsMTM5LDE3Myw2MywzNSwxMDksMTYwLDIwLDU5LDE5NiwxODksNDAsMjcsMTM2LDUzLDEyOCwxODEsMTMyLDg5LDIwMCwyMjUsMTYzLDI0OCwyOSwyMjAsMTUwLDE2NCwxMjEsNjEsNTgsNDgsNDQsMjMxLDIxNCw2Nyw1MCwxODIsNDIsMTQwLDIzMCwyNiwxMTcsMTkyLDE3OCwyMDksMTQzLDIyNCwxMTgsMTA2LDIzMCwzMiwyMSwxOSw3NCw4NiwxLDExOSwyMywyNTMsMTI0LDMyLDU5LDIwMCwyMDgsMTY2LDM0LDI1MSwyNDQsNTgsNzEsMTU3LDk4LDU4LDEyOSw2NCw0OCw0MywzNywyMjgsNjAsMjU1LDEzNywyNDYsODAsMTg3LDkzLDE0LDY5LDIxMywyNDEsMTQzLDE0MywyMTEsMjI0LDMxLDE5OCw3Niw4OSw5NCwxOTgsODcsMTk5LDk2LDEyMSw1NSw2MSwxODUsMjM0LDE0OSwyMSwyNDgsMTAzLDE0Miw2MywzMSw0NSwyMjAsMjQ5LDE1MSwyMjMsMTE0LDQ4LDE1MiwzNyw5LDgyLDIzMyw2NSwxMjcsNjgsMjAsMjM3LDE2Miw4MSw0OSw1NCwxNjMsMzgsMTkxLDExNiwxMDEsODIsMTcsMTc3LDQ1LDYxLDI4LDE4OCwxMDAsNiwyMzIsMTcxLDk3LDE3LDEyLDIzOSw3Nyw2MCwxMiwyMTMsMzMsMjI5LDIyOSwxOSwxNDUsMTU1LDExMywyNTEsMjM1LDE5MiwxLDk2LDI0NiwxMzAsMjU0LDE5MCwyMTYsMTgyLDIxNiwxNzEsMzMsMTMzLDEwOSwyMTMsMTAxLDE2LDIyNywxNDUsMTU3LDkwLDEzOSwxNjUsODhdfSwiMiI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzEyMCwxMzksNjQsMyw3MSwxNjAsMTY1LDkwLDE4MiwxOTYsMjIwLDIyMiw2Miw4OSwyMTEsNzYsMjIxLDIxNiw2NSwzOSw0NCwxNTEsMTY3LDE0MywyMDIsMTYwLDE1NCwxMTgsOSwzNiw5OSwxNjgsMjAzLDEyNywyMzksOTYsMjAxLDE4MSw3MiwyNTQsNDMsOTksOTYsMTk2LDEwMSwxMjMsMjQsOTUsMTM3LDExMiwxNjksMTUyLDIyNiwxMDQsMTgxLDcyLDI0MSwyMzQsMTQyLDQsMTUsMjAsMTQsMjEyLDUwLDEyNCw1MiwxMDUsMjQsMjMyLDIzOCwxODYsMjE0LDIyMiwxMzAsMTM0LDUwLDU4LDIyMiwxODcsNjYsMTI2LDIwNCwxNDQsMTI4LDQ5LDI0OCwyNDYsMjI2LDE3NiwxNTIsMjE4LDQzLDQ4LDIyMywxMzQsODUsNjksMTIzLDExNywxNjUsMTksMTM4LDE1NSwxNzksMjAxLDE3NSwyMDAsMzUsNjgsNDIsMjA4LDIxMCw0MSwxODAsMjAwLDIyNiw4Niw4MiwxMTUsMTI4LDE4MywxNjksMTAxLDIwNCwyMTAsNTIsMTA3LDEyNCwxMTcsODYsODUsMTQwLDIzNCw4LDIzMCwxNDksODgsMTU5LDEzOSwxMTUsMTg4LDExMCwxNDMsOTUsMTU3LDIxMCwxMTYsMTUxLDE2OCw1NywxMzIsNDgsMTg5LDIwOSw0MCwxNzEsMTczLDE0NCwzMiwxOSwyMSw4NCw3NiwxODcsMTEsNjQsMTczLDI1NCwxNTEsNzgsNTcsMjMwLDE0NSwxNjUsMTYyLDIzOCwxMiw0NiwxMzgsNjUsOTAsMTQxLDQzLDIxOSwxMTQsMTgwLDE1MiwxOTIsMTkxLDYsOTgsNzIsOTQsODksMjUzLDE4LDEwMywxNCwxNjUsMTg4LDkwLDEyLDE4MiwxNzAsNzUsMjAzLDE5LDI2LDIxNSwyNDYsMTMwLDE4NiwxNDEsNDgsMTczLDIxNiw2Myw1OSwyMTQsMTQ2LDE1NiwxMjUsMzgsMTcyLDkxLDUzLDE0MCwyMzQsODQsMjM0LDE2NCw0NSwxMTUsMjQsMTIwLDE5LDIyNCw5LDE3Myw2LDIxLDQ1LDI0MSwyMiw0MSwxNjgsMjIsNDIsMjA1LDE2OCw4MiwxNjMsMjQ2LDExMCwyMDFdfSwiNCI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzE5NywxOCwyMzIsMTIsMjMyLDE5NCw5MCw1MiwxMDcsMTEyLDEyMCw1MCwxOTcsOTIsNjgsOTYsMTQyLDEwLDE1OCwyNiwyMTEsMTI0LDE2Myw3MCw0NywxMzMsMTc4LDIxMSwxOTYsMjM0LDE2MiwyMzcsOTIsNDQsMjQwLDk0LDEzNiw5OCwzNywxNjEsMTQ2LDcsMTczLDE4OSwyOCwxNjQsMTkxLDIwNyw0Myw4OCwxMDMsNjgsNzUsMjQzLDE4NywyMCwxNzMsMjcsNSwxMjgsOTMsNCw4Miw2NiwyMzgsMjM0LDAsOSw5NywyMTMsNDEsMjQ4LDIwLDE3NywzMiw5MCw4NywxMDksMTg0LDIyNCwxNzQsMTg2LDIwMSwxNDEsMjM5LDg1LDEwLDI0OCwyMzAsNTQsMTI1LDk3LDExOCw2NSwxNTgsNDEsMTk1LDQxLDEzLDkxLDIzMSwxMDksMTE3LDExLDE1NywxMywxMDgsNzIsMTE1LDE1Niw4LDksMTY3LDMxLDI0Miw3MSw1Miw3NSwxNTQsOTQsMTM5LDIwNSwxODAsNDcsNDMsODQsMjAwLDE1OCwxNDUsMTgzLDI0LDE2NywxOTksMjQ5LDIyOCwxNzcsMTMyLDE3NywxNyw5NywxMzYsMTEzLDE1NywyMTIsODIsNzIsODcsMTUwLDI1MiwxMzYsMTUzLDMyLDI0LDIxNiw4NSwxMDUsMjA1LDEzMiw0Niw1NCwxNjAsMjM4LDgyLDgwLDIyMSw2MywyNiwzMSw5MSwyMDIsMjE4LDE0NSwxNCw5OCwxMjksNjEsMTk1LDMzLDIwOSw0Myw4MiwxMzUsNTMsMTkwLDExMiwzMCwxNzEsODEsOTIsNDMsMyw1NCwxMzAsMjMsNDMsMjQ2LDE3NiwxMzQsMTQsMjMzLDExOCwxMTEsMTQxLDE0MiwxODMsMTA4LDE5NiwxODMsMTk2LDIwOSwxMCwxOTksOTMsOCwxNTgsMjEyLDIxMiwyMjUsNjUsMjI0LDIxNSw4NiwyMDksMTE5LDE3NCw1LDY5LDE3NCw1MywyNDEsMTgxLDI1MCwyNTEsMTY2LDEyOCwxMiwxNzAsMjQ2LDE4OCwxNzAsMjA5LDMzLDc2LDQxLDE1OSwyNywzNSwyMDYsMTc4LDIxMCwxNzMsMTMxLDgwLDk1LDg3LDExN119fSwiaGFzaGVzIjp7IjEiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOlszNiwxNDcsMjIwLDcyLDIwNywxNjMsMTc0LDQ0LDExNSwzMCwzNCwxNzMsMTA5LDcsMTMxLDE4MSwxMjgsMTE4LDE4OSwxNTRdfSwiMiI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzEyOCwxNDUsOTMsMTczLDgxLDExNiwxOTAsMjU0LDEwMSwyMiwxODYsNDYsMTUsMjMxLDE1OSw4NCw0OCwyMTcsMTc3LDIzM119LCI0Ijp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMjIsNTgsMTI1LDIzNSwxMDQsMTM5LDExLDEzOCw4Myw2NiwxNDksMTUsMjQyLDIxMywxOSwxMjEsMjQ2LDI3LDE2NiwxMDFdfX19'))

class HardcodeSession extends MemorySession {
    constructor() {
        super()
        this._authKeys = {}
    }

    async load() {
        try {
            const { mainDcId, keys, hashes } = KEYS
            const { ipAddress, port } = utils.getDC(mainDcId)

            this.setDC(mainDcId, ipAddress, port, true)

            Object.keys(keys).forEach((dcId) => {
                if (keys[dcId] && hashes[dcId]){
                    this._authKeys[dcId] = new AuthKey(
                        Buffer.from(keys[dcId].data),
                        Buffer.from(hashes[dcId].data)
                    )
                }
            })
        } catch (err) {
            throw new Error('Failed to retrieve or parse hardcoded JSON')
        }
    }

    setDC(dcId, serverAddress, port, skipUpdateStorage = false) {
        this._dcId = dcId
        this._serverAddress = serverAddress
        this._port = port

        delete this._authKeys[dcId]
    }

    async save() {
        return 'N/A'
    }

    get authKey() {
        throw new Error('Not supported')
    }

    set authKey(value) {
        throw new Error('Not supported')
    }

    getAuthKey(dcId = this._dcId) {
        return this._authKeys[dcId]
    }

    setAuthKey(authKey, dcId = this._dcId) {
        this._authKeys[dcId] = authKey
    }

    async delete() {
    }
}

module.exports = HardcodeSession
