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
  const user = global.users.byId[userId];
  const updatedUser = {
    ...user,
    ...userUpdate,
  };

  if (!updatedUser.id || !updatedUser.type) {
    return global;
  }

  return updateUsers(global, { [userId]: updatedUser });
}

export function updateSelectedUserId(global: GlobalState, selectedId?: number) {
  return {
    ...global,
    users: {
      ...global.users,
      selectedId,
    },
  };
}
