import React, { FC, memo, useMemo } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiChat } from '../../api/types';

import prepareChats from '../common/helpers/prepareChats';
import InfiniteScroll from '../ui/InfiniteScroll';
import Loading from '../ui/Loading';
import Chat from './Chat';

import './ChatList.scss';

type IProps = {
  chats: Record<number, ApiChat>;
  listIds: number[];
  selectedChatId: number;
  orderedPinnedIds?: number[];
} & Pick<GlobalActions, 'loadMoreChats'>;

const ChatList: FC<IProps> = ({
  chats, listIds, selectedChatId, orderedPinnedIds, loadMoreChats,
}) => {
  const chatArrays = useMemo(() => (
    listIds ? prepareChats(chats, listIds, orderedPinnedIds) : undefined
  ), [chats, listIds, orderedPinnedIds]);

  return (
    <InfiniteScroll className="ChatList custom-scroll" items={listIds} onLoadMore={loadMoreChats}>
      {listIds && listIds.length && chatArrays ? (
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
      ) : listIds && listIds.length === 0 ? (
        <div className="no-chats">Chat list is empty.</div>
      ) : (
        <Loading />
      )}
    </InfiniteScroll>
  );
};

export default memo(withGlobal(
  global => {
    const {
      chats: {
        listIds,
        byId: chats,
        selectedId: selectedChatId,
        orderedPinnedIds,
      },
    } = global;

    return {
      chats,
      listIds,
      selectedChatId,
      orderedPinnedIds,
    };
  },
  (setGlobal, actions) => {
    const { loadMoreChats } = actions;
    return { loadMoreChats };
  },
)(ChatList));
