import { addReducer, GlobalState } from '../../lib/teactn';

import * as TdLib from '../../api/tdlib';
import { TdLibUpdate } from '../../api/tdlib/updates';

import * as system from './system';
import * as chats from './chats';
import * as messages from './messages';

addReducer('init', (global: GlobalState) => {
  TdLib.init(onUpdate);

  return {
    ...global,
    isInitialized: true,
  };
});

function onUpdate(update: TdLibUpdate) {
  console.log('[TdLib] UPDATE', update['@type'], { update });

  system.onUpdate(update);
  chats.onUpdate(update);
  messages.onUpdate(update);
}
