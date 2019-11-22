import { OnUpdate } from './types/types';

import { init as initUpdater } from './connectors/updater';
import { init as initAuth } from './connectors/auth';
import { init as initChats } from './connectors/chats';
import { init as initMessages } from './connectors/messages';
import { init as initFiles } from './connectors/files';
import { init as initClient } from './client';

export async function init(onUpdate: OnUpdate, sessionId = '') {
  initUpdater(onUpdate);
  initAuth(onUpdate);
  initChats(onUpdate);
  initMessages(onUpdate);
  initFiles();

  await initClient(sessionId);
}
