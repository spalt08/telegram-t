import React, { FC, memo } from '../../../../lib/teact';

import { isPrivateChat } from '../../../../modules/helpers';
import PrivateChatInfo from '../common/PrivateChatInfo';
import GroupChatInfo from '../common/GroupChatInfo';
import HeaderActions from './HeaderActions';

import './MiddleHeader.scss';

type IProps = {
  chatId: number;
};

const MiddleHeader: FC<IProps> = ({ chatId }) => {
  return (
    <div className="MiddleHeader">
      {isPrivateChat(chatId) ? (
        <PrivateChatInfo chatId={chatId} />
      ) : (
        <GroupChatInfo chatId={chatId} />
      )}
      <HeaderActions />
    </div>
  );
};

export default memo(MiddleHeader);
