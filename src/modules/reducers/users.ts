import { ApiUser } from '../../api/types';
import { GlobalState } from '../../store/types';

export function replaceUsers(global: GlobalState, byId: Record<number, ApiUser>) {
  return {
    ...global,
    users: {
      ...global.users,
      byId,
    },
  };
}

export function updateUser(global: GlobalState, userId: number, userUpdate: Partial<ApiUser>) {
  const { byId } = global.users;
  const user = byId[userId];
  const updatedUser = {
    ...user,
    ...userUpdate,
  };

  if (!updatedUser.id || !updatedUser.type) {
    return global;
  }

  return replaceUsers(global, {
    ...byId,
    [userId]: updatedUser,
  });
}

export function updateUsers(global: GlobalState, byId: Record<number, ApiUser>) {
  let newGlobal = global;

  Object.keys(byId).forEach((id) => {
    newGlobal = updateUser(newGlobal, Number(id), byId[Number(id)]);
  });

  return newGlobal;
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
