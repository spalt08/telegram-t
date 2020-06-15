import React, {
  FC, memo, useMemo, useCallback, useEffect,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiChat, ApiChatFolder, ApiUser } from '../../../api/types';

import { CHAT_LIST_SLICE } from '../../../config';
import usePrevious from '../../../hooks/usePrevious';
import { buildCollectionByKey, mapValues, pick } from '../../../util/iteratees';
import { getChatOrder, prepareChatList, prepareFolderListIds } from '../../../modules/helpers';
import { selectTotalChatCount, selectChatFolder } from '../../../modules/selectors';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';

import InfiniteScroll from '../../ui/InfiniteScroll';
import Loading from '../../ui/Loading';
import Chat from './Chat';

import './ChatList.scss';

type OwnProps = {
  folderType: 'all' | 'archived' | 'folder';
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

enum FolderTypeToListType {
  'all' = 'active',
  'archived' = 'archived'
}

const ChatList: FC<OwnProps & StateProps & DispatchProps> = ({
  folderType,
  folderId,
  noChatsText = 'Chat list is empty.',
  chatFolder,
  chatsById,
  usersById,
  listIds,
  selectedChatId,
  orderedPinnedIds,
  lastSyncTime,
  loadMoreChats,
  preloadTopChatMessages,
}) => {
  const [currentListIds, currentPinnedIds] = useMemo(() => {
    return folderType === 'folder' && chatFolder
      ? prepareFolderListIds(chatsById, usersById, chatFolder)
      : [listIds, orderedPinnedIds];
  }, [folderType, chatsById, usersById, chatFolder, listIds, orderedPinnedIds]);

  const [orderById, orderedIds] = useMemo(() => {
    if (!currentListIds || (folderType === 'folder' && !chatFolder)) {
      return [];
    }
    const newChatArrays = prepareChatList(chatsById, currentListIds, currentPinnedIds, folderType);
    const singleList = [...newChatArrays.pinnedChats, ...newChatArrays.otherChats];
    const newOrderedIds = singleList.map(({ id }) => id);
    const newOrderById = mapValues(
      buildCollectionByKey(singleList, 'id'),
      (chat, id, index) => index,
    );

    return [newOrderById, newOrderedIds];
  }, [currentListIds, currentPinnedIds, folderType, chatFolder, chatsById]);

  const prevOrderById = usePrevious(orderById);
  const orderDiffById = orderById && prevOrderById
    ? mapValues(orderById, (order, id) => {
      return order - (prevOrderById[id] !== undefined ? prevOrderById[id] : Infinity);
    })
    : {};

  const loadMoreOfType = useCallback(() => {
    loadMoreChats({ listType: folderType === 'archived' ? 'archived' : 'active' });
  }, [loadMoreChats, folderType]);

  const [viewportIds, getMore] = useInfiniteScroll(loadMoreOfType, orderedIds, !lastSyncTime);
  // TODO Refactor to not call `prepareChatList` twice
  const chatArrays = viewportIds && prepareChatList(chatsById, viewportIds, currentPinnedIds, folderType);

  useEffect(() => {
    if (lastSyncTime && folderType === 'all') {
      preloadTopChatMessages();
    }
  }, [lastSyncTime, folderType, preloadTopChatMessages]);

  return (
    <InfiniteScroll
      className="ChatList custom-scroll optimized-list"
      items={viewportIds}
      onLoadMore={getMore}
      preloadBackwards={CHAT_LIST_SLICE}
    >
      {viewportIds && viewportIds.length && chatArrays ? (
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
      ) : viewportIds && !viewportIds.length ? (
        <div className="no-chats">{noChatsText}</div>
      ) : (
        <Loading />
      )}
    </InfiniteScroll>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { folderType, folderId }): StateProps => {
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

    const listType = folderType !== 'folder' ? FolderTypeToListType[folderType] : undefined;
    const chatFolder = folderId ? selectChatFolder(global, folderId) : undefined;

    return {
      chatsById,
      usersById,
      selectedChatId,
      lastSyncTime,
      ...(listType ? {
        listIds: listIds[listType],
        orderedPinnedIds: orderedPinnedIds[listType],
        totalCount: selectTotalChatCount(global, listType),
      } : {
        chatFolder,
      }),
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['loadMoreChats', 'preloadTopChatMessages']),
)(ChatList));
