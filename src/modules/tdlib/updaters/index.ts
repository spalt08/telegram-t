import { ApiUpdate } from '../../../api/types';
import { TdLibUpdate } from '../../../api/tdlib/types/updates';

import { DEBUG } from '../../../config';
import * as system from './system';
import * as users from './users';
import * as chats from './chats';
import * as messages from './messages';
import * as files from './files';
import * as groups from './groups';

export default function onUpdate(update: ApiUpdate | TdLibUpdate) {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log('[TdLib] UPDATE', update['@type'], { update });
  }

  system.onUpdate(update);
  users.onUpdate(update);
  chats.onUpdate(update);
  messages.onUpdate(update);
  files.onUpdate(update);
  groups.onUpdate(update);
}
