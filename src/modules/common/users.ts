import { ApiUser } from '../../api/types';
import { GlobalState } from '../../store/types';

export function updateUsers(global: GlobalState, byId: Record<number, ApiUser>, shouldReplaceExisting = false) {
  return {
    ...global,
    users: {
      ...global.users,
      byId: {
        ...(!shouldReplaceExisting && global.users.byId),
        ...byId,
      },
    },
  };
}

export function updateUser(global: GlobalState, userId: number, userUpdate: Partial<ApiUser>) {
  const currentUser = global.users.byId[userId];

  const isSufficient = (currentUser && currentUser.type) || userUpdate.type;
  if (!isSufficient) {
    return global;
  }

  return updateUsers(global, {
    [userId]: {
      ...global.users.byId[userId],
      ...userUpdate,
    },
  });
}
