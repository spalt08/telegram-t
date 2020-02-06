import React, {
  FC, useCallback, useEffect, useState,
} from '../../../lib/teact/teact';
import { GlobalActions } from '../../../store/types';
import { withGlobal } from '../../../lib/teact/teactn';

import { ApiAttachment } from '../../../api/types';

import Button from '../../ui/Button';
import AttachMenu from './AttachMenu';
import MessageInput from './MessageInput';
import MessageInputReply from './MessageInputReply';
import Attachment from './Attachment';

import { getImageDataFromFile } from '../../../util/image';

import './MiddleFooter.scss';

type IProps = Pick<GlobalActions, 'sendMessage'>;

const CLIPBOARD_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif'];

const MiddleFooter: FC<IProps> = ({ sendMessage }) => {
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment] = useState<ApiAttachment | undefined>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const canSend = Boolean(messageText) || Boolean(attachment);

  const handleSend = useCallback(() => {
    if (canSend) {
      sendMessage({
        text: messageText,
        attachment,
      });

      setMessageText('');
      setAttachment(undefined);
    }
  }, [attachment, canSend, messageText, sendMessage]);

  useEffect(() => {
    async function pasteImageFromClipboard(e: ClipboardEvent) {
      if (!e.clipboardData) {
        return;
      }

      const { items } = e.clipboardData;

      const media = Array.from(items).find((item) => CLIPBOARD_ACCEPTED_TYPES.includes(item.type));
      const file = media && media.getAsFile();

      if (file) {
        e.preventDefault();

        setAttachment(await buildAttachment(file, true));
      }
    }

    document.addEventListener('paste', pasteImageFromClipboard, false);

    return () => {
      document.removeEventListener('paste', pasteImageFromClipboard, false);
    };
  }, []);

  const handleClearAttachment = useCallback(() => {
    setAttachment(undefined);
  }, []);

  const handleOpenMenu = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleFileSelect = useCallback(async (file: File, asPhoto: boolean) => {
    setAttachment(await buildAttachment(file, asPhoto));
  }, []);

  return (
    <div className="MiddleFooter">
      <Attachment
        attachment={attachment}
        caption={messageText}
        onCaptionUpdate={setMessageText}
        onSend={handleSend}
        onClear={handleClearAttachment}
      />
      <div id="message-compose">
        <MessageInputReply />
        <div className="message-input-wrapper">
          <Button className="not-implemented" round color="translucent">
            <i className="icon-smile" />
          </Button>
          <MessageInput
            messageText={!attachment ? messageText : ''}
            onUpdate={setMessageText}
            onSend={handleSend}
          />
          <Button
            className={`${isMenuOpen ? 'activated' : ''}`}
            round
            color="translucent"
            onClick={handleOpenMenu}
          >
            <i className="icon-attach" />
          </Button>
          <AttachMenu
            isOpen={isMenuOpen}
            onFileSelect={handleFileSelect}
            onClose={handleCloseMenu}
          />
        </div>
      </div>
      <Button
        round
        color="secondary"
        className={`${canSend ? 'send' : 'microphone not-implemented'}`}
        onClick={handleSend}
      >
        <i className="icon-send" />
        <i className="icon-microphone-alt" />
      </Button>
    </div>
  );
};

async function buildAttachment(file: File, asPhoto: boolean): Promise<ApiAttachment> {
  return {
    file,
    ...(asPhoto && { photo: await getImageDataFromFile(file) }),
  };
}

export default withGlobal(
  undefined,
  (setGlobal, actions) => {
    const { sendMessage } = actions;
    return { sendMessage };
  },
)(MiddleFooter);
