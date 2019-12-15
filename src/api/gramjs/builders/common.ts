export function bytesToDataUri(bytes: Uint8Array, shouldOmitPrefix = false, mimeType: string = 'image/jpg') {
  const prefix = shouldOmitPrefix ? '' : `data:${mimeType};base64,`;

  return `${prefix}${btoa(
    bytes.reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''),
  )}`;
}
