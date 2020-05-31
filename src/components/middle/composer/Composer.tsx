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
  ApiChat,
} from '../../../api/types';

import { EDITABLE_INPUT_ID } from '../../../config';
import { IS_EMOJI_SUPPORTED, IS_VOICE_RECORDING_SUPPORTED } from '../../../util/environment';
import { selectChatMessage, selectChat, selectIsChatWithBot } from '../../../modules/selectors';
import { getAllowedAttachmentOptions, getChatSlowModeOptions } from '../../../modules/helpers';
import { formatVoiceRecordDuration } from '../../../util/dateFormat';
import focusEditableElement from '../../../util/focusEditableElement';
import parseMessageInput from './helpers/parseMessageInput';
import buildAttachment from './helpers/buildAttachment';
import renderText from '../../common/helpers/renderText';
import insertHtmlInSelection from '../../../util/insertHtmlInSelection';
import { pick } from '../../../util/iteratees';

import useOverlay from '../../../hooks/useOverlay';
import useVoiceRecording from './hooks/useVoiceRecording';
import useClipboardPaste from './hooks/useClipboardPaste';
import useDraft from './hooks/useDraft';
import useEditing from './hooks/useEditing';
import usePrevious from '../../../hooks/usePrevious';

import DeleteMessageModal from '../../common/DeleteMessageModal.async';
import Button from '../../ui/Button';
import ResponsiveHoverButton from '../../ui/ResponsiveHoverButton';
import AttachMenu from './AttachMenu.async';
import SymbolMenu from './SymbolMenu.async';
import MessageInput from './MessageInput';
import ComposerEmbeddedMessage from './ComposerEmbeddedMessage';
import AttachmentModal from './AttachmentModal.async';
import PollModal from './PollModal.async';
import WebPagePreview from './WebPagePreview';

import './Composer.scss';

type StateProps = {
  editedMessage?: ApiMessage;
  chatId?: number;
  chat?: ApiChat;
  draft?: ApiFormattedText;
  isChatWithBot?: boolean;
} & Pick<GlobalState, 'connectionState'>;

type DispatchProps = Pick<GlobalActions, (
  'sendMessage' | 'editMessage' | 'saveDraft' |
  'clearDraft' | 'showError'
)>;

enum MainButtonState {
  Send = 'send',
  Record = 'record',
  Edit = 'edit',
}

const VOICE_RECORDING_FILENAME = 'wonderful-voice-message.ogg';
const MAX_NESTING_PARENTS = 5;
// When voice recording is active, composer placeholder will hide to prevent overlapping
const SCREEN_WIDTH_TO_HIDE_PLACEHOLDER = 600; // px

const Composer: FC<StateProps & DispatchProps> = ({
  editedMessage,
  chatId,
  draft,
  chat,
  connectionState,
  isChatWithBot,
  sendMessage,
  editMessage,
  saveDraft,
  clearDraft,
  showError,
}) => {
  const [html, setHtml] = useState<string>('');
  const lastMessageSendTimeSeconds = useRef<number>();

  // Cache for frequently updated state
  const htmlRef = useRef<string>(html);
  useEffect(() => {
    htmlRef.current = html;
  }, [html]);

  useEffect(() => {
    lastMessageSendTimeSeconds.current = null;
  }, [chatId]);

  const [attachment, setAttachment] = useState<ApiAttachment | undefined>();

  const [isAttachMenuOpen, openAttachMenu, closeAttachMenu] = useOverlay();
  const [isSymbolMenuOpen, openSymbolMenu, closeSymbolMenu] = useOverlay();
  const [isPollModalOpen, openPollModal, closePollModal] = useOverlay();
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useOverlay();

  const {
    startRecordingVoice,
    stopRecordingVoice,
    activeVoiceRecording,
    currentRecordTime,
    recordButtonRef,
    startRecordTimeRef,
  } = useVoiceRecording();

  const allowedAttachmentOptions = getAllowedAttachmentOptions(chat, isChatWithBot);
  const slowMode = getChatSlowModeOptions(chat);

  const insertTextAndUpdateCursor = useCallback((text: string) => {
    const selection = window.getSelection()!;
    const messageInput = document.getElementById(EDITABLE_INPUT_ID)!;
    const newHtml = renderText(text, ['escape_html', 'emoji_html', 'br_html'])
      .join('')
      .replace(/\u200b+/g, '\u200b');

    if (selection.rangeCount) {
      const selectionRange = selection.getRangeAt(0);
      if (isSelectionInsideInput(selectionRange)) {
        if (IS_EMOJI_SUPPORTED) {
          // Insertion will trigger `onChange` in MessageInput, so no need to setHtml in state
          document.execCommand('insertText', false, text);
        } else {
          insertHtmlInSelection(newHtml);
          messageInput.dispatchEvent(new Event('input'));
        }

        return;
      }

      setHtml(`${htmlRef.current!}${newHtml}`);

      // If selection is outside of input, set cursor at the end of input
      requestAnimationFrame(() => {
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

    if (slowMode) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const secondsSinceLastMessage = lastMessageSendTimeSeconds.current
        && Math.floor(nowSeconds - lastMessageSendTimeSeconds.current);
      const nextSendDateNotReached = slowMode.nextSendDate && slowMode.nextSendDate > nowSeconds;

      if (
        (secondsSinceLastMessage && secondsSinceLastMessage < slowMode.seconds)
        || nextSendDateNotReached
      ) {
        const secondsRemaining = nextSendDateNotReached
          ? slowMode.nextSendDate! - nowSeconds
          : slowMode.seconds - secondsSinceLastMessage!;
        showError({
          error: {
            message: `A wait of ${secondsRemaining} seconds is required before sending another message in this chat`,
          },
        });
        return;
      }
    }

    sendMessage({
      text,
      entities,
      attachment: currentAttachment,
    });

    lastMessageSendTimeSeconds.current = Math.floor(Date.now() / 1000);

    resetComposer();
    clearDraft({ chatId, localOnly: true });
  }, [
    activeVoiceRecording, attachment, connectionState, chatId, slowMode,
    sendMessage, stopRecordingVoice, resetComposer, clearDraft, showError,
  ]);

  const handleStickerSelect = useCallback((sticker: ApiSticker) => {
    sendMessage({ sticker });
    closeSymbolMenu();
  }, [closeSymbolMenu, sendMessage]);

  const handleGifSelect = useCallback((gif: ApiVideo) => {
    sendMessage({ gif });
    closeSymbolMenu();
  }, [closeSymbolMenu, sendMessage]);

  const handlePollSend = useCallback((poll: ApiNewPoll) => {
    sendMessage({ poll });
    closePollModal();
  }, [closePollModal, sendMessage]);

  const mainButtonState = editedMessage
    ? MainButtonState.Edit
    : !IS_VOICE_RECORDING_SUPPORTED || activeVoiceRecording || (html && !attachment)
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

  const areVoiceMessagesNotAllowed = mainButtonState === MainButtonState.Record
    && !allowedAttachmentOptions.canAttachMedia;

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
        {allowedAttachmentOptions.canAttachEmbedLinks && (
          <WebPagePreview messageText={!attachment ? html : ''} />
        )}
        <div className="message-input-wrapper">
          <ResponsiveHoverButton
            className={`${isSymbolMenuOpen ? 'activated' : ''}`}
            round
            color="translucent"
            onActivate={openSymbolMenu}
          >
            <i className="icon-smile" />
          </ResponsiveHoverButton>
          <MessageInput
            id="message-input-text"
            html={!attachment ? html : ''}
            placeholder={window.innerWidth < SCREEN_WIDTH_TO_HIDE_PLACEHOLDER && !activeVoiceRecording ? 'Message' : ''}
            onUpdate={setHtml}
            onSend={mainButtonState === MainButtonState.Edit ? handleEditComplete : handleSend}
            shouldSetFocus={isSymbolMenuOpen}
          />
          {!activeVoiceRecording && !editedMessage && (
            <ResponsiveHoverButton
              className={`${isAttachMenuOpen ? 'activated' : ''}`}
              round
              color="translucent"
              onActivate={openAttachMenu}
            >
              <i className="icon-attach" />
            </ResponsiveHoverButton>
          )}
          {activeVoiceRecording && currentRecordTime && (
            <span className="recording-state">
              {formatVoiceRecordDuration(currentRecordTime - startRecordTimeRef.current!)}
            </span>
          )}
          <AttachMenu
            isOpen={isAttachMenuOpen}
            allowedAttachmentOptions={allowedAttachmentOptions}
            onFileSelect={handleFileSelect}
            onPollCreate={openPollModal}
            onClose={closeAttachMenu}
          />
          <SymbolMenu
            isOpen={isSymbolMenuOpen}
            allowedAttachmentOptions={allowedAttachmentOptions}
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
        ripple
        color="secondary"
        className={`${mainButtonState} ${activeVoiceRecording ? 'recording' : ''}`}
        disabled={areVoiceMessagesNotAllowed}
        ariaLabel={areVoiceMessagesNotAllowed ? 'Posting media content is not allowed in this group.' : undefined}
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

    const chat = chatId ? selectChat(global, chatId) : undefined;
    const isChatWithBot = chatId ? selectIsChatWithBot(global, chatId) : undefined;

    return {
      editedMessage,
      connectionState,
      chatId,
      draft: chatId ? draftsById[chatId] : undefined,
      chat,
      isChatWithBot,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'sendMessage',
    'editMessage',
    'saveDraft',
    'clearDraft',
    'showError',
  ]),
)(Composer));
