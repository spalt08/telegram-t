import React, {
  FC, memo, useCallback, useEffect,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiMessage, ApiUser } from '../../../api/types';

import { selectChatMessage, selectUser } from '../../../modules/selectors';
import captureEscKeyListener from '../../../util/captureEscKeyListener';
import { pick } from '../../../util/iteratees';

import Button from '../../ui/Button';
import EmbeddedMessage from '../../common/EmbeddedMessage';

import './ComposerEmbeddedMessage.scss';

type StateProps = {
  selectedChatId?: number;
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
    focusMessage({ chatId: message!.chatId, messageId: message!.id });
  }, [focusMessage, message]);

  if (!isShown) {
    return undefined;
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
  (global): StateProps => {
    const { chats: { selectedId: selectedChatId, replyingToById, editingById } } = global;
    const replyingTo = selectedChatId ? replyingToById[selectedChatId] : undefined;
    const editing = selectedChatId ? editingById[selectedChatId] : undefined;

    const message = replyingTo || editing
      ? selectChatMessage(global, selectedChatId!, (replyingTo || editing)!)
      : undefined;
    const sender = replyingTo && message && message.senderUserId
      ? selectUser(global, message.senderUserId)
      : undefined;

    return {
      selectedChatId,
      replyingTo,
      editing,
      message,
      sender,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'setChatReplyingTo',
    'setChatEditing',
    'focusMessage',
  ]),
)(ComposerEmbeddedMessage));
