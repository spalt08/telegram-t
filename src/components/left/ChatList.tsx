import React, { FC, memo } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiChat } from '../../api/types';

import { toArray, orderBy } from '../../util/iteratees';

import InfiniteScroll from '../ui/InfiniteScroll';
import Loading from '../ui/Loading';
import Chat from './Chat';

import './ChatList.scss';

type IProps = {
  chats: Record<number, ApiChat>;
  loadedChatIds: number[];
  selectedChatId: number;
} & Pick<GlobalActions, 'loadMoreChats'>;

const ChatList: FC<IProps> = ({
  chats, loadedChatIds, selectedChatId, loadMoreChats,
}) => {
  const chatArrays = loadedChatIds ? prepareChats(chats, loadedChatIds) : undefined;

  return (
    <InfiniteScroll className="ChatList custom-scroll" items={loadedChatIds} onLoadMore={loadMoreChats}>
      {/* eslint-disable-next-line no-nested-ternary */}
      {loadedChatIds && loadedChatIds.length && chatArrays ? (
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
      ) : loadedChatIds && loadedChatIds.length === 0 ? (
        <div className="no-chats">Chat list is empty.</div>
      ) : (
        <Loading />
      )}
    </InfiniteScroll>
  );
};

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

export default memo(withGlobal(
  global => {
    const {
      chats: {
        ids: loadedChatIds,
        byId: chats,
        selectedId: selectedChatId,
      },
    } = global;

    return {
      chats,
      loadedChatIds,
      selectedChatId,
    };
  },
  (setGlobal, actions) => {
    const { loadMoreChats } = actions;
    return { loadMoreChats };
  },
)(ChatList));
