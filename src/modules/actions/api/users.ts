import { addReducer, setGlobal, getGlobal } from '../../../lib/teact/teactn';

import { callApi } from '../../../api/gramjs';
import { selectUser } from '../../selectors';
import { addUsers, updateChats } from '../../reducers';
import { debounce } from '../../../util/schedulers';
import { buildCollectionByKey } from '../../../util/iteratees';
import { ApiUser } from '../../../api/types';

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

  let newGlobal = addUsers(getGlobal(), buildCollectionByKey(contactList.users, 'id'));
  newGlobal = updateChats(newGlobal, buildCollectionByKey(contactList.chats, 'id'));

  // Sort contact list by Last Name (or First Name), with latinic names being placed first
  const getCompareString = (user: ApiUser) => (user.last_name || user.first_name || '');
  const collator = new Intl.Collator('en-US');

  const sortedUsers = contactList.users.sort((a, b) => (
    collator.compare(getCompareString(a), getCompareString(b))
  )).filter((user) => !user.is_self);

  setGlobal({
    ...newGlobal,
    contactList: {
      hash: contactList.hash,
      userIds: sortedUsers.map((user) => user.id),
    },
  });
}
