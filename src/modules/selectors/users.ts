import { GlobalState } from '../../global/types';
import { ApiUser } from '../../api/types';

export function selectUser(global: GlobalState, userId: number): ApiUser | undefined {
  return global.users.byId[userId];
}

export function selectUserByUserName(global: GlobalState, userName: string) {
  return Object.values(global.users.byId).find(
    (user) => user.username.toLowerCase() === userName.toLowerCase(),
  );
}
