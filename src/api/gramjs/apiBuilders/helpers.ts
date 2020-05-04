export function bytesToDataUri(bytes: Buffer, shouldOmitPrefix = false, mimeType: string = 'image/jpeg') {
  const prefix = shouldOmitPrefix ? '' : `data:${mimeType};base64,`;

  return `${prefix}${btoa(String.fromCharCode(...bytes))}`;
}
