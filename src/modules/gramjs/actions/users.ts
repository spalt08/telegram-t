import { addReducer, setGlobal, getGlobal } from '../../../lib/teact/teactn';

import { callApi } from '../../../api/gramjs';
import { selectUser } from '../../selectors';
import { addUsers } from '../../reducers';
import { debounce } from '../../../util/schedulers';
import { buildCollectionByKey } from '../../../util/iteratees';

const runDebouncedForFetchFullUser = debounce((cb) => cb(), 500, false, true);
const TOP_PEERS_REQUEST_COOLDOWN = 60000; // 1 min

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

addReducer('loadTopUsers', (global) => {
  const { users: usersHash } = global.topPeers.hashes || {};
  const { users: usersLastRequested } = global.topPeers.lastRequestedAt || {};

  if (!usersLastRequested || Date.now() - usersLastRequested > TOP_PEERS_REQUEST_COOLDOWN) {
    void loadTopUsers(usersHash);
  }
});

addReducer('loadContactList', (global) => {
  const { hash } = global.contactList || {};
  void loadContactList(hash);
});

async function loadNearestCountry() {
  const authNearestCountry = await callApi('fetchNearestCountry');
  setGlobal({
    ...getGlobal(),
    authNearestCountry,
  });
}

async function loadTopUsers(usersHash?: number) {
  const result = await callApi('fetchTopUsers', { hash: usersHash });
  if (!result) {
    return;
  }

  const { hash, users } = result;
  const global = getGlobal();

  setGlobal({
    ...global,
    topPeers: {
      ...global.topPeers,
      hashes: {
        ...global.topPeers.hashes,
        users: hash,
      },
      lastRequestedAt: {
        ...global.topPeers.lastRequestedAt,
        users: Date.now(),
      },
      users,
    },
  });
}

async function loadContactList(hash?: number) {
  const contactList = await callApi('fetchContactList', { hash });
  if (!contactList) {
    return;
  }

  setGlobal({
    ...addUsers(getGlobal(), buildCollectionByKey(contactList.users, 'id')),
    contactList: {
      hash: contactList.hash,
      userIds: contactList.users.map((user) => user.id),
    },
  });
}
