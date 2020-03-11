import React, { FC, useMemo } from '../../lib/teact/teact';
import { getGlobal, withGlobal } from '../../lib/teact/teactn';

import { ApiMessage, ApiUser, ApiChat } from '../../api/types';

import {
  selectUser,
  selectChatMessages,
  selectOpenChat, selectCurrentMessageSearch,
} from '../../modules/selectors';
import {
  getMessageText,
  getChatTitle,
  isChatChannel,
  getUserFullName,
} from '../../modules/helpers';
import LastMessageMeta from '../left/LastMessageMeta';
import { GlobalActions } from '../../global/types';
import { orderBy } from '../../util/iteratees';
import { MEMO_EMPTY_ARRAY } from '../../util/memo';
import renderTextWithHighlight from '../common/helpers/renderTextWithHighlight';

import RippleEffect from '../ui/RippleEffect';
import InfiniteScroll from '../ui/InfiniteScroll';
import Avatar from '../common/Avatar';

import './RightSearch.scss';

type IProps = {
  chat: ApiChat;
  messagesById: Record<number, ApiMessage>;
  query?: string;
  totalCount?: number;
  foundIds?: number[];
} & Pick<GlobalActions, 'searchMessages' | 'focusMessage'>;

const RightSearch: FC<IProps> = ({
  chat,
  messagesById,
  query,
  totalCount,
  foundIds,
  searchMessages,
  focusMessage,
}) => {
  const foundResults = useMemo(() => {
    if (!query || !foundIds || !foundIds.length) {
      return MEMO_EMPTY_ARRAY;
    }

    const results = foundIds.map((id) => {
      const message = messagesById[id];

      return {
        message,
        user: message.sender_user_id ? selectUser(getGlobal(), message.sender_user_id) : undefined,
        onClick: () => focusMessage({ chatId: chat.id, messageId: id }),
      };
    });

    return orderBy(results, ({ message }) => message.date, 'desc');
  }, [chat.id, focusMessage, foundIds, messagesById, query]);

  const renderSearchResult = ({
    message, user, onClick,
  }: {
    message: ApiMessage; user?: ApiUser; onClick: NoneToVoidFunction;
  }) => {
    const text = getMessageText(message);
    if (!text) {
      return null;
    }

    return (
      <div className={`search-result-message ${!onClick ? 'not-implemented' : ''}`} onClick={onClick}>
        <Avatar chat={isChatChannel(chat) ? chat : undefined} user={user} />
        <div className="info">
          <div className="title">
            <h3>{isChatChannel(chat) ? getChatTitle(chat) : getUserFullName(user)}</h3>
            <LastMessageMeta message={message} />
          </div>
          <p className="subtitle">{renderTextWithHighlight(text, query!)}</p>
        </div>
        <RippleEffect />
      </div>
    );
  };

  return (
    <InfiniteScroll
      className="RightSearch custom-scroll"
      items={foundResults}
      preloadBackwards={0}
      onLoadMore={searchMessages}
    >
      <p className="helper-text">
        {!query ? (
          'Search messages'
        ) : totalCount === 1 ? (
          '1 message found'
        ) : (
          `${(foundResults.length && (totalCount || foundResults.length)) || 'No'} messages found`
        )}
      </p>
      {foundResults.map(renderSearchResult)}
    </InfiniteScroll>
  );
};

export default withGlobal(
  (global) => {
    const chat = selectOpenChat(global);
    const messagesById = chat && selectChatMessages(global, chat.id);

    if (!chat || !messagesById) {
      return {};
    }

    const currentSearch = selectCurrentMessageSearch(global);
    const { query, resultsByType } = currentSearch || {};
    const { totalCount, foundIds } = (resultsByType && resultsByType.text) || {};

    return {
      chat,
      messagesById,
      query,
      totalCount,
      foundIds,
    };
  },
  (global, actions) => {
    const { searchMessages, focusMessage } = actions;
    return { searchMessages, focusMessage };
  },
)(RightSearch);
