import { addReducer, setGlobal, getGlobal } from '../../../lib/teact/teactn';

import { callApi } from '../../../api/gramjs';
import { selectUser } from '../../selectors';
import { debounce } from '../../../util/schedulers';

const runDebouncedForFetchFullUser = debounce((cb) => cb(), 500, false, true);

addReducer('loadUserFromMessage', (global, actions, payload) => {
  const { chatId, userId, messageId } = payload!;

  void callApi('fetchUserFromMessage', { chatId, userId, messageId });
});

addReducer('loadFullUser', (global, actions, payload) => {
  const { userId } = payload!;
  const user = selectUser(global, userId);
  if (!user) {
    return;
  }

  const { id, access_hash: accessHash } = user;

  runDebouncedForFetchFullUser(() => callApi('fetchFullUser', { id, accessHash }));
});

addReducer('loadNearestCountry', (global) => {
  const { connectionState } = global;

  if (connectionState === 'connectionStateReady') {
    void loadNearestCountry();
  }
});

async function loadNearestCountry() {
  const authNearestCountry = await callApi('fetchNearestCountry');
  setGlobal({
    ...getGlobal(),
    authNearestCountry,
  });
}
