import React, { FC, memo, useMemo } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiChat } from '../../api/types';

import usePrevious from '../../hooks/usePrevious';
import { mapValues, pick } from '../../util/iteratees';
import { getChatOrder } from '../../modules/helpers';
import prepareChats from '../common/helpers/prepareChats';

import InfiniteScroll from '../ui/InfiniteScroll';
import Loading from '../ui/Loading';
import Chat from './Chat';

import './ChatList.scss';
import { RESTRICTED_TO_CHAT_ID } from '../../config';

type StateProps = {
  chats: Record<number, ApiChat>;
  listIds?: number[];
  selectedChatId?: number;
  orderedPinnedIds?: number[];
};

type DispatchProps = Pick<GlobalActions, 'loadMoreChats'>;

const ChatList: FC<StateProps & DispatchProps> = ({
  chats, listIds, selectedChatId, orderedPinnedIds, loadMoreChats,
}) => {
  const [chatArrays, orderById] = useMemo(() => {
    if (!listIds) {
      return [];
    }

    const newChatArrays = prepareChats(chats, listIds, orderedPinnedIds);
    const newOrderById = [...newChatArrays.pinnedChats, ...newChatArrays.otherChats]
      .reduce((acc, chat, index) => ({ ...acc, [chat.id]: index }), {} as Record<string, number>);

    return [newChatArrays, newOrderById];
  }, [chats, listIds, orderedPinnedIds]);

  const prevOrderById = usePrevious(orderById);
  const orderDiffById = orderById && prevOrderById
    ? mapValues(orderById, (order, id) => order - prevOrderById[id])
    : {};

  return (
    <InfiniteScroll className="ChatList custom-scroll" items={listIds || []} onLoadMore={loadMoreChats}>
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
        <div className="no-chats">Chat list is empty.</div>
      ) : (
        <Loading />
      )}
    </InfiniteScroll>
  );
};

export default memo(withGlobal(
  (global): StateProps => {
    const {
      chats: {
        byId: chats,
        selectedId: selectedChatId,
      },
    } = global;

    return {
      chats: chats[RESTRICTED_TO_CHAT_ID] ? pick(chats, [RESTRICTED_TO_CHAT_ID]) : {},
      listIds: [RESTRICTED_TO_CHAT_ID],
      selectedChatId,
      orderedPinnedIds: [],
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['loadMoreChats']),
)(ChatList));
