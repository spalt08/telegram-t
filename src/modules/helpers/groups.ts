import { ApiGroup } from '../../api/tdlib/types';

export function isChannel(group: ApiGroup) {
  return group.is_channel;
}

export function getGroupTypeString(group: ApiGroup) {
  if (isChannel(group)) {
    return 'Channel';
  }

  if (group['@type'] === 'supergroup') {
    return 'Supergroup Chat';
  }

  return 'Group Chat';
}

export function getGroupLink(group: ApiGroup) {
  const { invite_link, username } = group;

  if (invite_link && invite_link.length) {
    return invite_link;
  }

  return username ? `t.me/${username}` : '';
}
