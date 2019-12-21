import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { ApiChat, ApiGroup } from '../../../../api/types';
import { isChannel, getGroupTypeString, isSuperGroupChat } from '../../../../modules/helpers';
import Avatar from '../../../../components/Avatar';
import { selectChat, selectChatGroupId, selectGroupOnlineCount } from '../../../../modules/selectors';
import { selectGroup } from '../../../../modules/selectors/groups';

type IProps = {
  chatId: number;
  avatarSize?: 'small' | 'medium' | 'large' | 'jumbo';
  chat: ApiChat;
  group: ApiGroup;
  onlineMembers?: number;
};

const GroupChatInfo: FC<IProps> = ({
  chat,
  group,
  onlineMembers,
  avatarSize = 'medium',
}) => {
  const groupStatus = getGroupStatus(chat, group);
  const onlineStatus = onlineMembers ? `, ${onlineMembers} online` : '';

  return (
    <div className="ChatInfo">
      <Avatar size={avatarSize} chat={chat} />
      <div>
        <div className="title">{chat.title}</div>
        <div className="status">
          {groupStatus}
          {onlineStatus}
        </div>
      </div>
    </div>
  );
};

function getGroupStatus(chat: ApiChat, group?: ApiGroup) {
  if (!group) {
    return isSuperGroupChat(chat.id) ? 'Super Group' : 'Group Chat';
  }

  return group.member_count
    ? `${group.member_count} ${isChannel(group) ? 'subscribers' : 'members'}`
    : getGroupTypeString(group);
}

export default withGlobal(
  (global, { chatId }: IProps) => {
    const chat = selectChat(global, chatId);
    const chatGroupId = chat && selectChatGroupId(chat);
    const group = chatGroupId && selectGroup(global, chatGroupId);
    const onlineMembers = group && selectGroupOnlineCount(global, group);

    return {
      chat,
      group,
      onlineMembers,
    };
  },
)(GroupChatInfo);
