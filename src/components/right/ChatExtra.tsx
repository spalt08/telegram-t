import React, { FC, memo } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiChat } from '../../api/types';

import { selectChat } from '../../modules/selectors';
import { getChatDescription, getChatLink } from '../../modules/helpers';
import renderText from '../common/helpers/renderText';

type OwnProps = {
  chatId: number;
};

type StateProps = {
  chat?: ApiChat;
};

const ChatExtra: FC<OwnProps & StateProps> = ({ chat }) => {
  if (!chat || chat.isRestricted) {
    return undefined;
  }

  const description = getChatDescription(chat);
  const link = getChatLink(chat);
  const url = link.indexOf('http') === 0 ? link : `http://${link}`;

  return (
    <div className="ChatExtra">
      {description && !!description.length && (
        <div className="item">
          <i className="icon-info" />
          <div>
            <p className="title">{renderText(description)}</p>
            <p className="subtitle">About</p>
          </div>
        </div>
      )}
      {!!link.length && (
        <div className="item">
          <i className="icon-username" />
          <div>
            <a className="title" href={url} target="_blank" rel="noopener noreferrer">{link}</a>
            <p className="subtitle">Link</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { chatId }): StateProps => {
    const chat = selectChat(global, chatId);

    return { chat };
  },
)(ChatExtra));
