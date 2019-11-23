import { getDispatch, getGlobal, setGlobal } from '../../../lib/teactn';

import { ApiUpdate, ApiUser } from '../../../api/types';
import { buildCollectionByKey } from '../../../util/iteratees';

export function onUpdate(update: ApiUpdate) {
  switch (update['@type']) {
    case 'users': {
      setUsers(update.users);

      update.users.forEach((user: ApiUser) => {
        getDispatch().loadUserPhoto({ user });
      });

      break;
    }

    case 'updateUser': {
      updateUser(update.id, update.user);

      getDispatch().loadUserPhoto({ user: update.user });

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
