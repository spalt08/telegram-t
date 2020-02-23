import { GlobalState } from '../../global/types';
import { ApiUser } from '../../api/types';

export function replaceUsers(global: GlobalState, newById: Record<number, ApiUser>): GlobalState {
  return {
    ...global,
    users: {
      ...global.users,
      byId: newById,
    },
  };
}

export function updateUser(global: GlobalState, userId: number, userUpdate: Partial<ApiUser>): GlobalState {
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

export function updateUsers(global: GlobalState, updatedById: Record<number, ApiUser>): GlobalState {
  let newGlobal = global;

  Object.keys(updatedById).map(Number).forEach((id) => {
    newGlobal = updateUser(newGlobal, id, updatedById[id]);
  });

  return newGlobal;
}

export function addUsers(global: GlobalState, addedById: Record<number, ApiUser>): GlobalState {
  const { byId } = global.users;
  let newGlobal = global;

  Object.keys(addedById).map(Number).forEach((id) => {
    if (!byId[id]) {
      newGlobal = updateUser(newGlobal, id, addedById[id]);
    }
  });

  return newGlobal;
}

export function updateSelectedUserId(global: GlobalState, selectedId?: number): GlobalState {
  if (global.users.selectedId === selectedId) {
    return global;
  }

  return {
    ...global,
    users: {
      ...global.users,
      selectedId,
    },
    messageSearch: {
      isTextSearch: false,
    },
  };
}
