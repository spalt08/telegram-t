import React, { FC, memo } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import {
  ApiUser,
  ApiMessage,
} from '../../../../api/types';
import { selectUser, selectChatMessage } from '../../../../modules/selectors';
import { getServiceMessageContent } from '../common/getServiceMessageContent';

type IProps = {
  message: ApiMessage;
  sender?: ApiUser;
  actionTargetMessage?: ApiMessage;
};

const ServiceMessage: FC<IProps> = ({ message, sender, actionTargetMessage }) => (
  <div className="message-action-group">
    <div className="message-action-header">{getServiceMessageContent(message, sender, actionTargetMessage)}</div>
  </div>
);

export default memo(withGlobal(
  (global, { message }: IProps) => {
    const userId = message.sender_user_id;
    const actionTargetMessageId = message.reply_to_message_id;

    return {
      ...(userId && { sender: selectUser(global, userId) }),
      // TODO: Works for only recent messages that are already loaded in the store
      ...(actionTargetMessageId && {
        actionTargetMessage: selectChatMessage(global, message.chat_id, actionTargetMessageId),
      }),
    };
  },
)(ServiceMessage));