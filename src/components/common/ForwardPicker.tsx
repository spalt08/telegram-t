import React, {
  FC, useCallback, useMemo, useState,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiChat } from '../../api/types';

import { isChatChannel, getChatTitle } from '../../modules/helpers';
import prepareChats from './helpers/prepareChats';
import searchWords from '../../util/searchWords';

import Picker from './Picker';
import Loading from '../ui/Loading';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

import './ForwardPicker.scss';

type IProps = {
  chatsById: Record<number, ApiChat>;
  listIds?: number[];
  orderedPinnedIds?: number[];
  selectedIds?: number[];
  isLoading?: boolean;
} & Pick<GlobalActions, 'setForwardChatIds' | 'forwardMessages' | 'loadMoreChats'>;

const ForwardPicker: FC<IProps> = ({
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
    const chatArrays = listIds ? prepareChats(chatsById, listIds, orderedPinnedIds) : undefined;
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
      <Button
        className={!isLoading && selectedIds && selectedIds.length ? 'revealed' : ''}
        color="primary"
        round
        onClick={!isLoading && selectedIds && selectedIds.length ? forwardMessages : undefined}
      >
        {isLoading ? (
          <Spinner color="white" />
        ) : (
          <i className="icon-send" />
        )}
      </Button>
    </div>
  );
};

export default withGlobal(
  (global) => {
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
      listIds,
      orderedPinnedIds,
      selectedIds,
      isLoading,
    };
  },
  (setGlobal, actions) => {
    const { setForwardChatIds, forwardMessages, loadMoreChats } = actions;

    return { setForwardChatIds, forwardMessages, loadMoreChats };
  },
)(ForwardPicker);
