import { Api as GramJs, TelegramClient } from '../../../lib/gramjs';

import localDb from '../localDb';
import { getEntityTypeById } from '../gramjsBuilders';

type EntityType = 'msg' | 'sticker' | 'gif' | 'channel' | 'chat' | 'user';

export default async function downloadMedia(client: TelegramClient, url: string): Promise<{
  data: Buffer | null;
  mimeType?: string;
} | null> {
  const mediaMatch = url.match(/(avatar|msg|sticker|gif)([-\d]+)(\?size=\w)?/);
  if (!mediaMatch) {
    return null;
  }

  let entityType: EntityType;
  let entityId: string | number = mediaMatch[2];
  const sizeType = mediaMatch[3] ? mediaMatch[3].replace('?size=', '') : null;
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
    return null;
  }

  if (entityType === 'msg' || entityType === 'sticker' || entityType === 'gif') {
    const data = await client.downloadMedia(entity, { sizeType });
    const mimeType = entity instanceof GramJs.Message
      ? getMessageMediaMimeType(entity, Boolean(sizeType))
      : (entity as GramJs.Document).mimeType;

    return { mimeType, data };
  } else {
    const data = await client.downloadProfilePhoto(entity, false);
    const mimeType = 'image/jpeg';
    return { mimeType, data };
  }
}

function getMessageMediaMimeType(message: GramJs.Message, isThumb = false) {
  if (!message || !message.media) {
    return undefined;
  }

  if (isThumb || message.media instanceof GramJs.MessageMediaPhoto) {
    return 'image/jpeg';
  }

  if (message.media instanceof GramJs.MessageMediaDocument && message.media.document instanceof GramJs.Document) {
    return message.media.document.mimeType;
  }

  return undefined;
}
