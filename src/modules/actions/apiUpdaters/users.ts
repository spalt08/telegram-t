import { addReducer } from '../../../lib/teact/teactn';

import { ApiUpdate } from '../../../api/types';

import { updateUser } from '../../reducers';

addReducer('apiUpdate', (global, actions, update: ApiUpdate) => {
  switch (update['@type']) {
    case 'updateUser': {
      return updateUser(global, update.id, update.user);
    }

    case 'updateUserFullInfo': {
      const { id, fullInfo } = update;
      const targetUser = global.users.byId[id];
      if (!targetUser) {
        return undefined;
      }

      return updateUser(global, id, {
        fullInfo: {
          ...targetUser.fullInfo,
          ...fullInfo,
        },
      });
    }
  }

  return undefined;
});
