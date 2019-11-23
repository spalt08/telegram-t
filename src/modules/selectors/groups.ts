import { GlobalState } from '../../store/types';
import { ApiGroup } from '../../api/types';
import { isChannel, isUserOnline } from '../helpers';

export function selectGroup(global: GlobalState, groupId: number) {
  return global.groups.byId[groupId];
}

export function selectGroupOnlineCount(global: GlobalState, group: ApiGroup) {
  if (isChannel(group) || !group.members) {
    return undefined;
  }

  const groupMemberIds = group.members.map((m) => m.user_id);
  let onlineCount = 0;
  groupMemberIds.forEach((id) => {
    const user = global.users.byId[id];
    if (user && isUserOnline(user)) {
      onlineCount++;
    }
  });

  return onlineCount;
}
