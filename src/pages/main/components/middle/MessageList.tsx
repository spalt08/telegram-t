import React, { FC } from '../../../../lib/teact';
import { DispatchMap, withGlobal } from '../../../../lib/teactn';

import { ApiMessage } from '../../../../modules/tdlib/types/messages';
import { isOwnMessage } from '../../../../modules/tdlib/helpers';

import orderBy from '../../../../util/orderBy';
import onNextTick from '../../../../util/onNextTick';

import Loading from '../../../../components/Loading';
import Message from './Message';

import './MessageList.scss';

type IProps = Pick<DispatchMap, 'loadChatMessages'> & {
  selectedChatId: number;
  messages: ApiMessage[];
};

const MessageList: FC<IProps> = ({ selectedChatId, messages, loadChatMessages }) => {
  if (!messages) {
    loadChatMessages({ chatId: selectedChatId });
  }

  onNextTick(() => {
    const scrollContainer = document.getElementsByClassName('MessageList')[0];
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  });

  return (
    <div className="MessageList">{
      messages ? (
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
      || isOwnMessage(message) === isOwnMessage(group[group.length - 1])
    ) {
      group.push(message);
    }

    if (
      messages[index + 1]
      && isOwnMessage(message) !== isOwnMessage(messages[index + 1])
    ) {
      messageGroups.push(group);
      group = [];
    }
  });

  return messageGroups;
}

export default withGlobal(
  global => {
    const { chats, messages } = global;

    const chatMessages = chats.selectedId ? messages.byChatId[chats.selectedId] : null;

    return {
      selectedChatId: chats.selectedId,
      // TODO @perf New object returned each time.
      messages: chatMessages && orderBy(chatMessages, 'date', 'desc'),
    };
  },
  (setGlobal, actions) => {
    const { loadChatMessages } = actions;
    return { loadChatMessages };
  },
)(MessageList);
