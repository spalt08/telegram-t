import { GlobalState } from '../../global/types';
import { ApiUser } from '../../api/types';

export function selectUser(global: GlobalState, userId: number): ApiUser | undefined {
  return global.users.byId[userId];
}

export function selectUserByUsername(global: GlobalState, username: string) {
  return Object.values(global.users.byId).find(
    (user) => user.username.toLowerCase() === username.toLowerCase(),
  );
}
