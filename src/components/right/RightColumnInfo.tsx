import React, { FC } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { getPrivateChatUserId } from '../../modules/helpers';
import { ApiPrivateChat } from '../../api/types';
import { selectChat } from '../../modules/selectors';
import PrivateChatInfo from '../common/PrivateChatInfo';
import GroupChatInfo from '../common/GroupChatInfo';
import UserExtra from './UserExtra';
import GroupExtra from './GroupExtra';

import './RightColumnInfo.scss';

type IProps = {
  chatId: number;
  userId?: number;
  resolvedUserId?: number;
};

const RightColumnInfo: FC<IProps> = ({ chatId, resolvedUserId }) => {
  return resolvedUserId ? (
    <div className="RightColumnInfo">
      <PrivateChatInfo userId={resolvedUserId} avatarSize="jumbo" />
      <UserExtra userId={resolvedUserId} />
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
      return { resolvedUserId: userId };
    } else {
      const chat = selectChat(global, chatId) as ApiPrivateChat | undefined;
      const id = chat && getPrivateChatUserId(chat);
      return { resolvedUserId: id };
    }
  },
)(RightColumnInfo);
