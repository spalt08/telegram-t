import { UIEvent } from 'react';
import React, { FC, useEffect } from '../../../../lib/teact';
import { DispatchMap, getGlobal, withGlobal } from '../../../../lib/teactn';

import { ApiMessage } from '../../../../modules/tdlib/types';
import { selectChatMessages, selectChatScrollOffset } from '../../../../modules/tdlib/selectors';
import { isOwnMessage, isPrivateChat } from '../../../../modules/tdlib/helpers';
import orderBy from '../../../../util/orderBy';
import toArray from '../../../../util/toArray';
import { throttle } from '../../../../util/schedulers';
import Loading from '../../../../components/Loading';
import Message from './Message';
import './MessageList.scss';

type IProps = Pick<DispatchMap, 'loadChatMessages' | 'loadMoreChatMessages' | 'setChatScrollOffset'> & {
  areMessagesLoaded: boolean,
  chatId: number;
  messages?: Record<number, ApiMessage>;
};

const LOAD_MORE_THRESHOLD_PX = 1000;
const SCROLL_THROTTLE_MS = 1000;

let loadMoreChatMessagesThrottled: Function | undefined;

const MessageList: FC<IProps> = ({
  areMessagesLoaded, chatId, messages, loadChatMessages, loadMoreChatMessages, setChatScrollOffset,
}) => {
  if (!loadMoreChatMessagesThrottled) {
    loadMoreChatMessagesThrottled = throttle(loadMoreChatMessages as (...args: any) => void, SCROLL_THROTTLE_MS, true);
  }

  if (!areMessagesLoaded) {
    loadChatMessages({ chatId });
  }

  const messagesArray = areMessagesLoaded && messages ? orderBy(toArray(messages), 'date', 'desc') : undefined;
  const isPrivate = isPrivateChat(chatId);

  useEffect(() => {
    const scrollContainer = document.querySelector('.MessageList') as HTMLElement;

    if (scrollContainer) {
      const previousScrollOffset = selectChatScrollOffset(getGlobal(), chatId);
      scrollContainer.scrollTop = scrollContainer.scrollHeight - Number(previousScrollOffset || 0);
    }
  });

  // TODO @perf Replace the whole element while rendering, it will be faster for long lists.
  return (
    <div
      className={`MessageList ${isPrivate ? 'no-avatars' : ''}`}
      onScroll={(e) => handleScroll(e, chatId, setChatScrollOffset)}
    >
      {
        areMessagesLoaded ? (
          <div className="messages-container">
            {messagesArray && groupMessages(messagesArray).map((messageGroup) => (
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

function handleScroll(
  e: UIEvent,
  chatId: number,
  setChatScrollOffset: DispatchMap['setChatScrollOffset'],
) {
  const target = e.target as HTMLElement;

  setChatScrollOffset({ chatId, scrollOffset: target.scrollHeight - target.scrollTop });

  if (loadMoreChatMessagesThrottled && target.scrollTop <= LOAD_MORE_THRESHOLD_PX) {
    loadMoreChatMessagesThrottled({ chatId });
  }
}

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

    return {
      chatId: chats.selectedId,
      areMessagesLoaded: Boolean(messages),
      messages,
    };
  },
  (setGlobal, actions) => {
    const { loadChatMessages, loadMoreChatMessages, setChatScrollOffset } = actions;
    return { loadChatMessages, loadMoreChatMessages, setChatScrollOffset };
  },
)(MessageList);
