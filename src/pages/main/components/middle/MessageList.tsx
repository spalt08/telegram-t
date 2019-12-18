import { UIEvent } from 'react';
import React, { FC, useEffect } from '../../../../lib/teact';
import { getGlobal, withGlobal } from '../../../../lib/teactn';

import { GlobalActions } from '../../../../store/types';
import { ApiMessage } from '../../../../api/types';
import { selectChatMessages, selectChatScrollOffset } from '../../../../modules/selectors';
import { isOwnMessage, isPrivateChat, isActionMessage } from '../../../../modules/helpers';
import { orderBy, toArray } from '../../../../util/iteratees';
import { throttle } from '../../../../util/schedulers';
import { formatChatDateHeader } from '../../../../util/dateFormat';
import { MessageDateGroup, groupMessages } from './message/utils';
import Loading from '../../../../components/Loading';
import Message from './Message';
import './MessageList.scss';
import ServiceMessage from './ServiceMessage';

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
      const updateFn = () => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight - Number(previousScrollOffset || 0);
      };

      updateFn();
      // We need this for the very first page render.
      requestAnimationFrame(updateFn);
    }
  });

  function renderMessageDateGroup(messageDateGroup: MessageDateGroup) {
    return (
      <div className="message-date-group">
        <div className="message-date-header">{formatChatDateHeader(messageDateGroup.datetime)}</div>
        {messageDateGroup.messageGroups.map((messageGroup) => {
          if (messageGroup.length === 1 && isActionMessage(messageGroup[0])) {
            const message = messageGroup[0];
            return <ServiceMessage message={message} />;
          }

          return (
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
          );
        })}
      </div>
    );
  }

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

  if (target.scrollTop <= LOAD_MORE_THRESHOLD_PX) {
    loadMoreChatMessagesThrottled!({ chatId });
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
