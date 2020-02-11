import { addReducer } from '../../lib/teact/teactn';

import { GlobalState } from '../../global/types';

import { updateSelectedUserId } from '../reducers';

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
