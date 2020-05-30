import { addReducer, setGlobal, getGlobal } from '../../../lib/teact/teactn';

import { ApiUser } from '../../../api/types';
import { ProfileEditProgress } from '../../../types';

import { debounce } from '../../../util/schedulers';
import { buildCollectionByKey } from '../../../util/iteratees';
import { callApi } from '../../../api/gramjs';
import { selectUser } from '../../selectors';
import { addUsers, updateChats, updateUser } from '../../reducers';

const runDebouncedForFetchFullUser = debounce((cb) => cb(), 500, false, true);
const TOP_PEERS_REQUEST_COOLDOWN = 60000; // 1 min

addReducer('loadFullUser', (global, actions, payload) => {
  const { userId } = payload!;
  const user = selectUser(global, userId);
  if (!user) {
    return;
  }

  const { id, accessHash } = user;

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

addReducer('loadCurrentUser', () => {
  void callApi('fetchCurrentUser');
});

addReducer('updateProfile', (global, actions, payload) => {
  const {
    photo, firstName, lastName, bio, username,
  } = payload!;

  void updateProfile(photo, firstName, lastName, bio, username);
});

addReducer('checkUsername', (global, actions, payload) => {
  const { username } = payload!;
  void checkUsername(username);
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
  const getCompareString = (user: ApiUser) => (user.lastName || user.firstName || '');
  const collator = new Intl.Collator('en-US');

  const sortedUsers = contactList.users.sort((a, b) => (
    collator.compare(getCompareString(a), getCompareString(b))
  )).filter((user) => !user.isSelf);

  setGlobal({
    ...newGlobal,
    contactList: {
      hash: contactList.hash,
      userIds: sortedUsers.map((user) => user.id),
    },
  });
}

async function updateProfile(
  photo?: File,
  firstName?: string,
  lastName?: string,
  about?: string,
  username?: string,
) {
  let global = getGlobal();
  const { currentUserId } = global;
  if (!currentUserId) {
    return;
  }

  setGlobal({
    ...getGlobal(),
    profileEdit: {
      progress: ProfileEditProgress.InProgress,
    },
  });

  if (photo) {
    await callApi('updateProfilePhoto', photo);
  }

  if (firstName || lastName || about) {
    const result = await callApi('updateProfile', { firstName, lastName, about });
    if (result) {
      global = getGlobal();
      const currentUser = currentUserId && selectUser(global, currentUserId);

      if (currentUser) {
        setGlobal(updateUser(
          global,
          currentUser.id,
          {
            firstName,
            lastName,
            fullInfo: {
              ...currentUser.fullInfo,
              bio: about,
            },
          },
        ));
      }
    }
  }

  if (username) {
    const result = await callApi('updateUsername', username);
    if (result && currentUserId) {
      setGlobal(updateUser(getGlobal(), currentUserId, { username }));
    }
  }

  setGlobal({
    ...getGlobal(),
    profileEdit: {
      progress: ProfileEditProgress.Complete,
    },
  });
}

async function checkUsername(username: string) {
  let global = getGlobal();

  // No need to check the username if profile update is already in progress
  if (global.profileEdit && global.profileEdit.progress === ProfileEditProgress.InProgress) {
    return;
  }

  setGlobal({
    ...global,
    profileEdit: {
      progress: global.profileEdit ? global.profileEdit.progress : ProfileEditProgress.Idle,
      isUsernameAvailable: undefined,
    },
  });

  const isUsernameAvailable = await callApi('checkUsername', username);

  global = getGlobal();
  setGlobal({
    ...global,
    profileEdit: {
      ...global.profileEdit!,
      isUsernameAvailable,
    },
  });
}
