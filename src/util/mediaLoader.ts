import { callSdk } from '../api/gramjs';
import * as cacheApi from './cacheApi';
import { MEDIA_CACHE_DISABLED, MEDIA_CACHE_NAME } from '../config';
import { blobToDataUri } from './image';

// We cache avatars as Data URI for faster initial load
// and messages media as Blob for smaller size.
export enum Type {
  DataUri,
  BlobUrl,
  Lottie,
}

const asCacheApiType = {
  [Type.DataUri]: cacheApi.Type.Text,
  [Type.BlobUrl]: cacheApi.Type.Blob,
  [Type.Lottie]: cacheApi.Type.Json,
};

type ParsedMedia = string | Blob | AnyLiteral;
type MemoryMedia = string | AnyLiteral;

const MEMORY_CACHE: Record<string, MemoryMedia> = {};
const FETCH_PROMISES: Record<string, Promise<MemoryMedia>> = {};

let pako: typeof import('pako/dist/pako_inflate');

export function fetch(url: string, mediaType: Type) {
  if (!FETCH_PROMISES[url]) {
    FETCH_PROMISES[url] = fetchFromCacheOrRemote(url, mediaType);
    FETCH_PROMISES[url].catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      delete FETCH_PROMISES[url];
    });
  }

  return FETCH_PROMISES[url];
}

export function getFromMemory<T extends MemoryMedia>(url: string): T {
  return MEMORY_CACHE[url] as T;
}

async function fetchFromCacheOrRemote(url: string, mediaType: Type) {
  if (!MEDIA_CACHE_DISABLED) {
    const cached = await cacheApi.fetch(MEDIA_CACHE_NAME, url, asCacheApiType[mediaType]);
    if (cached) {
      MEMORY_CACHE[url] = forMemory(cached);

      return MEMORY_CACHE[url];
    }
  }

  const remote = await callSdk('downloadMedia', url);

  if (!remote) {
    throw new Error('Failed to fetch media');
  }

  const mediaData = await parseMedia(remote, mediaType);

  if (!MEDIA_CACHE_DISABLED) {
    cacheApi.save(MEDIA_CACHE_NAME, url, mediaData);
  }

  MEMORY_CACHE[url] = forMemory(mediaData);

  return MEMORY_CACHE[url];
}

async function parseMedia(data: Buffer, mediaType: Type): Promise<ParsedMedia> {
  switch (mediaType) {
    case Type.DataUri:
      return blobToDataUri(new Blob([data]));
    case Type.BlobUrl:
      return new Blob([data]);
    case Type.Lottie: {
      if (!pako) {
        pako = await import('pako/dist/pako_inflate');
      }
      const json = pako.inflate(data, { to: 'string' });
      return JSON.parse(json);
    }
  }

  throw new Error('Unknown media type');
}

function forMemory(mediaData: ParsedMedia): MemoryMedia {
  if (mediaData instanceof Blob) {
    return URL.createObjectURL(mediaData);
  }

  return mediaData;
}
