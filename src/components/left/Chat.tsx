import React, { FC, memo, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../store/types';
import {
  ApiChat, ApiUser, ApiMessage, ApiMessageOutgoingStatus,
} from '../../api/types';

import {
  getChatTitle,
  getLastMessageText,
  getUserFirstName,
  isPrivateChat,
  isActionMessage,
  getPrivateChatUserId,
} from '../../modules/helpers';
import {
  selectChat, selectUser, selectChatMessage, selectOutgoingStatus,
} from '../../modules/selectors';
import { getServiceMessageContent } from '../common/getServiceMessageContent';

import Avatar from '../common/Avatar';
import RippleEffect from '../ui/RippleEffect';
import VerifiedIcon from '../common/VerifiedIcon';
import LastMessageMeta from './LastMessageMeta';
import Badge from './Badge';

import './Chat.scss';

type IProps = {
  chatId: number;
  chat: ApiChat;
  privateChatUser?: ApiUser;
  actionTargetUser?: ApiUser;
  lastMessageSender?: ApiUser;
  lastMessageOutgoingStatus?: ApiMessageOutgoingStatus;
  actionTargetMessage?: ApiMessage;
  selected: boolean;
  isUiReady: boolean;
} & Pick<GlobalActions, 'openChat'>;

const Chat: FC<IProps> = ({
  chat,
  privateChatUser,
  actionTargetUser,
  lastMessageSender,
  lastMessageOutgoingStatus,
  actionTargetMessage,
  selected,
  isUiReady,
  openChat,
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
            actionTargetUser,
            actionTargetMessage,
            { maxTextLength: 16, plain: true },
          )}
        </p>
      );
    }

    const senderName = getSenderName(chat.id, lastMessageSender);

    return (
      <p className="last-message">
        {senderName && (
          <span className="sender-name">{senderName}</span>
        )}
        {getLastMessageText(last_message)}
      </p>
    );
  }

  const handleClick = useCallback(() => {
    openChat({ id: chat.id });
  }, [openChat, chat.id]);

  return (
    <div className={buildClassNames(chat, selected)} onClick={handleClick}>
      {isUiReady && (
        <Avatar
          chat={chat}
          user={privateChatUser}
          showOnlineStatus
          isSavedMessages={privateChatUser && privateChatUser.is_self}
        />
      )}
      <div className="info">
        <div className="title">
          <h3>{getChatTitle(chat, privateChatUser)}</h3>
          {chat.is_verified && <VerifiedIcon />}
          {chat.is_muted && <i className="icon-muted-chat" />}
          {chat.last_message && (
            <LastMessageMeta message={chat.last_message} outgoingStatus={lastMessageOutgoingStatus} />
          )}
        </div>
        <div className="subtitle">
          {renderLastMessage()}
          <Badge chat={chat} />
        </div>
      </div>
      <RippleEffect delayed={!selected} />
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

function getSenderName(chatId: number, sender?: ApiUser) {
  if (!sender || isPrivateChat(chatId)) {
    return undefined;
  }

  if (sender.is_self) {
    return 'You';
  }

  return getUserFirstName(sender);
}

export default memo(withGlobal(
  (global, { chatId }: IProps) => {
    const chat = selectChat(global, chatId);

    if (!chat || !chat.last_message) {
      return null;
    }

    const lastMessage = chat.last_message;
    // TODO: Works for only recent messages that are already loaded in the store
    const actionTargetMessage = lastMessage.content.action && lastMessage.reply_to_message_id
      ? selectChatMessage(global, lastMessage.chat_id, lastMessage.reply_to_message_id)
      : undefined;
    const { targetUserId: actionTargetUserId } = lastMessage.content.action || {};
    const privateChatUserId = getPrivateChatUserId(chat);
    const { isUiReady } = global;

    return {
      chat,
      lastMessageSender: selectUser(global, lastMessage.sender_user_id),
      ...(lastMessage.is_outgoing && { lastMessageOutgoingStatus: selectOutgoingStatus(global, lastMessage) }),
      ...(privateChatUserId && { privateChatUser: selectUser(global, privateChatUserId) }),
      ...(actionTargetUserId && { actionTargetUser: selectUser(global, actionTargetUserId) }),
      actionTargetMessage,
      isUiReady,
    };
  },
  (setGlobal, actions) => {
    const { openChat } = actions;
    return { openChat };
  },
)(Chat));
