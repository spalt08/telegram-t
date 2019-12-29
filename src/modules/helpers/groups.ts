import { ApiGroup } from '../../api/types';

export function isGroupChannel(group: ApiGroup) {
  // TODO Not supported in Gram JS.
  return group.is_channel || false;
}

export function getGroupTypeString(group: ApiGroup) {
  if (isGroupChannel(group)) {
    return 'channel';
  }

  return 'group chat';
}

export function getGroupDescription(group: ApiGroup) {
  return group.description;
}

export function getGroupLink(group: ApiGroup) {
  const { invite_link, username } = group;

  if (invite_link && invite_link.length) {
    return invite_link;
  }

  return username ? `t.me/${username}` : '';
}
