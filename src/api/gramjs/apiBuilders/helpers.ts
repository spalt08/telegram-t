import { Api as GramJs } from '../../../lib/gramjs';

export function bytesToDataUri(bytes: Buffer, shouldOmitPrefix = false, mimeType: string = 'image/jpg') {
  const prefix = shouldOmitPrefix ? '' : `data:${mimeType};base64,`;

  return `${prefix}${btoa(
    bytes.reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''),
  )}`;
}

export function omitGramJsFields<T extends GramJs.VirtualClass<{}>>(
  instance: T,
): Omit<T, 'CONSTRUCTOR_ID' | 'SUBCLASS_OF_ID'> {
  const object = { ...instance };
  delete object.CONSTRUCTOR_ID;
  delete object.SUBCLASS_OF_ID;
  return object;
}
