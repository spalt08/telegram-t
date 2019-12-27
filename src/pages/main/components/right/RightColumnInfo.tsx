import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { getPrivateChatUserId } from '../../../../modules/helpers';
import { ApiPrivateChat } from '../../../../api/types';
import { selectChat } from '../../../../modules/selectors';
import PrivateChatInfo from '../common/PrivateChatInfo';
import GroupChatInfo from '../common/GroupChatInfo';
import UserExtra from './UserExtra';
import GroupExtra from './GroupExtra';

import './RightColumnInfo.scss';

type IProps = {
  chatId: number;
  userId?: number;
  selectedUserId?: number;
};

const RightColumnInfo: FC<IProps> = ({ chatId, selectedUserId }) => {
  return selectedUserId ? (
    <div className="RightColumnInfo">
      <PrivateChatInfo userId={selectedUserId} avatarSize="jumbo" />
      <UserExtra userId={selectedUserId} />
    </div>
  ) : (
    <div className="RightColumnInfo">
      <GroupChatInfo chatId={chatId} avatarSize="jumbo" />
      <GroupExtra chatId={chatId} />
    </div>
  );
};

export default withGlobal(
  (global, { chatId, userId }: IProps) => {
    if (userId) {
      return { selectedUserId: userId };
    } else {
      const chat = selectChat(global, chatId) as ApiPrivateChat | undefined;
      const id = chat && getPrivateChatUserId(chat);
      return { selectedUserId: id };
    }
  },
)(RightColumnInfo);
