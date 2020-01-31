import React, { FC, memo } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import {
  ApiUser,
  ApiMessage,
} from '../../api/types';
import { selectUser, selectChatMessage } from '../../modules/selectors';
import { getServiceMessageContent } from '../common/getServiceMessageContent';

type IProps = {
  message: ApiMessage;
  sender?: ApiUser;
  actionTargetUser?: ApiUser;
  actionTargetMessage?: ApiMessage;
};

const ServiceMessage: FC<IProps> = ({
  message, sender, actionTargetUser, actionTargetMessage,
}) => (
  <div className="message-action-header">
    <span>
      {getServiceMessageContent(
        message,
        sender,
        actionTargetUser,
        actionTargetMessage,
      )}
    </span>
  </div>
);

export default memo(withGlobal(
  (global, { message }: IProps) => {
    const userId = message.sender_user_id;
    const { targetUserId: actionTargetUserId } = message.content.action || {};
    const actionTargetMessageId = message.reply_to_message_id;

    return {
      ...(userId && { sender: selectUser(global, userId) }),
      ...(actionTargetUserId && { actionTargetUser: selectUser(global, actionTargetUserId) }),
      // TODO: Works for only recent messages that are already loaded in the store
      ...(actionTargetMessageId && {
        actionTargetMessage: selectChatMessage(global, message.chat_id, actionTargetMessageId),
      }),
    };
  },
)(ServiceMessage));
