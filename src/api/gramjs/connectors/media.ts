import { Api as GramJs, TelegramClient } from '../../../lib/gramjs';

import localDb from '../localDb';
import { getEntityTypeById } from '../inputHelpers';
import { pause } from '../../../util/schedulers';
import { Queue } from '../util/queue';

const IMAGE_LOAD_TIMEOUT = 1000;

const queue = new Queue();

// TODO Client ready.
export default function downloadMedia(client: TelegramClient, url: string): Promise<Buffer | null> | null {
  const mediaMatch = url.match(/(avatar|msg)(-?\d+)/);
  if (!mediaMatch) {
    return null;
  }

  let entityType = mediaMatch[1];
  let entityId: number = Number(mediaMatch[2]);
  let entity: GramJs.User | GramJs.Chat | GramJs.Channel | GramJs.Message | undefined;

  if (entityType === 'avatar') {
    entityType = getEntityTypeById(entityId);
    entityId = Math.abs(entityId);
  }

  switch (entityType) {
    case 'channel':
    case 'chat':
      entity = localDb.chats[entityId];
      break;
    case 'user':
      entity = localDb.users[entityId];
      break;
    case 'msg':
      entity = localDb.messages[entityId];
      break;
  }

  if (!entity) {
    return null;
  }

  if (entityType === 'msg') {
    return queue.add(() => Promise.race([
      client.downloadMedia(entity, { sizeType: 'x' }),
      pause(IMAGE_LOAD_TIMEOUT),
    ]));
  } else {
    return client.downloadProfilePhoto(entity, false);
  }
}
