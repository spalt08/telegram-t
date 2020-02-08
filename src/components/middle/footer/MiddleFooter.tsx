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

import { getImageDataFromFile, getVideoDataFromFile } from '../../../util/files';

import './MiddleFooter.scss';

type IProps = Pick<GlobalActions, 'sendMessage'>;

const CLIPBOARD_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif'];
const MAX_QUICK_FILE_SIZE = 10 * 1024 ** 2; // 10 MB

const MiddleFooter: FC<IProps> = ({ sendMessage }) => {
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment] = useState<ApiAttachment | undefined>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSend = useCallback(() => {
    if (messageText || attachment) {
      sendMessage({
        text: messageText,
        attachment,
      });

      setMessageText('');
      setAttachment(undefined);
    }
  }, [messageText, attachment, sendMessage]);

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

  const handleFileSelect = useCallback(async (file: File, isQuick: boolean) => {
    setAttachment(await buildAttachment(file, isQuick));
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
        className={`${messageText && !attachment ? 'send' : 'microphone not-implemented'}`}
        onClick={handleSend}
      >
        <i className="icon-send" />
        <i className="icon-microphone-alt" />
      </Button>
    </div>
  );
};

async function buildAttachment(file: File, isQuick: boolean): Promise<ApiAttachment> {
  if (!isQuick || file.size >= MAX_QUICK_FILE_SIZE) {
    return { file };
  }

  return {
    file,
    quick: file.type.startsWith('image/')
      ? await getImageDataFromFile(file)
      : await getVideoDataFromFile(file),
  };
}

export default withGlobal(
  undefined,
  (setGlobal, actions) => {
    const { sendMessage } = actions;
    return { sendMessage };
  },
)(MiddleFooter);
