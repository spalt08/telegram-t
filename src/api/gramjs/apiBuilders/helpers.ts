export function bytesToDataUri(bytes: Buffer, shouldOmitPrefix = false, mimeType: string = 'image/jpg') {
  const prefix = shouldOmitPrefix ? '' : `data:${mimeType};base64,`;

  return `${prefix}${btoa(String.fromCharCode(...bytes))}`;
}
