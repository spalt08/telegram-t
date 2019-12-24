import { UIEvent } from 'react';
import React, { FC, useEffect, useState } from '../../../../lib/teact';
import { getGlobal, withGlobal } from '../../../../lib/teactn';

import { GlobalActions } from '../../../../store/types';
import { ApiMessage } from '../../../../api/types';
import { selectChatMessages } from '../../../../modules/selectors';
import { isOwnMessage, isPrivateChat, isActionMessage } from '../../../../modules/helpers';
import { orderBy, toArray } from '../../../../util/iteratees';
import { throttle } from '../../../../util/schedulers';
import { formatHumanDate } from '../../../../util/dateFormat';
import { MessageDateGroup, groupMessages } from './message/utils';
import Loading from '../../../../components/Loading';
import Message from './Message';
import './MessageList.scss';
import ServiceMessage from './ServiceMessage';

type IProps = Pick<GlobalActions, 'loadChatMessages' | 'loadMoreChatMessages' | 'setChatScrollOffset'> & {
  areMessagesLoaded?: boolean;
  chatId?: number;
  messages?: Record<number, ApiMessage>;
};

const SCROLL_THROTTLE_MS = 1000;
const LOAD_MORE_THRESHOLD_PX = 1000;
const LOAD_MORE_WHEN_LESS_THAN = 50;
const VIEWPORT_MARGIN = 500;

const runThrottled = throttle((cb) => cb(), SCROLL_THROTTLE_MS, true);

const MessageList: FC<IProps> = ({
  areMessagesLoaded,
  chatId,
  messages,
  loadChatMessages,
  loadMoreChatMessages,
  setChatScrollOffset,
}) => {
  const [viewportMessageIds, setViewportMessageIds] = useState([]);

  const messagesArray = areMessagesLoaded && messages ? orderBy(toArray(messages), 'date') : undefined;

  if (!areMessagesLoaded) {
    loadChatMessages({ chatId });
  } else if (messagesArray && messagesArray.length < LOAD_MORE_WHEN_LESS_THAN) {
    loadMoreChatMessages({ chatId });
  }

  const isPrivate = chatId && isPrivateChat(chatId);

  const handleScroll = chatId
    ? (e: UIEvent) => {
      const target = e.target as HTMLElement;

      const newScrollOffset = target.scrollHeight - target.scrollTop;
      setChatScrollOffset({ chatId, scrollOffset: newScrollOffset });

      runThrottled(() => {
        const newViewportMessageIds = findMediaMessagesInViewport(target);
        if (!areArraysEqual(newViewportMessageIds, viewportMessageIds)) {
          setViewportMessageIds(newViewportMessageIds);
        }

        if (target.scrollTop <= LOAD_MORE_THRESHOLD_PX) {
          loadMoreChatMessages!({ chatId });
        }
      });
    }
    : undefined;

  useEffect(() => {
    const scrollContainer = document.querySelector('.MessageList') as HTMLElement;

    if (chatId && scrollContainer) {
      const updateFn = () => {
        const previousScrollOffset = getGlobal().chats.scrollOffsetById[chatId];
        const currentScrollOffset = scrollContainer.scrollHeight - scrollContainer.scrollTop;

        if (currentScrollOffset !== previousScrollOffset) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight - Number(previousScrollOffset || 0);
        }
      };

      updateFn();
      // We need this for the very first page render.
      requestAnimationFrame(updateFn);
    }
  }, [chatId, messages]);

  function renderMessageDateGroup(messageDateGroup: MessageDateGroup) {
    return (
      <div className="message-date-group">
        <div className="message-date-header">{formatHumanDate(messageDateGroup.datetime)}</div>
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
                    loadAndPlayMedia={viewportMessageIds.includes(message.id)}
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
      onScroll={handleScroll}
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

function findMediaMessagesInViewport(container: HTMLElement) {
  const viewportY1 = container.scrollTop;
  const viewportY2 = viewportY1 + container.clientHeight;
  const messageEls = Array.from(document.querySelectorAll('.Message.has-media')).reverse() as HTMLElement[];
  const visibleIds: number[] = [];

  messageEls.forEach((messageEl) => {
    const y1 = messageEl.offsetTop;
    const y2 = y1 + messageEl.offsetHeight;

    if (y1 <= viewportY2 + VIEWPORT_MARGIN && y2 >= viewportY1 - VIEWPORT_MARGIN) {
      visibleIds.push(Number((messageEl.dataset.messageId)));
    }
  });

  return visibleIds;
}

function areArraysEqual(arr1: any[], arr2: any[]) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  return arr1.every((el, i) => el === arr2[i]);
}

export default withGlobal(
  global => {
    const { chats: { selectedId } } = global;

    if (!selectedId) {
      return {};
    }

    const messages = selectChatMessages(global, selectedId);

    return {
      chatId: selectedId,
      messages,
      areMessagesLoaded: Boolean(messages),
    };
  },
  (setGlobal, actions) => {
    const { loadChatMessages, loadMoreChatMessages, setChatScrollOffset } = actions;
    return { loadChatMessages, loadMoreChatMessages, setChatScrollOffset };
  },
)(MessageList);
