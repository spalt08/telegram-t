import {
  ApiMediaFormat,
  ApiMediaFormatToPrepared,
  ApiOnProgress,
  ApiParsedMedia,
  ApiPreparedMedia,
} from '../api/types';

import { DEBUG, MEDIA_CACHE_DISABLED, MEDIA_CACHE_NAME } from '../config';
import { callApi } from '../api/gramjs';
import * as cacheApi from './cacheApi';
import { preloadImage } from './files';

const asCacheApiType = {
  [ApiMediaFormat.DataUri]: cacheApi.Type.Text,
  [ApiMediaFormat.BlobUrl]: cacheApi.Type.Blob,
  [ApiMediaFormat.StreamUrl]: cacheApi.Type.Blob,
  [ApiMediaFormat.Lottie]: cacheApi.Type.Json,
};

const MEMORY_CACHE: Record<string, ApiPreparedMedia> = {};
const FETCH_PROMISES: Record<string, Promise<ApiPreparedMedia | null>> = {};

export function fetch<T extends ApiMediaFormat>(url: string, mediaFormat: T, onProgress?: ApiOnProgress) {
  if (!FETCH_PROMISES[url]) {
    FETCH_PROMISES[url] = fetchFromCacheOrRemote(url, mediaFormat, onProgress).catch((err) => {
      if (DEBUG) {
        // eslint-disable-next-line no-console
        console.warn(err);
      }

      delete FETCH_PROMISES[url];

      return null;
    });
  }

  return FETCH_PROMISES[url] as Promise<ApiMediaFormatToPrepared<T>>;
}

export function getFromMemory<T extends ApiMediaFormat>(url: string) {
  return MEMORY_CACHE[url] as ApiMediaFormatToPrepared<T>;
}

async function fetchFromCacheOrRemote(url: string, mediaFormat: ApiMediaFormat, onProgress?: ApiOnProgress) {
  if (!MEDIA_CACHE_DISABLED) {
    const cached = await cacheApi.fetch(MEDIA_CACHE_NAME, url, asCacheApiType[mediaFormat]);
    if (cached) {
      const prepared = prepareMedia(cached);

      if (mediaFormat === ApiMediaFormat.BlobUrl) {
        await preload(prepared as string, cached.type);
      }

      MEMORY_CACHE[url] = prepared;
      return prepared;
    }
  }

  if (mediaFormat === ApiMediaFormat.StreamUrl) {
    const mediaSource = new MediaSource();
    const streamUrl = URL.createObjectURL(mediaSource);
    let isOpen = false;

    mediaSource.addEventListener('sourceopen', () => {
      if (isOpen) {
        return;
      }
      isOpen = true;

      const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64000d"; profiles="mp41,mp42,isom"');

      void callApi('downloadMedia', { url, mediaFormat }, (progress: number, arrayBuffer?: ArrayBuffer) => {
        if (onProgress) {
          onProgress(progress);
        }

        sourceBuffer.appendBuffer(arrayBuffer!);

        if (progress === 1) {
          sourceBuffer.addEventListener('updateend', () => {
            if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
              mediaSource.endOfStream();
            }
          });
        }
      });
    });

    MEMORY_CACHE[url] = streamUrl;
    return streamUrl;
  }

  const remote = await callApi('downloadMedia', { url, mediaFormat }, onProgress);
  if (!remote) {
    throw new Error('Failed to fetch media');
  }

  const { prepared, mimeType } = remote;

  if (mediaFormat === ApiMediaFormat.BlobUrl && mimeType) {
    await preload(prepared as string, mimeType);
  }

  MEMORY_CACHE[url] = prepared;
  return prepared;
}

function prepareMedia(mediaData: ApiParsedMedia): ApiPreparedMedia {
  if (mediaData instanceof Blob) {
    return URL.createObjectURL(mediaData);
  }

  return mediaData;
}

async function preload(blobUrl: string, mimeType: string) {
  if (mimeType.startsWith('image/')) {
    await preloadImage(blobUrl);
  }
}
