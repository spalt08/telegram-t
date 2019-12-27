import { addReducer } from '../../../lib/teactn';

import { callSdk } from '../../../api/gramjs';
import { selectUser } from '../../selectors';

addReducer('loadFullUser', (global, actions, payload) => {
  const { userId } = payload!;
  const user = selectUser(global, userId);
  if (!user) {
    return;
  }

  const { id, access_hash: accessHash } = user;

  void callSdk('fetchFullUser', { id, accessHash });
});
