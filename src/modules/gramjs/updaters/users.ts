import { getGlobal, setGlobal } from '../../../lib/teactn';

import { ApiUpdate } from '../../../api/types';
import { updateUser } from '../../common/users';

export function onUpdate(update: ApiUpdate) {
  const global = getGlobal();

  switch (update['@type']) {
    case 'updateUser': {
      setGlobal(updateUser(global, update.id, update.user));

      break;
    }

    case 'updateUserFullInfo': {
      const { id, full_info } = update;
      const targetUser = global.users.byId[id];
      if (!targetUser) {
        return;
      }

      setGlobal(updateUser(global, id, {
        full_info: {
          ...targetUser.full_info,
          ...full_info,
        },
      }));
    }
  }
}
