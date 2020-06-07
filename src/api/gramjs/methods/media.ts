import { inflate } from 'pako/lib/inflate';

import { Api as GramJs, TelegramClient } from '../../../lib/gramjs';
import {
  ApiMediaFormat, ApiOnProgress, ApiParsedMedia, ApiPreparedMedia,
} from '../../types';

import { MEDIA_CACHE_DISABLED, MEDIA_CACHE_MAX_BYTES, MEDIA_CACHE_NAME } from '../../../config';
import localDb from '../localDb';
import { getEntityTypeById } from '../gramjsBuilders';
import { blobToDataUri } from '../../../util/files';
import * as cacheApi from '../../../util/cacheApi';

type EntityType = 'msg' | 'sticker' | 'gif' | 'channel' | 'chat' | 'user';

export default async function downloadMedia(
  {
    url, mediaFormat, start, end,
  }: {
    url: string; mediaFormat: ApiMediaFormat; start?: number; end?: number;
  },
  client: TelegramClient,
  isConnected: boolean,
  onProgress?: ApiOnProgress,
) {
  const { data, mimeType, fullSize } = await download(url, client, isConnected, onProgress, start, end) || {};
  if (!data) {
    return undefined;
  }

  const parsed = await parseMedia(data, mediaFormat, mimeType);
  if (!parsed) {
    return undefined;
  }

  const canCache = mediaFormat !== ApiMediaFormat.Progressive && (
    mediaFormat !== ApiMediaFormat.BlobUrl || (parsed as Blob).size <= MEDIA_CACHE_MAX_BYTES
  );
  if (!MEDIA_CACHE_DISABLED && cacheApi && canCache) {
    void cacheApi.save(MEDIA_CACHE_NAME, url, parsed);
  }

  const prepared = prepareMedia(parsed);

  return { prepared, mimeType, fullSize };
}

async function download(
  url: string, client: TelegramClient, isConnected: boolean, onProgress?: ApiOnProgress, start?: number, end?: number,
) {
  const mediaMatch = url.match(/(avatar|msg|sticker|gif|file)([-\d\w./]+)(\?size=\w+)?/);
  if (!mediaMatch) {
    return undefined;
  }

  if (mediaMatch[1] === 'file') {
    const response = await fetch(mediaMatch[2]);
    const data = await response.arrayBuffer();
    return { data };
  }

  if (!isConnected) {
    return Promise.reject(new Error('ERROR: Client is not connected'));
  }

  let entityType: EntityType;
  let entityId: string | number = mediaMatch[2];
  const sizeType = mediaMatch[3] ? mediaMatch[3].replace('?size=', '') : undefined;
  let entity: GramJs.User | GramJs.Chat | GramJs.Channel | GramJs.Message | GramJs.Document | undefined;

  if (mediaMatch[1] === 'avatar') {
    entityType = getEntityTypeById(Number(entityId));
    entityId = Math.abs(Number(entityId));
  } else {
    entityType = mediaMatch[1] as 'msg' | 'sticker' | 'gif';
  }

  switch (entityType) {
    case 'channel':
    case 'chat':
      entity = localDb.chats[entityId as number];
      break;
    case 'user':
      entity = localDb.users[entityId as number];
      break;
    case 'msg':
      entity = localDb.messages[entityId as string];
      break;
    case 'sticker':
    case 'gif':
      entity = localDb.documents[entityId as string];
      break;
  }

  if (!entity) {
    return undefined;
  }

  if (entityType === 'msg' || entityType === 'sticker' || entityType === 'gif') {
    const data = await client.downloadMedia(entity, {
      sizeType, start, end, progressCallback: onProgress,
    });
    let mimeType;
    let fullSize;

    if (entityType === 'sticker' && sizeType) {
      mimeType = 'image/webp';
    } else if (sizeType) {
      mimeType = 'image/jpeg';
    } else if (entity instanceof GramJs.Message) {
      mimeType = getMessageMediaMimeType(entity);
      if (entity.media instanceof GramJs.MessageMediaDocument && entity.media.document instanceof GramJs.Document) {
        fullSize = entity.media.document.size;
      }
    } else {
      mimeType = (entity as GramJs.Document).mimeType;
      fullSize = (entity as GramJs.Document).size;
    }

    return { mimeType, data, fullSize };
  } else {
    const data = await client.downloadProfilePhoto(entity, sizeType === 'big');
    const mimeType = 'image/jpeg';

    return { mimeType, data };
  }
}

function getMessageMediaMimeType(message: GramJs.Message) {
  if (!message || !message.media) {
    return undefined;
  }

  if (message.media instanceof GramJs.MessageMediaPhoto) {
    return 'image/jpeg';
  }

  if (message.media instanceof GramJs.MessageMediaDocument && message.media.document instanceof GramJs.Document) {
    return message.media.document.mimeType;
  }

  return undefined;
}

// eslint-disable-next-line no-async-without-await/no-async-without-await
async function parseMedia(
  data: Buffer, mediaFormat: ApiMediaFormat, mimeType?: string,
): Promise<ApiParsedMedia | undefined> {
  switch (mediaFormat) {
    case ApiMediaFormat.DataUri:
      return blobToDataUri(new Blob([data], { type: mimeType }));
    case ApiMediaFormat.BlobUrl:
      return new Blob([data], { type: mimeType });
    case ApiMediaFormat.Lottie: {
      const json = inflate(data, { to: 'string' });
      return JSON.parse(json);
    }
  }

  return undefined;
}

function prepareMedia(mediaData: ApiParsedMedia): ApiPreparedMedia {
  if (mediaData instanceof Blob) {
    return URL.createObjectURL(mediaData);
  }

  return mediaData;
}
