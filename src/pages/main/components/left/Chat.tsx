import React, { FC, memo } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { GlobalActions } from '../../../../store/types';
import { ApiChat, ApiUser, ApiMessage } from '../../../../api/types';
import {
  getChatTitle,
  getLastMessageText,
  getUserFirstName,
  isPrivateChat,
  isGroupChat,
  isActionMessage,
} from '../../../../modules/helpers';
import { selectUser, selectChatMessage } from '../../../../modules/selectors';
import Avatar from '../../../../components/Avatar';
import { getServiceMessageContent } from '../common/getServiceMessageContent';
import LastMessageMeta from './LastMessageMeta';
import Badge from './Badge';
import './Chat.scss';
import RippleEffect from '../../../../components/ui/RippleEffect';

type IProps = {
  chat: ApiChat;
  privateChatUser?: ApiUser;
  lastMessageSender?: ApiUser;
  actionTargetMessage?: ApiMessage;
  selected: boolean;
} & Pick<GlobalActions, 'selectChat'>;

const Chat: FC<IProps> = ({
  chat,
  privateChatUser,
  lastMessageSender,
  actionTargetMessage,
  selected,
  selectChat,
}) => {
  function renderLastMessage() {
    const { last_message } = chat;
    if (!last_message) {
      return null;
    }

    if (isActionMessage(last_message)) {
      return (
        <p className="last-message">
          {getServiceMessageContent(
            last_message,
            lastMessageSender,
            actionTargetMessage,
            { maxTextLength: 16, plain: true },
          )}
        </p>
      );
    }

    return (
      <p className="last-message">
        {isGroupChat(chat.id) && getUserFirstName(lastMessageSender) && (
          <span className="sender-name">{getUserFirstName(lastMessageSender)}</span>
        )}
        {getLastMessageText(last_message)}
      </p>
    );
  }

  return (
    <div className={buildClassNames(chat, selected)} onClick={() => selectChat({ id: chat.id })}>
      <Avatar chat={chat} user={privateChatUser} showOnlineStatus />
      <div className="info">
        <div className="title">
          <h3>{getChatTitle(chat)}</h3>
          {chat.last_message && (
            <LastMessageMeta message={chat.last_message} />
          )}
        </div>
        <div className="subtitle">
          {renderLastMessage()}
          <Badge chat={chat} />
        </div>
      </div>
      <RippleEffect />
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

export default memo(withGlobal(
  (global, { chat }: IProps) => {
    if (!chat || !chat.last_message) {
      return null;
    }

    const lastMessage = chat.last_message;
    const privateChatUserId = isPrivateChat(chat.id) && chat.type.user_id;
    // TODO: Works for only recent messages that are already loaded in the store
    const actionTargetMessage = lastMessage.content.action && lastMessage.reply_to_message_id
      ? selectChatMessage(global, lastMessage.chat_id, lastMessage.reply_to_message_id)
      : undefined;

    return {
      lastMessageSender: selectUser(global, lastMessage.sender_user_id),
      privateChatUser: privateChatUserId && selectUser(global, privateChatUserId),
      actionTargetMessage,
    };
  },
  (setGlobal, actions) => {
    const { selectChat } = actions;
    return { selectChat };
  },
)(Chat));
