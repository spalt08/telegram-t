import React, { FC, useMemo, memo } from '../../lib/teact/teact';
import { getGlobal, withGlobal } from '../../lib/teact/teactn';

import { ApiMessage, ApiUser, ApiChat } from '../../api/types';
import { GlobalActions } from '../../global/types';

import {
  selectUser,
  selectChatMessages,
  selectOpenChat,
  selectCurrentMessageSearch,
} from '../../modules/selectors';
import {
  getMessageText,
  getChatTitle,
  isChatChannel,
  getUserFullName,
} from '../../modules/helpers';
import renderText from '../common/helpers/renderText';
import { orderBy, pick } from '../../util/iteratees';
import { MEMO_EMPTY_ARRAY } from '../../util/memo';

import InfiniteScroll from '../ui/InfiniteScroll';
import ListItem from '../ui/ListItem';
import LastMessageMeta from '../common/LastMessageMeta';
import Avatar from '../common/Avatar';

import './RightSearch.scss';

export type OwnProps = {
  chatId: number;
};

type StateProps = {
  chat?: ApiChat;
  messagesById?: Record<number, ApiMessage>;
  query?: string;
  totalCount?: number;
  foundIds?: number[];
};

type DispatchProps = Pick<GlobalActions, 'searchMessages' | 'focusMessage'>;

const RightSearch: FC<OwnProps & StateProps & DispatchProps> = ({
  chatId,
  chat,
  messagesById,
  query,
  totalCount,
  foundIds,
  searchMessages,
  focusMessage,
}) => {
  const foundResults = useMemo(() => {
    if (!query || !foundIds || !foundIds.length || !messagesById) {
      return MEMO_EMPTY_ARRAY;
    }

    const results = foundIds.map((id) => {
      const message = messagesById[id];

      return {
        message,
        user: message.senderUserId ? selectUser(getGlobal(), message.senderUserId) : undefined,
        onClick: () => focusMessage({ chatId, messageId: id }),
      };
    });

    return orderBy(results, ({ message }) => message.date, 'desc');
  }, [chatId, focusMessage, foundIds, messagesById, query]);

  const renderSearchResult = ({
    message, user, onClick,
  }: {
    message: ApiMessage; user?: ApiUser; onClick: NoneToVoidFunction;
  }) => {
    const text = getMessageText(message);
    if (!text) {
      return undefined;
    }

    const title = chat && isChatChannel(chat) ? getChatTitle(chat) : getUserFullName(user);

    return (
      <ListItem
        className={`search-result-message ${!onClick ? 'not-implemented' : ''}`}
        onClick={onClick}
        ripple
      >
        <Avatar chat={chat && isChatChannel(chat) ? chat : undefined} user={user} />
        <div className="info">
          <div className="title">
            <h3>{title && renderText(title)}</h3>
            <LastMessageMeta message={message} />
          </div>
          <p className="subtitle">{renderText(text, ['emoji', 'highlight'], { query })}</p>
        </div>
      </ListItem>
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

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
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
  (global, actions): DispatchProps => pick(actions, ['searchMessages', 'focusMessage']),
)(RightSearch));
