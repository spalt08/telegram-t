
// Based on https://github.com/ricmoo/aes-js

// region AES
function copyArray(sourceArray, targetArray, targetStart, sourceStart, sourceEnd) {
    if (sourceStart != null || sourceEnd != null) {
        if (sourceArray.slice) {
            sourceArray = sourceArray.slice(sourceStart, sourceEnd)
        } else {
            sourceArray = Array.prototype.slice.call(sourceArray, sourceStart, sourceEnd)
        }
    }
    targetArray.set(sourceArray, targetStart)
}

function convertToInt32(bytes) {
    const result = []
    for (let i = 0; i < bytes.length; i += 4) {
        result.push(
            (bytes[i] << 24) |
            (bytes[i + 1] << 16) |
            (bytes[i + 2] << 8) |
            bytes[i + 3]
        )
    }
    return result
}

function checkInt(value) {
    return (parseInt(value) === value)
}

function checkInts(arrayish) {
    if (!checkInt(arrayish.length)) {
        return false
    }

    for (let i = 0; i < arrayish.length; i++) {
        if (!checkInt(arrayish[i]) || arrayish[i] < 0 || arrayish[i] > 255) {
            return false
        }
    }

    return true
}


const numberOfRounds = {
    16: 10,
    24: 12,
    32: 14
}
_tables = [[[], [], [], [], []], [[], [], [], [], []]]


var encTable = _tables[0], decTable = _tables[1],
    sbox = encTable[4], sboxInv = decTable[4],
    i, x, xInv, d = [], th = [], x2, x4, x8, s, tEnc, tDec;

// Compute double and third tables
for (i = 0; i < 256; i++) {
    th[(d[i] = i << 1 ^ (i >> 7) * 283) ^ i] = i;
}

for (x = xInv = 0; !sbox[x]; x ^= x2 || 1, xInv = th[xInv] || 1) {
    // Compute sbox
    s = xInv ^ xInv << 1 ^ xInv << 2 ^ xInv << 3 ^ xInv << 4;
    s = s >> 8 ^ s & 255 ^ 99;
    sbox[x] = s;
    sboxInv[s] = x;

    // Compute MixColumns
    x8 = d[x4 = d[x2 = d[x]]];
    tDec = x8 * 0x1010101 ^ x4 * 0x10001 ^ x2 * 0x101 ^ x * 0x1010100;
    tEnc = d[s] * 0x101 ^ s * 0x1010100;

    for (i = 0; i < 4; i++) {
        encTable[i][x] = tEnc = tEnc << 24 ^ tEnc >>> 8;
        decTable[i][s] = tDec = tDec << 24 ^ tDec >>> 8;
    }
}
// Compactify.  Considerable speedup on Firefox.
for (i = 0; i < 5; i++) {
    encTable[i] = encTable[i].slice(0);
    decTable[i] = decTable[i].slice(0);
}
for (i = 0; i < 4; i++) {
    for (let j = 0; j < encTable[i].length; j++) {
        encTable[i][j] += 4294967296
    }
    for (let j = 0; j < encTable[i].length; j++) {
        decTable[i][j] += 4294967296
    }
}


// Round constant words
const rcon = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a, 0x2f, 0x5e, 0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a, 0xd4, 0xb3, 0x7d, 0xfa, 0xef, 0xc5, 0x91]

// S-box and Inverse S-box (S is for Substitution)
const S = sbox
const Si = sboxInv

// Transformations for encryption
const T1 = _tables[0][0]
const T2 = _tables[0][1]
const T3 = _tables[0][2]
const T4 = _tables[0][3]

// Transformations for decryption
const T5 = _tables[1][0]
const T6 = _tables[1][1]
const T7 = _tables[1][2]
const T8 = _tables[1][3]

// Transformations for decryption key expansion
const U_SRC = '000000000e090d0b1c121a16121b171d3824342c362d392724362e3a2a3f2331704868587e4165536c5a724e62537f45486c5c744665517f547e46625a774b69e090d0b0ee99ddbbfc82caa6f28bc7add8b4e49cd6bde997c4a6fe8acaaff38190d8b8e89ed1b5e38ccaa2fe82c3aff5a8fc8cc4a6f581cfb4ee96d2bae79bd9db3bbb7bd532b670c729a16dc920ac66e31f8f57ed16825cff0d9541f104984aab73d323a57ade28b761c935b968c43e9357e70f9d5eea048f45fd19814cf0123bab6bcb35a266c027b971dd29b07cd6038f5fe70d8652ec1f9d45f1119448fa4be3039345ea0e9857f1198559f8148e73c737bf7dce3ab46fd52da961dc20a2ad766df6a37f60fdb16477e0bf6d7aeb955259da9b5b54d1894043cc87494ec7dd3e05aed33708a5c12c1fb8cf2512b3e51a3182eb133c89f9082b94f701269f4de6bd4643efb04d51f4a7505ffdaa5b75c2896a7bcb846169d0937c67d99e773daed51e33a7d81521bccf082fb5c203058ae1320b83ec391998fb241791f62f764dd68d7844db866a5fcc9b6456c1904e69e2a14060efaa527bf8b75c72f5bc0605bed5080cb3de1a17a4c3141ea9c83e218af9302887f2223390ef2c3a9de496dd063d98d40b368acf1c2b84c61120aef93211a0f03f1ab2eb2807bce2250ce6956e65e89c636efa877473f48e7978deb15a49d0b85742c2a3405fccaa4d5441ecdaf74fe5d7fc5dfec0e153f7cdea79c8eedb77c1e3d065daf4cd6bd3f9c631a4b2af3fadbfa42db6a8b923bfa5b20980868307898b8815929c951b9b919ea17c0a47af75074cbd6e1051b3671d5a99583e6b97513360854a247d8b432976d134621fdf3d6f14cd267809c32f7502e9105633e7195b38f5024c25fb0b412e9ad7618c94de6c8786c57b9a88cc7691a2f355a0acfa58abbee14fb6b0e842bdea9f09d4e49604dff68d13c2f8841ec9d2bb3df8dcb230f3cea927eec0a02ae57a47b13c744ebc376655ab2a685ca621426385104c6a881b5e719f065078920d0a0fd9640406d46f161dc3721814ce79322bed483c22e0432e39f75e2030fa55ec9ab701e293ba0af088ad17fe81a01cd4be832ddab78e26c8ac993bc6a594309cd2df5992dbd25280c0c54f8ec9c844a4f6eb75aaffe67eb8e4f163b6edfc680c0a67b102036aba10187da71e1170ac342e539d3a275e96283c498b263544807c420fe9724b02e2605015ff6e5918f444663bc54a6f36ce587421d3567d2cd837a10c7a39a801712bb3166c25ba1b670f853856018c355d139722401d9e2f4b47e9642249e069295bfb7e3455f2733f7fcd500e71c45d0563df4a186dd64713d731dccad938d1c1cb23c6dcc52acbd7ef15e8e6e11ce5edf307f2f0fd0efffba779b492a970b999bb6bae84b562a38f9f5d80be91548db5834f9aa88d4697a3000000000b0e090d161c121a1d121b172c38243427362d393a24362e312a3f2358704868537e41654e6c5a724562537f74486c5c7f46655162547e46695a774bb0e090d0bbee99dda6fc82caadf28bc79cd8b4e497d6bde98ac4a6fe81caaff3e890d8b8e39ed1b5fe8ccaa2f582c3afc4a8fc8ccfa6f581d2b4ee96d9bae79b7bdb3bbb70d532b66dc729a166c920ac57e31f8f5ced168241ff0d954af1049823ab73d328a57ade35b761c93eb968c40f9357e7049d5eea198f45fd12814cf0cb3bab6bc035a266dd27b971d629b07ce7038f5fec0d8652f11f9d45fa119448934be3039845ea0e8557f1198e59f814bf73c737b47dce3aa96fd52da261dc20f6ad766dfda37f60e0b16477ebbf6d7ada955259d19b5b54cc894043c787494eaedd3e05a5d33708b8c12c1fb3cf251282e51a3189eb133c94f9082b9ff70126464de6bd4d43efb05051f4a75b5ffdaa6a75c289617bcb847c69d0937767d99e1e3daed51533a7d80821bccf032fb5c232058ae1390b83ec241998fb2f1791f68d764dd6867844db9b6a5fcc906456c1a14e69e2aa4060efb7527bf8bc5c72f5d50605bede080cb3c31a17a4c8141ea9f93e218af2302887ef223390e42c3a9d3d96dd063698d40b2b8acf1c2084c61111aef9321aa0f03f07b2eb280cbce22565e6956e6ee89c6373fa877478f48e7949deb15a42d0b8575fc2a34054ccaa4df741ecdafc4fe5d7e15dfec0ea53f7cddb79c8eed077c1e3cd65daf4c66bd3f9af31a4b2a43fadbfb92db6a8b223bfa5830980868807898b9515929c9e1b9b9147a17c0a4caf750751bd6e105ab3671d6b99583e609751337d854a24768b43291fd1346214df3d6f09cd267802c32f7533e9105638e7195b25f5024c2efb0b418c9ad7618794de6c9a86c57b9188cc76a0a2f355abacfa58b6bee14fbdb0e842d4ea9f09dfe49604c2f68d13c9f8841ef8d2bb3df3dcb230eecea927e5c0a02a3c7a47b137744ebc2a6655ab21685ca6104263851b4c6a88065e719f0d507892640a0fd96f0406d472161dc3791814ce48322bed433c22e05e2e39f7552030fa01ec9ab70ae293ba17f088ad1cfe81a02dd4be8326dab78e3bc8ac9930c6a594599cd2df5292dbd24f80c0c5448ec9c875a4f6eb7eaaffe663b8e4f168b6edfcb10c0a67ba02036aa710187dac1e11709d342e53963a275e8b283c4980263544e97c420fe2724b02ff605015f46e5918c544663bce4a6f36d3587421d8567d2c7a37a10c7139a8016c2bb3166725ba1b560f85385d018c35401397224b1d9e2f2247e9642949e069345bfb7e3f55f2730e7fcd500571c45d1863df4a136dd647cad731dcc1d938d1dccb23c6d7c52acbe6ef15e8ede11ce5f0f307f2fbfd0eff92a779b499a970b984bb6bae8fb562a3be9f5d80b591548da8834f9aa38d4697000000000d0b0e091a161c12171d121b342c38243927362d2e3a243623312a3f6858704865537e41724e6c5a7f4562535c74486c517f46654662547e4b695a77d0b0e090ddbbee99caa6fc82c7adf28be49cd8b4e997d6bdfe8ac4a6f381caafb8e890d8b5e39ed1a2fe8ccaaff582c38cc4a8fc81cfa6f596d2b4ee9bd9bae7bb7bdb3bb670d532a16dc729ac66c9208f57e31f825ced169541ff0d984af104d323ab73de28a57ac935b761c43eb968e70f9357ea049d5efd198f45f012814c6bcb3bab66c035a271dd27b97cd629b05fe7038f52ec0d8645f11f9d48fa119403934be30e9845ea198557f1148e59f837bf73c73ab47dce2da96fd520a261dc6df6ad7660fda37f77e0b1647aebbf6d59da955254d19b5b43cc89404ec7874905aedd3e08a5d3371fb8c12c12b3cf253182e51a3c89eb132b94f908269ff701bd464de6b04d43efa75051f4aa5b5ffd896a75c284617bcb937c69d09e7767d9d51e3daed81533a7cf0821bcc2032fb5e132058aec390b83fb241998f62f1791d68d764ddb867844cc9b6a5fc1906456e2a14e69efaa4060f8b7527bf5bc5c72bed50605b3de080ca4c31a17a9c8141e8af93e2187f2302890ef22339de42c3a063d96dd0b3698d41c2b8acf112084c63211aef93f1aa0f02807b2eb250cbce26e65e695636ee89c7473fa877978f48e5a49deb15742d0b8405fc2a34d54ccaadaf741ecd7fc4fe5c0e15dfecdea53f7eedb79c8e3d077c1f4cd65daf9c66bd3b2af31a4bfa43fada8b92db6a5b223bf868309808b8807899c951592919e1b9b0a47a17c074caf751051bd6e1d5ab3673e6b995833609751247d854a29768b43621fd1346f14df3d7809cd267502c32f5633e9105b38e7194c25f502412efb0b618c9ad76c8794de7b9a86c5769188cc55a0a2f358abacfa4fb6bee142bdb0e809d4ea9f04dfe49613c2f68d1ec9f8843df8d2bb30f3dcb227eecea92ae5c0a0b13c7a47bc37744eab2a6655a621685c85104263881b4c6a9f065e71920d5078d9640a0fd46f0406c372161dce791814ed48322be0433c22f75e2e39fa552030b701ec9aba0ae293ad17f088a01cfe81832dd4be8e26dab7993bc8ac9430c6a5df599cd2d25292dbc54f80c0c8448ec9eb75a4f6e67eaafff163b8e4fc68b6ed67b10c0a6aba02037da7101870ac1e11539d342e5e963a27498b283c448026350fe97c4202e2724b15ff605018f46e593bc5446636ce4a6f21d358742cd8567d0c7a37a1017139a8166c2bb31b6725ba38560f85355d018c224013972f4b1d9e642247e9692949e07e345bfb733f55f2500e7fcd5d0571c44a1863df47136dd6dccad731d1c1d938c6dccb23cbd7c52ae8e6ef15e5ede11cf2f0f307fffbfd0eb492a779b999a970ae84bb6ba38fb56280be9f5d8db591549aa8834f97a38d4600000000090d0b0e121a161c1b171d1224342c382d392736362e3a243f23312a486858704165537e5a724e6c537f45626c5c744865517f467e466254774b695a90d0b0e099ddbbee82caa6fc8bc7adf2b4e49cd8bde997d6a6fe8ac4aff381cad8b8e890d1b5e39ecaa2fe8cc3aff582fc8cc4a8f581cfa6ee96d2b4e79bd9ba3bbb7bdb32b670d529a16dc720ac66c91f8f57e316825ced0d9541ff04984af173d323ab7ade28a561c935b768c43eb957e70f935eea049d45fd198f4cf01281ab6bcb3ba266c035b971dd27b07cd6298f5fe7038652ec0d9d45f11f9448fa11e303934bea0e9845f1198557f8148e59c737bf73ce3ab47dd52da96fdc20a261766df6ad7f60fda36477e0b16d7aebbf5259da955b54d19b4043cc89494ec7873e05aedd3708a5d32c1fb8c12512b3cf1a3182e5133c89eb082b94f901269ff7e6bd464defb04d43f4a75051fdaa5b5fc2896a75cb84617bd0937c69d99e7767aed51e3da7d81533bccf0821b5c2032f8ae1320583ec390b98fb241991f62f174dd68d7644db86785fcc9b6a56c1906469e2a14e60efaa407bf8b75272f5bc5c05bed5060cb3de0817a4c31a1ea9c814218af93e2887f2303390ef223a9de42cdd063d96d40b3698cf1c2b8ac6112084f93211aef03f1aa0eb2807b2e2250cbc956e65e69c636ee8877473fa8e7978f4b15a49deb85742d0a3405fc2aa4d54ccecdaf741e5d7fc4ffec0e15df7cdea53c8eedb79c1e3d077daf4cd65d3f9c66ba4b2af31adbfa43fb6a8b92dbfa5b22380868309898b8807929c95159b919e1b7c0a47a175074caf6e1051bd671d5ab3583e6b99513360974a247d854329768b34621fd13d6f14df267809cd2f7502c3105633e9195b38e7024c25f50b412efbd7618c9ade6c8794c57b9a86cc769188f355a0a2fa58abace14fb6bee842bdb09f09d4ea9604dfe48d13c2f6841ec9f8bb3df8d2b230f3dca927eecea02ae5c047b13c7a4ebc377455ab2a665ca62168638510426a881b4c719f065e78920d500fd9640a06d46f041dc3721614ce79182bed483222e0433c39f75e2e30fa55209ab701ec93ba0ae288ad17f081a01cfebe832dd4b78e26daac993bc8a59430c6d2df599cdbd25292c0c54f80c9c8448ef6eb75a4ffe67eaae4f163b8edfc68b60a67b10c036aba02187da7101170ac1e2e539d34275e963a3c498b2835448026420fe97c4b02e2725015ff605918f46e663bc5446f36ce4a7421d3587d2cd856a10c7a37a8017139b3166c2bba1b67258538560f8c355d01972240139e2f4b1de9642247e0692949fb7e345bf2733f55cd500e7fc45d0571df4a1863d647136d31dccad738d1c1d923c6dccb2acbd7c515e8e6ef1ce5ede107f2f0f30efffbfd79b492a770b999a96bae84bb62a38fb55d80be9f548db5914f9aa8834697a38d'
// Parse the upper hex string into 4 * 256 integers
const [U1, U2, U3, U4] = (new Array(4).fill(0)).reduce((res, _, i) => {
    const uSrc = U_SRC.slice(i * 256 * 8, (i + 1) * 256 * 8)
    const u = (new Array(256).fill(0)).reduce((uRes, _, j) => {
        const str = uSrc.slice(j * 8, (j + 1) * 8)
        uRes.push(parseInt(str, 16))
        return uRes
    }, [])

    res.push(u)
    return res
}, [])

function coerceArray(arg, copy) {

    // ArrayBuffer view
    if (arg.buffer && arg.name === 'Uint8Array') {

        if (copy) {
            if (arg.slice) {
                arg = arg.slice()
            } else {
                arg = Array.prototype.slice.call(arg)
            }
        }

        return arg
    }

    // It's an array; check it is a valid representation of a byte
    if (Array.isArray(arg)) {
        if (!checkInts(arg)) {
            throw new Error('Array contains invalid value: ' + arg)
        }

        return new Uint8Array(arg)
    }

    // Something else, but behaves like an array (maybe a Buffer? Arguments?)
    if (checkInt(arg.length) && checkInts(arg)) {
        return new Uint8Array(arg)
    }

    throw new Error('unsupported array-like object')
}

function createArray(length) {
    return new Uint8Array(length)
}

class AES {

    constructor(key) {
        this.key = coerceArray(key, true)
        this._prepare()
    }

    _prepare() {
        const rounds = numberOfRounds[this.key.length]
        if (rounds == null) {
            throw new Error('invalid key size (must be 16, 24 or 32 bytes)')
        }

        // encryption round keys
        this._Ke = []

        // decryption round keys
        this._Kd = []

        for (let i = 0; i <= rounds; i++) {
            this._Ke.push([0, 0, 0, 0])
            this._Kd.push([0, 0, 0, 0])
        }

        const roundKeyCount = (rounds + 1) * 4
        const KC = this.key.length / 4

        // convert the key into ints
        const tk = convertToInt32(this.key)

        // copy values into round key arrays
        let index
        for (let i = 0; i < KC; i++) {
            index = i >> 2
            this._Ke[index][i % 4] = tk[i]
            this._Kd[rounds - index][i % 4] = tk[i]
        }

        // key expansion (fips-197 section 5.2)
        let rconPointer = 0
        let t = KC
        let tt
        while (t < roundKeyCount) {
            tt = tk[KC - 1]
            tk[0] ^= ((S[(tt >> 16) & 0xFF] << 24) ^
                (S[(tt >> 8) & 0xFF] << 16) ^
                (S[tt & 0xFF] << 8) ^
                S[(tt >> 24) & 0xFF] ^
                (rcon[rconPointer] << 24))
            rconPointer += 1

            // key expansion (for non-256 bit)
            if (KC !== 8) {
                for (let i = 1; i < KC; i++) {
                    tk[i] ^= tk[i - 1]
                }

                // key expansion for 256-bit keys is "slightly different" (fips-197)
            } else {
                for (let i = 1; i < (KC / 2); i++) {
                    tk[i] ^= tk[i - 1]
                }
                tt = tk[(KC / 2) - 1]

                tk[KC / 2] ^= (S[tt & 0xFF] ^
                    (S[(tt >> 8) & 0xFF] << 8) ^
                    (S[(tt >> 16) & 0xFF] << 16) ^
                    (S[(tt >> 24) & 0xFF] << 24))

                for (let i = (KC / 2) + 1; i < KC; i++) {
                    tk[i] ^= tk[i - 1]
                }
            }

            // copy values into round key arrays
            let i = 0,
                r,
                c
            while (i < KC && t < roundKeyCount) {
                r = t >> 2
                c = t % 4
                this._Ke[r][c] = tk[i]
                this._Kd[rounds - r][c] = tk[i++]
                t++
            }
        }

        // inverse-cipher-ify the decryption round key (fips-197 section 5.3)
        for (let r = 1; r < rounds; r++) {
            for (let c = 0; c < 4; c++) {
                tt = this._Kd[r][c];
                this._Kd[r][c] = (U1[(tt >> 24) & 0xFF] ^
                    U2[(tt >> 16) & 0xFF] ^
                    U3[(tt >> 8) & 0xFF] ^
                    U4[tt & 0xFF])
            }
        }
    }

    encrypt(plainText) {
        if (plainText.length !== 16) {
            throw new Error('invalid plaintext size (must be 16 bytes)')
        }

        const rounds = this._Ke.length - 1
        const a = [0, 0, 0, 0]

        // convert plaintext to (ints ^ key)
        let t = convertToInt32(plainText)
        for (let i = 0; i < 4; i++) {
            t[i] ^= this._Ke[0][i]
        }

        // apply round transforms
        for (let r = 1; r < rounds; r++) {
            for (let i = 0; i < 4; i++) {
                a[i] = (T1[(t[i] >> 24) & 0xff] ^
                    T2[(t[(i + 1) % 4] >> 16) & 0xff] ^
                    T3[(t[(i + 2) % 4] >> 8) & 0xff] ^
                    T4[t[(i + 3) % 4] & 0xff] ^
                    this._Ke[r][i])
            }
            t = a.slice()
        }

        // the last round is special
        const result = createArray(16)
        let tt
        for (let i = 0; i < 4; i++) {
            tt = this._Ke[rounds][i]
            result[4 * i] = (S[(t[i] >> 24) & 0xff] ^ (tt >> 24)) & 0xff
            result[4 * i + 1] = (S[(t[(i + 1) % 4] >> 16) & 0xff] ^ (tt >> 16)) & 0xff
            result[4 * i + 2] = (S[(t[(i + 2) % 4] >> 8) & 0xff] ^ (tt >> 8)) & 0xff
            result[4 * i + 3] = (S[t[(i + 3) % 4] & 0xff] ^ tt) & 0xff
        }

        return result
    }

    decrypt(cipherText) {
        if (cipherText.length !== 16) {
            throw new Error('invalid cipherText size (must be 16 bytes)')
        }

        const rounds = this._Kd.length - 1
        const a = [0, 0, 0, 0]

        // convert plaintext to (ints ^ key)
        let t = convertToInt32(cipherText)
        for (let i = 0; i < 4; i++) {
            t[i] ^= this._Kd[0][i]
        }

        // apply round transforms
        for (let r = 1; r < rounds; r++) {
            for (let i = 0; i < 4; i++) {
                a[i] = (T5[(t[i] >> 24) & 0xff] ^
                    T6[(t[(i + 3) % 4] >> 16) & 0xff] ^
                    T7[(t[(i + 2) % 4] >> 8) & 0xff] ^
                    T8[t[(i + 1) % 4] & 0xff] ^
                    this._Kd[r][i])
            }
            t = a.slice()
        }

        // the last round is special
        const result = createArray(16)
        let tt
        for (let i = 0; i < 4; i++) {
            tt = this._Kd[rounds][i]
            result[4 * i] = (Si[(t[i] >> 24) & 0xff] ^ (tt >> 24)) & 0xff
            result[4 * i + 1] = (Si[(t[(i + 3) % 4] >> 16) & 0xff] ^ (tt >> 16)) & 0xff
            result[4 * i + 2] = (Si[(t[(i + 2) % 4] >> 8) & 0xff] ^ (tt >> 8)) & 0xff
            result[4 * i + 3] = (Si[t[(i + 1) % 4] & 0xff] ^ tt) & 0xff
        }

        return result
    }

}

class Counter {
    constructor(initialValue) {
        this.setBytes(initialValue)
    }

    setBytes(bytes) {
        bytes = coerceArray(bytes, true)
        this._counter = bytes
    }

    increment() {
        for (let i = 15; i >= 0; i--) {
            if (this._counter[i] === 255) {
                this._counter[i] = 0
            } else {
                this._counter[i]++
                break
            }
        }
    }
}

class CTR {
    constructor(key, counter) {

        if (!(counter instanceof Counter)) {
            counter = new Counter(counter)
        }

        this._counter = counter

        this._remainingCounter = null
        this._remainingCounterIndex = 16

        this._aes = new AES(key)
    }

    update(plainText) {
        return this.encrypt(plainText)
    }

    encrypt(plainText) {
        const encrypted = coerceArray(plainText, true)

        for (let i = 0; i < encrypted.length; i++) {
            if (this._remainingCounterIndex === 16) {
                this._remainingCounter = this._aes.encrypt(this._counter._counter)
                this._remainingCounterIndex = 0
                this._counter.increment()
            }
            encrypted[i] ^= this._remainingCounter[this._remainingCounterIndex++]
        }

        return encrypted
    }
}


class ECB {
    constructor(key, type) {
        this._aes = new AES(key)
        this.type = type
    }

    update(text) {
        if (this.type === 'encrypt') {
            return this.encrypt(text)
        } else {
            return this.decrypt(text)
        }
    }

    encrypt(plainText) {
        plainText = coerceArray(plainText)

        if ((plainText.length % 16) !== 0) {
            throw new Error('invalid plainText size (must be multiple of 16 bytes)')
        }

        const cipherText = createArray(plainText.length)
        let block = createArray(16)

        for (let i = 0; i < plainText.length; i += 16) {
            copyArray(plainText, block, 0, i, i + 16)
            block = this._aes.encrypt(block)
            copyArray(block, cipherText, i)
        }

        return cipherText
    }

    decrypt(cipherText) {
        cipherText = coerceArray(cipherText)

        if ((cipherText.length % 16) !== 0) {
            throw new Error('invalid cipherText size (must be multiple of 16 bytes)')
        }

        const plaintext = createArray(cipherText.length)
        let block = createArray(16)

        for (let i = 0; i < cipherText.length; i += 16) {
            copyArray(cipherText, block, 0, i, i + 16)
            block = this._aes.decrypt(block)
            copyArray(block, plaintext, i)
        }
        return plaintext
    }
}

// endregion
function createDecipheriv(algorithm, key, iv) {
    if (algorithm.includes('ECB')) {
        return new ECB(key, 'decrypt')
    } else {
        return new CTR(key, iv)
    }
}

function createCipheriv(algorithm, key, iv) {
    if (algorithm.includes('ECB')) {
        return new ECB(key, 'encrypt')
    } else {
        return new CTR(key, iv)
    }
}

function randomBytes(count) {
    const bytes = new Uint8Array(count)
    crypto.getRandomValues(bytes)
    return bytes
}

class Hash {
    constructor(algorithm) {
        this.algorithm = algorithm
    }

    update(data) {
        //We shouldn't be needing new Uint8Array but it doesn't
        //work without it
        this.data = new Uint8Array(data)
    }

    async digest() {
        if (this.algorithm === 'sha1') {
            return Buffer.from(await self.crypto.subtle.digest('SHA-1', this.data))
        } else if (this.algorithm === 'sha256') {
            return Buffer.from(await self.crypto.subtle.digest('SHA-256', this.data))
        }
    }
}

async function pbkdf2(password, salt, iterations) {
    const passwordKey = await crypto.subtle.importKey('raw', password,
        {name: 'PBKDF2'}, false, ['deriveBits'])
    return Buffer.from(await crypto.subtle.deriveBits({
        name: 'PBKDF2',
        hash: 'SHA-512', salt, iterations
    }, passwordKey, 512));
}


function createHash(algorithm) {
    return new Hash(algorithm)
}

module.exports = {
    createCipheriv,
    createDecipheriv,
    randomBytes,
    createHash,
    pbkdf2
}
