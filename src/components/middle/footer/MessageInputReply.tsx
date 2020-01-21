import React, { FC } from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';
import { selectChatMessage, selectUser } from '../../../modules/selectors';
import { GlobalActions } from '../../../store/types';
import { ApiMessage, ApiUser } from '../../../api/types';

import Button from '../../ui/Button';
import ReplyMessage from '../../common/ReplyMessage';
import './MessageInputReply.scss';

type IProps = Pick<GlobalActions, 'setChatReplyingTo'> & {
  selectedChatId: number;
  replyingTo?: number;
  message?: ApiMessage;
  sender?: ApiUser;
};

const MessageInputReply: FC<IProps> = ({
  selectedChatId, replyingTo, message, sender, setChatReplyingTo,
}) => {
  if (!replyingTo || !message) {
    return null;
  }

  function clearReplyTo() {
    setChatReplyingTo({ chatId: selectedChatId, messageId: undefined });
  }

  return (
    <div className="MessageInputReply">
      <Button round color="translucent" ariaLabel="Cancel replying" onClick={clearReplyTo}>
        <i className="icon-close" />
      </Button>
      <ReplyMessage message={message} sender={sender} className="inside-input" />
    </div>
  );
};


export default withGlobal(
  (global) => {
    const { chats: { selectedId: selectedChatId, replyingToById } } = global;
    const replyingTo = selectedChatId ? replyingToById[selectedChatId] : undefined;
    const message = replyingTo ? selectChatMessage(global, selectedChatId!, replyingTo) : undefined;
    const sender = message && selectUser(global, message.sender_user_id);

    return {
      selectedChatId,
      replyingTo,
      message,
      sender,
    };
  },
  (setGlobal, actions) => {
    const { setChatReplyingTo } = actions;
    return { setChatReplyingTo };
  },
)(MessageInputReply);
