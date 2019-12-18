import { TelegramClient } from '../../../lib/gramjs';

import localDb from '../localDb';
import { getEntityTypeById } from '../inputHelpers';
import { pause } from '../../../util/schedulers';

// This is an heuristic value that allows subsequent images to load properly when intermediate load breaks.
const IMAGE_LOAD_DELAY = 200;

let currentPromise: Promise<Buffer | null>;

// TODO client ready.
export default function downloadMedia(client: TelegramClient, url: string): Promise<Buffer | null> | null {
  const mediaMatch = url.match(/(avatar|msg)(-?\d+)/);
  if (!mediaMatch) {
    return null;
  }

  let entityType = mediaMatch[1];
  let entityId: number = Number(mediaMatch[2]);
  let entity;

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
    // TODO Load entity.
    return null;
  }

  // TODO Queue with array.
  if (entityType === 'msg') {
    const prevPromise = currentPromise;
    currentPromise = (async () => {
      if (prevPromise) {
        await prevPromise;
      }
      await pause(IMAGE_LOAD_DELAY);
      return client.downloadMedia(entity, { sizeType: 'x' });
    })();
    return currentPromise;
  } else {
    return client.downloadProfilePhoto(entity, false);
  }
}
