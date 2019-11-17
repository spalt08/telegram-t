import { getGlobal, setGlobal } from '../../../lib/teactn';

import { TdLibUpdate, ApiUser } from '../../../api/tdlib/types';

export function onUpdate(update: TdLibUpdate) {
  switch (update['@type']) {
    case 'updateUser': {
      updateUser(update.user.id, update.user);

      // TODO This is not yet supported and will block other requests.
      // getDispatch().loadUserPhoto({ user: update.user });

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
