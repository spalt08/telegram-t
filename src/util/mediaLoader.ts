import { callSdk } from '../api/gramjs';
import { blobToDataUri } from './image';
import * as cacheApi from './cacheApi';
import { MEDIA_CACHE_DISABLED, MEDIA_CACHE_NAME } from '../config';

export enum Type {
  Jpeg,
  Lottie,
}

type ParsedMedia = string | AnyLiteral;

const MEMORY_CACHE: Record<string, ParsedMedia> = {};
const FETCH_PROMISES: Record<string, Promise<ParsedMedia>> = {};

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

export function getFromMemory(url: string) {
  return MEMORY_CACHE[url];
}

async function fetchFromCacheOrRemote(url: string, mediaType: Type) {
  if (!MEDIA_CACHE_DISABLED) {
    const cacheType = mediaType === Type.Lottie ? cacheApi.Type.Json : cacheApi.Type.Text;
    const cached = await cacheApi.fetch(MEDIA_CACHE_NAME, url, cacheType);
    if (cached) {
      MEMORY_CACHE[url] = cached;

      return cached;
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

  MEMORY_CACHE[url] = mediaData;

  return mediaData;
}

async function parseMedia(data: Buffer, mediaType: Type): Promise<string | AnyLiteral> {
  switch (mediaType) {
    case Type.Jpeg: {
      const dataUri = await blobToDataUri(new Blob([data]));
      return dataUri.replace('application/octet-stream', 'image/jpg');
    }
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
