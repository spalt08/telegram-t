import { GlobalState } from '../../../lib/teactn';

// TODO Add `reselect` to all selectors.

export function selectUser(global: GlobalState, userId: number) {
  return global.users.byId[userId];
}
