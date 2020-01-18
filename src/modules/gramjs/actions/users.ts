import { addReducer, setGlobal, getGlobal } from '../../../lib/teactn';

import { callSdk } from '../../../api/gramjs';
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

  runDebouncedForFetchFullUser(() => callSdk('fetchFullUser', { id, accessHash }));
});

addReducer('loadNearestCountry', (global) => {
  const { connectionState } = global;

  if (connectionState === 'connectionStateReady') {
    void loadNearestCountry();
  }
});

async function loadNearestCountry() {
  const authNearestCountry = await callSdk('fetchNearestCountry', undefined);
  setGlobal({
    ...getGlobal(),
    authNearestCountry,
  });
}
