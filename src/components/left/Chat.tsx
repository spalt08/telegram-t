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
import { pick } from '../../util/iteratees';
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

type DispatchProps = Pick<GlobalActions, 'openChat' | 'focusLastMessage'>;

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
  focusLastMessage,
}) => {
  const ref = useRef<HTMLDivElement>();

  const { lastMessage, typingStatus } = chat || {};
  const isAction = lastMessage && isActionMessage(lastMessage);

  useEnsureMessage(chatId, isAction ? lastMessage!.replyToMessageId : undefined, actionTargetMessage);

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
      focusLastMessage();
    } else {
      openChat({ id: chatId });
    }
  }, [selected, focusLastMessage, openChat, chatId]);

  if (!chat) {
    return undefined;
  }

  function renderLastMessageOrTyping() {
    if (typingStatus && lastMessage && typingStatus.timestamp > lastMessage.date * 1000) {
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

    if (!lastMessage) {
      return undefined;
    }

    if (isAction) {
      return (
        <p className="last-message">
          {renderActionMessageText(
            lastMessage,
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
        {getMessageSummaryText(lastMessage)}
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
          isSavedMessages={privateChatUser && privateChatUser.isSelf}
        />
      )}
      <div className="info">
        <div className="title">
          <h3>{getChatTitle(chat, privateChatUser)}</h3>
          {chat.isVerified && <VerifiedIcon />}
          {chat.isMuted && <i className="icon-muted-chat" />}
          {chat.lastMessage && (
            <LastMessageMeta message={chat.lastMessage} outgoingStatus={lastMessageOutgoingStatus} />
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
    if (!chat || !chat.lastMessage) {
      return {};
    }

    const { senderUserId, replyToMessageId, isOutgoing } = chat.lastMessage;
    const lastMessageSender = senderUserId ? selectUser(global, senderUserId) : undefined;
    const lastMessageAction = getMessageAction(chat.lastMessage);
    const actionTargetMessage = lastMessageAction && replyToMessageId
      ? selectChatMessage(global, chat.id, replyToMessageId)
      : undefined;
    const { targetUserId: actionTargetUserId } = lastMessageAction || {};
    const privateChatUserId = getPrivateChatUserId(chat);
    const { isUiReady, chats: { draftsById } } = global;

    return {
      chat,
      lastMessageSender,
      ...(isOutgoing && { lastMessageOutgoingStatus: selectOutgoingStatus(global, chat.lastMessage) }),
      ...(privateChatUserId && { privateChatUser: selectUser(global, privateChatUserId) }),
      ...(actionTargetUserId && { actionTargetUser: selectUser(global, actionTargetUserId) }),
      actionTargetMessage,
      isUiReady,
      draft: draftsById[chatId],
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['openChat', 'focusLastMessage']),
)(Chat));
