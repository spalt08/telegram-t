import React, { FC } from '../../../../lib/reactt';
import { DispatchMap, withGlobal } from '../../../../lib/reactnt';

import Message from './Message';
import orderBy from '../../../../util/orderBy';

import './MessageList.scss';

type IProps = Pick<DispatchMap, 'loadChatMessages'> & {
  selectedChatId: number;
  messages: Record<string, any>[];
};

const MessageList: FC<IProps> = ({ selectedChatId, messages, loadChatMessages }) => {
  if (!messages) {
    loadChatMessages({ chatId: selectedChatId });
  }

  return (
    <div className="MessageList">{
      messages ? (
        <div>
          {messages.map(message => (
            <Message key={message.id} message={message} />
          ))}
        </div>
      ) : (
        <div>Loading...</div>
      )
    }</div>
  );
};

export default withGlobal(
  global => {
    const { chats, messages } = global;

    const chatMessages = chats.selectedId ? messages.byChatId[chats.selectedId] : null;

    return {
      selectedChatId: chats.selectedId,
      messages: chatMessages && orderBy(chatMessages, 'date', 'desc'),
    };
  },
  (setGlobal, actions) => {
    const { loadChatMessages } = actions;
    return { loadChatMessages };
  },
)(MessageList);
