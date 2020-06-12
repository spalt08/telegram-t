import React, {
  FC, memo, useMemo, useCallback, useEffect,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiChat, ApiChatFolder, ApiUser } from '../../../api/types';
import { LoadMoreDirection } from '../../../types';

import usePrevious from '../../../hooks/usePrevious';
import { mapValues, pick } from '../../../util/iteratees';
import { getChatOrder, prepareChatList, prepareFolderListIds } from '../../../modules/helpers';
import { selectTotalChatCount, selectChatFolder } from '../../../modules/selectors';

import InfiniteScroll from '../../ui/InfiniteScroll';
import Loading from '../../ui/Loading';
import Chat from './Chat';

import './ChatList.scss';

type OwnProps = {
  listType: 'active' | 'archived' | 'folder';
  folderId?: number;
  noChatsText?: string;
};

type StateProps = {
  chatsById: Record<number, ApiChat>;
  usersById: Record<number, ApiUser>;
  chatFolder?: ApiChatFolder;
  listIds?: number[];
  selectedChatId?: number;
  orderedPinnedIds?: number[];
  totalCount?: number;
  lastSyncTime?: number;
};

type DispatchProps = Pick<GlobalActions, 'loadMoreChats' | 'preloadTopChatMessages'>;

const ChatList: FC<OwnProps & StateProps & DispatchProps> = ({
  listType,
  folderId,
  noChatsText = 'Chat list is empty.',
  chatFolder,
  chatsById,
  usersById,
  listIds,
  selectedChatId,
  orderedPinnedIds,
  totalCount,
  lastSyncTime,
  loadMoreChats,
  preloadTopChatMessages,
}) => {
  const [currentListIds, currentPinnedIds] = useMemo(() => {
    return listType === 'folder' && chatFolder
      ? prepareFolderListIds(chatsById, usersById, chatFolder)
      : [listIds, orderedPinnedIds];
  }, [listType, chatsById, usersById, chatFolder, listIds, orderedPinnedIds]);

  const [chatArrays, orderById] = useMemo(() => {
    if (!currentListIds || (listType === 'folder' && !chatFolder)) {
      return [];
    }

    const newChatArrays = prepareChatList(chatsById, currentListIds, currentPinnedIds, listType);
    const newOrderById = [...newChatArrays.pinnedChats, ...newChatArrays.otherChats]
      .reduce((acc, chat, index) => ({ ...acc, [chat.id]: index }), {} as Record<string, number>);

    return [newChatArrays, newOrderById];
  }, [currentListIds, currentPinnedIds, listType, chatFolder, chatsById]);

  const prevOrderById = usePrevious(orderById);
  const orderDiffById = orderById && prevOrderById
    ? mapValues(orderById, (order, id) => {
      return order - (prevOrderById[id] !== undefined ? prevOrderById[id] : Infinity);
    })
    : {};

  const handleLoadMore = useCallback(({ direction }: { direction: LoadMoreDirection }) => {
    loadMoreChats({ direction, listType });
  }, [loadMoreChats, listType]);

  useEffect(() => {
    if (lastSyncTime) {
      preloadTopChatMessages({ listType });
    }
  }, [lastSyncTime, listType, preloadTopChatMessages]);

  useEffect(() => {
    if (
      listIds && totalCount
      && listIds.length < totalCount
    ) {
      loadMoreChats({ listType });
    }
  }, [listIds, totalCount, listType, loadMoreChats]);

  return (
    <InfiniteScroll
      className="ChatList custom-scroll optimized-list"
      items={currentListIds || []}
      onLoadMore={handleLoadMore}
    >
      {currentListIds && currentListIds.length && chatArrays ? (
        <div teactFastList>
          {chatArrays.pinnedChats.map(({ id }, i) => (
            <Chat
              key={id}
              teactOrderKey={i}
              chatId={id}
              isPinned
              folderId={folderId}
              isSelected={id === selectedChatId}
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
              folderId={folderId}
              isSelected={chat.id === selectedChatId}
              orderDiff={orderDiffById[chat.id]}
            />
          ))}
        </div>
      ) : currentListIds && currentListIds.length === 0 ? (
        <div className="no-chats">{noChatsText}</div>
      ) : (
        <Loading />
      )}
    </InfiniteScroll>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { listType, folderId }): StateProps => {
    const {
      chats: {
        listIds,
        byId: chatsById,
        selectedId: selectedChatId,
        orderedPinnedIds,
      },
      users: { byId: usersById },
      lastSyncTime,
    } = global;

    const chatFolder = folderId ? selectChatFolder(global, folderId) : undefined;

    return {
      chatsById,
      usersById,
      chatFolder,
      ...(listType !== 'folder' && {
        listIds: listIds[listType],
        orderedPinnedIds: orderedPinnedIds[listType],
        totalCount: selectTotalChatCount(global, listType),
      }),
      selectedChatId,
      lastSyncTime,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['loadMoreChats', 'preloadTopChatMessages']),
)(ChatList));
