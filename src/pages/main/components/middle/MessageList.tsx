import React, { FC } from '../../../../lib/teact';
import { DispatchMap, withGlobal } from '../../../../lib/teactn';

import { ApiMessage } from '../../../../modules/tdlib/types';
import { selectChatMessages } from '../../../../modules/tdlib/selectors';
import { isOwnMessage, isPrivateChat } from '../../../../modules/tdlib/helpers';
import orderBy from '../../../../util/orderBy';
import toArray from '../../../../util/toArray';
import onNextTick from '../../../../util/onNextTick';
import Loading from '../../../../components/Loading';
import Message from './Message';
import './MessageList.scss';

type IProps = Pick<DispatchMap, 'loadChatMessages'> & {
  areMessagesLoaded: boolean,
  chatId: number;
  messages?: Record<number, ApiMessage>;
};

const MessageList: FC<IProps> = ({
  areMessagesLoaded, chatId, messages, loadChatMessages,
}) => {
  if (!areMessagesLoaded) {
    loadChatMessages({ chatId });
  }

  const messagesArray = areMessagesLoaded && messages ? orderBy(toArray(messages), 'date', 'desc') : undefined;
  const isPrivate = isPrivateChat(chatId);

  onNextTick(() => {
    const scrollContainer = document.getElementsByClassName('MessageList')[0];
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  });

  return (
    <div className={`MessageList ${isPrivate ? 'no-avatars' : ''}`}>{
      areMessagesLoaded && messagesArray ? (
        <div className="messages-container">
          {groupMessages(messagesArray).map((messageGroup) => (
            <div className="message-group">
              {messageGroup.map((message, i) => {
                const isOwn = isOwnMessage(message);

                return (
                  <Message
                    key={message.id}
                    message={message}
                    showAvatar={!isPrivate && !isOwn}
                    showSenderName={i === 0 && !isPrivate && !isOwn}
                  />
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <Loading />
      )
    }
    </div>
  );
};

function groupMessages(messages: ApiMessage[]) {
  const messageGroups: ApiMessage[][] = [];
  let group: ApiMessage[] = [];

  messages.forEach((message, index) => {
    if (
      !group.length
      || message.sender_user_id === group[group.length - 1].sender_user_id
    ) {
      group.push(message);
    }

    if (
      messages[index + 1]
      && message.sender_user_id !== messages[index + 1].sender_user_id
    ) {
      messageGroups.push(group);
      group = [];
    }
  });

  if (group.length) {
    messageGroups.push(group);
  }

  return messageGroups;
}

export default withGlobal(
  global => {
    const { chats } = global;

    const messages = chats.selectedId ? selectChatMessages(global, chats.selectedId) : undefined;
    const areMessagesLoaded = messages && Object.keys(messages).length;

    return {
      chatId: chats.selectedId,
      areMessagesLoaded,
      messages,
    };
  },
  (setGlobal, actions) => {
    const { loadChatMessages } = actions;
    return { loadChatMessages };
  },
)(MessageList);
