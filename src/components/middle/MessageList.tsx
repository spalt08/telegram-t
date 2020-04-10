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
  selectFirstUnreadId,
  selectOpenChat,
  selectFocusedMessageId,
} from '../../modules/selectors';
import {
  getMessageOriginalId,
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
import { groupMessages, MessageDateGroup, isAlbum } from './helpers/groupMessages';
import useOnChange from '../../hooks/useOnChange';
import findInViewport from '../../util/findInViewport';

import Loading from '../ui/Loading';
import Message from './message/Message';
import ActionMessage from './ActionMessage';

import './MessageList.scss';

type OwnProps = {
  onFabToggle: (show: boolean) => void;
};

type StateProps = {
  chatId?: number;
  isChannelChat?: boolean;
  messageIds?: number[];
  messagesById?: Record<number, ApiMessage>;
  firstUnreadId?: number;
  isViewportNewest?: boolean;
  isFocusing?: boolean;
};

type DispatchProps = Pick<GlobalActions, 'loadViewportMessages' | 'markMessagesRead' | 'setChatScrollOffset'>;

const SCROLL_TO_LAST_THRESHOLD_PX = 100;
const VIEWPORT_MEDIA_MARGIN = 500;
const INDICATOR_TOP_MARGIN = 10;
const SCROLL_THROTTLE = 1000;
const FOCUSING_DURATION = 1000;

const runThrottledForScroll = throttle((cb) => cb(), SCROLL_THROTTLE, false);
const scrollToLastMessage = throttle((container: Element) => {
  container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
}, 300, true);

let currentAnchorId: string | undefined;
let currentAnchorTop: number;
let listItemElements: NodeListOf<HTMLDivElement>;
let memoFirstUnreadId: number | undefined;
let scrollTimeout: NodeJS.Timeout | null = null;

const MessageList: FC<OwnProps & StateProps & DispatchProps> = ({
  onFabToggle,
  chatId,
  isChannelChat,
  messageIds,
  messagesById,
  firstUnreadId,
  isViewportNewest,
  isFocusing,
  loadViewportMessages,
  markMessagesRead,
  setChatScrollOffset,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const scrollOffsetRef = useRef<number>();

  const [viewportMessageIds, setViewportMessageIds] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const [containerHeight, setContainerHeight] = useState();

  useOnChange(() => {
    currentAnchorId = undefined;

    // We update local cached `scrollOffsetRef` when switching chat.
    // Then we update global version every second on scrolling.
    scrollOffsetRef.current = (chatId && getGlobal().chats.scrollOffsetById[chatId]) || 0;

    // We only update `memoFirstUnreadId` when switching chat.
    memoFirstUnreadId = firstUnreadId;
  }, [chatId, Boolean(messageIds)]);

  const messageGroups = useMemo(() => {
    if (!chatId || !messageIds || !messagesById || !messageIds.length) {
      return undefined;
    }

    const listedMessages = messageIds.map((id) => messagesById[id]);
    return groupMessages(orderBy(listedMessages, 'date'), memoFirstUnreadId!);
  }, [chatId, messageIds, messagesById]);

  const [loadMoreBackwards, loadMoreForwards, loadMoreBoth] = useMemo(
    () => [
      debounce(() => loadViewportMessages({ direction: LoadMoreDirection.Backwards }), 1000, true, false),
      debounce(() => loadViewportMessages({ direction: LoadMoreDirection.Forwards }), 1000, true, false),
      debounce(() => loadViewportMessages({ direction: LoadMoreDirection.Both }), 1000, true, false),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadViewportMessages, chatId, messageIds],
  );

  const updateFabVisibility = useCallback(() => {
    if (!messageIds || !messageIds.length) {
      onFabToggle(false);
      return;
    }

    if (!isViewportNewest) {
      onFabToggle(true);
      return;
    }

    const scrollBottom = scrollOffsetRef.current! - containerRef.current!.offsetHeight;
    const isNearBottom = scrollBottom <= SCROLL_TO_LAST_THRESHOLD_PX;
    const isAtBottom = scrollBottom === 0;

    onFabToggle(firstUnreadId ? !isAtBottom : !isNearBottom);
  }, [messageIds, isViewportNewest, firstUnreadId, onFabToggle]);

  const updateViewportMessages = useCallback(() => {
    const container = containerRef.current!;

    const {
      allElements: mediaMessageEls, visibleIndexes: visibleMediaIndexes,
    } = findInViewport(container, '.Message.has-media', VIEWPORT_MEDIA_MARGIN);
    const newViewportMessageIds = visibleMediaIndexes.map((i) => Number(mediaMessageEls[i].dataset.messageId));
    if (!areSortedArraysEqual(newViewportMessageIds, viewportMessageIds)) {
      setViewportMessageIds(newViewportMessageIds);
    }

    if (firstUnreadId) {
      const {
        allElements, visibleIndexes,
      } = findInViewport(container, listItemElements, undefined, undefined, true);
      const lowerElement = allElements[visibleIndexes[visibleIndexes.length - 1]];

      const maxId = lowerElement ? Number(lowerElement.dataset.messageId) : undefined;
      if (maxId && maxId >= firstUnreadId) {
        markMessagesRead({ maxId });
      }
    }
  }, [firstUnreadId, markMessagesRead, viewportMessageIds]);

  const processInfiniteScroll = useCallback(() => {
    const container = containerRef.current!;
    const { scrollTop, scrollHeight, offsetHeight } = container;
    const isNearTop = scrollTop <= MESSAGE_LIST_SENSITIVE_AREA;
    const isNearBottom = scrollHeight - (scrollTop + offsetHeight) <= MESSAGE_LIST_SENSITIVE_AREA;
    const currentAnchor = currentAnchorId && document.getElementById(currentAnchorId);
    let isUpdated = false;

    if (isNearTop) {
      const nextAnchor = listItemElements[0];
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
          loadMoreBackwards();
        }
      }
    }

    if (!isViewportNewest && isNearBottom) {
      const nextAnchor = listItemElements[listItemElements.length - 1];
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
          loadMoreForwards();
        }
      }
    }

    if (!isUpdated) {
      if (currentAnchor) {
        currentAnchorTop = currentAnchor.getBoundingClientRect().top;
      } else {
        const nextAnchor = listItemElements[0];
        currentAnchorId = nextAnchor.id;
        currentAnchorTop = nextAnchor.getBoundingClientRect().top;
      }
    }
  }, [isViewportNewest, loadMoreBackwards, loadMoreForwards]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current!;
    const newScrollOffset = container.scrollHeight - container.scrollTop;

    if (newScrollOffset === scrollOffsetRef.current) {
      return;
    }

    scrollOffsetRef.current = newScrollOffset;
    setIsScrolling(true);

    if (!isFocusing) {
      processInfiniteScroll();
    } else {
      setTimeout(processInfiniteScroll, FOCUSING_DURATION);
    }

    runThrottledForScroll(() => {
      if (!container.parentElement) {
        return;
      }

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(() => setIsScrolling(false), SCROLL_THROTTLE + 100);

      requestAnimationFrame(() => {
        updateFabVisibility();
        updateViewportMessages();
        determineStuckDate(container);
      });

      setChatScrollOffset({ chatId, scrollOffset: scrollOffsetRef.current });
    });
  }, [isFocusing, processInfiniteScroll, setChatScrollOffset, chatId, updateViewportMessages, updateFabVisibility]);

  // Container resize observer.
  useEffect(() => {
    if (!('ResizeObserver' in window) || process.env.NODE_ENV === 'perf') {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height);
    });

    observer.observe(containerRef.current!);

    return () => {
      observer.disconnect();
    };
  });

  // Initial message loading
  useEffect(() => {
    const container = containerRef.current!;

    if (!messageIds || (
      container.scrollHeight <= container.clientHeight && messageIds.length < MESSAGE_LIST_SLICE * 2
    )) {
      loadMoreBoth();
    }
  }, [chatId, messageIds, loadMoreBoth]);

  useLayoutEffectWithPrevDeps(([
    prevChatId, prevMessageIds, prevIsViewportNewest, prevContainerHeight,
  ]: [
    typeof chatId, typeof messageIds, typeof isViewportNewest, typeof containerHeight
  ]) => {
    if (!chatId || !messageIds || (
      chatId === prevChatId
      && messageIds === prevMessageIds
      && prevContainerHeight === containerHeight
    )) {
      return;
    }

    const container = containerRef.current!;
    listItemElements = container.querySelectorAll<HTMLDivElement>('.message-list-item');

    if (isFocusing) {
      return;
    }

    if (process.env.NODE_ENV === 'perf') {
      // eslint-disable-next-line no-console
      console.time('scrollTop');
    }

    const { scrollTop, scrollHeight, offsetHeight } = container;
    const scrollOffset = scrollOffsetRef.current!;
    const isAtBottom = isViewportNewest && prevIsViewportNewest && (
      scrollOffset - (prevContainerHeight || offsetHeight) <= SCROLL_TO_LAST_THRESHOLD_PX
    );
    const isNewMessage = (
      prevMessageIds && messageIds[messageIds.length - 1] !== prevMessageIds[prevMessageIds.length - 1]
    );
    const isResized = prevContainerHeight !== containerHeight;
    const anchor = currentAnchorId ? document.getElementById(currentAnchorId) : undefined;
    const unreadDivider = (
      !anchor && memoFirstUnreadId && container.querySelector<HTMLDivElement>('.unread-divider')
    );

    let newScrollTop;

    if (isAtBottom && isNewMessage) {
      newScrollTop = scrollHeight - offsetHeight;
      scrollToLastMessage(container);
    } else {
      if (isAtBottom && isResized) {
        newScrollTop = scrollHeight - offsetHeight;
      } else if (anchor) {
        const newAnchorTop = anchor.getBoundingClientRect().top;
        newScrollTop = scrollTop + (newAnchorTop - currentAnchorTop);
      } else if (unreadDivider) {
        newScrollTop = unreadDivider.offsetTop - INDICATOR_TOP_MARGIN;
      } else {
        newScrollTop = scrollHeight - scrollOffset;
      }

      container.scrollTop = newScrollTop;
      determineStuckDate(container, true);
    }

    scrollOffsetRef.current = Math.max(scrollHeight - newScrollTop, offsetHeight);
    updateFabVisibility();
    requestAnimationFrame(updateViewportMessages);

    if (process.env.NODE_ENV === 'perf') {
      // eslint-disable-next-line no-console
      console.timeEnd('scrollTop');
    }
  }, [chatId, messageIds, isViewportNewest, containerHeight, isFocusing, updateFabVisibility, updateViewportMessages]);

  useEffect(() => {
    if (!firstUnreadId) {
      updateFabVisibility();
    }
  }, [firstUnreadId, updateFabVisibility]);

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
      if (senderGroup.length === 1 && !isAlbum(senderGroup[0]) && isActionMessage(senderGroup[0])) {
        const message = senderGroup[0];
        const renderedMessage = <ActionMessage key={message.id} message={message} />;

        if (message.id === memoFirstUnreadId) {
          return (
            <>
              <div className="unread-divider"><span>Unread messages</span></div>
              {renderedMessage}
            </>
          );
        }

        return renderedMessage;
      }

      return flatten(senderGroup.map((
        messageOrAlbum,
        messageIndex,
      ) => {
        const message = isAlbum(messageOrAlbum) ? messageOrAlbum.messages[0] : messageOrAlbum;
        const album = isAlbum(messageOrAlbum) ? messageOrAlbum : undefined;

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
          || (!!message.prev_local_id && viewportMessageIds.includes(message.prev_local_id))
        );

        const renderedMessage = (
          <Message
            key={getMessageOriginalId(message)}
            message={message}
            album={album}
            showAvatar={!isPrivate && !isOwn}
            showSenderName={messageIndex === 0 && !isPrivate && !isOwn}
            loadAndPlayMedia={loadAndPlayMedia}
            isFirstInGroup={position.isFirstInGroup}
            isLastInGroup={position.isLastInGroup}
            isLastInList={position.isLastInList}
          />
        );

        if (message.id === memoFirstUnreadId) {
          return (
            <>
              <div className="unread-divider"><span>Unread messages</span></div>
              {renderedMessage}
            </>
          );
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

function determineStuckDate(container: HTMLElement, forceHide = false) {
  const allElements = container.querySelectorAll<HTMLDivElement>('.message-date-header');
  const containerTop = container.scrollTop;

  Array.from(allElements).forEach((el) => {
    const isStuck = el.offsetTop - containerTop === INDICATOR_TOP_MARGIN;
    el.classList.toggle('stuck', isStuck);
    el.classList.toggle('hidden', isStuck && forceHide);
  });
}

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
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
      firstUnreadId: selectFirstUnreadId(global, chatId),
      isViewportNewest: selectIsViewportNewest(global, chatId),
      isFocusing: Boolean(selectFocusedMessageId(global, chatId)),
    };
  },
  (setGlobal, actions): DispatchProps => {
    const {
      loadViewportMessages, markMessagesRead, setChatScrollOffset,
    } = actions;

    return {
      loadViewportMessages, markMessagesRead, setChatScrollOffset,
    };
  },
)(MessageList));
