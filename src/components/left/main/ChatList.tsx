import React, {
  FC, memo, useMemo, useCallback, useEffect,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiChat } from '../../../api/types';
import { LoadMoreDirection } from '../../../types';

import usePrevious from '../../../hooks/usePrevious';
import { mapValues, pick } from '../../../util/iteratees';
import { getChatOrder, prepareChatList } from '../../../modules/helpers';

import InfiniteScroll from '../../ui/InfiniteScroll';
import Loading from '../../ui/Loading';
import Chat from './Chat';

import './ChatList.scss';

type OwnProps = {
  folder: 'active' | 'archived';
  noChatsText?: string;
};

type StateProps = {
  chats: Record<number, ApiChat>;
  listIds?: number[];
  selectedChatId?: number;
  orderedPinnedIds?: number[];
  lastSyncTime?: number;
};

type DispatchProps = Pick<GlobalActions, 'loadMoreChats' | 'preloadTopChatMessages'>;

const ChatList: FC<OwnProps & StateProps & DispatchProps> = ({
  folder,
  noChatsText = 'Chat list is empty.',
  chats,
  listIds,
  selectedChatId,
  orderedPinnedIds,
  lastSyncTime,
  loadMoreChats,
  preloadTopChatMessages,
}) => {
  const [chatArrays, orderById] = useMemo(() => {
    if (!listIds) {
      return [];
    }

    const newChatArrays = prepareChatList(chats, listIds, orderedPinnedIds, folder);
    const newOrderById = [...newChatArrays.pinnedChats, ...newChatArrays.otherChats]
      .reduce((acc, chat, index) => ({ ...acc, [chat.id]: index }), {} as Record<string, number>);

    return [newChatArrays, newOrderById];
  }, [folder, chats, listIds, orderedPinnedIds]);

  const prevOrderById = usePrevious(orderById);
  const orderDiffById = orderById && prevOrderById
    ? mapValues(orderById, (order, id) => {
      return order - (prevOrderById[id] !== undefined ? prevOrderById[id] : Infinity);
    })
    : {};

  const handleLoadMore = useCallback(({ direction }: { direction: LoadMoreDirection }) => {
    loadMoreChats({ direction, folder });
  }, [loadMoreChats, folder]);

  useEffect(() => {
    if (lastSyncTime) {
      preloadTopChatMessages({ folder });
    }
  }, [lastSyncTime, folder, preloadTopChatMessages]);

  return (
    <InfiniteScroll className="ChatList custom-scroll" items={listIds || []} onLoadMore={handleLoadMore}>
      {listIds && listIds.length && chatArrays ? (
        <div teactFastList>
          {chatArrays.pinnedChats.map(({ id }, i) => (
            <Chat
              key={id}
              teactOrderKey={i}
              chatId={id}
              selected={id === selectedChatId}
              orderDiff={orderDiffById[id]}
            />
          ))}
          {chatArrays.pinnedChats.length > 0 && (
            <div key="chats-divider" className="pinned-chats-divider" />
          )}
          {chatArrays.otherChats.map((chat) => (
            <Chat
              key={chat.id}
              teactOrderKey={getChatOrder(chat)}
              chatId={chat.id}
              selected={chat.id === selectedChatId}
              orderDiff={orderDiffById[chat.id]}
            />
          ))}
        </div>
      ) : listIds && listIds.length === 0 ? (
        <div className="no-chats">{noChatsText}</div>
      ) : (
        <Loading />
      )}
    </InfiniteScroll>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { folder }): StateProps => {
    const {
      chats: {
        listIds,
        byId: chats,
        selectedId: selectedChatId,
        orderedPinnedIds,
      },
      lastSyncTime,
    } = global;

    return {
      chats,
      listIds: listIds[folder],
      selectedChatId,
      orderedPinnedIds: orderedPinnedIds[folder],
      lastSyncTime,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['loadMoreChats', 'preloadTopChatMessages']),
)(ChatList));
