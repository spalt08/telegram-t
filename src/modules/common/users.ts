import { ApiUser } from '../../api/types';
import { GlobalState } from '../../store/types';

export function setUsers(global: GlobalState, byId: Record<number, ApiUser>) {
  return {
    ...global,
    users: {
      ...global.users,
      byId: {
        ...global.users.byId,
        ...byId,
      },
    },
  };
}

export function updateUser(global: GlobalState, userId: number, userUpdate: Partial<ApiUser>) {
  return {
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
  };
}
