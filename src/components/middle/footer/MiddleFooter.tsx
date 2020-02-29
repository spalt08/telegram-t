import React, {
  FC, memo, useCallback, useEffect, useRef, useState,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import {
  ApiAttachment,
  ApiSticker,
  ApiVideo,
  ApiNewPoll,
} from '../../../api/types';

import { isChatPrivate } from '../../../modules/helpers';

import { formatVoiceRecordDuration } from '../../../util/dateFormat';
import { blobToFile, getImageDataFromFile, getVideoDataFromFile } from '../../../util/files';
import * as voiceRecording from '../../../util/voiceRecording';
import parseTextEntities from '../util/parseTextEntities';
import focusEditableElement from '../../../util/focusEditableElement';

import Button from '../../ui/Button';
import AttachMenu from './AttachMenu';
import StickerMenu from './StickerMenu';
import MessageInput from './MessageInput';
import MessageInputReply from './MessageInputReply';
import AttachmentModal from './AttachmentModal';
import PollModal from './PollModal';
import WebPagePreview from './WebPagePreview';

import './MiddleFooter.scss';

type IProps = {
  isPrivateChat: boolean;
} &Pick<GlobalActions, 'sendMessage'>;
type ActiveVoiceRecording = { stop: () => Promise<voiceRecording.Result> } | undefined;

const CLIPBOARD_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif'];
const MAX_QUICK_FILE_SIZE = 10 * 1024 ** 2; // 10 MB
const VOICE_RECORDING_SUPPORTED = voiceRecording.isSupported();
const VOICE_RECORDING_FILENAME = 'wonderful-voice-message.ogg';
const EDITABLE_INPUT_ID = 'editable-message-text';
const MAX_NESTING_PARENTS = 5;
const MAX_MESSAGE_LENGTH = 4096;

function isSelectionInsideInput(selectionRange: Range) {
  const { commonAncestorContainer } = selectionRange;
  let parentNode: HTMLElement | null = commonAncestorContainer as HTMLElement;
  let iterations = 1;
  while (parentNode && parentNode.id !== EDITABLE_INPUT_ID && iterations < MAX_NESTING_PARENTS) {
    parentNode = parentNode.parentElement;
    iterations++;
  }

  return Boolean(parentNode && parentNode.id === EDITABLE_INPUT_ID);
}

const MiddleFooter: FC<IProps> = ({ isPrivateChat, sendMessage }) => {
  const [html, setHtml] = useState<string>('');
  const htmlRef = useRef<string>(html);

  const [attachment, setAttachment] = useState<ApiAttachment | undefined>();
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const canOpenAttachMenu = useRef(true);

  const [isStickerMenuOpen, setIsStickerMenuOpen] = useState(false);

  const recordButtonRef = useRef<HTMLButtonElement>();
  const [activeVoiceRecording, setActiveVoiceRecording] = useState<ActiveVoiceRecording>();
  const startRecordTimeRef = useRef<number>();
  const [currentRecordTime, setCurrentRecordTime] = useState();

  const isMainButtonSend = !VOICE_RECORDING_SUPPORTED || activeVoiceRecording || (html && !attachment);

  useEffect(() => {
    htmlRef.current = html;
  }, [html]);

  const insertTextAndUpdateCursor = useCallback((text: string) => {
    const selection = window.getSelection()!;

    if (selection.rangeCount) {
      const selectionRange = selection.getRangeAt(0);
      if (isSelectionInsideInput(selectionRange)) {
        // Insertion will trigger `onChange` in MessageInput, so no need to setHtml in state
        document.execCommand('insertText', false, text);
        return;
      }

      setHtml(`${htmlRef.current!}${text}`);

      // If selection is outside of input, set cursor at the end of input
      requestAnimationFrame(() => {
        const messageInput = document.getElementById(EDITABLE_INPUT_ID)!;
        focusEditableElement(messageInput);
      });
    }
  }, []);

  useEffect(() => {
    async function handlePaste(e: ClipboardEvent) {
      if (!e.clipboardData) {
        return;
      }

      const { items } = e.clipboardData;

      const media = Array.from(items).find((item) => CLIPBOARD_ACCEPTED_TYPES.includes(item.type));
      const file = media && media.getAsFile();

      const pasteText = e.clipboardData.getData('text')
        .substring(0, MAX_MESSAGE_LENGTH)
        .replace(/<br[ ]?\/?>/g, '\n')
        .replace(/</g, '&lt;');
      if (!file && !pasteText) {
        return;
      }

      e.preventDefault();

      if (file) {
        setAttachment(await buildAttachment(file, true));
      }
      if (pasteText) {
        insertTextAndUpdateCursor(pasteText);
      }
    }

    document.addEventListener('paste', handlePaste, false);

    return () => {
      document.removeEventListener('paste', handlePaste, false);
    };
  }, [insertTextAndUpdateCursor]);

  const handleOpenAttachMenu = useCallback(() => {
    if (canOpenAttachMenu.current) {
      setIsAttachMenuOpen(true);
    }
  }, []);

  const handleCloseAttachMenu = useCallback(() => {
    setIsAttachMenuOpen(false);
  }, []);

  const handleOpenPollCreation = useCallback(() => {
    setIsPollModalOpen(true);
  }, []);

  const handleClosePollCreation = useCallback(() => {
    setIsPollModalOpen(false);
  }, []);

  const handlePollSend = useCallback((pollSummary: ApiNewPoll) => {
    sendMessage({ pollSummary });
    setIsPollModalOpen(false);
  }, [sendMessage]);

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

  const handleStickerSelect = useCallback((sticker: ApiSticker) => {
    sendMessage({ sticker });
    setIsStickerMenuOpen(false);
  }, [sendMessage]);

  const handleGifSelect = useCallback((gif: ApiVideo) => {
    sendMessage({ gif });
    setIsStickerMenuOpen(false);
  }, [sendMessage]);

  const handleRecordVoice = useCallback(async () => {
    try {
      const stop = await voiceRecording.start((tickVolume: number) => {
        if (recordButtonRef.current) {
          const volumeLevel = ((tickVolume - 128) / 127) * 2;
          const volumeFactor = volumeLevel ? 0.25 + volumeLevel * 0.75 : 0;
          if (startRecordTimeRef.current && Date.now() % 4 === 0) {
            recordButtonRef.current.style.boxShadow = `0 0 0 ${volumeFactor * 50}px rgba(0,0,0,.15)`;
          }
          setCurrentRecordTime(Date.now());
        }
      });
      startRecordTimeRef.current = Date.now();
      setCurrentRecordTime(Date.now());

      setActiveVoiceRecording({ stop });
      canOpenAttachMenu.current = false;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }, []);

  const stopRecordingVoice = useCallback(() => {
    setActiveVoiceRecording(undefined);
    startRecordTimeRef.current = null;
    setCurrentRecordTime(undefined);
    if (recordButtonRef.current) {
      recordButtonRef.current.style.boxShadow = 'none';
    }
    setTimeout(() => {
      canOpenAttachMenu.current = true;
    }, 250);

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

    const { rawText, entities } = parseTextEntities(htmlRef.current!);

    if (!currentAttachment && !rawText) {
      return;
    }

    sendMessage({
      text: rawText,
      entities,
      attachment: currentAttachment,
    });

    setHtml('');
    setAttachment(undefined);
    setIsStickerMenuOpen(false);
  }, [activeVoiceRecording, attachment, sendMessage, stopRecordingVoice]);

  return (
    <div className="MiddleFooter">
      <AttachmentModal
        attachment={attachment}
        caption={attachment ? html : ''}
        onCaptionUpdate={setHtml}
        onSend={handleSend}
        onClear={handleClearAttachment}
      />
      <PollModal
        isOpen={isPollModalOpen}
        onClear={handleClosePollCreation}
        onSend={handlePollSend}
      />
      <div id="message-compose">
        <MessageInputReply />
        <WebPagePreview messageText={!attachment ? html : ''} />
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
            id="message-input-text"
            html={!attachment ? html : ''}
            placeholder="Message"
            onUpdate={setHtml}
            onSend={handleSend}
            shouldSetFocus={isStickerMenuOpen}
          />
          {!activeVoiceRecording && (
            <Button
              className={`${isAttachMenuOpen ? 'activated' : ''}`}
              round
              color="translucent"
              onMouseEnter={handleOpenAttachMenu}
              onFocus={handleOpenAttachMenu}
            >
              <i className="icon-attach" />
            </Button>
          )}
          {activeVoiceRecording && (
            <span className="recording-state">
              {formatVoiceRecordDuration(currentRecordTime - startRecordTimeRef.current!)}
            </span>
          )}
          <AttachMenu
            isOpen={isAttachMenuOpen}
            isPrivateChat={isPrivateChat}
            onFileSelect={handleFileSelect}
            onPollCreate={handleOpenPollCreation}
            onClose={handleCloseAttachMenu}
          />
          <StickerMenu
            isOpen={isStickerMenuOpen}
            onClose={handleCloseStickerMenu}
            onEmojiSelect={insertTextAndUpdateCursor}
            onStickerSelect={handleStickerSelect}
            onGifSelect={handleGifSelect}
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
  (global) => {
    const selectedChatId = global.chats.selectedId;
    return { isPrivateChat: !!selectedChatId && isChatPrivate(selectedChatId) };
  },
  (setGlobal, actions) => {
    const { sendMessage } = actions;
    return { sendMessage };
  },
)(MiddleFooter));
