// We cache avatars as Data URI for faster initial load
// and messages media as Blob for smaller size.
export enum ApiMediaFormat {
  DataUri,
  BlobUrl,
  Lottie,
  Progressive,
}

export type ApiParsedMedia = string | Blob | AnyLiteral;
export type ApiPreparedMedia = string | AnyLiteral;
export type ApiMediaFormatToPrepared<T> = T extends ApiMediaFormat.Lottie ? AnyLiteral : string;
