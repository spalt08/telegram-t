import React, {
  FC, useCallback, useMemo, memo,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { ApiUser, ApiChat, ApiMessage } from '../../../api/types';
import { GlobalActions } from '../../../global/types';

import searchWords from '../../../util/searchWords';
import { unique, pick } from '../../../util/iteratees';
import {
  getUserFullName,
  getChatTitle,
  getSenderName,
  getMessageSummaryText,
} from '../../../modules/helpers';
import renderText from '../../common/helpers/renderText';
import { MEMO_EMPTY_ARRAY } from '../../../util/memo';

import Avatar from '../../common/Avatar';
import LastMessageMeta from '../../common/LastMessageMeta';
import InfiniteScroll from '../../ui/InfiniteScroll';
import ListItem from '../../ui/ListItem';
import LeftSearchResultChat from './LeftSearchResultChat';

export type OwnProps = {
  searchQuery?: string;
  onReset: () => void;
};

type StateProps = {
  currentUserId?: number;
  localContactIds?: number[];
  localChats?: ApiChat[];
  localUsers?: ApiUser[];
  globalChats?: ApiChat[];
  globalUsers?: ApiUser[];
  globalMessagesById?: Record<number, ApiMessage>;
  chatsById: Record<number, ApiChat>;
  usersById: Record<number, ApiUser>;
  fetchingStatus: { chats?: boolean; messages?: boolean };
};

type DispatchProps = Pick<GlobalActions, (
  'openChat' | 'addRecentlyFoundChatId' | 'focusMessage' | 'searchMessagesGlobal'
)>;

const MIN_QUERY_LENGTH_FOR_GLOBAL_SEARCH = 5;

const LeftSearch: FC<OwnProps & StateProps & DispatchProps> = ({
  searchQuery, currentUserId,
  localContactIds, localChats, localUsers, globalChats, globalUsers,
  globalMessagesById, chatsById, usersById, fetchingStatus,
  onReset, openChat, addRecentlyFoundChatId, focusMessage, searchMessagesGlobal,
}) => {
  const handleChatClick = useCallback(
    (id: number) => {
      openChat({ id });
      onReset();
      if (id !== currentUserId) {
        addRecentlyFoundChatId({ id });
      }
    },
    [currentUserId, openChat, addRecentlyFoundChatId, onReset],
  );

  const localResults = useMemo(() => {
    if (!searchQuery || (searchQuery.startsWith('@') && searchQuery.length < 2)) {
      return MEMO_EMPTY_ARRAY;
    }

    const foundLocalContacts = localContactIds
      ? localContactIds.filter((id) => {
        const user = usersById[id];
        if (!user) {
          return false;
        }
        const fullName = getUserFullName(user);
        return (fullName && searchWords(fullName, searchQuery))
          || searchWords(user.username, searchQuery);
      })
      : [];

    return unique([
      ...(searchWords('Saved Messages', searchQuery) ? [currentUserId] : []),
      ...foundLocalContacts,
      ...(localChats ? localChats.map((chat) => chat.id) : []),
      ...(localUsers ? localUsers.map((user) => user.id) : []),
    ]) as number[];
  }, [searchQuery, localContactIds, localChats, localUsers, usersById, currentUserId]);

  const globalResults = useMemo(() => {
    if (
      !searchQuery || searchQuery.length < MIN_QUERY_LENGTH_FOR_GLOBAL_SEARCH
      || !globalChats || !globalUsers
    ) {
      return MEMO_EMPTY_ARRAY;
    }

    return unique([
      ...globalChats.map((chat) => chat.id),
      ...globalUsers.map((user) => user.id),
    ]);
  }, [globalChats, globalUsers, searchQuery]);

  const foundMessages = useMemo(() => {
    if (!searchQuery || !globalMessagesById) {
      return [];
    }

    return Object.values(globalMessagesById).sort((a, b) => b.date - a.date);
  }, [globalMessagesById, searchQuery]);

  function renderFoundMessage(message: ApiMessage) {
    const text = getMessageSummaryText(message);
    const chat = chatsById[message.chatId];
    const user = message.senderUserId ? usersById[message.senderUserId] : undefined;

    if (!text || !chat) {
      return undefined;
    }

    const handleClick = () => {
      focusMessage({ chatId: chat.id, messageId: message.id });
    };
    const senderName = getSenderName(chat.id, user);

    return (
      <ListItem
        className="chat-item-clickable search-result-message"
        onClick={handleClick}
        ripple
      >
        <Avatar chat={chat} isSavedMessages={chat.id === currentUserId} />
        <div className="info">
          <div className="title">
            <h3>{renderText(getChatTitle(chat, user))}</h3>
            <LastMessageMeta message={message} />
          </div>
          <div className="subtitle">
            {senderName && (
              <span className="sender-name">{renderText(senderName)}</span>
            )}
            {renderText(text, ['emoji', 'highlight'], { highlight: searchQuery })}
          </div>
        </div>
      </ListItem>
    );
  }

  const nothingFound = !fetchingStatus.chats && !fetchingStatus.messages
    && !localResults.length && !globalResults.length && !foundMessages.length;

  return (
    <InfiniteScroll
      className="LeftSearch custom-scroll"
      items={foundMessages}
      onLoadMore={searchMessagesGlobal}
      noFastList
    >
      {nothingFound && (
        <div className="search-section">
          <p className="search-no-results">Nothing found.</p>
        </div>
      )}
      {!!localResults.length && (
        <div className="search-section">
          <h3 className="section-heading">Contacts and Chats</h3>
          {localResults.map((id) => (
            <LeftSearchResultChat
              chatId={id}
              onClick={handleChatClick}
            />
          ))}
        </div>
      )}
      {!!globalResults.length && (
        <div className="search-section">
          <h3 className="section-heading">Global Search</h3>
          {globalResults.map((id) => (
            <LeftSearchResultChat
              chatId={id}
              showHandle
              onClick={handleChatClick}
            />
          ))}
        </div>
      )}
      {!!foundMessages.length && (
        <div className="search-section">
          <h3 className="section-heading">Messages</h3>
          {foundMessages.map(renderFoundMessage)}
        </div>
      )}
    </InfiniteScroll>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const { byId: chatsById } = global.chats;
    const { byId: usersById } = global.users;

    const { userIds: localContactIds } = global.contactList || {};

    if (!localContactIds) {
      return {
        chatsById,
        usersById,
        fetchingStatus: {},
      };
    }

    const { currentUserId } = global;
    const { fetchingStatus, globalResults, localResults } = global.globalSearch;
    const {
      chats: globalChats,
      users: globalUsers,
      messages,
    } = globalResults || {};
    const { chats: localChats, users: localUsers } = localResults || {};
    const { byId: globalMessagesById } = messages || {};

    return {
      currentUserId,
      localContactIds,
      localChats,
      localUsers,
      globalChats,
      globalUsers,
      globalMessagesById,
      chatsById,
      usersById,
      fetchingStatus: fetchingStatus || {},
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'openChat',
    'addRecentlyFoundChatId',
    'focusMessage',
    'searchMessagesGlobal',
  ]),
)(LeftSearch));
