import { GlobalState } from '../../../lib/teactn';

export function selectUser(global: GlobalState, userId: number) {
  return global.users.byId[userId];
}
