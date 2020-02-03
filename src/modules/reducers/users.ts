import { GlobalState } from '../../store/types';
import { ApiUser } from '../../api/types';

export function replaceUsers(global: GlobalState, newById: Record<number, ApiUser>) {
  return {
    ...global,
    users: {
      ...global.users,
      byId: newById,
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

export function updateUsers(global: GlobalState, updatedById: Record<number, ApiUser>) {
  let newGlobal = global;

  Object.keys(updatedById).forEach((id) => {
    newGlobal = updateUser(newGlobal, Number(id), updatedById[Number(id)]);
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
