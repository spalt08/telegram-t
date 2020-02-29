import React, {
  FC, memo, useCallback, useEffect,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiMessage, ApiUser } from '../../../api/types';

import { selectChatMessage, selectChatMessageViewportIds, selectUser } from '../../../modules/selectors';
import captureEscKeyListener from '../../../util/captureEscKeyListener';

import Button from '../../ui/Button';
import ReplyMessage from '../../common/ReplyMessage';

import './MessageInputReply.scss';

type IProps = {
  selectedChatId: number;
  replyingTo?: number;
  message?: ApiMessage;
  sender?: ApiUser;
  isReplyInViewport?: boolean;
} & Pick<GlobalActions, 'setChatReplyingTo' | 'focusMessage'>;

const MessageInputReply: FC<IProps> = ({
  selectedChatId,
  replyingTo,
  message,
  sender,
  isReplyInViewport,
  setChatReplyingTo,
  focusMessage,
}) => {
  const clearReplyingTo = useCallback(() => {
    setChatReplyingTo({ chatId: selectedChatId, messageId: undefined });
  }, [selectedChatId, setChatReplyingTo]);
  const isShown = replyingTo && message;

  useEffect(() => (isShown ? captureEscKeyListener(clearReplyingTo) : undefined), [isShown, clearReplyingTo]);

  const handleReplyClick = useCallback((): void => {
    focusMessage({ chatId: message!.chat_id, messageId: message!.id });
  }, [focusMessage, message]);

  if (!isShown) {
    return null;
  }

  return (
    <div className="MessageInputReply">
      <Button round color="translucent" ariaLabel="Cancel replying" onClick={clearReplyingTo}>
        <i className="icon-close" />
      </Button>
      <ReplyMessage
        message={message!}
        sender={sender}
        className={`inside-input ${isReplyInViewport ? '' : 'not-implemented '}`}
        loadPictogram
        onClick={isReplyInViewport ? handleReplyClick : undefined}
      />
    </div>
  );
};

export default memo(withGlobal(
  (global) => {
    const { chats: { selectedId: selectedChatId, replyingToById } } = global;
    const replyingTo = selectedChatId ? replyingToById[selectedChatId] : undefined;
    const message = replyingTo ? selectChatMessage(global, selectedChatId!, replyingTo) : undefined;
    const sender = message && message.sender_user_id && selectUser(global, message.sender_user_id);
    const viewportIds = selectedChatId && selectChatMessageViewportIds(global, selectedChatId);
    const isReplyInViewport = message && message.id && viewportIds && viewportIds.includes(message.id);

    return {
      selectedChatId,
      replyingTo,
      message,
      sender,
      isReplyInViewport,
    };
  },
  (setGlobal, actions) => {
    const { setChatReplyingTo, focusMessage } = actions;
    return { setChatReplyingTo, focusMessage };
  },
)(MessageInputReply));
