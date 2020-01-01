import { Api as GramJs, TelegramClient } from '../../../lib/gramjs';

import localDb from '../localDb';
import { getEntityTypeById } from '../inputHelpers';

// TODO Await client ready.
export default async function downloadMedia(client: TelegramClient, url: string): Promise<{
  data: Buffer | null;
  mimeType?: string;
} | null> {
  const mediaMatch = url.match(/(avatar|msg)([-\d]+)(\?size=\w)?/);
  if (!mediaMatch) {
    return null;
  }

  let entityType = mediaMatch[1];
  let entityId: string | number = mediaMatch[2];
  const sizeType = mediaMatch[3] ? mediaMatch[3].replace('?size=', '') : null;
  let entity: GramJs.User | GramJs.Chat | GramJs.Channel | GramJs.Message | undefined;

  if (entityType === 'avatar') {
    entityType = getEntityTypeById(Number(entityId));
    entityId = Math.abs(Number(entityId));
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
  }

  if (!entity) {
    return null;
  }

  if (entityType === 'msg') {
    const data = await client.downloadMedia(entity, { sizeType });
    const mimeType = getMediaMimeType(entity as GramJs.Message);
    return { mimeType, data };
  } else {
    const data = await client.downloadProfilePhoto(entity, false);
    const mimeType = 'image/jpeg';
    return { mimeType, data };
  }
}

function getMediaMimeType(message: GramJs.Message) {
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
