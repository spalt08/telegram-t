import React, { FC, memo } from '../../lib/teact/teact';

import Button from '../ui/Button';
import ChatList from './main/ChatList';

import './ArchivedChats.scss';

export type OwnProps = {
  onReset: () => void;
};

const ArchivedChats: FC<OwnProps> = ({ onReset }) => {
  return (
    <div className="ArchivedChats">
      <div className="LeftHeader">
        <Button
          round
          size="smaller"
          color="translucent"
          onClick={onReset}
          ariaLabel="Return to chat list"
        >
          <i className="icon-back" />
        </Button>
        <h3>Archived Chats</h3>
      </div>
      <ChatList folder="archived" noChatsText="Archive is empty." />
    </div>
  );
};

export default memo(ArchivedChats);
