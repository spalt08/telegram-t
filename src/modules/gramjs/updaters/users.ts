import { getDispatch, getGlobal, setGlobal } from '../../../lib/teactn';

import { TdLibUpdate, ApiUser } from '../../../api/tdlib/types';
import { buildCollectionByKey } from '../../../util/iteratees';

export function onUpdate(update: TdLibUpdate) {
  switch (update['@type']) {
    case 'users': {
      setUsers(update.users);

      update.users.forEach((user: ApiUser) => {
        getDispatch().loadUserPhoto({ user });
      });

      break;
    }

    case 'updateUser': {
      updateUser(update.user.id, update.user);

      getDispatch().loadUserPhoto({ user: update.user });

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

function setUsers(users: ApiUser[]) {
  const global = getGlobal();

  const byId = buildCollectionByKey(users, 'id');

  setGlobal({
    ...global,
    users: {
      ...global.users,
      byId: {
        ...global.users.byId,
        ...byId,
      },
    },
  });
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
