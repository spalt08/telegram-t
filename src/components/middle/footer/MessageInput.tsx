import { ChangeEvent } from 'react';
import React, {
  FC, useEffect, useLayoutEffect, useRef
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { debounce } from '../../../util/schedulers';

type IProps = {
  selectedChatId?: number;
  replyingTo?: number;
  text: string;
  isStickerMenuOpen: boolean;
  onUpdate: Function;
  onSend: Function;
};

const MAX_INPUT_HEIGHT = 240;
const TAB_INDEX_PRIORITY_TIMEOUT = 2000;

let isJustSent = false;

const MessageInput: FC<IProps> = ({
  selectedChatId, replyingTo, text, onUpdate, onSend, isStickerMenuOpen,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>();

  useLayoutEffect(() => {
    const input = inputRef.current!;

    if (text) {
      if (input.scrollHeight !== input.offsetHeight) {
        input.style.height = 'auto';
        input.style.height = `${Math.min(input.scrollHeight, MAX_INPUT_HEIGHT)}px`;
      }

      input.style.overflowY = input.scrollHeight <= MAX_INPUT_HEIGHT ? 'hidden' : 'auto';
    } else {
      input.removeAttribute('style');
    }
  }, [text]);

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

    onUpdate(e.currentTarget.value);
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();

      onSend();

      // Disable `onChange` following immediately after `onKeyPress`.
      isJustSent = true;
      setTimeout(() => {
        isJustSent = false;
      }, 0);
    }
  }

  useEffect(focusInput, [selectedChatId, replyingTo, isStickerMenuOpen, text]);

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
      value={text}
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
)(MessageInput);
