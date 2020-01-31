import { UIEvent } from 'react';
import React, {
  FC, useState, memo, useCallback, useRef,
} from '../../lib/teact/teact';
import { getGlobal, withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../store/types';
import { ApiMessage } from '../../api/types';

import { selectChatMessages, selectChat } from '../../modules/selectors';
import {
  isOwnMessage,
  isPrivateChat,
  isActionMessage,
  isChannel,
} from '../../modules/helpers';
import { orderBy, toArray, flatten } from '../../util/iteratees';
import { throttle } from '../../util/schedulers';
import { formatHumanDate } from '../../util/dateFormat';
import useLayoutEffectWithPrevDeps from '../../hooks/useLayoutEffectWithPrevDeps';
import { MessageDateGroup, groupMessages } from './util/groupMessages';

import Loading from '../ui/Loading';
import Message from './message/Message';
import ServiceMessage from './ServiceMessage';

import './MessageList.scss';

type IProps = Pick<GlobalActions, 'loadMessages' | 'loadMoreMessages' | 'markMessagesRead' | 'setChatScrollOffset'> & {
  isLoaded?: boolean;
  isUnread?: boolean;
  messages?: Record<number, ApiMessage>;
  chatId?: number;
  isChannelChat?: boolean;
};

const LOAD_MORE_THRESHOLD_PX = 1000;
const LOAD_MORE_WHEN_LESS_THAN = 50;
const VIEWPORT_MARGIN = 500;
const HIDE_STICKY_TIMEOUT = 450;

const runThrottledForLoadMessages = throttle((cb) => cb(), 1000, true);
const runThrottledForMarkMessagesRead = throttle((cb) => cb(), 1000, true);
const runThrottledForScroll = throttle((cb) => cb(), 1000, false);

let currentScrollOffset = 0;
let scrollTimeout: NodeJS.Timeout | null = null;

const MessageList: FC<IProps> = ({
  isLoaded,
  isUnread,
  messages,
  chatId,
  isChannelChat,
  loadMessages,
  loadMoreMessages,
  markMessagesRead,
  setChatScrollOffset,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const [viewportMessageIds, setViewportMessageIds] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);

  const messagesArray = isLoaded && messages ? orderBy(toArray(messages), 'date') : [];

  if (!isLoaded) {
    runThrottledForLoadMessages(loadMessages);
  } else {
    if (isUnread) {
      runThrottledForMarkMessagesRead(markMessagesRead);
    }

    if (messagesArray.length < LOAD_MORE_WHEN_LESS_THAN) {
      runThrottledForLoadMessages(loadMoreMessages);
    }
  }

  const playMediaInViewport = useCallback(() => {
    requestAnimationFrame(() => {
      const newViewportMessageIds = findMediaMessagesInViewport(containerRef.current!);
      if (!areArraysEqual(newViewportMessageIds, viewportMessageIds)) {
        setViewportMessageIds(newViewportMessageIds);
      }
    });
  }, [viewportMessageIds]);

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    currentScrollOffset = target.scrollHeight - target.scrollTop;

    determineStickyElement(target, '.message-date-header');

    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    setIsScrolling(true);
    scrollTimeout = setTimeout(() => setIsScrolling(false), HIDE_STICKY_TIMEOUT);

    if (target.scrollTop <= LOAD_MORE_THRESHOLD_PX) {
      runThrottledForLoadMessages(() => {
        // More than one callback can be added to the queue
        // before the messages are prepended, so we need to check again.
        if (target.scrollTop <= LOAD_MORE_THRESHOLD_PX) {
          loadMoreMessages();
        }
      });
    }

    runThrottledForScroll(() => {
      setChatScrollOffset({ chatId, scrollOffset: currentScrollOffset });

      playMediaInViewport();
    });
  }, [chatId, loadMoreMessages, setChatScrollOffset, playMediaInViewport]);

  useLayoutEffectWithPrevDeps(([prevChatId, prevMessages]) => {
    if (chatId === prevChatId && messages === prevMessages) {
      return;
    }

    if (chatId && chatId !== prevChatId) {
      // We only read global state offset value when the chat has changed. Then we update it every second on scrolling.
      currentScrollOffset = getGlobal().chats.scrollOffsetById[chatId];
    }

    if (!containerRef.current) {
      return;
    }

    if (process.env.NODE_ENV === 'perf') {
      // eslint-disable-next-line no-console
      console.time('scrollTop');
    }

    const { scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight !== clientHeight) {
      containerRef.current.scrollTop = scrollHeight - Number(currentScrollOffset || 0);
    } else {
      playMediaInViewport();
    }

    if (process.env.NODE_ENV === 'perf') {
      // eslint-disable-next-line no-console
      console.timeEnd('scrollTop');
    }
  }, [chatId, messages, playMediaInViewport]);

  const isPrivate = chatId && isPrivateChat(chatId);

  function renderMessageDateGroup(
    messageDateGroup: MessageDateGroup,
    dateGroupIndex: number,
    messageDateGroupsArray: MessageDateGroup[],
  ) {
    const messageGroups = messageDateGroup.messageGroups.map((
      messageGroup,
      groupIndex,
      messageGroupsArray,
    ) => {
      if (messageGroup.length === 1 && isActionMessage(messageGroup[0])) {
        const message = messageGroup[0];
        return <ServiceMessage key={message.id} message={message} />;
      }

      return messageGroup.map((message, i) => {
        const isOwn = isOwnMessage(message);
        const position = {
          isFirstInGroup: i === 0,
          isLastInGroup: i === messageGroup.length - 1,
          isLastInList: i === messageGroup.length - 1
            && groupIndex === messageGroupsArray.length - 1
            && dateGroupIndex === messageDateGroupsArray.length - 1,
        };

        return (
          <Message
            key={message.id}
            message={message}
            showAvatar={!isPrivate && !isOwn}
            showSenderName={i === 0 && !isPrivate && !isOwn}
            loadAndPlayMedia={viewportMessageIds.includes(message.id)}
            isFirstInGroup={position.isFirstInGroup}
            isLastInGroup={position.isLastInGroup}
            isLastInList={position.isLastInList}
          />
        );
      });
    });

    return (
      // @ts-ignore
      <div className="message-date-group" key={messageDateGroup.datetime} teactChildrenKeyOrder="asc">
        <div className="message-date-header" key={0}>
          <span>{formatHumanDate(messageDateGroup.datetime)}</span>
        </div>
        {flatten(messageGroups)}
      </div>
    );
  }

  const classNames = ['MessageList', 'custom-scroll'];
  if (isPrivate || isChannelChat) {
    classNames.push('no-avatars');
  }
  if (isChannelChat) {
    classNames.push('bottom-padding');
  }
  if (isScrolling) {
    classNames.push('is-scrolling');
  }

  return (
    <div
      ref={containerRef}
      className={classNames.join(' ')}
      onScroll={handleScroll}
    >
      {isLoaded ? (
        // @ts-ignore
        <div className="messages-container" teactChildrenKeyOrder="asc">
          {messagesArray.length > 0 && flatten(groupMessages(messagesArray).map(renderMessageDateGroup))}
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
};

function findMediaMessagesInViewport(container: HTMLElement) {
  const viewportY1 = container.scrollTop;
  const viewportY2 = viewportY1 + container.clientHeight;
  const messageEls = container.querySelectorAll('.Message.has-media, .Message.has-reply');
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
  const containerTop = container.getBoundingClientRect().top;

  Array.from(allElements).forEach((el) => {
    const currentTop = el.getBoundingClientRect().top;
    el.classList.toggle('is-sticky', currentTop - containerTop === 10);
  });
}

export default memo(withGlobal(
  global => {
    const { chats: { selectedId } } = global;

    if (!selectedId) {
      return {};
    }

    const messages = selectChatMessages(global, selectedId);
    const chat = selectChat(global, selectedId);

    return {
      isLoaded: Boolean(messages),
      isUnread: Boolean(chat.unread_count),
      messages,
      chatId: selectedId,
      isChannelChat: isChannel(chat),
    };
  },
  (setGlobal, actions) => {
    const {
      loadMessages, loadMoreMessages, markMessagesRead, setChatScrollOffset,
    } = actions;

    return {
      loadMessages, loadMoreMessages, markMessagesRead, setChatScrollOffset,
    };
  },
)(MessageList));
