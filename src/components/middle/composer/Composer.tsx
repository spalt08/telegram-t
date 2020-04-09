import React, {
  FC, memo, useCallback, useEffect, useMemo, useRef, useState,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions, GlobalState } from '../../../global/types';
import {
  ApiAttachment,
  ApiSticker,
  ApiVideo,
  ApiNewPoll,
  ApiMessage,
  ApiFormattedText,
} from '../../../api/types';

import { selectChatMessage } from '../../../modules/selectors';
import { isChatPrivate } from '../../../modules/helpers';
import { formatVoiceRecordDuration } from '../../../util/dateFormat';
import { blobToFile, getImageDataFromFile, getVideoDataFromFile } from '../../../util/files';
import * as voiceRecording from '../../../util/voiceRecording';
import focusEditableElement from '../../../util/focusEditableElement';
import { throttle } from '../../../util/schedulers';
import parseMessageInput from './helpers/parseMessageInput';
import getMessageTextAsHtml from './helpers/getMessageTextAsHtml';
import usePrevious from '../../../hooks/usePrevious';

import DeleteMessageModal from '../../common/DeleteMessageModal.async';
import Button from '../../ui/Button';
import AttachMenu from './AttachMenu.async';
import SymbolMenu from './SymbolMenu.async';
import MessageInput from './MessageInput';
import ComposerEmbeddedMessage from './ComposerEmbeddedMessage';
import AttachmentModal from './AttachmentModal.async';
import PollModal from './PollModal.async';
import WebPagePreview from './WebPagePreview';

import './Composer.scss';
import { DRAFT_THROTTLE } from '../../../config';

type StateProps = {
  isPrivateChat: boolean;
  editedMessage?: ApiMessage;
  selectedChatId?: number;
  draft?: ApiFormattedText;
} & Pick<GlobalState, 'connectionState'>;

type DispatchProps = Pick<GlobalActions, 'sendMessage' | 'editMessage' | 'saveDraft' | 'clearDraft'>;

type ActiveVoiceRecording = { stop: () => Promise<voiceRecording.Result> } | undefined;

enum MainButtonState {
  Send = 'send',
  Record = 'record',
  Edit = 'edit',
}

const CLIPBOARD_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif'];
const MAX_QUICK_FILE_SIZE = 10 * 1024 ** 2; // 10 MB
const VOICE_RECORDING_SUPPORTED = voiceRecording.isSupported();
const VOICE_RECORDING_FILENAME = 'wonderful-voice-message.ogg';
const EDITABLE_INPUT_ID = 'editable-message-text';
const MAX_NESTING_PARENTS = 5;
const MAX_MESSAGE_LENGTH = 4096;

// Used to avoid running throttled callbacks when chat changes.
let currentChatId: number | undefined;

const Composer: FC<StateProps & DispatchProps> = ({
  isPrivateChat,
  editedMessage,
  selectedChatId,
  draft,
  connectionState,
  sendMessage,
  editMessage,
  saveDraft,
  clearDraft,
}) => {
  const [html, setHtml] = useState<string>('');
  const htmlRef = useRef<string>(html);

  const [attachment, setAttachment] = useState<ApiAttachment | undefined>();
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const canOpenAttachMenu = useRef(true);

  const [isSymbolMenuOpen, setIsSymbolMenuOpen] = useState(false);

  const recordButtonRef = useRef<HTMLButtonElement>();
  const [activeVoiceRecording, setActiveVoiceRecording] = useState<ActiveVoiceRecording>();
  const startRecordTimeRef = useRef<number>();
  const [currentRecordTime, setCurrentRecordTime] = useState();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const mainButtonState = editedMessage
    ? MainButtonState.Edit
    : !VOICE_RECORDING_SUPPORTED || activeVoiceRecording || (html && !attachment)
      ? MainButtonState.Send
      : MainButtonState.Record;

  const updateDraft = useCallback((chatId: number) => {
    if (htmlRef.current.length && !editedMessage) {
      saveDraft({ chatId, draft: parseMessageInput(htmlRef.current!) });
    } else {
      clearDraft({ chatId });
    }
  }, [clearDraft, editedMessage, saveDraft]);

  // Cache for frequently updated state
  useEffect(() => {
    htmlRef.current = html;
  }, [html]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const runThrottledForSaveDraft = useMemo(() => throttle((cb) => cb(), DRAFT_THROTTLE, false), [selectedChatId]);

  // Update draft when input changes
  const prevHtml = usePrevious(html);
  currentChatId = selectedChatId;
  useEffect(() => {
    if (!selectedChatId || prevHtml === html) {
      return;
    }

    if (html.length) {
      runThrottledForSaveDraft(() => {
        if (currentChatId !== selectedChatId) {
          return;
        }

        updateDraft(selectedChatId);
      });
    } else {
      updateDraft(selectedChatId);
    }
  }, [html, prevHtml, runThrottledForSaveDraft, selectedChatId, updateDraft]);

  // Handle editing message
  useEffect(() => {
    if (!editedMessage) {
      setHtml('');
      return;
    }

    setHtml(getMessageTextAsHtml(editedMessage.content.text));

    requestAnimationFrame(() => {
      const messageInput = document.getElementById(EDITABLE_INPUT_ID)!;
      focusEditableElement(messageInput, true);
    });
  }, [editedMessage]);

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

  // Subscribe and handle `window.blur`
  useEffect(() => {
    function handleBlur() {
      if (selectedChatId) {
        updateDraft(selectedChatId);
      }
    }

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [selectedChatId, updateDraft]);

  // Subscribe and handle `document.onpaste`
  useEffect(() => {
    async function handlePaste(e: ClipboardEvent) {
      if (!e.clipboardData) {
        return;
      }

      const input = document.getElementById('editable-message-text');
      if (input !== document.activeElement) {
        return;
      }

      const { items } = e.clipboardData;
      const media = Array.from(items).find((item) => CLIPBOARD_ACCEPTED_TYPES.includes(item.type));
      const file = media && media.getAsFile();
      const pastedText = e.clipboardData.getData('text').substring(0, MAX_MESSAGE_LENGTH);

      if (!file && !pastedText) {
        return;
      }

      e.preventDefault();

      if (file && !editedMessage) {
        setAttachment(await buildAttachment(file, true));
      }

      if (pastedText) {
        insertTextAndUpdateCursor(pastedText);
      }
    }

    document.addEventListener('paste', handlePaste, false);

    return () => {
      document.removeEventListener('paste', handlePaste, false);
    };
  }, [insertTextAndUpdateCursor, editedMessage]);

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

  const handleOpenSymbolMenu = useCallback(() => {
    setIsSymbolMenuOpen(true);
  }, []);

  const handleCloseSymbolMenu = useCallback(() => {
    setIsSymbolMenuOpen(false);
  }, []);

  const handleStickerSelect = useCallback((sticker: ApiSticker) => {
    sendMessage({ sticker });
    setIsSymbolMenuOpen(false);
  }, [sendMessage]);

  const handleGifSelect = useCallback((gif: ApiVideo) => {
    sendMessage({ gif });
    setIsSymbolMenuOpen(false);
  }, [sendMessage]);

  const handleDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

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
    if (!activeVoiceRecording) {
      return undefined;
    }

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

  const resetComposer = useCallback(() => {
    setHtml('');
    setAttachment(undefined);
    setIsSymbolMenuOpen(false);
  }, []);

  // Handle chat change
  const prevSelectedChatId = usePrevious(selectedChatId);
  useEffect(() => {
    if (!prevSelectedChatId || selectedChatId === prevSelectedChatId) {
      return;
    }

    updateDraft(prevSelectedChatId);
    stopRecordingVoice();
    resetComposer();

    if (draft) {
      setHtml(getMessageTextAsHtml(draft));

      requestAnimationFrame(() => {
        const messageInput = document.getElementById(EDITABLE_INPUT_ID)!;
        focusEditableElement(messageInput, true);
      });
    }
  }, [draft, prevSelectedChatId, resetComposer, selectedChatId, stopRecordingVoice, updateDraft]);

  const handleSend = useCallback(async () => {
    if (connectionState !== 'connectionStateReady') {
      return;
    }

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

    const { text, entities } = parseMessageInput(htmlRef.current!);

    if (!currentAttachment && !text) {
      return;
    }

    sendMessage({
      text,
      entities,
      attachment: currentAttachment,
    });

    resetComposer();
    clearDraft({ chatId: selectedChatId, localOnly: true });
  }, [
    activeVoiceRecording, attachment, connectionState, selectedChatId,
    sendMessage, stopRecordingVoice, resetComposer, clearDraft,
  ]);

  const handleEditComplete = useCallback(() => {
    const { text, entities } = parseMessageInput(htmlRef.current!);

    if (!editedMessage) {
      return;
    }

    if (!text) {
      setIsDeleteModalOpen(true);
      return;
    }

    editMessage({
      messageId: editedMessage.id,
      text,
      entities,
    });

    resetComposer();
  }, [editedMessage, editMessage, resetComposer]);

  const mainButtonHandler = useCallback(() => {
    switch (mainButtonState) {
      case MainButtonState.Send:
        handleSend();
        break;
      case MainButtonState.Record:
        handleRecordVoice();
        break;
      case MainButtonState.Edit:
        handleEditComplete();
        break;
      default:
        break;
    }
  }, [mainButtonState, handleSend, handleRecordVoice, handleEditComplete]);

  return (
    <div className="Composer">
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
      {editedMessage && (
        <DeleteMessageModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteModalClose}
          message={editedMessage}
        />
      )}
      <div id="message-compose">
        <ComposerEmbeddedMessage />
        <WebPagePreview messageText={!attachment ? html : ''} />
        <div className="message-input-wrapper">
          <Button
            className={`${isSymbolMenuOpen ? 'activated' : ''}`}
            round
            color="translucent"
            onMouseEnter={handleOpenSymbolMenu}
          >
            <i className="icon-smile" />
          </Button>
          <MessageInput
            id="message-input-text"
            html={!attachment ? html : ''}
            placeholder="Message"
            onUpdate={setHtml}
            onSend={mainButtonState === MainButtonState.Edit ? handleEditComplete : handleSend}
            shouldSetFocus={isSymbolMenuOpen}
          />
          {!activeVoiceRecording && !editedMessage && (
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
          <SymbolMenu
            isOpen={isSymbolMenuOpen}
            onClose={handleCloseSymbolMenu}
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
        className={`${mainButtonState} ${activeVoiceRecording ? 'recording' : ''}`}
        onClick={mainButtonHandler}
      >
        <i className="icon-send" />
        <i className="icon-microphone-alt" />
        <i className="icon-check" />
      </Button>
    </div>
  );
};

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
  (global): StateProps => {
    const selectedChatId = global.chats.selectedId;
    const editingMessageId = selectedChatId ? global.chats.editingById[selectedChatId] : undefined;
    const editedMessage = editingMessageId ? selectChatMessage(global, selectedChatId!, editingMessageId) : undefined;
    const { connectionState, chats: { draftsById } } = global;

    return {
      isPrivateChat: !!selectedChatId && isChatPrivate(selectedChatId),
      editedMessage,
      connectionState,
      selectedChatId,
      draft: selectedChatId ? draftsById[selectedChatId] : undefined,
    };
  },
  (setGlobal, actions): DispatchProps => {
    const {
      sendMessage, editMessage, saveDraft, clearDraft,
    } = actions;
    return {
      sendMessage, editMessage, saveDraft, clearDraft,
    };
  },
)(Composer));
