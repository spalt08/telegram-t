import React, { FC } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiChat } from '../../api/types';
import { selectChat } from '../../modules/selectors';
import { getChatDescription, getChatLink } from '../../modules/helpers';

type OwnProps = {
  chatId: number;
};

type StateProps = {
  chat: ApiChat;
};

const ChatExtra: FC<OwnProps & StateProps> = ({ chat }) => {
  const description = getChatDescription(chat);
  const link = getChatLink(chat);
  const url = link.indexOf('http') === 0 ? link : `http://${link}`;

  return (
    <div className="ChatExtra">
      {description && !!description.length && (
        <div className="item">
          <i className="icon-info" />
          <div>
            <p className="title">{description}</p>
            <p className="subtitle">About</p>
          </div>
        </div>
      )}
      {!!link.length && (
        <div className="item">
          <i className="icon-username" />
          <div>
            <a className="title" href={url}>{link}</a>
            <p className="subtitle">Link</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default withGlobal<OwnProps>(
  (global, { chatId }): StateProps => {
    const chat = selectChat(global, chatId);

    return { chat };
  },
)(ChatExtra);
