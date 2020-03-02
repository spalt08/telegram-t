import { addReducer, setGlobal, getGlobal } from '../../../lib/teact/teactn';

import { callApi } from '../../../api/gramjs';
import { selectUser } from '../../selectors';
import { debounce } from '../../../util/schedulers';

const runDebouncedForFetchFullUser = debounce((cb) => cb(), 500, false, true);

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

addReducer('loadTopUsers', () => {
  void loadTopUsers();
});

async function loadNearestCountry() {
  const authNearestCountry = await callApi('fetchNearestCountry');
  setGlobal({
    ...getGlobal(),
    authNearestCountry,
  });
}

async function loadTopUsers() {
  const users = await callApi('fetchTopUsers');
  if (!users) {
    return;
  }

  const global = getGlobal();

  setGlobal({
    ...global,
    topPeers: {
      ...global.topPeers,
      users,
    },
  });
}
