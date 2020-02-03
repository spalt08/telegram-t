import { UIEvent } from 'react';
import React, {
  FC, useState, memo, useCallback, useRef, useEffect,
} from '../../lib/teact/teact';
import { getGlobal, withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../store/types';
import { ApiMessage } from '../../api/types';

import { selectChatMessages, selectOpenChat } from '../../modules/selectors';
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

type IProps = Pick<GlobalActions, 'loadMessages' | 'markMessagesRead' | 'setChatScrollOffset'> & {
  chatId?: number;
  isChannelChat?: boolean;
  isUnread?: boolean;
  messages?: Record<number, ApiMessage>;
};

const LOAD_MORE_THRESHOLD_PX = 1000;
const LOAD_MORE_WHEN_LESS_THAN = 50;
const VIEWPORT_MARGIN = 500;
const HIDE_STICKY_TIMEOUT = 450;

const runThrottledForLoadMessages = throttle((cb) => cb(), 1000, true);
const runThrottledForScroll = throttle((cb) => cb(), 1000, false);

let currentScrollOffset = 0;
let scrollTimeout: NodeJS.Timeout | null = null;

const MessageList: FC<IProps> = ({
  chatId,
  isChannelChat,
  isUnread,
  messages,
  loadMessages,
  markMessagesRead,
  setChatScrollOffset,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const [viewportMessageIds, setViewportMessageIds] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);

  const isLoaded = Boolean(messages);
  const messagesArray = isLoaded && messages ? orderBy(toArray(messages), 'date') : [];
  const isPrivate = chatId !== undefined && isPrivateChat(chatId);

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
          loadMessages({ chatId });
        }
      });
    }

    runThrottledForScroll(() => {
      setChatScrollOffset({ chatId, scrollOffset: currentScrollOffset });

      playMediaInViewport();
    });
  }, [chatId, loadMessages, setChatScrollOffset, playMediaInViewport]);

  useEffect(() => {
    if (!isLoaded || messagesArray.length < LOAD_MORE_WHEN_LESS_THAN) {
      runThrottledForLoadMessages(() => loadMessages({ chatId }));
    }
  }, [isLoaded, loadMessages, messagesArray.length, chatId]);

  useEffect(() => {
    if (isUnread) {
      markMessagesRead();
    }
  }, [isUnread, markMessagesRead]);

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
    }

    playMediaInViewport();

    if (process.env.NODE_ENV === 'perf') {
      // eslint-disable-next-line no-console
      console.timeEnd('scrollTop');
    }
  }, [chatId, messages, playMediaInViewport]);

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
    <div ref={containerRef} className={classNames.join(' ')} onScroll={handleScroll}>
      {isLoaded ? (
        // @ts-ignore
        <div className="messages-container" teactChildrenKeyOrder="asc">
          {messagesArray.length > 0 && renderMessages(messagesArray, viewportMessageIds, isPrivate)}
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
};

function renderMessages(
  messagesArray: ApiMessage[],
  viewportMessageIds: number[],
  isPrivate: boolean,
) {
  const dateGroups = groupMessages(messagesArray).map((
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

        return (
          <Message
            key={message.id}
            message={message}
            showAvatar={!isPrivate && !isOwn}
            showSenderName={messageIndex === 0 && !isPrivate && !isOwn}
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
      <div className="message-date-group" key={dateGroup.datetime} teactChildrenKeyOrder="asc">
        <div className="message-date-header" key={0}>
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
    const chat = selectOpenChat(global);

    if (!chat) {
      return {};
    }

    const messages = selectChatMessages(global, chat.id);

    return {
      chatId: chat.id,
      isChannelChat: isChannel(chat),
      isUnread: Boolean(chat.unread_count),
      messages,
    };
  },
  (setGlobal, actions) => {
    const {
      loadMessages, markMessagesRead, setChatScrollOffset,
    } = actions;

    return {
      loadMessages, markMessagesRead, setChatScrollOffset,
    };
  },
)(MessageList));
