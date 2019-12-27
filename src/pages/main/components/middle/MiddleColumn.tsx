import React, { FC, useEffect } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { GlobalActions } from '../../../../store/types';
import { ApiChat } from '../../../../api/types';
import { selectChat } from '../../../../modules/selectors';

import Button from '../../../../components/ui/Button';
import MessageList from './MessageList';
import MiddleFooter from './MiddleFooter';
import MiddleHeader from './MiddleHeader';
import './MiddleColumn.scss';
import { isChannel } from '../../../../modules/helpers';

type IProps = Pick<GlobalActions, 'selectChatToView'> & {
  selectedChatId: number;
  selectedChat?: ApiChat;
  areChatsLoaded: boolean;
  canCloseChatOnEsc: boolean;
};

const MiddleColumn: FC<IProps> = (props) => {
  const { selectChatToView, canCloseChatOnEsc } = props;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (canCloseChatOnEsc && (e.key === 'Escape' || e.key === 'Esc')) {
        selectChatToView({ id: undefined });
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [canCloseChatOnEsc, selectChatToView]);

  return (
    <div id="MiddleColumn">
      {renderSelectedChat(props)}
      {renderOpenChatScreen(props)}
    </div>
  );
};

function renderSelectedChat(props: IProps) {
  const { selectedChatId, selectedChat } = props;

  if (!selectedChatId) {
    return null;
  }

  return (
    <div className="messages-layout">
      <MiddleHeader chatId={selectedChatId} />
      <MessageList key={selectedChatId} />
      {selectedChat && !isChannel(selectedChat) && (
        <MiddleFooter />
      )}
    </div>
  );
}

function renderOpenChatScreen(props: IProps) {
  const { selectedChatId, areChatsLoaded } = props;

  if (selectedChatId || !areChatsLoaded) {
    return null;
  }

  return (
    <div className="select-chat-note">
      <i className="icon-chats-placeholder" />
      <h2>
        Open Chat
        <br />
        or create a new one
      </h2>

      <div className="create-chat-buttons">
        <Button className="not-implemented" round color="secondary">
          <i className="icon-new-private" />
          <span>Private</span>
        </Button>
        <Button className="not-implemented" round color="secondary">
          <i className="icon-new-group" />
          <span>Group</span>
        </Button>
        <Button className="not-implemented" round color="secondary">
          <i className="icon-new-channel" />
          <span>Channel</span>
        </Button>
      </div>
    </div>
  );
}

export default withGlobal(
  (global) => {
    const { chats, messages } = global;
    const selectedChatId = chats.selectedId;
    const areChatsLoaded = Boolean(chats.ids);

    const selectedChat = selectedChatId && areChatsLoaded
      ? selectChat(global, selectedChatId)
      : undefined;

    return {
      selectedChatId,
      selectedChat,
      areChatsLoaded,
      canCloseChatOnEsc: !messages.selectedMediaMessageId,
    };
  },
  (setGlobal, actions) => {
    const { selectChatToView } = actions;
    return { selectChatToView };
  },
)(MiddleColumn);
