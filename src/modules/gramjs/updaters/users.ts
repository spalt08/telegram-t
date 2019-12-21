import { getGlobal, setGlobal } from '../../../lib/teactn';

import { ApiUpdate } from '../../../api/types';
import { buildCollectionByKey } from '../../../util/iteratees';
import { setUsers, updateUser } from '../../common/users';

export function onUpdate(update: ApiUpdate) {
  const global = getGlobal();

  switch (update['@type']) {
    case 'users': {
      const byId = buildCollectionByKey(update.users, 'id');
      setGlobal(setUsers(global, byId));

      break;
    }

    case 'updateUser': {
      setGlobal(updateUser(global, update.id, update.user));

      break;
    }
  }
}
