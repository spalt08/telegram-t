import {
  addReducer, getGlobal, setGlobal,
} from '../../../lib/teact/teactn';

import {
  ApiUpdate,
} from '../../../api/types';
import { DEBUG } from '../../../config';

addReducer('apiUpdate', (global, actions, update: ApiUpdate) => {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log('[GramJs] UPDATE', update['@type'], { update });
  }

  switch (update['@type']) {
    case 'updateResetContactList':
      setGlobal({
        ...getGlobal(),
        contactList: {
          hash: 0,
          userIds: [],
        },
      });
      break;

    case 'updateFavoriteStickers':
      actions.loadFavoriteStickers();
  }
});
