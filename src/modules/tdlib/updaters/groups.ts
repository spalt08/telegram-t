import { getGlobal, setGlobal } from '../../../lib/teactn';

import { TdLibUpdate, ApiGroup } from '../../../api/tdlib/types';

export function onUpdate(update: TdLibUpdate) {
  switch (update['@type']) {
    case 'updateBasicGroup': {
      updateGroup(update.basic_group.id, update.basic_group);

      break;
    }

    case 'updateBasicGroupFullInfo': {
      const {
        creator_user_id,
        description,
        invite_link,
        members,
      } = update.basic_group_full_info;

      updateGroup(
        update.basic_group_id,
        {
          creator_user_id,
          description,
          invite_link,
          members,
        },
      );
      break;
    }

    case 'updateSupergroup': {
      updateGroup(update.supergroup.id, update.supergroup);

      break;
    }

    case 'updateSupergroupFullInfo': {
      const {
        description,
        invite_link,
        administrator_count,
        member_count,
      } = update.supergroup_full_info;

      updateGroup(
        update.supergroup_id,
        {
          description,
          invite_link,
          administrator_count,
          member_count,
        },
      );
      break;
    }
  }
}

function updateGroup(groupId: number, groupUpdate: Partial<ApiGroup>) {
  const global = getGlobal();

  setGlobal({
    ...global,
    groups: {
      ...global.groups,
      byId: {
        ...global.groups.byId,
        [groupId]: {
          ...global.groups.byId[groupId],
          ...groupUpdate,
        },
      },
    },
  });
}
