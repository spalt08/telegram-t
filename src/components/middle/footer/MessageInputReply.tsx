import React, {
  FC, memo, useCallback, useEffect,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiMessage, ApiUser } from '../../../api/types';

import { selectChatMessage, selectUser } from '../../../modules/selectors';
import captureEscKeyListener from '../../../util/captureEscKeyListener';

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
  const clearReplyingTo = useCallback(() => {
    setChatReplyingTo({ chatId: selectedChatId, messageId: undefined });
  }, [selectedChatId, setChatReplyingTo]);
  const isShown = replyingTo && message;

  useEffect(() => (isShown ? captureEscKeyListener(clearReplyingTo) : undefined), [isShown, clearReplyingTo]);

  if (!isShown) {
    return null;
  }

  return (
    <div className="MessageInputReply">
      <Button round color="translucent" ariaLabel="Cancel replying" onClick={clearReplyingTo}>
        <i className="icon-close" />
      </Button>
      <ReplyMessage message={message!} sender={sender} className="inside-input" loadPictogram />
    </div>
  );
};

export default memo(withGlobal(
  (global) => {
    const { chats: { selectedId: selectedChatId, replyingToById } } = global;
    const replyingTo = selectedChatId ? replyingToById[selectedChatId] : undefined;
    const message = replyingTo ? selectChatMessage(global, selectedChatId!, replyingTo) : undefined;
    const sender = message && message.sender_user_id && selectUser(global, message.sender_user_id);

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
)(MessageInputReply));
