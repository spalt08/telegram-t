import React, {
  FC, memo, useCallback, useLayoutEffect, useRef,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import {
  ApiChat, ApiUser, ApiMessage, ApiMessageOutgoingStatus, ApiFormattedText,
} from '../../api/types';

import {
  getChatTitle,
  getMessageSummaryText,
  isChatPrivate,
  isActionMessage,
  getPrivateChatUserId,
  getMessageAction,
  getSenderName,
} from '../../modules/helpers';
import {
  selectChat, selectUser, selectChatMessage, selectOutgoingStatus,
} from '../../modules/selectors';
import { renderActionMessageText } from '../common/helpers/renderActionMessageText';
import { fastRaf } from '../../util/schedulers';
import buildClassName from '../../util/buildClassName';
import useEnsureMessage from '../../hooks/useEnsureMessage';

import Avatar from '../common/Avatar';
import RippleEffect from '../ui/RippleEffect';
import VerifiedIcon from '../common/VerifiedIcon';
import TypingStatus from '../common/TypingStatus';
import LastMessageMeta from './LastMessageMeta';
import Badge from './Badge';

import './Chat.scss';

type OwnProps = {
  chatId: number;
  orderDiff: number;
  selected: boolean;
};

type StateProps = {
  chat?: ApiChat;
  privateChatUser?: ApiUser;
  actionTargetUser?: ApiUser;
  lastMessageSender?: ApiUser;
  lastMessageOutgoingStatus?: ApiMessageOutgoingStatus;
  actionTargetMessage?: ApiMessage;
  isUiReady?: boolean;
  draft?: ApiFormattedText;
};

type DispatchProps = Pick<GlobalActions, 'openChat' | 'focusTopMessage'>;

const Chat: FC<OwnProps & StateProps & DispatchProps> = ({
  chatId,
  chat,
  orderDiff,
  privateChatUser,
  actionTargetUser,
  lastMessageSender,
  lastMessageOutgoingStatus,
  actionTargetMessage,
  selected,
  isUiReady,
  draft,
  openChat,
  focusTopMessage,
}) => {
  const ref = useRef<HTMLDivElement>();

  const { last_message, typingStatus } = chat || {};
  const isAction = last_message && isActionMessage(last_message);

  useEnsureMessage(chatId, isAction ? last_message!.reply_to_message_id : undefined, actionTargetMessage);

  useLayoutEffect(() => {
    const element = ref.current!;

    if (orderDiff < 0) {
      element.style.opacity = '0';

      fastRaf(() => {
        element.classList.add('animate-opacity');
        element.style.opacity = '1';
      });
    } else if (orderDiff > 0) {
      element.style.transform = `translate3d(0, ${-orderDiff * 100}%, 0)`;

      fastRaf(() => {
        element.classList.add('animate-transform');
        element.style.transform = '';
      });
    }
  }, [orderDiff]);

  const handleClick = useCallback(() => {
    if (selected) {
      focusTopMessage();
    } else {
      openChat({ id: chatId });
    }
  }, [selected, focusTopMessage, openChat, chatId]);

  if (!chat) {
    return null;
  }

  function renderLastMessageOrTyping() {
    if (typingStatus && last_message && typingStatus.timestamp > last_message.date * 1000) {
      return <TypingStatus typingStatus={typingStatus} />;
    }

    if (draft && draft.text.length) {
      return (
        <p className="last-message">
          <span className="draft">Draft</span>
          {draft.text}
        </p>
      );
    }

    if (!last_message) {
      return null;
    }

    if (isAction) {
      return (
        <p className="last-message">
          {renderActionMessageText(
            last_message,
            lastMessageSender,
            actionTargetUser,
            actionTargetMessage,
            { plain: true },
          )}
        </p>
      );
    }

    const senderName = getSenderName(chatId, lastMessageSender);

    return (
      <p className="last-message">
        {senderName && (
          <span className="sender-name">{senderName}</span>
        )}
        {getMessageSummaryText(last_message)}
      </p>
    );
  }

  const className = buildClassName(
    'Chat',
    isChatPrivate(chatId) ? 'private' : 'group',
    selected && 'selected',
  );

  return (
    <div ref={ref} className={className} onClick={handleClick}>
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

export default memo(withGlobal<OwnProps>(
  (global, { chatId }): StateProps => {
    const chat = selectChat(global, chatId);
    if (!chat || !chat.last_message) {
      return {};
    }

    const { sender_user_id, reply_to_message_id, is_outgoing } = chat.last_message;
    const lastMessageSender = sender_user_id ? selectUser(global, sender_user_id) : undefined;
    const lastMessageAction = getMessageAction(chat.last_message);
    const actionTargetMessage = lastMessageAction && reply_to_message_id
      ? selectChatMessage(global, chat.id, reply_to_message_id)
      : undefined;
    const { targetUserId: actionTargetUserId } = lastMessageAction || {};
    const privateChatUserId = getPrivateChatUserId(chat);
    const { isUiReady, chats: { draftsById } } = global;

    return {
      chat,
      lastMessageSender,
      ...(is_outgoing && { lastMessageOutgoingStatus: selectOutgoingStatus(global, chat.last_message) }),
      ...(privateChatUserId && { privateChatUser: selectUser(global, privateChatUserId) }),
      ...(actionTargetUserId && { actionTargetUser: selectUser(global, actionTargetUserId) }),
      actionTargetMessage,
      isUiReady,
      draft: draftsById[chatId],
    };
  },
  (setGlobal, actions): DispatchProps => {
    const { openChat, focusTopMessage } = actions;
    return { openChat, focusTopMessage };
  },
)(Chat));
