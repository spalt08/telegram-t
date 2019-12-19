import { UIEvent } from 'react';
import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { GlobalActions } from '../../../../store/types';
import { ApiChat } from '../../../../api/types';
import { toArray, orderBy } from '../../../../util/iteratees';
import { throttle } from '../../../../util/schedulers';
import Chat from './Chat';
import Loading from '../../../../components/Loading';
import './ChatList.scss';

type IProps = {
  chats: Record<number, ApiChat>;
  loadedChatIds: number[];
  selectedChatId: number;
  areChatsLoaded: boolean;
} & Pick<GlobalActions, 'loadMoreChats'>;

const LOAD_MORE_THRESHOLD_PX = 1000;
const SCROLL_THROTTLE_MS = 1000;

const handleScrollThrottled = throttle(handleScroll, SCROLL_THROTTLE_MS, true);

const ChatList: FC<IProps> = ({
  chats, loadedChatIds, areChatsLoaded, selectedChatId, loadMoreChats,
}) => {
  const chatArrays = areChatsLoaded && chats ? prepareChats(chats, loadedChatIds) : undefined;

  return (
    <div className="ChatList custom-scroll" onScroll={(e) => handleScrollThrottled(e, loadMoreChats)}>{
      chatArrays ? (
        <div>
          {chatArrays.pinnedChats.map((chat) => (
            <Chat key={chat.id} chat={chat} selected={chat.id === selectedChatId} />
          ))}
          {chatArrays.pinnedChats.length && (
            <div className="pinned-chats-divider" />
          )}
          {chatArrays.otherChats.map((chat) => (
            <Chat key={chat.id} chat={chat} selected={chat.id === selectedChatId} />
          ))}
        </div>
      ) : (
        <Loading />
      )
    }
    </div>
  );
};

function handleScroll(e: UIEvent, loadMoreChats: GlobalActions['loadMoreChats']) {
  const target = e.target as HTMLElement;

  if (target.scrollHeight - (target.scrollTop + target.clientHeight) <= LOAD_MORE_THRESHOLD_PX) {
    loadMoreChats();
  }
}

function prepareChats(chats: Record<number, ApiChat>, loadedChatIds: number[]) {
  const filtered = toArray(chats)
    .filter((chat) => Boolean(chat.last_message) && loadedChatIds.includes(chat.id));
  const pinnedChats = orderBy(filtered.filter((chat) => chat.is_pinned), [(chat) => chat.last_message!.date], 'desc');
  const otherChats = orderBy(filtered.filter((chat) => !chat.is_pinned), [(chat) => chat.last_message!.date], 'desc');

  return {
    pinnedChats,
    otherChats,
  };
}

export default withGlobal(
  global => {
    const {
      chats: {
        ids: loadedChatIds,
        byId: chats,
        selectedId: selectedChatId,
      },
    } = global;

    return {
      areChatsLoaded: loadedChatIds.length > 0 && Object.keys(chats).length >= loadedChatIds.length,
      chats,
      loadedChatIds,
      selectedChatId,
    };
  },
  (setGlobal, actions) => {
    const { loadMoreChats } = actions;
    return { loadMoreChats };
  },
)(ChatList);
