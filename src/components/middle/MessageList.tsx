import { UIEvent } from 'react';
import React, {
  FC, memo, useCallback, useEffect, useMemo, useRef, useState,
} from '../../lib/teact/teact';
import { getGlobal, withGlobal } from '../../lib/teact/teactn';

import { ApiMessage } from '../../api/types';
import { GlobalActions } from '../../global/types';

import {
  selectChatMessages,
  selectViewportIds,
  selectIsChatMessageViewportLatest,
  selectOpenChat,
} from '../../modules/selectors';
import {
  getMessageRenderKey,
  isActionMessage,
  isChatChannel,
  isChatPrivate,
  isOwnMessage,
} from '../../modules/helpers';
import { flatten, orderBy } from '../../util/iteratees';
import { debounce, throttle } from '../../util/schedulers';
import { formatHumanDate } from '../../util/dateFormat';
import useLayoutEffectWithPrevDeps from '../../hooks/useLayoutEffectWithPrevDeps';
import buildClassName from '../../util/buildClassName';
import { groupMessages, MessageDateGroup } from './helpers/groupMessages';

import Loading from '../ui/Loading';
import Message from './message/Message';
import ServiceMessage from './ServiceMessage';

import './MessageList.scss';

type IProps = Pick<GlobalActions, 'loadMessagesForList' | 'markMessagesRead' | 'setChatScrollOffset'> & {
  chatId?: number;
  isChannelChat?: boolean;
  isUnread?: boolean;
  messageIds?: number[];
  messagesById?: Record<number, ApiMessage>;
  isLatest: boolean;
};

const LOAD_MORE_THRESHOLD_PX = 1500;
const LOAD_MORE_WHEN_LESS_THAN = 50;
const SCROLL_TO_LAST_THRESHOLD_PX = 100;
const VIEWPORT_MARGIN = 500;
const STICKY_OFFSET_TOP = 10;
const HIDE_STICKY_TIMEOUT = 450;

const runThrottledForScroll = throttle((cb) => cb(), 1000, false);
const scrollToLastMessage = throttle((container: Element) => {
  container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
}, 300, true);

let currentScrollOffset = 0;
let currentAnchorId: string | undefined;
let currentAnchorTop: number;

let scrollTimeout: NodeJS.Timeout | null = null;

const MessageList: FC<IProps> = ({
  chatId,
  isChannelChat,
  isUnread,
  messageIds,
  messagesById,
  isLatest,
  loadMessagesForList,
  markMessagesRead,
  setChatScrollOffset,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const [viewportMessageIds, setViewportMessageIds] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const messageGroups = useMemo(() => {
    if (!chatId || !messageIds || !messagesById || !messageIds.length) {
      return undefined;
    }

    const listedMessages = messageIds.map((id) => messagesById[id]);
    return groupMessages(orderBy(listedMessages, 'date'));
  }, [chatId, messageIds, messagesById]);

  const playMediaInViewport = useCallback(() => {
    requestAnimationFrame(() => {
      const newViewportMessageIds = findMediaMessagesInViewport(containerRef.current!);
      if (!areArraysEqual(newViewportMessageIds, viewportMessageIds)) {
        setViewportMessageIds(newViewportMessageIds);
      }
    });
  }, [viewportMessageIds]);

  const loadMessagesDebounced = useMemo(
    () => debounce(loadMessagesForList, 1000, true, false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadMessagesForList, messageIds],
  );

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const container = e.target as HTMLElement;

    const { scrollTop, scrollHeight, offsetHeight } = container;
    currentScrollOffset = scrollHeight - scrollTop;

    const isNearTop = scrollTop <= LOAD_MORE_THRESHOLD_PX;
    const isNearBottom = scrollHeight - (scrollTop + offsetHeight) <= LOAD_MORE_THRESHOLD_PX;
    const currentAnchor = currentAnchorId && document.getElementById(currentAnchorId);

    if (isNearTop) {
      const itemEls = container.querySelectorAll('.Message');
      const newAnchor = itemEls[0];
      if (newAnchor) {
        const newMovingOffset = newAnchor.getBoundingClientRect().top;
        const isMovingUp = (
          currentAnchor && currentAnchorTop !== undefined && newMovingOffset > currentAnchorTop
        );

        currentAnchorId = newAnchor.id;
        currentAnchorTop = newMovingOffset;

        if (isMovingUp) {
          loadMessagesDebounced({ direction: -1 });
        }
      }
    } else if (!isLatest && isNearBottom) {
      const itemEls = container.querySelectorAll('.Message');
      const newAnchor = itemEls[itemEls.length - 1];
      if (newAnchor) {
        const newMovingOffset = newAnchor.getBoundingClientRect().top;
        const isMovingDown = (
          currentAnchor && currentAnchorTop !== undefined && newMovingOffset < currentAnchorTop
        );

        currentAnchorId = newAnchor.id;
        currentAnchorTop = newMovingOffset;

        if (isMovingDown) {
          loadMessagesDebounced({ direction: 1 });
        }
      }
    } else if (currentAnchor) {
      currentAnchorTop = currentAnchor.getBoundingClientRect().top;
    }

    setIsScrolling(true);
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(() => setIsScrolling(false), HIDE_STICKY_TIMEOUT);

    runThrottledForScroll(() => {
      setChatScrollOffset({ chatId, scrollOffset: currentScrollOffset });

      playMediaInViewport();
    });

    determineStickyElement(container, '.message-date-header');
  }, [chatId, isLatest, loadMessagesDebounced, playMediaInViewport, setChatScrollOffset]);

  useEffect(() => {
    if (!messageIds || (messageIds.length < LOAD_MORE_WHEN_LESS_THAN)) {
      loadMessagesDebounced();
    }
  }, [messageIds, loadMessagesDebounced]);

  useEffect(() => {
    if (isUnread) {
      markMessagesRead();
    }
  }, [isUnread, markMessagesRead]);

  useLayoutEffectWithPrevDeps(([prevChatId, prevMessageIds, prevIsLatest]) => {
    if (chatId === prevChatId && messageIds === prevMessageIds) {
      return;
    }

    if (chatId && chatId !== prevChatId) {
      // We only read global state offset value when the chat has changed. Then we update it every second on scrolling.
      currentScrollOffset = getGlobal().chats.scrollOffsetById[chatId];
      currentAnchorId = undefined;
    }

    if (!containerRef.current) {
      return;
    }

    if (process.env.NODE_ENV === 'perf') {
      // eslint-disable-next-line no-console
      console.time('scrollTop');
    }

    const { scrollTop, scrollHeight, offsetHeight } = containerRef.current;
    const anchor = currentAnchorId ? document.getElementById(currentAnchorId) : undefined;

    const itemEls = containerRef.current.querySelectorAll('.Message');
    const lastMessage = itemEls[itemEls.length - 1];
    const isNewMessage = lastMessage && (lastMessage.id !== currentAnchorId);
    const isScrolledDown = currentScrollOffset - offsetHeight <= SCROLL_TO_LAST_THRESHOLD_PX;

    if (prevIsLatest && isScrolledDown && isNewMessage) {
      scrollToLastMessage(containerRef.current);
    } else if (!anchor) {
      containerRef.current.scrollTop = scrollHeight - Number(currentScrollOffset || 0);
    } else {
      const newAnchorTop = anchor.getBoundingClientRect().top;
      const newScrollTop = scrollTop + (newAnchorTop - currentAnchorTop);
      currentScrollOffset = scrollHeight - newScrollTop;
      containerRef.current.scrollTop = newScrollTop;
    }

    if (lastMessage) {
      currentAnchorId = lastMessage.id;
      currentAnchorTop = lastMessage.getBoundingClientRect().top;
    }

    playMediaInViewport();

    if (process.env.NODE_ENV === 'perf') {
      // eslint-disable-next-line no-console
      console.timeEnd('scrollTop');
    }
  }, [chatId, messageIds, isLatest, playMediaInViewport]);

  const isPrivate = chatId !== undefined && isChatPrivate(chatId);

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

      return senderGroup.map((
        message,
        messageIndex,
      ) => {
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

        return (
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
      });
    });

    return (
      // @ts-ignore
      <div className="message-date-group" key={dateGroup.key}>
        <div className="message-date-header" key={-Infinity}>
          <span>{formatHumanDate(dateGroup.datetime)}</span>
        </div>
        {flatten(senderGroups)}
      </div>
    );
  });

  return flatten(dateGroups);
}

function findMediaMessagesInViewport(container: HTMLElement) {
  const viewportY1 = container.scrollTop;
  const viewportY2 = viewportY1 + container.clientHeight;
  const messageEls = container.querySelectorAll('.Message.has-media');
  const visibleIds: number[] = [];
  let isFound = false;

  for (let i = messageEls.length - 1; i >= 0; i--) {
    const messageEl = messageEls[i] as HTMLElement;
    const y1 = messageEl.offsetTop;
    const y2 = y1 + messageEl.offsetHeight;

    if (y1 <= viewportY2 + VIEWPORT_MARGIN && y2 >= viewportY1 - VIEWPORT_MARGIN) {
      visibleIds.push(Number(messageEl.dataset.messageId));
      isFound = true;
    } else if (isFound) {
      break;
    }
  }

  return visibleIds;
}

function areArraysEqual(arr1: any[], arr2: any[]) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  return arr1.every((el, i) => el === arr2[i]);
}

function determineStickyElement(container: HTMLElement, selector: string) {
  const allElements = container.querySelectorAll(selector);
  const containerTop = container.scrollTop;

  Array.from(allElements).forEach((el) => {
    const currentTop = (el as HTMLElement).offsetTop;
    el.classList.toggle('is-sticky', currentTop - containerTop === STICKY_OFFSET_TOP);
  });
}

export default memo(withGlobal(
  global => {
    const chat = selectOpenChat(global);

    if (!chat) {
      return {};
    }

    return {
      chatId: chat.id,
      isChannelChat: isChatChannel(chat),
      isUnread: Boolean(chat.unread_count),
      messageIds: selectViewportIds(global, chat.id),
      messagesById: selectChatMessages(global, chat.id),
      isLatest: selectIsChatMessageViewportLatest(global, chat.id),
    };
  },
  (setGlobal, actions) => {
    const {
      loadMessagesForList, markMessagesRead, setChatScrollOffset,
    } = actions;

    return {
      loadMessagesForList, markMessagesRead, setChatScrollOffset,
    };
  },
)(MessageList));
