import { GlobalState } from '../../global/types';

export function selectUser(global: GlobalState, userId: number) {
  return global.users.byId[userId];
}

export function selectOpenUser(global: GlobalState) {
  const { byId, selectedId } = global.users;
  return selectedId ? byId[selectedId] : undefined;
}
