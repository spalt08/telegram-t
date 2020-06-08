import React, {
  FC, useCallback, useMemo, useState, memo,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiChat } from '../../api/types';

import { isChatChannel, getChatTitle, prepareChatList } from '../../modules/helpers';
import searchWords from '../../util/searchWords';
import { pick } from '../../util/iteratees';

import Loading from '../ui/Loading';
import FloatingActionButton from '../ui/FloatingActionButton';
import Spinner from '../ui/Spinner';
import Picker from './Picker';

import './ForwardPicker.scss';

type StateProps = {
  chatsById: Record<number, ApiChat>;
  listIds?: number[];
  orderedPinnedIds?: number[];
  selectedIds?: number[];
  isLoading?: boolean;
};

type DispatchProps = Pick<GlobalActions, 'setForwardChatIds' | 'forwardMessages' | 'loadMoreChats'>;

const ForwardPicker: FC<StateProps & DispatchProps> = ({
  chatsById,
  listIds,
  orderedPinnedIds,
  selectedIds,
  isLoading,
  setForwardChatIds,
  forwardMessages,
  loadMoreChats,
}) => {
  const [filter, setFilter] = useState('');

  const chats = useMemo(() => {
    const chatArrays = listIds ? prepareChatList(chatsById, listIds, orderedPinnedIds, 'active') : undefined;
    return chatArrays && [...chatArrays.pinnedChats, ...chatArrays.otherChats];
  }, [chatsById, listIds, orderedPinnedIds]);

  const chatIds = useMemo(() => {
    if (!chats) {
      return undefined;
    }

    return chats
      .filter((chat) => (
        !isChatChannel(chat)
        && (!filter || searchWords(getChatTitle(chat), filter) || (selectedIds && selectedIds.includes(chat.id)))
      ))
      .map(({ id }) => id);
  }, [chats, filter, selectedIds]);

  const handleSelectedIdsChange = useCallback((ids: number[]) => {
    setForwardChatIds({ ids });
  }, [setForwardChatIds]);

  if (!chatIds) {
    return <Loading />;
  }

  return (
    <div className="ForwardPicker">
      <Picker
        itemIds={chatIds}
        selectedIds={selectedIds || []}
        filterValue={filter}
        filterPlaceholder="Select chat"
        onSelectedIdsChange={handleSelectedIdsChange}
        onFilterChange={setFilter}
        onLoadMore={loadMoreChats}
      />
      <FloatingActionButton
        show={Boolean(!isLoading && selectedIds && selectedIds.length)}
        onClick={forwardMessages}
      >
        {isLoading ? (
          <Spinner color="white" />
        ) : (
          <i className="icon-send" />
        )}
      </FloatingActionButton>
    </div>
  );
};

export default memo(withGlobal(
  (global): StateProps => {
    const {
      chats: {
        byId: chatsById,
        listIds,
        orderedPinnedIds,
      },
      forwardMessages: {
        toChatIds: selectedIds,
        inProgress: isLoading,
      },
    } = global;

    return {
      chatsById,
      listIds: listIds.active,
      orderedPinnedIds: orderedPinnedIds.active,
      selectedIds,
      isLoading,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['setForwardChatIds', 'forwardMessages', 'loadMoreChats']),
)(ForwardPicker));
