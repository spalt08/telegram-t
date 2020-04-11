import { addReducer } from '../../../lib/teact/teactn';

import { GlobalState } from '../../../global/types';

import { updateSelectedUserId } from '../../reducers';
import { selectOpenChat } from '../../selectors';

addReducer('openUserInfo', (global, actions, payload) => {
  const { id } = payload!;
  const selectedChat = selectOpenChat(global);

  if (selectedChat && selectedChat.id === id) {
    actions.openChatWithInfo({ id });
    return undefined;
  }

  return updateSelectedUserId(global, id);
});

const clearSelectedUserId = (global: GlobalState) => updateSelectedUserId(global, undefined);

addReducer('openChatWithInfo', clearSelectedUserId);
addReducer('openChat', clearSelectedUserId);
