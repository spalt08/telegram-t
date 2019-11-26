import { ApiUpdate } from '../../../api/types';
import { DEBUG } from '../../../config';
import * as system from './system';
import * as users from './users';
import * as chats from './chats';
import * as messages from './messages';
import * as files from './files';

export default function onUpdate(update: ApiUpdate) {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log('[GramJs] UPDATE', update['@type'], { update });
  }

  system.onUpdate(update);
  users.onUpdate(update);
  chats.onUpdate(update);
  messages.onUpdate(update);
  files.onUpdate(update);
}
