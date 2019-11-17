import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { isPrivateChat } from '../../../../modules/helpers';
import PrivateChatInfo from '../common/PrivateChatInfo';
import GroupChatInfo from '../common/GroupChatInfo';
import UserExtra from './UserExtra';
import GroupExtra from './GroupExtra';

import './RightColumnInfo.scss';

type IProps = {
  chatId: number;
};

const RightColumnInfo: FC<IProps> = ({ chatId }) => {
  return isPrivateChat(chatId) ? (
    <div className="RightColumnInfo">
      <PrivateChatInfo chatId={chatId} avatarSize="jumbo" />
      <UserExtra chatId={chatId} />
    </div>
  ) : (
    <div className="RightColumnInfo">
      <GroupChatInfo chatId={chatId} avatarSize="jumbo" />
      <GroupExtra chatId={chatId} />
    </div>
  );
};

export default withGlobal(

)(RightColumnInfo);
