import React, { FC, memo, useCallback } from '../../../../lib/teact';
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
} & Pick<GlobalActions, 'loadMoreChats'>;

const LOAD_MORE_THRESHOLD_PX = 1000;

const runThrottledForLoadChats = throttle((cb) => cb(), 1000, true);

const ChatList: FC<IProps> = ({
  chats, loadedChatIds, selectedChatId, loadMoreChats,
}) => {
  const chatArrays = loadedChatIds ? prepareChats(chats, loadedChatIds) : undefined;

  const handleScroll = useCallback((e) => {
    const target = e.target as HTMLElement;

    if (target.scrollHeight - (target.scrollTop + target.clientHeight) <= LOAD_MORE_THRESHOLD_PX) {
      runThrottledForLoadChats(() => {
        // More than one callback can be added to the queue
        // before the chats are appended, so we need to check again.
        if (target.scrollHeight - (target.scrollTop + target.clientHeight) <= LOAD_MORE_THRESHOLD_PX) {
          loadMoreChats();
        }
      });
    }
  }, [loadMoreChats]);

  return (
    <div className="ChatList custom-scroll" onScroll={handleScroll}>{
      // eslint-disable-next-line no-nested-ternary
      loadedChatIds && loadedChatIds.length && chatArrays ? (
        <div>
          {chatArrays.pinnedChats.map((chat) => (
            <Chat key={chat.id} chat={chat} selected={chat.id === selectedChatId} />
          ))}
          {chatArrays.pinnedChats.length > 0 && (
            <div className="pinned-chats-divider" />
          )}
          {chatArrays.otherChats.map((chat) => (
            <Chat key={chat.id} chat={chat} selected={chat.id === selectedChatId} />
          ))}
        </div>
      ) : loadedChatIds && loadedChatIds.length === 0 ? (
        <div className="no-chats">Chat list empty.</div>
      ) : (
        <Loading />
      )
    }
    </div>
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
