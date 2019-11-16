import { str2bigInt, bigInt2str, powMod } from './vendor/leemon';

type Bytes = number[];

function bytesToHex(bytes: Bytes | Uint8Array = []) {
  const arr = [];
  for (let i = 0; i < bytes.length; i++) {
    arr.push((bytes[i] < 16 ? '0' : '') + (bytes[i] || 0).toString(16));
  }
  return arr.join('');
}

function bytesFromHex(hexString: string): Bytes {
  const len = hexString.length;
  let start = 0;
  const bytes = [];

  if (hexString.length % 2) {
    bytes.push(parseInt(hexString.charAt(0), 16));
    start++;
  }

  for (let i = start; i < len; i += 2) {
    bytes.push(parseInt(hexString.substr(i, 2), 16));
  }

  return bytes;
}

function bytesModPow(x: Bytes | Uint8Array, y: Bytes | Uint8Array, m: Bytes | Uint8Array) {
  const xBigInt = str2bigInt(bytesToHex(x), 16);
  const yBigInt = str2bigInt(bytesToHex(y), 16);
  const mBigInt = str2bigInt(bytesToHex(m), 16);
  const resBigInt = powMod(xBigInt, yBigInt, mBigInt);

  return bytesFromHex(bigInt2str(resBigInt, 16));
}

module.exports = bytesModPow;
