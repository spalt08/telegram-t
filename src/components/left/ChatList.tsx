import React, { FC, memo, useMemo } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiChat } from '../../api/types';

import { orderBy } from '../../util/iteratees';

import InfiniteScroll from '../ui/InfiniteScroll';
import Loading from '../ui/Loading';
import Chat from './Chat';

import './ChatList.scss';

type IProps = {
  chats: Record<number, ApiChat>;
  loadedIds: number[];
  selectedChatId: number;
  orderedPinnedIds?: number[];
} & Pick<GlobalActions, 'loadMoreChats'>;

const ChatList: FC<IProps> = ({
  chats, loadedIds, selectedChatId, orderedPinnedIds, loadMoreChats,
}) => {
  const chatArrays = useMemo(() => (
    loadedIds ? prepareChats(chats, loadedIds, orderedPinnedIds) : undefined
  ), [chats, loadedIds, orderedPinnedIds]);

  return (
    <InfiniteScroll className="ChatList custom-scroll" items={loadedIds} onLoadMore={loadMoreChats}>
      {loadedIds && loadedIds.length && chatArrays ? (
        <div>
          {chatArrays.pinnedChats.map(({ id }) => (
            <Chat key={id} chatId={id} selected={id === selectedChatId} />
          ))}
          {chatArrays.pinnedChats.length > 0 && (
            <div className="pinned-chats-divider" />
          )}
          {chatArrays.otherChats.map(({ id }) => (
            <Chat key={id} chatId={id} selected={id === selectedChatId} />
          ))}
        </div>
      ) : loadedIds && loadedIds.length === 0 ? (
        <div className="no-chats">Chat list is empty.</div>
      ) : (
        <Loading />
      )}
    </InfiniteScroll>
  );
};

function prepareChats(chats: Record<number, ApiChat>, loadedIds: number[], orderedPinnedIds?: number[]) {
  const filtered = Object.values(chats).filter((chat) => Boolean(chat.last_message) && loadedIds.includes(chat.id));
  const pinnedChats = orderedPinnedIds
    ? orderedPinnedIds.map((id) => chats[id])
    : filtered.filter((chat) => chat.is_pinned);
  const otherChats = orderBy(filtered.filter((chat) => !chat.is_pinned), [(chat) => chat.last_message!.date], 'desc');

  return {
    pinnedChats,
    otherChats,
  };
}

export default memo(withGlobal(
  global => {
    const {
      chats: {
        ids: loadedIds,
        byId: chats,
        selectedId: selectedChatId,
        orderedPinnedIds,
      },
    } = global;

    return {
      chats,
      loadedIds,
      selectedChatId,
      orderedPinnedIds,
    };
  },
  (setGlobal, actions) => {
    const { loadMoreChats } = actions;
    return { loadMoreChats };
  },
)(ChatList));
