import React, {
  FC, useCallback, useEffect, useState,
} from '../../../../lib/teact';
import { GlobalActions } from '../../../../store/types';
import { withGlobal } from '../../../../lib/teactn';

import Button from '../../../../components/ui/Button';
import AttachMenu from './AttachMenu';
import MessageInput from './MessageInput';
import MessageInputReply from './MessageInputReply';
import MessageInputImage from './MessageInputImage';
import './MiddleFooter.scss';

type IProps = Pick<GlobalActions, 'sendTextMessage'> & {
  selectedChatId: number;
};

const MiddleFooter: FC<IProps> = ({ selectedChatId, sendTextMessage }) => {
  const [messageText, setMessageText] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const isSendButton = Boolean(messageText);

  const onSendMessage = () => {
    if (messageText !== '') {
      sendTextMessage({
        chatId: selectedChatId,
        text: messageText,
      });
      setMessageText('');
    }
  };

  const pasteImageFromClipboard = (e: ClipboardEvent) => {
    if (!e.clipboardData) {
      return;
    }

    const { items } = e.clipboardData;
    const acceptedTypes = ['image/png', 'image/jpeg', 'image/gif'];

    const file = Array.from(items).find((item) => acceptedTypes.includes(item.type));

    if (file) {
      setAttachedImage(file.getAsFile());
      e.preventDefault();
    }
  };

  useEffect(() => {
    document.addEventListener('paste', pasteImageFromClipboard, false);

    return () => {
      document.removeEventListener('paste', pasteImageFromClipboard, false);
    };
  });

  const handleClearAttachedImage = useCallback(() => {
    setAttachedImage(null);
  }, []);

  const handleOpenAttachMenu = useCallback(() => {
    setIsAttachMenuOpen(true);
  }, []);

  const handleCloseAttachMenu = useCallback(() => {
    setIsAttachMenuOpen(false);
  }, []);

  const handleMediaChoose = useCallback((file: File) => {
    setAttachedImage(file);
  }, []);

  return (
    <div className="MiddleFooter">
      <div id="message-compose">
        <MessageInputReply />
        {attachedImage && <MessageInputImage image={attachedImage} onClearImage={handleClearAttachedImage} />}
        <div className="message-input-wrapper">
          <Button className="not-implemented" round color="translucent">
            <i className="icon-smile" />
          </Button>
          <MessageInput messageText={messageText} setMessageText={setMessageText} onSendMessage={onSendMessage} />
          <Button
            className={`${isAttachMenuOpen ? 'activated' : ''}`}
            round
            color="translucent"
            onClick={handleOpenAttachMenu}
          >
            <i className="icon-attach" />
          </Button>
          <AttachMenu
            isOpen={isAttachMenuOpen}
            onMediaChoose={handleMediaChoose}
            onClose={handleCloseAttachMenu}
          />
        </div>
      </div>
      <Button
        round
        color="primary"
        className={`${isSendButton ? 'send' : 'microphone not-implemented'}`}
        onClick={onSendMessage}
      >
        <i className="icon-send" />
        <i className="icon-microphone" />
      </Button>
    </div>
  );
};

export default withGlobal(
  (global) => {
    const { chats: { selectedId: selectedChatId } } = global;

    return {
      selectedChatId,
    };
  },
  (setGlobal, actions) => {
    const { sendTextMessage } = actions;
    return { sendTextMessage };
  },
)(MiddleFooter);
