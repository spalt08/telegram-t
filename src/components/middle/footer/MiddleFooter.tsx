import React, {
  FC, memo, useCallback, useEffect, useRef, useState,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiAttachment, ApiSticker } from '../../../api/types';

import { formatVoiceRecordDuration } from '../../../util/dateFormat';
import { blobToFile, getImageDataFromFile, getVideoDataFromFile } from '../../../util/files';
import * as voiceRecording from '../../../util/voiceRecording';

import Button from '../../ui/Button';
import AttachMenu from './AttachMenu';
import StickerMenu from './StickerMenu';
import MessageInput from './MessageInput';
import MessageInputReply from './MessageInputReply';
import Attachment from './Attachment';
import WebPagePreview from './WebPagePreview';

import './MiddleFooter.scss';

type IProps = Pick<GlobalActions, 'sendMessage'>;
type ActiveVoiceRecording = { stop: () => Promise<voiceRecording.Result> } | undefined;

const CLIPBOARD_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif'];
const MAX_QUICK_FILE_SIZE = 10 * 1024 ** 2; // 10 MB
const VOICE_RECORDING_SUPPORTED = voiceRecording.isSupported();
const VOICE_RECORDING_FILENAME = 'wonderful-voice-message.ogg';

const MiddleFooter: FC<IProps> = ({ sendMessage }) => {
  const [text, setText] = useState('');
  const textRef = useRef(text);

  const [attachment, setAttachment] = useState<ApiAttachment | undefined>();
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);

  const [isStickerMenuOpen, setIsStickerMenuOpen] = useState(false);

  const recordButtonRef = useRef<HTMLButtonElement>();
  const [activeVoiceRecording, setActiveVoiceRecording] = useState<ActiveVoiceRecording>();
  const [startRecordTime, setStartRecordTime] = useState();
  const [currentRecordTime, setCurrentRecordTime] = useState();

  const isMainButtonSend = !VOICE_RECORDING_SUPPORTED || activeVoiceRecording || (text && !attachment);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

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

  const handleOpenAttachMenu = useCallback(() => {
    setIsAttachMenuOpen(true);
  }, []);

  const handleCloseAttachMenu = useCallback(() => {
    setIsAttachMenuOpen(false);
  }, []);

  const handleFileSelect = useCallback(async (file: File, isQuick: boolean) => {
    setAttachment(await buildAttachment(file, isQuick));
  }, []);

  const handleClearAttachment = useCallback(() => {
    setAttachment(undefined);
  }, []);

  const handleOpenStickerMenu = useCallback(() => {
    setIsStickerMenuOpen(true);
  }, []);

  const handleCloseStickerMenu = useCallback(() => {
    setIsStickerMenuOpen(false);
  }, []);

  const handleEmojiSelect = useCallback((emoji: string) => {
    const messageInput = document.getElementById('message-input-text') as HTMLInputElement;
    const selectionStart = messageInput.selectionStart || 0;
    const selectionEnd = messageInput.selectionEnd || 0;
    setText(`${textRef.current.substring(0, selectionStart)}${emoji}${textRef.current.substring(selectionEnd)}`);
    requestAnimationFrame(() => {
      messageInput.setSelectionRange(selectionStart + emoji.length, selectionStart + emoji.length);
    });
  }, []);

  const handleStickerSelect = useCallback((sticker: ApiSticker) => {
    sendMessage({ sticker });
    setIsStickerMenuOpen(false);
  }, [sendMessage]);

  const handleRecordVoice = useCallback(async () => {
    try {
      const stop = await voiceRecording.start((tickVolume: number) => {
        if (recordButtonRef.current) {
          const volumeLevel = ((tickVolume - 128) / 127) * 2;
          const volumeFactor = volumeLevel ? 0.25 + volumeLevel * 0.75 : 0;
          if (Date.now() % 4 === 0) {
            recordButtonRef.current.style.boxShadow = `0 0 0 ${volumeFactor * 50}px rgba(0,0,0,.15)`;
          }
          setCurrentRecordTime(Date.now());
        }
      });
      setStartRecordTime(Date.now());
      setCurrentRecordTime(Date.now());

      setActiveVoiceRecording({ stop });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }, []);

  const stopRecordingVoice = useCallback(() => {
    setActiveVoiceRecording(undefined);
    setStartRecordTime(undefined);
    setCurrentRecordTime(undefined);
    if (recordButtonRef.current) {
      recordButtonRef.current.style.boxShadow = 'none';
    }

    try {
      return activeVoiceRecording!.stop();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return undefined;
    }
  }, [activeVoiceRecording]);

  const handleSend = useCallback(async () => {
    let currentAttachment = attachment;

    if (activeVoiceRecording) {
      const record = await stopRecordingVoice();
      if (record) {
        const { blob, duration, waveform } = record;
        currentAttachment = {
          file: blobToFile(blob, VOICE_RECORDING_FILENAME),
          voice: { duration, waveform },
        };
      }
    }

    if (textRef.current || currentAttachment) {
      sendMessage({
        text: textRef.current,
        attachment: currentAttachment,
      });

      setText('');
      setAttachment(undefined);
      setIsStickerMenuOpen(false);
    }
  }, [activeVoiceRecording, attachment, sendMessage, stopRecordingVoice]);

  return (
    <div className="MiddleFooter">
      <Attachment
        attachment={attachment}
        caption={attachment ? text : ''}
        onCaptionUpdate={setText}
        onSend={handleSend}
        onClear={handleClearAttachment}
      />
      <div id="message-compose">
        <MessageInputReply />
        <WebPagePreview messageText={!attachment ? text : ''} />
        <div className="message-input-wrapper">
          <Button
            className={`${isStickerMenuOpen ? 'activated' : ''}`}
            round
            color="translucent"
            onMouseEnter={handleOpenStickerMenu}
            onFocus={handleOpenStickerMenu}
          >
            <i className="icon-smile" />
          </Button>
          <MessageInput
            text={!attachment ? text : ''}
            onUpdate={setText}
            onSend={handleSend}
            isStickerMenuOpen={isStickerMenuOpen}
          />
          {!activeVoiceRecording && (
            <Button
              className={`${isAttachMenuOpen ? 'activated' : ''}`}
              round
              color="translucent"
              onMouseDown={handleOpenAttachMenu}
            >
              <i className="icon-attach" />
            </Button>
          )}
          {activeVoiceRecording && (
            <span className="recording-state">
              {formatVoiceRecordDuration(currentRecordTime - startRecordTime)}
            </span>
          )}
          <AttachMenu
            isOpen={isAttachMenuOpen}
            onFileSelect={handleFileSelect}
            onClose={handleCloseAttachMenu}
          />
          <StickerMenu
            isOpen={isStickerMenuOpen}
            onClose={handleCloseStickerMenu}
            onEmojiSelect={handleEmojiSelect}
            onStickerSelect={handleStickerSelect}
          />
        </div>
      </div>
      {activeVoiceRecording && (
        <Button
          round
          color="danger"
          className="cancel"
          onClick={stopRecordingVoice}
        >
          <i className="icon-delete" />
        </Button>
      )}
      <Button
        ref={recordButtonRef}
        round
        color="secondary"
        className={`${isMainButtonSend ? 'send' : 'microphone'} ${activeVoiceRecording ? 'recording' : ''}`}
        onClick={isMainButtonSend ? handleSend : handleRecordVoice}
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

export default memo(withGlobal(
  undefined,
  (setGlobal, actions) => {
    const { sendMessage } = actions;
    return { sendMessage };
  },
)(MiddleFooter));
