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
import { IS_EMOJI_SUPPORTED, IS_VOICE_RECORDING_SUPPORTED, IS_MOBILE_SCREEN } from '../../../util/environment';
import { selectChatMessage, selectChat, selectIsChatWithBot } from '../../../modules/selectors';
import { getAllowedAttachmentOptions, getChatSlowModeOptions } from '../../../modules/helpers';
import { formatVoiceRecordDuration } from '../../../util/dateFormat';
import focusEditableElement from '../../../util/focusEditableElement';
import parseMessageInput from './helpers/parseMessageInput';
import buildAttachment from './helpers/buildAttachment';
import renderText from '../../common/helpers/renderText';
import insertHtmlInSelection from '../../../util/insertHtmlInSelection';
import deleteLastCharacterOutsideSelection from '../../../util/deleteLastCharacterOutsideSelection';
import { pick } from '../../../util/iteratees';
import buildClassName from '../../../util/buildClassName';

import useFlag from '../../../hooks/useFlag';
import useVoiceRecording from './hooks/useVoiceRecording';
import useClipboardPaste from './hooks/useClipboardPaste';
import useDraft from './hooks/useDraft';
import useEditing from './hooks/useEditing';
import usePrevious from '../../../hooks/usePrevious';

import DeleteMessageModal from '../../common/DeleteMessageModal.async';
import Button from '../../ui/Button';
import ResponsiveHoverButton from '../../ui/ResponsiveHoverButton';
import Spinner from '../../ui/Spinner';
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
  'clearDraft' | 'showError' | 'setStickerSearchQuery' | 'setGifSearchQuery'
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

const MOBILE_KEYBOARD_HIDE_DELAY_MS = 100;

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
  setStickerSearchQuery,
  setGifSearchQuery,
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

  const [attachments, setAttachments] = useState<ApiAttachment[]>([]);

  const [isAttachMenuOpen, openAttachMenu, closeAttachMenu] = useFlag();
  const [isSymbolMenuOpen, openSymbolMenu, closeSymbolMenu] = useFlag();
  const [isPollModalOpen, openPollModal, closePollModal] = useFlag();
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useFlag();
  const [isSymbolMenuLoaded, onSymbolMenuLoadingComplete] = useFlag();

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
    } else if (IS_MOBILE_SCREEN) {
      setHtml(`${htmlRef.current!}${newHtml}`);
    }
  }, []);

  const removeSymbol = useCallback(() => {
    const selection = window.getSelection()!;

    if (selection.rangeCount) {
      const selectionRange = selection.getRangeAt(0);
      if (isSelectionInsideInput(selectionRange)) {
        document.execCommand('delete', false);
        return;
      }
    }

    setHtml(deleteLastCharacterOutsideSelection(htmlRef.current!));
  }, []);

  const resetComposer = useCallback(() => {
    setHtml('');
    setAttachments([]);
    closeSymbolMenu();
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
  useClipboardPaste(insertTextAndUpdateCursor, setAttachments, editedMessage);

  const handleFileSelect = useCallback(async (files: File[], isQuick: boolean) => {
    setAttachments(await Promise.all(files.map((file) => buildAttachment(file.name, file, isQuick))));
  }, []);

  const handleClearAttachment = useCallback(() => {
    setAttachments([]);
  }, []);

  const handleSend = useCallback(async () => {
    if (connectionState !== 'connectionStateReady') {
      return;
    }

    let currentAttachments = attachments;

    if (activeVoiceRecording) {
      const record = await stopRecordingVoice();
      if (record) {
        const { blob, duration, waveform } = record;
        currentAttachments = [await buildAttachment(
          VOICE_RECORDING_FILENAME,
          blob,
          false,
          { voice: { duration, waveform } },
        )];
      }
    }

    const { text, entities } = parseMessageInput(htmlRef.current!);

    if (!currentAttachments.length && !text) {
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
            isSlowMode: true,
          },
        });

        const messageInput = document.getElementById(EDITABLE_INPUT_ID)!;
        messageInput.blur();

        return;
      }
    }

    sendMessage({
      text,
      entities,
      attachments: currentAttachments,
    });

    lastMessageSendTimeSeconds.current = Math.floor(Date.now() / 1000);

    resetComposer();
    clearDraft({ chatId, localOnly: true });
  }, [
    activeVoiceRecording, attachments, connectionState, chatId, slowMode,
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

  const handleSearchOpen = useCallback((type: 'stickers' | 'gifs') => {
    if (type === 'stickers') {
      setStickerSearchQuery({ query: '' });
      setGifSearchQuery({ query: undefined });
    } else {
      setGifSearchQuery({ query: '' });
      setStickerSearchQuery({ query: undefined });
    }
  }, [setStickerSearchQuery, setGifSearchQuery]);

  const handleSymbolMenuOpen = useCallback(() => {
    const messageInput = document.getElementById(EDITABLE_INPUT_ID)!;

    if (!IS_MOBILE_SCREEN || messageInput !== document.activeElement) {
      openSymbolMenu();
      return;
    }

    messageInput.blur();
    setTimeout(() => {
      openSymbolMenu();
    }, MOBILE_KEYBOARD_HIDE_DELAY_MS);
  }, [openSymbolMenu]);

  const handleInputFocus = useCallback(() => {
    closeSymbolMenu();
  }, [closeSymbolMenu]);

  const mainButtonState = editedMessage
    ? MainButtonState.Edit
    : !IS_VOICE_RECORDING_SUPPORTED || activeVoiceRecording || (html && !attachments.length)
      ? MainButtonState.Send
      : MainButtonState.Record;

  const mainButtonHandler = useCallback(() => {
    closeSymbolMenu();
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
  }, [mainButtonState, handleSend, startRecordingVoice, handleEditComplete, closeSymbolMenu]);

  const areVoiceMessagesNotAllowed = mainButtonState === MainButtonState.Record
    && !allowedAttachmentOptions.canAttachMedia;

  let sendButtonAriaLabel = 'Send message';
  switch (mainButtonState) {
    case MainButtonState.Edit:
      sendButtonAriaLabel = 'Save edited message';
      break;
    case MainButtonState.Record:
      sendButtonAriaLabel = areVoiceMessagesNotAllowed
        ? 'Posting media content is not allowed in this group.'
        : 'Record a voice message';
  }

  const symbolMenuButtonClassName = buildClassName(
    'mobile-symbol-menu-button',
    isSymbolMenuLoaded
      ? isSymbolMenuOpen && 'menu-opened'
      : isSymbolMenuOpen && 'is-loading',
  );

  return (
    <div className="Composer">
      <AttachmentModal
        attachments={attachments}
        caption={attachments.length ? html : ''}
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
          <WebPagePreview messageText={!attachments.length ? html : ''} />
        )}
        <div className="message-input-wrapper">
          {IS_MOBILE_SCREEN ? (
            <Button
              className={symbolMenuButtonClassName}
              round
              color="translucent"
              onClick={isSymbolMenuOpen ? closeSymbolMenu : handleSymbolMenuOpen}
              ariaLabel="Choose emoji, sticker or GIF"
            >
              <i className="icon-smile" />
              <i className="icon-keyboard" />
              <Spinner color="gray" />
            </Button>
          ) : (
            <ResponsiveHoverButton
              className={`${isSymbolMenuOpen ? 'activated' : ''}`}
              round
              faded
              color="translucent"
              onActivate={openSymbolMenu}
              ariaLabel="Choose emoji, sticker or GIF"
            >
              <i className="icon-smile" />
            </ResponsiveHoverButton>
          )}
          <MessageInput
            id="message-input-text"
            html={!attachments.length ? html : ''}
            placeholder={window.innerWidth < SCREEN_WIDTH_TO_HIDE_PLACEHOLDER && !activeVoiceRecording ? 'Message' : ''}
            onUpdate={setHtml}
            onSend={mainButtonState === MainButtonState.Edit ? handleEditComplete : handleSend}
            shouldSetFocus={isSymbolMenuOpen}
            shouldSupressFocus={IS_MOBILE_SCREEN && isSymbolMenuOpen}
            onSupressedFocus={handleInputFocus}
          />
          {!activeVoiceRecording && !editedMessage && (
            <ResponsiveHoverButton
              className={`${isAttachMenuOpen ? 'activated' : ''}`}
              round
              faded
              color="translucent"
              onActivate={openAttachMenu}
              ariaLabel="Add an attachment"
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
            onLoad={onSymbolMenuLoadingComplete}
            onClose={closeSymbolMenu}
            onEmojiSelect={insertTextAndUpdateCursor}
            onStickerSelect={handleStickerSelect}
            onGifSelect={handleGifSelect}
            onRemoveSymbol={removeSymbol}
            onSearchOpen={handleSearchOpen}
          />
        </div>
      </div>
      {activeVoiceRecording && (
        <Button
          round
          color="danger"
          className="cancel"
          onClick={stopRecordingVoice}
          ariaLabel="Cancel voice recording"
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
        ariaLabel={sendButtonAriaLabel}
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
    'setStickerSearchQuery',
    'setGifSearchQuery',
  ]),
)(Composer));
