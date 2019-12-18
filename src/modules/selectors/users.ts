import { GlobalState } from '../../store/types';

export function selectUser(global: GlobalState, userId: number) {
  return global.users.byId[userId];
}
