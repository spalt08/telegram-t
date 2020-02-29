import React, {
  FC, memo, useRef, useEffect,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import {
  ApiUser,
  ApiMessage,
} from '../../api/types';
import { selectUser, selectChatMessage, selectChatFocusedMessageId } from '../../modules/selectors';
import { renderServiceMessageText } from '../common/helpers/renderServiceMessageText';
import useEnsureMessage from '../../hooks/useEnsureMessage';

type IProps = {
  message: ApiMessage;
  sender?: ApiUser;
  actionTargetUser?: ApiUser;
  actionTargetMessage?: ApiMessage;
  isReply?: boolean;
  isFocused: boolean;
};

const FOCUSING_MAX_DISTANCE = 2000;

const ServiceMessage: FC<IProps> = ({
  message, sender, actionTargetUser, actionTargetMessage, isReply, isFocused,
}) => {
  const elementRef = useRef<HTMLDivElement>();

  useEnsureMessage(message.chat_id, message.reply_to_message_id, actionTargetMessage);

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
  }, [isFocused, message.chat_id]);

  const content = renderServiceMessageText(
    message,
    sender,
    actionTargetUser,
    actionTargetMessage,
    isReply ? { isReply, plain: true } : undefined,
  );

  if (isReply) {
    return <span className="reply-action-message">{content}</span>;
  }

  const classNames = ['message-action-header'];
  if (isFocused) {
    classNames.push('focused');
  }

  return (
    <div ref={elementRef} className={classNames.join(' ')}>
      <span>{content}</span>
    </div>
  );
};

export default memo(withGlobal(
  (global, { message }: IProps) => {
    const userId = message.sender_user_id;
    const { targetUserId: actionTargetUserId } = message.content.action || {};
    const actionTargetMessageId = message.reply_to_message_id;
    const isFocused = message.id === selectChatFocusedMessageId(global, message.chat_id);

    return {
      ...(userId && { sender: selectUser(global, userId) }),
      ...(actionTargetUserId && { actionTargetUser: selectUser(global, actionTargetUserId) }),
      ...(actionTargetMessageId && {
        actionTargetMessage: selectChatMessage(global, message.chat_id, actionTargetMessageId),
      }),
      isFocused,
    };
  },
)(ServiceMessage));
