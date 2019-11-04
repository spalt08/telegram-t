import { addReducer, GlobalState } from '../../lib/reactnt';
import * as TdLib from '../../api/tdlib';

import * as system from './system';
import * as chats from './chats';
import { TdLibUpdate } from '../../api/tdlib/updates';

addReducer('init', (global: GlobalState) => {
  TdLib.init(onUpdate);

  return {
    global,
    isInitialized: true,
  };
});

function onUpdate(update: TdLibUpdate) {
  console.log('[TdLib] UPDATE', update['@type'], { update });

  system.onUpdate(update);
  chats.onUpdate(update);
};
