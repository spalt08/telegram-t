import React, { FC } from '../../../../lib/teact';
import { DispatchMap, withGlobal } from '../../../../lib/teactn';

import { ApiMessage } from '../../../../modules/tdlib/types/messages';
import { selectChatMessages } from '../../../../modules/tdlib/selectors';
import { isPrivate } from '../../../../modules/tdlib/helpers';
import orderBy from '../../../../util/orderBy';
import toArray from '../../../../util/toArray';
import onNextTick from '../../../../util/onNextTick';
import Loading from '../../../../components/Loading';
import Message from './Message';
import './MessageList.scss';

type IProps = Pick<DispatchMap, 'loadChatMessages'> & {
  areMessagesLoaded: boolean,
  chatId: number;
  messages: ApiMessage[];
};

const MessageList: FC<IProps> = ({ areMessagesLoaded, chatId, messages, loadChatMessages }) => {
  if (!areMessagesLoaded) {
    loadChatMessages({ chatId });
  }

  onNextTick(() => {
    const scrollContainer = document.getElementsByClassName('MessageList')[0];
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  });

  return (
    <div className={`MessageList ${isPrivate(chatId) ? 'no-avatars' : ''}`}>{
      areMessagesLoaded ? (
        <div className="messages-container">
          {groupMessages(messages).map(messageGroup => (
            <div className="message-group">
              {messageGroup.map(message => (
                <Message key={message.id} message={message} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <Loading />
      )
    }</div>
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

    const chatMessages = chats.selectedId ? selectChatMessages(global, chats.selectedId) : null;
    const areMessagesLoaded = chatMessages && Object.keys(chatMessages).length;

    return {
      chatId: chats.selectedId,
      areMessagesLoaded,
      // TODO @perf New object returned each time.
      messages: chatMessages && orderBy(toArray(chatMessages), 'date', 'desc'),
    };
  },
  (setGlobal, actions) => {
    const { loadChatMessages } = actions;
    return { loadChatMessages };
  },
)(MessageList);
