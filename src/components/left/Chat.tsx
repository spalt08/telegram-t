import React, { FC, memo, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import {
  ApiChat, ApiUser, ApiMessage, ApiMessageOutgoingStatus,
} from '../../api/types';

import {
  getChatTitle,
  getMessageSummaryText,
  getUserFirstName,
  isChatPrivate,
  isActionMessage,
  getPrivateChatUserId,
  getMessageAction,
} from '../../modules/helpers';
import {
  selectChat, selectUser, selectChatMessage, selectOutgoingStatus,
} from '../../modules/selectors';
import { renderServiceMessageText } from '../common/helpers/renderServiceMessageText';
import buildClassName from '../../util/buildClassName';
import useEnsureMessage from '../../hooks/useEnsureMessage';

import Avatar from '../common/Avatar';
import RippleEffect from '../ui/RippleEffect';
import VerifiedIcon from '../common/VerifiedIcon';
import TypingStatus from '../common/TypingStatus';
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
  const { last_message, typingStatus } = chat;
  const isAction = last_message && isActionMessage(last_message);

  useEnsureMessage(chat.id, isAction ? last_message!.reply_to_message_id : undefined, actionTargetMessage);

  function renderLastMessageOrTyping() {
    if (typingStatus && last_message && typingStatus.timestamp > last_message.date * 1000) {
      return <TypingStatus typingStatus={typingStatus} />;
    }

    if (!last_message) {
      return null;
    }

    if (isAction) {
      return (
        <p className="last-message">
          {renderServiceMessageText(
            last_message,
            lastMessageSender,
            actionTargetUser,
            actionTargetMessage,
            { plain: true },
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
        {getMessageSummaryText(last_message)}
      </p>
    );
  }

  const handleClick = useCallback(() => {
    openChat({ id: chat.id });
  }, [openChat, chat.id]);

  const className = buildClassName(
    'Chat',
    isChatPrivate(chat.id) ? 'private' : 'group',
    selected && 'selected',
  );

  return (
    <div className={className} onClick={handleClick}>
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
          {renderLastMessageOrTyping()}
          <Badge chat={chat} />
        </div>
      </div>
      <RippleEffect delayed={!selected} />
    </div>
  );
};

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
      ? selectChatMessage(global, chat_id!, reply_to_message_id)
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
