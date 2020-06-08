import {
  addReducer, getGlobal, setGlobal,
} from '../../../lib/teact/teactn';

import { ApiUpdate } from '../../../api/types';

addReducer('apiUpdate', (global, actions, update: ApiUpdate) => {
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
