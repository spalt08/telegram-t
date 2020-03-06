import { UIEvent } from 'react';
import React, {
  FC, memo, useCallback, useEffect, useMemo, useRef, useState,
} from '../../lib/teact/teact';
import { getGlobal, withGlobal } from '../../lib/teact/teactn';

import { ApiMessage } from '../../api/types';
import { GlobalActions } from '../../global/types';
import { LoadMoreDirection } from '../../types';

import { MESSAGE_LIST_SENSITIVE_AREA, MESSAGE_LIST_SLICE } from '../../config';
import {
  selectChatMessages,
  selectViewportIds,
  selectIsViewportNewest,
  selectLastReadId,
  selectOpenChat,
  selectFocusedMessageId,
} from '../../modules/selectors';
import {
  getMessageRenderKey,
  isActionMessage,
  isChatChannel,
  isChatPrivate,
  isOwnMessage,
} from '../../modules/helpers';
import { areSortedArraysEqual, flatten, orderBy } from '../../util/iteratees';
import { debounce, throttle } from '../../util/schedulers';
import { formatHumanDate } from '../../util/dateFormat';
import useLayoutEffectWithPrevDeps from '../../hooks/useLayoutEffectWithPrevDeps';
import buildClassName from '../../util/buildClassName';
import { groupMessages, MessageDateGroup } from './helpers/groupMessages';
import useOnChange from '../../hooks/useOnChange';
import findInViewport from '../../util/findInViewport';

import Loading from '../ui/Loading';
import Message from './message/Message';
import ServiceMessage from './ServiceMessage';

import './MessageList.scss';

type IProps = Pick<GlobalActions, 'loadViewportMessages' | 'markMessagesRead' | 'setChatScrollOffset'> & {
  chatId?: number;
  isChannelChat?: boolean;
  messageIds?: number[];
  messagesById?: Record<number, ApiMessage>;
  lastReadId?: number;
  isViewportNewest: boolean;
  isFocusing: boolean;
};

const SCROLL_TO_LAST_THRESHOLD_PX = 100;
const VIEWPORT_MEDIA_MARGIN = 500;
const INDICATOR_TOP_MARGIN = 10;
const HIDE_STICKY_TIMEOUT = 450;
const FOCUSING_DURATION = 1000;

const runThrottledForScroll = throttle((cb) => cb(), 1000, false);
const scrollToLastMessage = throttle((container: Element) => {
  container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
}, 300, true);

let currentScrollOffset: number;
let currentAnchorId: string | undefined;
let currentAnchorTop: number;
let unreadDividerMessageId: number | undefined;
let scrollTimeout: NodeJS.Timeout | null = null;

const MessageList: FC<IProps> = ({
  chatId,
  isChannelChat,
  messageIds,
  messagesById,
  lastReadId,
  isViewportNewest,
  isFocusing,
  loadViewportMessages,
  markMessagesRead,
  setChatScrollOffset,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const [viewportMessageIds, setViewportMessageIds] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);

  useOnChange(() => {
    currentAnchorId = undefined;

    // We update local cached `currentScrollOffset` when switching chat.
    // Then we update global version every second on scrolling.
    currentScrollOffset = chatId ? getGlobal().chats.scrollOffsetById[chatId] : 0;

    // We only update `unreadDividerMessageId` when switching chat.
    unreadDividerMessageId = lastReadId;
  }, [chatId]);

  const messageGroups = useMemo(() => {
    if (!chatId || !messageIds || !messagesById || !messageIds.length) {
      return undefined;
    }

    const listedMessages = messageIds.map((id) => messagesById[id]);
    return groupMessages(orderBy(listedMessages, 'date'), unreadDividerMessageId!);
  }, [chatId, messageIds, messagesById]);

  const loadMessagesDebounced = useMemo(
    () => debounce(loadViewportMessages, 1000, true, false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadViewportMessages, messageIds],
  );

  const updateViewportMessages = useCallback(() => {
    requestAnimationFrame(() => {
      const container = containerRef.current!;

      const {
        allElements: mediaMessageEls, visibleIndexes: visibleMediaIndexes,
      } = findInViewport(container, '.Message.has-media', VIEWPORT_MEDIA_MARGIN);
      const newViewportMessageIds = visibleMediaIndexes.map((i) => Number(mediaMessageEls[i].dataset.messageId));
      if (!areSortedArraysEqual(newViewportMessageIds, viewportMessageIds)) {
        setViewportMessageIds(newViewportMessageIds);
      }

      if (lastReadId) {
        const { allElements, visibleIndexes } = findInViewport(container, '.Message', undefined, undefined, true);
        const lowerElement = allElements[visibleIndexes[visibleIndexes.length - 1]];
        if (lowerElement) {
          const maxId = Number(lowerElement.dataset.messageId);
          if (maxId > lastReadId) {
            markMessagesRead({ maxId });
          }
        }
      }
    });
  }, [lastReadId, markMessagesRead, viewportMessageIds]);

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const container = e.target as HTMLElement;

    const { scrollTop, scrollHeight, offsetHeight } = container;
    currentScrollOffset = scrollHeight - scrollTop;

    const isNearTop = scrollTop <= MESSAGE_LIST_SENSITIVE_AREA;
    const isNearBottom = scrollHeight - (scrollTop + offsetHeight) <= MESSAGE_LIST_SENSITIVE_AREA;
    const currentAnchor = currentAnchorId && document.getElementById(currentAnchorId);
    let isUpdated = false;

    if (isNearTop) {
      const messageElements = container.querySelectorAll('.Message');
      const nextAnchor = messageElements[0];
      if (nextAnchor) {
        const nextAnchorTop = nextAnchor.getBoundingClientRect().top;
        const newAnchorTop = currentAnchor && currentAnchor !== nextAnchor
          ? currentAnchor.getBoundingClientRect().top
          : nextAnchorTop;
        const isMovingUp = (
          currentAnchor && currentAnchorTop !== undefined && newAnchorTop > currentAnchorTop
        );

        if (isMovingUp) {
          currentAnchorId = nextAnchor.id;
          currentAnchorTop = nextAnchorTop;
          isUpdated = true;

          if (isFocusing) {
            setTimeout(() => {
              loadMessagesDebounced({ direction: LoadMoreDirection.Backwards });
            }, FOCUSING_DURATION);
          } else {
            loadMessagesDebounced({ direction: LoadMoreDirection.Backwards });
          }
        }
      }
    }

    if (!isViewportNewest && isNearBottom) {
      const messageElements = container.querySelectorAll('.Message');
      const nextAnchor = messageElements[messageElements.length - 1];
      if (nextAnchor) {
        const nextAnchorTop = nextAnchor.getBoundingClientRect().top;
        const newAnchorTop = currentAnchor && currentAnchor !== nextAnchor
          ? currentAnchor.getBoundingClientRect().top
          : nextAnchorTop;
        const isMovingDown = (
          currentAnchor && currentAnchorTop !== undefined && newAnchorTop < currentAnchorTop
        );

        if (isMovingDown) {
          currentAnchorId = nextAnchor.id;
          currentAnchorTop = nextAnchorTop;
          isUpdated = true;

          if (isFocusing) {
            setTimeout(() => {
              loadMessagesDebounced({ direction: LoadMoreDirection.Forwards });
            }, FOCUSING_DURATION);
          } else {
            loadMessagesDebounced({ direction: LoadMoreDirection.Forwards });
          }
        }
      }
    }

    if (!isUpdated) {
      if (currentAnchor) {
        currentAnchorTop = currentAnchor.getBoundingClientRect().top;
      } else {
        const messageElements = container.querySelectorAll('.Message');
        const nextAnchor = messageElements[0];
        currentAnchorId = nextAnchor.id;
        currentAnchorTop = nextAnchor.getBoundingClientRect().top;
      }
    }

    setIsScrolling(true);
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(() => setIsScrolling(false), HIDE_STICKY_TIMEOUT);

    runThrottledForScroll(() => {
      setChatScrollOffset({ chatId, scrollOffset: currentScrollOffset });

      updateViewportMessages();
    });

    determineStickyElement(container, '.message-date-header');
  }, [chatId, isViewportNewest, isFocusing, loadMessagesDebounced, updateViewportMessages, setChatScrollOffset]);

  // Initial message loading
  useEffect(() => {
    const container = containerRef.current!;

    if (!messageIds || (
      container.scrollHeight <= container.clientHeight && messageIds.length < MESSAGE_LIST_SLICE * 2
    )) {
      loadMessagesDebounced({ direction: LoadMoreDirection.Both });
    }
  }, [messageIds, loadMessagesDebounced]);

  useLayoutEffectWithPrevDeps(([prevChatId, prevMessageIds, prevIsViewportNewest]) => {
    if (chatId === prevChatId && messageIds === prevMessageIds) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    if (process.env.NODE_ENV === 'perf') {
      // eslint-disable-next-line no-console
      console.time('scrollTop');
    }

    const { scrollTop, scrollHeight, offsetHeight } = container;
    const anchor = currentAnchorId ? document.getElementById(currentAnchorId) : undefined;
    const messageElements = container.querySelectorAll('.Message');
    const lastMessage = messageElements[messageElements.length - 1];
    const isNewMessage = lastMessage && (lastMessage.id !== currentAnchorId);
    const isAtBottom = currentScrollOffset - offsetHeight <= SCROLL_TO_LAST_THRESHOLD_PX;
    const unreadDivider = (
      !anchor && unreadDividerMessageId && container.querySelector<HTMLDivElement>('.unread-divider')
    );

    if (isNewMessage && isAtBottom && prevIsViewportNewest) {
      scrollToLastMessage(container);
    } else if (anchor) {
      const newAnchorTop = anchor.getBoundingClientRect().top;
      const newScrollTop = scrollTop + (newAnchorTop - currentAnchorTop);
      currentScrollOffset = scrollHeight - newScrollTop;
      container.scrollTop = newScrollTop;
    } else if (currentScrollOffset) {
      container.scrollTop = scrollHeight - currentScrollOffset;
    } else if (unreadDivider) {
      container.scrollTop = unreadDivider.offsetTop - INDICATOR_TOP_MARGIN;
    } else {
      container.scrollTop = scrollHeight;
    }

    if (isNewMessage) {
      currentAnchorId = lastMessage.id;
      currentAnchorTop = lastMessage.getBoundingClientRect().top;
    }

    updateViewportMessages();

    if (process.env.NODE_ENV === 'perf') {
      // eslint-disable-next-line no-console
      console.timeEnd('scrollTop');
    }
  }, [chatId, messageIds, isViewportNewest, updateViewportMessages]);

  const isPrivate = Boolean(chatId && isChatPrivate(chatId));

  const className = buildClassName(
    'MessageList custom-scroll',
    isPrivate && 'no-avatars',
    isChannelChat && 'is-channel no-avatars bottom-padding',
    isScrolling && 'is-scrolling',
  );

  return (
    <div ref={containerRef} id="MessageList" className={className} onScroll={handleScroll}>
      {messageIds ? (
        // @ts-ignore
        <div className="messages-container" teactChildrenKeyOrder="asc">
          {messageGroups && renderMessages(messageGroups, viewportMessageIds, isPrivate)}
        </div>
      ) : (
        <Loading color="white" />
      )}
    </div>
  );
};

function renderMessages(
  messageGroups: MessageDateGroup[],
  viewportMessageIds: number[],
  isPrivate: boolean,
) {
  let isPrevLastRead = false;

  const dateGroups = messageGroups.map((
    dateGroup: MessageDateGroup,
    dateGroupIndex: number,
    dateGroupsArray: MessageDateGroup[],
  ) => {
    const senderGroups = dateGroup.senderGroups.map((
      senderGroup,
      senderGroupIndex,
      senderGroupsArray,
    ) => {
      if (senderGroup.length === 1 && isActionMessage(senderGroup[0])) {
        const message = senderGroup[0];
        return <ServiceMessage key={message.id} message={message} />;
      }

      return flatten(senderGroup.map((
        message,
        messageIndex,
      ) => {
        if (message.prev_local_id && currentAnchorId === `message${message.prev_local_id}`) {
          currentAnchorId = `message${message.id}`;
        }

        const isOwn = isOwnMessage(message);
        const position = {
          isFirstInGroup: messageIndex === 0,
          isLastInGroup: messageIndex === senderGroup.length - 1,
          isLastInList: (
            messageIndex === senderGroup.length - 1
            && senderGroupIndex === senderGroupsArray.length - 1
            && dateGroupIndex === dateGroupsArray.length - 1
          ),
        };
        const loadAndPlayMedia = (
          viewportMessageIds.includes(message.id)
          || (message.prev_local_id && viewportMessageIds.includes(message.prev_local_id))
        );

        const renderedMessage = (
          <Message
            key={getMessageRenderKey(message)}
            message={message}
            showAvatar={!isPrivate && !isOwn}
            showSenderName={messageIndex === 0 && !isPrivate && !isOwn}
            loadAndPlayMedia={loadAndPlayMedia}
            isFirstInGroup={position.isFirstInGroup}
            isLastInGroup={position.isLastInGroup}
            isLastInList={position.isLastInList}
          />
        );

        if (isPrevLastRead && !message.is_outgoing) {
          isPrevLastRead = false;

          return (
            <>
              <div className="unread-divider">Unread messages</div>
              {renderedMessage}
            </>
          );
        } else if (message.id === unreadDividerMessageId) {
          isPrevLastRead = true;
        }

        return renderedMessage;
      }));
    });

    return (
      // @ts-ignore
      <div className="message-date-group" key={dateGroup.datetime} teactChildrenKeyOrder="asc">
        <div className="message-date-header" key={-Infinity}>
          <span>{formatHumanDate(dateGroup.datetime)}</span>
        </div>
        {flatten(senderGroups)}
      </div>
    );
  });

  return flatten(dateGroups);
}

function determineStickyElement(container: HTMLElement, selector: string) {
  const allElements = container.querySelectorAll(selector);
  const containerTop = container.scrollTop;

  Array.from(allElements).forEach((el) => {
    const currentTop = (el as HTMLElement).offsetTop;
    el.classList.toggle('is-sticky', currentTop - containerTop === INDICATOR_TOP_MARGIN);
  });
}

export default memo(withGlobal(
  global => {
    const chat = selectOpenChat(global);

    if (!chat) {
      return {};
    }

    const chatId = chat.id;

    return {
      chatId,
      isChannelChat: isChatChannel(chat),
      messageIds: selectViewportIds(global, chatId),
      messagesById: selectChatMessages(global, chatId),
      lastReadId: selectLastReadId(global, chatId),
      isViewportNewest: selectIsViewportNewest(global, chatId),
      isFocusing: Boolean(selectFocusedMessageId(global, chatId)),
    };
  },
  (setGlobal, actions) => {
    const {
      loadViewportMessages, markMessagesRead, setChatScrollOffset,
    } = actions;

    return {
      loadViewportMessages, markMessagesRead, setChatScrollOffset,
    };
  },
)(MessageList));
