import React, {
  FC, memo, useCallback, useEffect,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiMessage, ApiUser } from '../../../api/types';

import { selectChatMessage, selectUser } from '../../../modules/selectors';
import captureEscKeyListener from '../../../util/captureEscKeyListener';

import Button from '../../ui/Button';
import EmbeddedMessage from '../../common/EmbeddedMessage';

import './ComposerEmbeddedMessage.scss';

type StateProps = {
  selectedChatId: number;
  replyingTo?: number;
  editing?: number;
  message?: ApiMessage;
  sender?: ApiUser;
};

type DispatchProps = Pick<GlobalActions, 'setChatReplyingTo' | 'setChatEditing' | 'focusMessage'>;

const ComposerEmbeddedMessage: FC<StateProps & DispatchProps> = ({
  selectedChatId,
  replyingTo,
  editing,
  message,
  sender,
  setChatReplyingTo,
  setChatEditing,
  focusMessage,
}) => {
  const isShown = (replyingTo || editing) && message;

  const clearEmbedded = useCallback(() => {
    if (replyingTo) {
      setChatReplyingTo({ chatId: selectedChatId, messageId: undefined });
    } else if (editing) {
      setChatEditing({ chatId: selectedChatId, messageId: undefined });
    }
  }, [selectedChatId, replyingTo, editing, setChatReplyingTo, setChatEditing]);

  useEffect(() => (isShown ? captureEscKeyListener(clearEmbedded) : undefined), [isShown, clearEmbedded]);

  const handleMessageClick = useCallback((): void => {
    focusMessage({ chatId: message!.chat_id, messageId: message!.id });
  }, [focusMessage, message]);

  if (!isShown) {
    return null;
  }

  return (
    <div className="ComposerEmbeddedMessage">
      <Button round color="translucent" ariaLabel="Cancel replying" onClick={clearEmbedded}>
        <i className="icon-close" />
      </Button>
      <EmbeddedMessage
        className="inside-input"
        message={message!}
        sender={sender}
        loadPictogram
        title={editing ? 'Editing' : undefined}
        onClick={handleMessageClick}
      />
    </div>
  );
};

export default memo(withGlobal(
  (global) => {
    const { chats: { selectedId: selectedChatId, replyingToById, editingById } } = global;
    const replyingTo = selectedChatId ? replyingToById[selectedChatId] : undefined;
    const editing = selectedChatId ? editingById[selectedChatId] : undefined;

    const message = replyingTo || editing
      ? selectChatMessage(global, selectedChatId!, (replyingTo || editing)!)
      : undefined;
    const sender = replyingTo && message && message.sender_user_id && selectUser(global, message.sender_user_id);

    return {
      selectedChatId,
      replyingTo,
      editing,
      message,
      sender,
    };
  },
  (setGlobal, actions) => {
    const { setChatReplyingTo, setChatEditing, focusMessage } = actions;
    return { setChatReplyingTo, setChatEditing, focusMessage };
  },
)(ComposerEmbeddedMessage));
