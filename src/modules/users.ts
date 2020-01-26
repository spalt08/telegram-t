import { addReducer } from '../lib/teact/teactn';

import { GlobalState } from '../store/types';

import { updateSelectedUserId } from './common/users';

addReducer('openUserInfo', (global, actions, payload) => {
  const { id } = payload!;

  global = updateSelectedUserId(global, id);
  global = {
    ...global,
    showRightColumn: true,
  };

  return global;
});

const clearSelectedUserId = (global: GlobalState) => updateSelectedUserId(global, undefined);

addReducer('openChatWithInfo', clearSelectedUserId);
addReducer('openChat', clearSelectedUserId);
