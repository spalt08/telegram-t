import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { ApiChat } from '../../../../api/types';
import { selectChat } from '../../../../modules/selectors';
import { getChatDescription, getChatLink } from '../../../../modules/helpers';

type IProps = {
  chatId: number;
  chat: ApiChat;
};

const GroupChatInfo: FC<IProps> = ({
  chat,
}) => {
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

export default withGlobal(
  (global, { chatId }: IProps) => {
    const chat = selectChat(global, chatId);

    return { chat };
  },
)(GroupChatInfo);
