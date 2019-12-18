import { callSdk } from '../api/gramjs';
import { blobToDataUri } from './image';
import * as cacheApi from './cacheApi';

const MEMORY_CACHE: Record<string, string> = {};
const PERSISTENT_CACHE_NAME = 'telegram-t-cache';
const FETCH_PROMISES: Record<string, Promise<string>> = {};

export function fetch(url: string) {
  if (!FETCH_PROMISES[url]) {
    FETCH_PROMISES[url] = fetchFromCacheOrRemote(url);
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

async function fetchFromCacheOrRemote(url: string) {
  const cached = await cacheApi.fetch(PERSISTENT_CACHE_NAME, url);
  if (cached) {
    MEMORY_CACHE[url] = cached;

    return cached;
  }

  const remote = await callSdk('downloadMedia', url);

  if (!remote) {
    throw new Error('Failed to fetch media');
  }

  let dataUri = await blobToDataUri(new Blob([remote]));
  dataUri = dataUri.replace('application/octet-stream', 'image/jpg');
  void cacheApi.save(PERSISTENT_CACHE_NAME, url, dataUri);
  MEMORY_CACHE[url] = dataUri;

  return dataUri;
}
