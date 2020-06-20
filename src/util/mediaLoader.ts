import {
  ApiMediaFormat,
  ApiMediaFormatToPrepared,
  ApiOnProgress,
  ApiParsedMedia,
  ApiPreparedMedia,
} from '../api/types';

import { DEBUG, MEDIA_CACHE_DISABLED, MEDIA_CACHE_NAME } from '../config';
import { callApi, cancelApiProgress } from '../api/gramjs';
import * as cacheApi from './cacheApi';
import { fetchBlob, preloadImage } from './files';
import {
  IS_OPUS_SUPPORTED,
  IS_PROGRESSIVE_SUPPORTED,
  isWebpSupported,
} from './environment';
import { oggToWav } from './oggToWav';

const asCacheApiType = {
  [ApiMediaFormat.DataUri]: cacheApi.Type.Text,
  [ApiMediaFormat.BlobUrl]: cacheApi.Type.Blob,
  [ApiMediaFormat.Lottie]: cacheApi.Type.Json,
  [ApiMediaFormat.Progressive]: undefined,
  [ApiMediaFormat.Stream]: undefined,
};

const MEMORY_CACHE: Record<string, ApiPreparedMedia> = {};
const FETCH_PROMISES: Record<string, Promise<ApiPreparedMedia | undefined>> = {};
const PROGRESSIVE_URL_PREFIX = './progressive/';

export function fetch<T extends ApiMediaFormat>(
  url: string, mediaFormat: T, onProgress?: ApiOnProgress,
): Promise<ApiMediaFormatToPrepared<T>> {
  if (mediaFormat === ApiMediaFormat.Progressive) {
    return (
      IS_PROGRESSIVE_SUPPORTED
        ? getProgressive(url)
        : fetch(url, ApiMediaFormat.BlobUrl, onProgress)
    ) as Promise<ApiMediaFormatToPrepared<T>>;
  }

  if (!FETCH_PROMISES[url]) {
    FETCH_PROMISES[url] = fetchFromCacheOrRemote(url, mediaFormat, onProgress).catch((err) => {
      if (DEBUG) {
        // eslint-disable-next-line no-console
        console.warn(err);
      }

      delete FETCH_PROMISES[url];

      return undefined;
    });
  }

  return FETCH_PROMISES[url] as Promise<ApiMediaFormatToPrepared<T>>;
}

export function getFromMemory<T extends ApiMediaFormat>(url: string) {
  return MEMORY_CACHE[url] as ApiMediaFormatToPrepared<T>;
}

export function cancelProgress(progressCallback: ApiOnProgress) {
  cancelApiProgress(progressCallback);
}

function getProgressive(url: string) {
  const progressiveUrl = `${PROGRESSIVE_URL_PREFIX}${url}`;

  MEMORY_CACHE[url] = progressiveUrl;

  return Promise.resolve(progressiveUrl);
}

async function fetchFromCacheOrRemote(url: string, mediaFormat: ApiMediaFormat, onProgress?: ApiOnProgress) {
  if (!MEDIA_CACHE_DISABLED) {
    const cached = await cacheApi.fetch(MEDIA_CACHE_NAME, url, asCacheApiType[mediaFormat]!);
    if (cached) {
      let media = cached;

      if (cached.type === 'audio/ogg' && !IS_OPUS_SUPPORTED) {
        media = await oggToWav(media);
      }

      const prepared = prepareMedia(media);

      if (mediaFormat === ApiMediaFormat.BlobUrl) {
        await preload(prepared as string, media.type);
      }

      MEMORY_CACHE[url] = prepared;

      return prepared;
    }
  }

  if (mediaFormat === ApiMediaFormat.Stream) {
    const mediaSource = new MediaSource();
    const streamUrl = URL.createObjectURL(mediaSource);
    let isOpen = false;

    mediaSource.addEventListener('sourceopen', () => {
      if (isOpen) {
        return;
      }
      isOpen = true;

      const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');

      void callApi('downloadMedia', { url, mediaFormat }, (progress: number, arrayBuffer: ArrayBuffer) => {
        if (onProgress) {
          onProgress(progress);
        }

        if (progress === 1) {
          mediaSource.endOfStream();
        }

        if (!arrayBuffer) {
          return;
        }

        sourceBuffer.appendBuffer(arrayBuffer!);
      });
    });

    MEMORY_CACHE[url] = streamUrl;
    return streamUrl;
  }

  const remote = await callApi('downloadMedia', { url, mediaFormat }, onProgress);
  if (!remote) {
    throw new Error('Failed to fetch media');
  }

  let { prepared, mimeType } = remote;

  if (mimeType === 'audio/ogg' && !IS_OPUS_SUPPORTED) {
    const blob = await fetchBlob(prepared as string);
    URL.revokeObjectURL(prepared as string);
    const media = await oggToWav(blob);
    prepared = prepareMedia(media);
    mimeType = blob.type;
  }

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
  if (mimeType.startsWith('image/') && (mimeType !== 'image/webp' || isWebpSupported())) {
    await preloadImage(blobUrl);
  }
}

if (IS_PROGRESSIVE_SUPPORTED) {
  navigator.serviceWorker.addEventListener('message', async (e) => {
    const { type, messageId, params } = e.data as {
      type: string;
      messageId: string;
      params: { url: string; start: number; end: number };
    };

    if (type !== 'requestPart') {
      return;
    }

    const result = await callApi('downloadMedia', { mediaFormat: ApiMediaFormat.BlobUrl, ...params });
    if (!result) {
      return;
    }

    const { prepared, mimeType, fullSize } = result;

    const response = await window.fetch(prepared as string);
    const arrayBuffer = await response.arrayBuffer();
    URL.revokeObjectURL(prepared as string);

    navigator.serviceWorker.controller!.postMessage({
      type: 'partResponse',
      messageId,
      result: {
        arrayBuffer,
        mimeType,
        fullSize,
      },
    }, [arrayBuffer]);
  });
}
