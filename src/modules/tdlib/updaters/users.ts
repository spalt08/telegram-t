import { getDispatch, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiUpdate, ApiUser } from '../../../api/types';
import { TdLibUpdate, TdLibUpdateUser } from '../../../api/tdlib/types/updates';

export function onUpdate(update: ApiUpdate | TdLibUpdate) {
  switch (update['@type']) {
    case 'updateUser': {
      const { user } = update as TdLibUpdateUser;

      updateUser(user.id, user);

      getDispatch().loadUserPhoto({ user });

      break;
    }

    case 'updateUserFullInfo': {
      const { user_id, user_full_info } = update;

      updateUser(user_id, user_full_info);

      break;
    }

    case 'updateUserStatus': {
      const { user_id, status } = update;

      updateUser(user_id, { status });

      break;
    }
  }
}

function updateUser(userId: number, userUpdate: Partial<ApiUser>) {
  const global = getGlobal();

  setGlobal({
    ...global,
    users: {
      ...global.users,
      byId: {
        ...global.users.byId,
        [userId]: {
          ...global.users.byId[userId],
          ...userUpdate,
        },
      },
    },
  });
}
