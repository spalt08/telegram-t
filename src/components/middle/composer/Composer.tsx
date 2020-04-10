import React, {
  FC, memo, useCallback, useEffect, useRef, useState,
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

import { EDITABLE_INPUT_ID } from '../../../config';

import { selectChatMessage } from '../../../modules/selectors';
import { isChatPrivate } from '../../../modules/helpers';
import { formatVoiceRecordDuration } from '../../../util/dateFormat';
import focusEditableElement from '../../../util/focusEditableElement';
import parseMessageInput from './helpers/parseMessageInput';
import buildAttachment from './helpers/buildAttachment';

import useOverlay from '../../../hooks/useOverlay';
import useVoiceRecording from './hooks/useVoiceRecording';
import useClipboardPaste from './hooks/useClipboardPaste';
import useDraft from './hooks/useDraft';
import useEditing from './hooks/useEditing';

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
import usePrevious from '../../../hooks/usePrevious';

type StateProps = {
  isPrivateChat: boolean;
  editedMessage?: ApiMessage;
  chatId?: number;
  draft?: ApiFormattedText;
} & Pick<GlobalState, 'connectionState'>;

type DispatchProps = Pick<GlobalActions, 'sendMessage' | 'editMessage' | 'saveDraft' | 'clearDraft'>;

enum MainButtonState {
  Send = 'send',
  Record = 'record',
  Edit = 'edit',
}

const VOICE_RECORDING_FILENAME = 'wonderful-voice-message.ogg';
const MAX_NESTING_PARENTS = 5;

const Composer: FC<StateProps & DispatchProps> = ({
  isPrivateChat,
  editedMessage,
  chatId,
  draft,
  connectionState,
  sendMessage,
  editMessage,
  saveDraft,
  clearDraft,
}) => {
  const [html, setHtml] = useState<string>('');

  // Cache for frequently updated state
  const htmlRef = useRef<string>(html);
  useEffect(() => {
    htmlRef.current = html;
  }, [html]);

  const [attachment, setAttachment] = useState<ApiAttachment | undefined>();

  const [isAttachMenuOpen, openAttachMenu, closeAttachMenu] = useOverlay();
  const [isSymbolMenuOpen, openSymbolMenu, closeSymbolMenu] = useOverlay();
  const [isPollModalOpen, openPollModal, closePollModal] = useOverlay();
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useOverlay();

  const {
    isVoiceRecordingSupported,
    startRecordingVoice,
    stopRecordingVoice,
    activeVoiceRecording,
    currentRecordTime,
    recordButtonRef,
    startRecordTimeRef,
  } = useVoiceRecording();

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

  const resetComposer = useCallback(() => {
    setHtml('');
    setAttachment(undefined);
    closeSymbolMenu(false);
  }, [closeSymbolMenu]);

  // Handle chat change
  const prevChatId = usePrevious(chatId);
  useEffect(() => {
    if (!prevChatId || chatId === prevChatId) {
      return;
    }

    stopRecordingVoice();
    resetComposer();
  }, [chatId, prevChatId, resetComposer, stopRecordingVoice]);

  const handleEditComplete = useEditing(htmlRef, setHtml, editedMessage, resetComposer, openDeleteModal, editMessage);
  useDraft(draft, chatId, html, htmlRef, setHtml, editedMessage, saveDraft, clearDraft);
  useClipboardPaste(insertTextAndUpdateCursor, setAttachment, editedMessage);

  const handleFileSelect = useCallback(async (file: File, isQuick: boolean) => {
    setAttachment(await buildAttachment(file.name, file, isQuick));
  }, []);

  const handleClearAttachment = useCallback(() => {
    setAttachment(undefined);
  }, []);

  const handleSend = useCallback(async () => {
    if (connectionState !== 'connectionStateReady') {
      return;
    }

    let currentAttachment = attachment;

    if (activeVoiceRecording) {
      const record = await stopRecordingVoice();
      if (record) {
        const { blob, duration, waveform } = record;
        currentAttachment = await buildAttachment(
          VOICE_RECORDING_FILENAME,
          blob,
          false,
          { voice: { duration, waveform } },
        );
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
    clearDraft({ chatId, localOnly: true });
  }, [
    activeVoiceRecording, attachment, connectionState, chatId,
    sendMessage, stopRecordingVoice, resetComposer, clearDraft,
  ]);

  const handleStickerSelect = useCallback((sticker: ApiSticker) => {
    sendMessage({ sticker });
    closeSymbolMenu();
  }, [closeSymbolMenu, sendMessage]);

  const handleGifSelect = useCallback((gif: ApiVideo) => {
    sendMessage({ gif });
    closeSymbolMenu();
  }, [closeSymbolMenu, sendMessage]);

  const handlePollSend = useCallback((pollSummary: ApiNewPoll) => {
    sendMessage({ pollSummary });
    closePollModal();
  }, [closePollModal, sendMessage]);

  const mainButtonState = editedMessage
    ? MainButtonState.Edit
    : !isVoiceRecordingSupported || activeVoiceRecording || (html && !attachment)
      ? MainButtonState.Send
      : MainButtonState.Record;

  const mainButtonHandler = useCallback(() => {
    switch (mainButtonState) {
      case MainButtonState.Send:
        handleSend();
        break;
      case MainButtonState.Record:
        startRecordingVoice();
        break;
      case MainButtonState.Edit:
        handleEditComplete();
        break;
      default:
        break;
    }
  }, [mainButtonState, handleSend, startRecordingVoice, handleEditComplete]);

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
        onClear={closePollModal}
        onSend={handlePollSend}
      />
      {editedMessage && (
        <DeleteMessageModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
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
            onMouseEnter={openSymbolMenu}
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
              onMouseEnter={openAttachMenu}
              onFocus={openAttachMenu}
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
            onPollCreate={openPollModal}
            onClose={closeAttachMenu}
          />
          <SymbolMenu
            isOpen={isSymbolMenuOpen}
            onClose={closeSymbolMenu}
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

export default memo(withGlobal(
  (global): StateProps => {
    const chatId = global.chats.selectedId;
    const editingMessageId = chatId ? global.chats.editingById[chatId] : undefined;
    const editedMessage = editingMessageId ? selectChatMessage(global, chatId!, editingMessageId) : undefined;
    const { connectionState, chats: { draftsById } } = global;

    return {
      isPrivateChat: !!chatId && isChatPrivate(chatId),
      editedMessage,
      connectionState,
      chatId,
      draft: chatId ? draftsById[chatId] : undefined,
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
