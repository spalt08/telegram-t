import React, {
  FC, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from '../../lib/teact/teact';
import { getGlobal, withGlobal } from '../../lib/teact/teactn';

import { ApiMessage, ApiRestrictionReason } from '../../api/types';
import { GlobalActions } from '../../global/types';
import { LoadMoreDirection } from '../../types';

import { MESSAGE_LIST_SENSITIVE_AREA, MESSAGE_LIST_SLICE } from '../../config';
import { IS_TOUCH_ENV } from '../../util/environment';
import {
  selectChatMessages,
  selectViewportIds,
  selectIsViewportNewest,
  selectFirstUnreadId,
  selectFocusedMessageId,
  selectChat,
} from '../../modules/selectors';
import {
  getMessageOriginalId,
  isActionMessage,
  isChatChannel,
  isChatPrivate,
  isOwnMessage,
  getCanPostInChat,
} from '../../modules/helpers';
import {
  areSortedArraysEqual,
  flatten,
  orderBy,
  pick,
} from '../../util/iteratees';
import { debounce, fastRaf, throttle } from '../../util/schedulers';
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
  chatId: number;
  onFabToggle: (show: boolean) => void;
};

type StateProps = {
  isChatLoaded?: boolean;
  isChannelChat?: boolean;
  isReadOnlyChannel?: boolean;
  messageIds?: number[];
  messagesById?: Record<number, ApiMessage>;
  firstUnreadId?: number;
  isViewportNewest?: boolean;
  isFocusing?: boolean;
  isRestricted?: boolean;
  restrictionReason?: ApiRestrictionReason;
};

type DispatchProps = Pick<GlobalActions, (
  'loadViewportMessages' | 'markChatRead' | 'markMessagesRead' | 'setChatScrollOffset'
)>;

const SCROLL_TO_LAST_THRESHOLD_PX = 100;
const VIEWPORT_MEDIA_MARGIN = 500;
const INDICATOR_TOP_MARGIN = 10;
const SCROLL_THROTTLE = 1000;
const FOCUSING_DURATION = 1000;

// TODO Check if this workaround is only required for iOS 13+
const SCROLL_DEBOUNCE_ARGS = IS_TOUCH_ENV ? [700, false, true] : [1000, true, false];

const runThrottledForScroll = throttle((cb) => cb(), SCROLL_THROTTLE, false);
const scrollToLastMessage = throttle((container: Element) => {
  container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
}, 300, true);

let currentAnchorId: string | undefined;
let currentAnchorTop: number;
let listItemElements: NodeListOf<HTMLDivElement>;
let memoFirstUnreadId: number | undefined;
let isScrollTopJustUpdated = false;

const MessageList: FC<OwnProps & StateProps & DispatchProps> = ({
  onFabToggle,
  chatId,
  isChatLoaded,
  isChannelChat,
  isReadOnlyChannel,
  messageIds,
  messagesById,
  firstUnreadId,
  isViewportNewest,
  isFocusing,
  isRestricted,
  restrictionReason,
  loadViewportMessages,
  markChatRead,
  markMessagesRead,
  setChatScrollOffset,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const scrollOffsetRef = useRef<number>();

  const [viewportMessageIds, setViewportMessageIds] = useState<number[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [containerHeight, setContainerHeight] = useState<number | undefined>();

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
      // @ts-ignore
      debounce(() => loadViewportMessages({ direction: LoadMoreDirection.Backwards }), ...SCROLL_DEBOUNCE_ARGS),
      // @ts-ignore
      debounce(() => loadViewportMessages({ direction: LoadMoreDirection.Forwards }), ...SCROLL_DEBOUNCE_ARGS),
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

    const {
      allElements: mentionMessageEls, visibleIndexes: visibleMentionIndexes,
    } = findInViewport(container, '.Message.has-unread-mention', VIEWPORT_MEDIA_MARGIN);
    const readMessageIds = visibleMentionIndexes.map((i) => Number(mentionMessageEls[i].dataset.messageId));
    if (readMessageIds.length) {
      markMessagesRead({ messageIds: readMessageIds });
    }

    if (firstUnreadId) {
      const {
        allElements, visibleIndexes,
      } = findInViewport(container, listItemElements, undefined, undefined, true);
      const lowerElement = allElements[visibleIndexes[visibleIndexes.length - 1]];
      if (!lowerElement) {
        return;
      }

      const maxId = Number(lowerElement.dataset.lastMessageId || lowerElement.dataset.messageId);
      if (maxId >= firstUnreadId) {
        markChatRead({ maxId });
      }
    }
  }, [firstUnreadId, markChatRead, markMessagesRead, viewportMessageIds]);

  const processInfiniteScroll = useCallback(() => {
    const container = containerRef.current!;
    const { scrollTop, scrollHeight, offsetHeight } = container;
    const isNearTop = scrollTop <= MESSAGE_LIST_SENSITIVE_AREA;
    const isNearBottom = scrollHeight - (scrollTop + offsetHeight) <= MESSAGE_LIST_SENSITIVE_AREA;
    const currentAnchor = currentAnchorId && document.getElementById(currentAnchorId);
    let isUpdated = false;

    if (isNearTop) {
      // We avoid the very first item as it may be a partly-loaded album
      const nextAnchor = listItemElements[1] || listItemElements[0];
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
      const nextAnchor = listItemElements[listItemElements.length - 2] || listItemElements[listItemElements.length - 1];
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
    if (isScrollTopJustUpdated) {
      isScrollTopJustUpdated = false;
      return;
    }

    const container = containerRef.current!;
    scrollOffsetRef.current = container.scrollHeight - container.scrollTop;

    if (!isFocusing) {
      processInfiniteScroll();
    } else {
      setTimeout(processInfiniteScroll, FOCUSING_DURATION);
    }

    runThrottledForScroll(() => {
      if (!container.parentElement) {
        return;
      }

      setIsScrolled(true);
      updateStickyDateOnScroll(container);

      fastRaf(() => {
        updateFabVisibility();
        updateViewportMessages();
      });

      setChatScrollOffset({ chatId, scrollOffset: scrollOffsetRef.current });
    });
  }, [isFocusing, processInfiniteScroll, setChatScrollOffset, chatId, updateFabVisibility, updateViewportMessages]);

  useLayoutEffect(() => {
    if (isScrolled) {
      updateStickyDateOnScroll(containerRef.current!, true);
    }
  }, [isScrolled]);

  // Container resize observer.
  useEffect(() => {
    if (!('ResizeObserver' in window) || process.env.APP_ENV === 'perf') {
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
    // Some chats are loaded asynchronosly, so we need to check if the chat has been loaded before fetching history
    if (!isChatLoaded) {
      return;
    }

    const container = containerRef.current!;

    if (!messageIds || (
      messageIds.length < MESSAGE_LIST_SLICE && container.scrollHeight <= container.clientHeight
    )) {
      loadMoreBoth();
    }
  }, [chatId, isChatLoaded, messageIds, loadMoreBoth]);

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

    if (process.env.APP_ENV === 'perf') {
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
    } else if (isFocusing) {
      return;
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
      isScrollTopJustUpdated = true;
    }

    scrollOffsetRef.current = Math.max(scrollHeight - newScrollTop, offsetHeight);
    updateFabVisibility();
    fastRaf(updateViewportMessages);

    if (process.env.APP_ENV === 'perf') {
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
    isChannelChat && 'no-avatars',
    isReadOnlyChannel && 'bottom-padding',
    isScrolled && 'scrolled',
  );

  function renderContent() {
    if (!messageIds && isRestricted) {
      return (
        <div className="chat-restricted">
          <p>{restrictionReason ? restrictionReason.text : 'This is a private chat'}</p>
        </div>
      );
    }

    return messageIds && messageGroups ? (
      // @ts-ignore
      <div className="messages-container" teactFastList>
        {messageGroups && renderMessages(messageGroups, viewportMessageIds, isPrivate)}
      </div>
    ) : messageIds ? (
      <div className="empty"><span>No messages here yet</span></div>
    ) : (
      <Loading color="white" />
    );
  }

  return (
    <div ref={containerRef} id="MessageList" className={className} onScroll={handleScroll}>
      {renderContent()}
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
              <div className="unread-divider" key="unread-divider">
                <span>Unread messages</span>
              </div>
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

        if (message.previousLocalId && currentAnchorId === `message${message.previousLocalId}`) {
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
          || (!!message.previousLocalId && viewportMessageIds.includes(message.previousLocalId))
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
              <div className="unread-divider" key="unread-divider">
                <span>Unread messages</span>
              </div>
              {renderedMessage}
            </>
          );
        }

        return renderedMessage;
      }));
    });

    return (
      <div
        className="message-date-group"
        key={dateGroup.datetime}
        teactFastList
      >
        <div className="message-date-header" key="date-header">
          <span>{formatHumanDate(dateGroup.datetime)}</span>
        </div>
        {flatten(senderGroups)}
      </div>
    );
  });

  return flatten(dateGroups);
}

let scrollEndTimeout: number | undefined;

function updateStickyDateOnScroll(container: HTMLElement, forceHide = false) {
  if (!scrollEndTimeout) {
    const currentInvisible = container.querySelector<HTMLDivElement>('.message-date-header.invisible');
    if (currentInvisible) {
      currentInvisible.classList.remove('invisible');
    }

    const stuckDateEl = findStuckDate(container);
    if (!stuckDateEl) {
      return;
    }

    stuckDateEl.classList.add('invisible');

    if (forceHide) {
      stuckDateEl.classList.add('no-transition');
    }

    fastRaf(() => {
      stuckDateEl.classList.remove('invisible', 'no-transition');
    });
  } else {
    clearTimeout(scrollEndTimeout);
  }

  scrollEndTimeout = window.setTimeout(() => {
    const stuckDateEl = findStuckDate(container);
    if (stuckDateEl) {
      stuckDateEl.classList.add('invisible');
    }
    scrollEndTimeout = undefined;
  }, SCROLL_THROTTLE + 100);
}

function findStuckDate(container: HTMLElement) {
  const allElements = container.querySelectorAll<HTMLDivElement>('.message-date-header');
  const containerTop = container.scrollTop;

  return Array.from(allElements).find((el) => {
    const { offsetTop, offsetHeight } = el;
    const top = offsetTop - containerTop;
    return -offsetHeight <= top && top <= INDICATOR_TOP_MARGIN;
  });
}

export default memo(withGlobal<OwnProps>(
  (global, { chatId }): StateProps => {
    const chat = selectChat(global, chatId);
    if (!chat) {
      return {};
    }

    const { isRestricted, restrictionReason } = chat;
    const isChannelChat = isChatChannel(chat);

    return {
      isChatLoaded: true,
      isRestricted,
      restrictionReason,
      isChannelChat,
      isReadOnlyChannel: isChannelChat && !getCanPostInChat(chat),
      messageIds: selectViewportIds(global, chatId),
      messagesById: selectChatMessages(global, chatId),
      firstUnreadId: selectFirstUnreadId(global, chatId),
      isViewportNewest: selectIsViewportNewest(global, chatId),
      isFocusing: Boolean(selectFocusedMessageId(global, chatId)),
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'loadViewportMessages',
    'markChatRead',
    'markMessagesRead',
    'setChatScrollOffset',
  ]),
)(MessageList));
