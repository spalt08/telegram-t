import { UIEvent } from 'react';
import React, { FC, useEffect } from '../../../../lib/teact';
import { getGlobal, withGlobal } from '../../../../lib/teactn';

import { GlobalActions } from '../../../../store/types';
import { ApiMessage } from '../../../../api/tdlib/types';
import { selectChatMessages, selectChatScrollOffset } from '../../../../modules/tdlib/selectors';
import { isOwnMessage, isPrivateChat } from '../../../../modules/tdlib/helpers';
import { orderBy, toArray } from '../../../../util/iteratees';
import { throttle } from '../../../../util/schedulers';
import { formatChatDateHeader } from '../../../../util/dateFormat';
import { MessageDateGroup, groupMessages } from './util/messages';
import Loading from '../../../../components/Loading';
import Message from './Message';
import './MessageList.scss';

type IProps = Pick<GlobalActions, 'loadChatMessages' | 'loadMoreChatMessages' | 'setChatScrollOffset'> & {
  areMessagesLoaded: boolean;
  chatId: number;
  messages?: Record<number, ApiMessage>;
};

const LOAD_MORE_THRESHOLD_PX = 1000;
const SCROLL_THROTTLE_MS = 1000;
const LOAD_MORE_WHEN_LESS_THAN = 50;

let loadMoreChatMessagesThrottled: Function | undefined;

const MessageList: FC<IProps> = ({
  areMessagesLoaded, chatId, messages, loadChatMessages, loadMoreChatMessages, setChatScrollOffset,
}) => {
  if (!loadMoreChatMessagesThrottled) {
    loadMoreChatMessagesThrottled = throttle(loadMoreChatMessages as (...args: any) => void, SCROLL_THROTTLE_MS, true);
  }

  const messagesArray = areMessagesLoaded && messages ? orderBy(toArray(messages), 'date') : undefined;

  if (!areMessagesLoaded) {
    loadChatMessages({ chatId });
  } else if (messagesArray && messagesArray.length < LOAD_MORE_WHEN_LESS_THAN) {
    loadMoreChatMessagesThrottled({ chatId });
  }

  const isPrivate = isPrivateChat(chatId);

  useEffect(() => {
    const scrollContainer = document.querySelector('.MessageList') as HTMLElement;

    if (scrollContainer) {
      const previousScrollOffset = selectChatScrollOffset(getGlobal(), chatId);
      scrollContainer.scrollTop = scrollContainer.scrollHeight - Number(previousScrollOffset || 0);
    }
  });

  function renderMessageDateGroup(messageDateGroup: MessageDateGroup) {
    return (
      <div className="message-date-group">
        <div className="message-date-header">{formatChatDateHeader(messageDateGroup.datetime)}</div>
        {messageDateGroup.messageGroups.map((messageGroup) => (
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
    );
  }

  // TODO @perf Replace the whole element while rendering, it will be faster for long lists.
  return (
    <div
      className={`MessageList custom-scroll ${isPrivate ? 'no-avatars' : ''}`}
      onScroll={(e) => handleScroll(e, chatId, setChatScrollOffset)}
    >
      {
        areMessagesLoaded ? (
          <div className="messages-container">
            {messagesArray && groupMessages(messagesArray).map(renderMessageDateGroup)}
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
  setChatScrollOffset: GlobalActions['setChatScrollOffset'],
) {
  const target = e.target as HTMLElement;

  setChatScrollOffset({ chatId, scrollOffset: target.scrollHeight - target.scrollTop });

  if (loadMoreChatMessagesThrottled && target.scrollTop <= LOAD_MORE_THRESHOLD_PX) {
    loadMoreChatMessagesThrottled({ chatId });
  }
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
