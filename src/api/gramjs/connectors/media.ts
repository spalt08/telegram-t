import { Api as GramJs, TelegramClient } from '../../../lib/gramjs';

import localDb from '../localDb';
import { getEntityTypeById } from '../inputHelpers';

// TODO Await client ready.
export default function downloadMedia(client: TelegramClient, url: string): Promise<Buffer | null> | null {
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

  return entityType === 'msg'
    ? client.downloadMedia(entity, { sizeType })
    : client.downloadProfilePhoto(entity, false);
}
