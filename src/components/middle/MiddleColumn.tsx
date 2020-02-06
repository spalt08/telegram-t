import React, { FC, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../store/types';
import { selectChat } from '../../modules/selectors';
import { isChatChannel } from '../../modules/helpers';
import captureEscKeyListener from '../../util/captureEscKeyListener';

import MessageList from './MessageList';
import MiddleFooter from './footer/MiddleFooter';
import MiddleHeader from './MiddleHeader';

import './MiddleColumn.scss';

type IProps = Pick<GlobalActions, 'openChat'> & {
  selectedChatId: number;
  isChannelChat: boolean;
  areChatsLoaded: boolean;
};

const MiddleColumn: FC<IProps> = (props) => {
  const { selectedChatId, openChat } = props;
  const isChatOpen = Boolean(selectedChatId);

  useEffect(() => {
    return isChatOpen
      ? captureEscKeyListener(() => {
        openChat({ id: undefined });
      })
      : undefined;
  }, [isChatOpen, openChat]);

  return (
    <div id="MiddleColumn">
      {renderSelectedChat(props)}
    </div>
  );
};

function renderSelectedChat(props: IProps) {
  const { selectedChatId, isChannelChat } = props;

  if (!selectedChatId) {
    return null;
  }

  return (
    <div className="messages-layout">
      <MiddleHeader chatId={selectedChatId} />
      <MessageList key={selectedChatId} />
      {!isChannelChat && (
        <MiddleFooter />
      )}
    </div>
  );
}

export default withGlobal(
  (global) => {
    const { chats } = global;
    const selectedChatId = chats.selectedId;
    const areChatsLoaded = Boolean(chats.ids);

    const selectedChat = selectedChatId && areChatsLoaded
      ? selectChat(global, selectedChatId)
      : undefined;
    const isChannelChat = selectedChat && isChatChannel(selectedChat);

    return {
      selectedChatId,
      isChannelChat,
      areChatsLoaded,
    };
  },
  (setGlobal, actions) => {
    const { openChat } = actions;
    return { openChat };
  },
)(MiddleColumn);
