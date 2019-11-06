import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import MessageList from './MessageList';

import './MiddleColumn.scss';

type IProps = {
  selectedChatId: number;
};

const MiddleColumn: FC<IProps> = ({ selectedChatId }) => {
  return (
    <div className="MiddleColumn">
      {selectedChatId ? (
        <MessageList />
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
