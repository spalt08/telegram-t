import { ChangeEvent } from 'react';
import React, { FC, useEffect, useRef } from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../store/types';

import { debounce } from '../../../util/schedulers';

type IProps = {
  selectedChatId?: number;
  replyingTo?: number;
  messageText: string;
  onUpdate: Function;
  onSend: Function;
} & Pick<GlobalActions, 'setChatReplyingTo'>;

const MAX_INPUT_HEIGHT = 240;
const TAB_INDEX_PRIORITY_TIMEOUT = 2000;

let isJustSent = false;

const MessageInput: FC<IProps> = ({
  selectedChatId, replyingTo, messageText, onUpdate, onSend, setChatReplyingTo,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>();

  function focusInput() {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    if (isJustSent) {
      isJustSent = false;
      return;
    }

    const { currentTarget } = e;
    onUpdate(currentTarget.value);
    if (currentTarget.scrollHeight !== currentTarget.offsetHeight) {
      currentTarget.style.height = 'auto';
      currentTarget.style.height = `${Math.min(currentTarget.scrollHeight, MAX_INPUT_HEIGHT)}px`;
    }

    currentTarget.style.overflowY = currentTarget.scrollHeight <= MAX_INPUT_HEIGHT ? 'hidden' : 'auto';
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const { currentTarget } = e;

    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();

      onSend();
      currentTarget.removeAttribute('style');

      setChatReplyingTo({ chatId: selectedChatId, messageId: undefined });

      // Disable `onChange` following immediately after `onKeyPress`.
      isJustSent = true;
      setTimeout(() => {
        isJustSent = false;
      }, 0);
    }
  }

  useEffect(focusInput, [selectedChatId, replyingTo]);

  useEffect(() => {
    const captureFirstTab = debounce((e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        requestAnimationFrame(focusInput);
      }
    }, TAB_INDEX_PRIORITY_TIMEOUT, true, false);

    document.addEventListener('keydown', captureFirstTab, false);

    return () => {
      document.removeEventListener('keydown', captureFirstTab, false);
    };
  }, []);

  return (
    <textarea
      ref={inputRef}
      id="message-input-text"
      className="form-control custom-scroll"
      placeholder="Message"
      rows={1}
      autoComplete="off"
      onChange={handleChange}
      onKeyPress={handleKeyPress}
      value={messageText}
    />
  );
};

export default withGlobal(
  (global) => {
    const { chats: { selectedId: selectedChatId, replyingToById } } = global;

    if (!selectedChatId) {
      return {};
    }

    return {
      selectedChatId,
      replyingTo: replyingToById[selectedChatId],
    };
  },
  (setGlobal, actions) => {
    const { setChatReplyingTo } = actions;
    return { setChatReplyingTo };
  },
)(MessageInput);
