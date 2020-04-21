import React, {
  FC, memo, useRef, useEffect,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiUser, ApiMessage } from '../../api/types';

import { selectUser, selectChatMessage, selectIsMessageFocused } from '../../modules/selectors';
import { renderActionMessageText } from '../common/helpers/renderActionMessageText';
import useEnsureMessage from '../../hooks/useEnsureMessage';
import buildClassName from '../../util/buildClassName';

type OwnProps = {
  message: ApiMessage;
  isEmbedded?: boolean;
};

type StateProps = {
  sender?: ApiUser;
  actionTargetUser?: ApiUser;
  actionTargetMessage?: ApiMessage;
  isFocused: boolean;
};

const FOCUSING_MAX_DISTANCE = 2000;

const ActionMessage: FC<OwnProps & StateProps> = ({
  message, sender, actionTargetUser, actionTargetMessage, isEmbedded, isFocused,
}) => {
  const elementRef = useRef<HTMLDivElement>();

  useEnsureMessage(message.chatId, message.replyToMessageId, actionTargetMessage);

  useEffect(() => {
    const messagesContainer = document.getElementById('MessageList');
    if (isFocused && elementRef.current && messagesContainer) {
      const offset = elementRef.current.offsetTop - messagesContainer.scrollTop;
      if (offset < -FOCUSING_MAX_DISTANCE) {
        messagesContainer.scrollTop += (offset + FOCUSING_MAX_DISTANCE);
      } else if (offset > FOCUSING_MAX_DISTANCE) {
        messagesContainer.scrollTop += (offset - FOCUSING_MAX_DISTANCE);
      }

      elementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isFocused, message.chatId]);

  const content = renderActionMessageText(
    message,
    sender,
    actionTargetUser,
    actionTargetMessage,
    isEmbedded ? { isEmbedded, plain: true } : undefined,
  );

  if (isEmbedded) {
    return <span className="embedded-action-message">{content}</span>;
  }

  return (
    <div
      ref={elementRef}
      id={`message${message.id}`}
      className={buildClassName('ActionMessage message-list-item', isFocused && 'focused')}
      data-message-id={message.id}
    >
      <span>{content}</span>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { message }): StateProps => {
    const userId = message.senderUserId;
    const { targetUserId: actionTargetUserId } = message.content.action || {};
    const actionTargetMessageId = message.replyToMessageId;
    const actionTargetMessage = actionTargetMessageId
      ? selectChatMessage(global, message.chatId, actionTargetMessageId)
      : undefined;

    return {
      ...(userId && { sender: selectUser(global, userId) }),
      ...(actionTargetUserId && { actionTargetUser: selectUser(global, actionTargetUserId) }),
      actionTargetMessage,
      isFocused: selectIsMessageFocused(global, message),
    };
  },
)(ActionMessage));
