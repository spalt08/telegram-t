const { getRandomInt } = require('../Helpers')
const JSBI = require('jsbi')

class Factorizator {
    /**
     * Finds the small multiplier by using Lopatin's method
     * @param what {JSBI.BigInt}
     * @return {JSBI.BigInt}
     */
    static findSmallMultiplierLopatin(what) {
        let g = JSBI.BigInt(0)
        for (let i = JSBI.BigInt(0); JSBI.lessThan(i, JSBI.BigInt(3)); i = JSBI.add(i, JSBI.BigInt(1))) {
            const q = JSBI.BigInt(30) || JSBI.BigInt((getRandomInt(0, 127) & 15) + 17)
            let x = JSBI.BigInt(40) || JSBI.BigInt(getRandomInt(0, 1000000000) + 1)

            let y = x
            const lim = JSBI.leftShift(JSBI.BigInt(1), JSBI.add(i, JSBI.BigInt(18)))
            for (let j = JSBI.BigInt(1); JSBI.lessThan(j, lim); j = JSBI.add(j, JSBI.BigInt(1))) {
                let a = x
                let b = x

                let c = q
                while (JSBI.notEqual(b, JSBI.BigInt(0))) {
                    if (JSBI.notEqual(JSBI.bitwiseAnd(b, JSBI.BigInt(1)), JSBI.BigInt(0))) {
                        c = JSBI.add(c, a)
                        if (JSBI.greaterThanOrEqual(c, what)) {
                            c = JSBI.subtract(c, what)
                        }
                    }
                    a = JSBI.add(a, a)
                    if (JSBI.greaterThanOrEqual(a, what)) {
                        a = JSBI.subtract(a, what)
                    }
                    b = JSBI.signedRightShift(b, JSBI.BigInt(1))
                }

                x = c
                const z = JSBI.BigInt(JSBI.lessThan(x, y) ? JSBI.subtract(y, x) : JSBI.subtract(x, y))
                g = this.gcd(z, what)

                if (JSBI.notEqual(g, JSBI.BigInt(1))) {
                    break
                }

                if (JSBI.equal(JSBI.bitwiseAnd(j, JSBI.subtract(j, JSBI.BigInt(1))), JSBI.BigInt(0))) {
                    y = x
                }
            }

            if (JSBI.greaterThan(g, JSBI.BigInt(1))) {
                break
            }
        }
        const p = JSBI.divide(what, g)

        return JSBI.lessThan(p, g) ? p : g
    }

    /**
     * Calculates the greatest common divisor
     * @param a {JSBI.BigInt}
     * @param b {JSBI.BigInt}
     * @returns {JSBI.BigInt}
     */
    static gcd(a, b) {
        while (JSBI.notEqual(a, JSBI.BigInt(0)) && JSBI.notEqual(b, JSBI.BigInt(0))) {
            while (JSBI.equal(JSBI.bitwiseAnd(b, JSBI.BigInt(1)), JSBI.BigInt(0))) {
                b = JSBI.signedRightShift(b, JSBI.BigInt(1))
            }
            while (JSBI.equal(JSBI.bitwiseAnd(a, JSBI.BigInt(1)), JSBI.BigInt(0))) {
                a = JSBI.signedRightShift(a, JSBI.BigInt(1))
            }
            if (JSBI.greaterThan(a, b)) {
                a = JSBI.subtract(a, b)
            } else {
                b = JSBI.subtract(b, a)
            }
        }
        return JSBI.equal(b, JSBI.BigInt(0)) ? a : b
    }

    /**
     * Factorizes the given number and returns both the divisor and the number divided by the divisor
     * @param pq {JSBI.BigInt}
     * @returns {{p: JSBI.BigInt, q: JSBI.BigInt}}
     */
    static factorize(pq) {
        const divisor = this.findSmallMultiplierLopatin(pq)
        return { p: divisor, q: JSBI.divide(pq, divisor) }
    }
}

module.exports = Factorizator
