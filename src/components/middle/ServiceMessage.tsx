import React, { FC, memo } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import {
  ApiUser,
  ApiMessage,
} from '../../api/types';
import { selectUser, selectChatMessage } from '../../modules/selectors';
import { getServiceMessageContent } from '../common/getServiceMessageContent';
import useEnsureMessage from '../../hooks/useEnsureMessage';
import useEnsureUserFromMessage from '../../hooks/useEnsureUserFromMessage';

type IProps = {
  message: ApiMessage;
  sender?: ApiUser;
  actionTargetUser?: ApiUser;
  actionTargetMessage?: ApiMessage;
  isReply?: boolean;
};

const ServiceMessage: FC<IProps> = ({
  message, sender, actionTargetUser, actionTargetMessage, isReply,
}) => {
  const { targetUserId: actionTargetUserId } = message.content.action || {};
  useEnsureMessage(message.chat_id, message.reply_to_message_id, actionTargetMessage);
  useEnsureUserFromMessage(message.chat_id, message.id, actionTargetUserId, actionTargetUser);

  const content = getServiceMessageContent(
    message,
    sender,
    actionTargetUser,
    actionTargetMessage,
    isReply ? { isReply, plain: true } : undefined,
  );

  if (isReply) {
    return <span className="reply-action-message">{content}</span>;
  }

  return (
    <div className="message-action-header">
      <span>{content}</span>
    </div>
  );
};

export default memo(withGlobal(
  (global, { message }: IProps) => {
    const userId = message.sender_user_id;
    const { targetUserId: actionTargetUserId } = message.content.action || {};
    const actionTargetMessageId = message.reply_to_message_id;

    return {
      ...(userId && { sender: selectUser(global, userId) }),
      ...(actionTargetUserId && { actionTargetUser: selectUser(global, actionTargetUserId) }),
      ...(actionTargetMessageId && {
        actionTargetMessage: selectChatMessage(global, message.chat_id, actionTargetMessageId),
      }),
    };
  },
)(ServiceMessage));
