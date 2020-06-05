import React, {
  FC, memo, useCallback, useLayoutEffect, useRef,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import {
  ApiChat, ApiUser, ApiMessage, ApiMessageOutgoingStatus, ApiFormattedText,
} from '../../../api/types';

import { ANIMATION_END_DELAY } from '../../../config';
import {
  getChatTitle,
  getMessageSummaryText,
  isChatPrivate,
  isActionMessage,
  getPrivateChatUserId,
  getMessageAction,
  getSenderName,
} from '../../../modules/helpers';
import {
  selectChat, selectUser, selectChatMessage, selectOutgoingStatus,
} from '../../../modules/selectors';
import { renderActionMessageText } from '../../common/helpers/renderActionMessageText';
import renderText from '../../common/helpers/renderText';
import { fastRaf } from '../../../util/schedulers';
import buildClassName from '../../../util/buildClassName';
import { pick } from '../../../util/iteratees';
import useEnsureMessage from '../../../hooks/useEnsureMessage';

import RippleEffect from '../../ui/RippleEffect';
import Avatar from '../../common/Avatar';
import VerifiedIcon from '../../common/VerifiedIcon';
import TypingStatus from '../../common/TypingStatus';
import LastMessageMeta from '../../common/LastMessageMeta';
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
  draft?: ApiFormattedText;
};

type DispatchProps = Pick<GlobalActions, 'openChat' | 'focusLastMessage'>;

const ANIMATION_DURATION = 200;

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
  draft,
  openChat,
  focusLastMessage,
}) => {
  const ref = useRef<HTMLDivElement>();

  const { lastMessage, typingStatus } = chat || {};
  const isAction = lastMessage && isActionMessage(lastMessage);

  useEnsureMessage(chatId, isAction ? lastMessage!.replyToMessageId : undefined, actionTargetMessage);

  // Sets animation excess values when `orderDiff` changes and then resets excess values to animate.
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
    } else {
      return;
    }

    setTimeout(() => {
      fastRaf(() => {
        element.classList.remove('animate-opacity', 'animate-transform');
        element.style.opacity = '';
        element.style.transform = '';
      });
    }, ANIMATION_DURATION + ANIMATION_END_DELAY);
  }, [orderDiff]);

  const handleClick = useCallback(() => {
    if (selected) {
      focusLastMessage();
    }
    openChat({ id: chatId });
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
          {renderText(draft.text)}
        </p>
      );
    }

    if (!lastMessage) {
      return undefined;
    }

    if (isAction) {
      return (
        <p className="last-message">
          {renderText(renderActionMessageText(
            lastMessage,
            lastMessageSender,
            actionTargetUser,
            actionTargetMessage,
            { plain: true },
          ) as string)}
        </p>
      );
    }

    const senderName = getSenderName(chatId, lastMessageSender);

    return (
      <p className="last-message">
        {senderName && (
          <span className="sender-name">{renderText(senderName)}</span>
        )}
        {renderText(getMessageSummaryText(lastMessage))}
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
      <Avatar
        chat={chat}
        user={privateChatUser}
        showOnlineStatus
        isSavedMessages={privateChatUser && privateChatUser.isSelf}
      />
      <div className="info">
        <div className="title">
          <h3>{renderText(getChatTitle(chat, privateChatUser))}</h3>
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
    const { chats: { draftsById } } = global;

    return {
      chat,
      lastMessageSender,
      ...(isOutgoing && { lastMessageOutgoingStatus: selectOutgoingStatus(global, chat.lastMessage) }),
      ...(privateChatUserId && { privateChatUser: selectUser(global, privateChatUserId) }),
      ...(actionTargetUserId && { actionTargetUser: selectUser(global, actionTargetUserId) }),
      actionTargetMessage,
      draft: draftsById[chatId],
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['openChat', 'focusLastMessage']),
)(Chat));
