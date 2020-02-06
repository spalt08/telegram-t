import React, { FC } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiMessage, ApiUser, ApiChat } from '../../api/types';
import { selectChatMessages, selectUser, selectChat } from '../../modules/selectors';
import {
  getMessageText,
  searchMessageText,
  getChatTitle,
  isChatChannel,
  getUserFullName,
} from '../../modules/helpers';
import { TextPart } from '../middle/message/util/enhanceText';

import Avatar from '../common/Avatar';
import LastMessageMeta from '../left/LastMessageMeta';
import RippleEffect from '../ui/RippleEffect';

import './RightSearch.scss';

type SearchResult = {
  message: ApiMessage;
  user: ApiUser;
};

type IProps = {
  chatId: number;
  chat: ApiChat;
  query?: string;
  searchResults: SearchResult[];
};

const RightSearch: FC<IProps> = ({ chat, query, searchResults }) => {
  function renderHelperText() {
    if (!query) {
      return 'Search messages';
    }

    if (searchResults.length === 1) {
      return '1 message found';
    }

    return `${searchResults.length || 'No'} messages found`;
  }

  function renderSearchResultText(message: ApiMessage) {
    const text = getMessageText(message);
    if (!text || !query) {
      return <p className="subtitle">{text}</p>;
    }

    return <p className="subtitle">{processSearchResult(text, query)}</p>;
  }

  return (
    <div className="RightSearch custom-scroll">
      <p className="helper-text">{renderHelperText()}</p>

      {searchResults.map(({ user, message }) => (
        <div className="search-result-message not-implemented" onClick={() => {}}>
          <Avatar chat={isChatChannel(chat) ? chat : undefined} user={user} />
          <div className="info">
            <div className="title">
              <h3>{isChatChannel(chat) ? getChatTitle(chat) : getUserFullName(user)}</h3>
              <LastMessageMeta message={message} />
            </div>
            {renderSearchResultText(message)}
          </div>
          <RippleEffect />
        </div>
      ))}
    </div>
  );
};

function processSearchResult(text: string, query: string): TextPart[] {
  const lowerCaseText = text.toLowerCase();
  const queryPosition = lowerCaseText.indexOf(query.toLowerCase());
  if (queryPosition < 0) {
    return [text];
  }

  const content: TextPart[] = [];
  content.push(text.substring(0, queryPosition));
  content.push(<span>{text.substring(queryPosition, queryPosition + query.length)}</span>);
  content.push(text.substring(queryPosition + query.length));

  return content;
}

export default withGlobal(
  (global, { chatId }: IProps) => {
    const { messageSearch } = global;
    const chat = selectChat(global, chatId);
    const messages = selectChatMessages(global, chatId);
    if (!messages || !chat) {
      return {};
    }

    const foundMessages = Object.values(messages)
      .filter((message) => (
        messageSearch.query && searchMessageText(message, messageSearch.query)
      ))
      .sort((message1, message2) => message2.date - message1.date);

    const searchResults = foundMessages.map((message) => ({
      message,
      user: selectUser(global, message.sender_user_id),
    }));

    return {
      chat,
      query: messageSearch.query,
      searchResults,
    };
  },
)(RightSearch);
