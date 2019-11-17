import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { GlobalActions } from '../../../../store/types';
import { ApiChat, ApiUser } from '../../../../api/tdlib/types';
import {
  getChatTitle,
  getLastMessageText,
  getUserFirstName,
  isPrivateChat,
  isGroupChat,
} from '../../../../modules/helpers';
import { selectUser } from '../../../../modules/selectors';
import Avatar from '../../../../components/Avatar';
import LastMessageMeta from './LastMessageMeta';
import Badge from './Badge';
import './Chat.scss';

type IProps = {
  chat: ApiChat;
  lastMessageSender?: ApiUser;
  selected: boolean;
} & Pick<GlobalActions, 'selectChat'>;

const Chat: FC<IProps> = ({
  chat,
  lastMessageSender,
  selected,
  selectChat,
}) => {
  return (
    <div className={buildClassNames(chat, selected)} onClick={() => selectChat({ id: chat.id })}>
      <Avatar chat={chat} />
      <div className="info">
        <div className="title">
          <h3>{getChatTitle(chat)}</h3>
          {chat.last_message && (
            <LastMessageMeta message={chat.last_message} />
          )}
        </div>
        <div className="subtitle">
          {chat.last_message && (
            <p className="last-message">
              {isGroupChat(chat.id) && getUserFirstName(lastMessageSender) && (
                <span className="sender-name">{getUserFirstName(lastMessageSender)}</span>
              )}
              {getLastMessageText(chat.last_message)}
            </p>
          )}
          <Badge chat={chat} />
        </div>
      </div>
    </div>
  );
};

function buildClassNames(chat: ApiChat, isSelected: boolean) {
  const classNames = ['Chat'];

  classNames.push(isPrivateChat(chat.id) ? 'private' : 'group');

  if (isSelected) {
    classNames.push('selected');
  }

  return classNames.join(' ');
}

export default withGlobal(
  (global, { chat }: IProps) => {
    if (!chat || !chat.last_message) {
      return null;
    }

    return {
      lastMessageSender: selectUser(global, chat.last_message.sender_user_id),
    };
  },
  (setGlobal, actions) => {
    const { selectChat } = actions;
    return { selectChat };
  },
)(Chat);
