import React, { FC, memo, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import {
  ApiChat, ApiUser, ApiMessage, ApiMessageOutgoingStatus,
} from '../../api/types';

import {
  getChatTitle,
  getMessagePlainText,
  getUserFirstName,
  isChatPrivate,
  isActionMessage,
  getPrivateChatUserId,
  getMessageAction,
} from '../../modules/helpers';
import {
  selectChat, selectUser, selectChatMessage, selectOutgoingStatus,
} from '../../modules/selectors';
import { getServiceMessageContent } from '../common/getServiceMessageContent';
import useEnsureMessage from '../../hooks/useEnsureMessage';
import useEnsureUserFromMessage from '../../hooks/useEnsureUserFromMessage';

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
  const { last_message } = chat;

  const lastMessageAction = last_message && getMessageAction(last_message);
  const actionTargetMessageId = lastMessageAction && last_message!.reply_to_message_id;
  const actionTargetUserId = lastMessageAction && lastMessageAction.targetUserId;

  useEnsureMessage(chat.id, actionTargetMessageId, actionTargetMessage);
  useEnsureUserFromMessage(
    chat.id,
    last_message,
    last_message && last_message.sender_user_id,
    lastMessageSender,
  );
  useEnsureUserFromMessage(
    chat.id,
    last_message,
    actionTargetUserId,
    actionTargetUser,
  );

  function renderLastMessage() {
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
        {getMessagePlainText(last_message)}
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

  classNames.push(isChatPrivate(chat.id) ? 'private' : 'group');

  if (isSelected) {
    classNames.push('selected');
  }

  return classNames.join(' ');
}

function getSenderName(chatId: number, sender?: ApiUser) {
  if (!sender || isChatPrivate(chatId)) {
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
    if (!chat) {
      return {};
    }

    const { last_message } = chat;
    if (!last_message) {
      return {};
    }

    const {
      sender_user_id, chat_id, reply_to_message_id, is_outgoing,
    } = last_message;

    const lastMessageSender = sender_user_id && selectUser(global, sender_user_id);
    const lastMessageAction = getMessageAction(last_message);
    const actionTargetMessage = lastMessageAction && reply_to_message_id
      ? selectChatMessage(global, chat_id, reply_to_message_id)
      : undefined;
    const { targetUserId: actionTargetUserId } = lastMessageAction || {};
    const privateChatUserId = getPrivateChatUserId(chat);
    const { isUiReady } = global;

    return {
      chat,
      ...(lastMessageSender && { lastMessageSender }),
      ...(is_outgoing && { lastMessageOutgoingStatus: selectOutgoingStatus(global, last_message) }),
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
