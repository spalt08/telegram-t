import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { isPrivateChat } from '../../../../modules/tdlib/helpers';
import DialogHeader from './PrivateChatHeader';
import GroupHeader from './GroupHeader';
import MessageList from './MessageList';
import MiddleFooter from './MiddleFooter';
import './MiddleColumn.scss';
import './MiddleHeader.scss';

type IProps = {
  selectedChatId: number;
};

const MiddleColumn: FC<IProps> = ({ selectedChatId }) => {
  return (
    <div id="MiddleColumn">
      {selectedChatId ? (
        <div className="messages-layout">
          {isPrivateChat(selectedChatId) ? (
            <DialogHeader chatId={selectedChatId} />
          ) : (
            <GroupHeader chatId={selectedChatId} />
          )}
          <MessageList />
          <MiddleFooter />
        </div>
      ) : (
        <div className="select-chat-note">Select chat to start messaging...</div>
      )}

    </div>
  );
};

export default withGlobal(
  (global) => {
    return {
      selectedChatId: global.chats.selectedId,
    };
  },
)(MiddleColumn);
