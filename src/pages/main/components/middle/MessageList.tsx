import React, { FC } from '../../../../lib/teact';
import { DispatchMap, withGlobal } from '../../../../lib/teactn';

import { ApiMessage } from '../../../../modules/tdlib/types/messages';

import orderBy from '../../../../util/orderBy';
import onNextTick from '../../../../util/onNextTick';

import Loading from '../../../../components/Loading';
import Message from './Message';

import './MessageList.scss';
import { isPrivate } from '../../../../modules/tdlib/helpers';

type IProps = Pick<DispatchMap, 'loadChatMessages'> & {
  chatId: number;
  messages: ApiMessage[];
};

const MessageList: FC<IProps> = ({ chatId, messages, loadChatMessages }) => {
  if (!messages) {
    loadChatMessages({ chatId });
  }

  onNextTick(() => {
    const scrollContainer = document.getElementsByClassName('MessageList')[0];
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  });

  return (
    <div className={`MessageList ${isPrivate(chatId) ? 'no-avatars' : ''}`}>{
      messages ? (
        <div className="messages-container">
          {groupMessages(messages).map(messageGroup => (
            <div className="message-group">
              {messageGroup.map((message, i) => (
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
    const { chats, messages } = global;

    const chatMessages = chats.selectedId ? messages.byChatId[chats.selectedId] : null;

    return {
      chatId: chats.selectedId,
      // TODO @perf New object returned each time.
      messages: chatMessages && orderBy(chatMessages, 'date', 'desc'),
    };
  },
  (setGlobal, actions) => {
    const { loadChatMessages } = actions;
    return { loadChatMessages };
  },
)(MessageList);
