import { ChangeEvent } from 'react';
import React, {
  FC, useEffect, useLayoutEffect, useRef,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { debounce } from '../../../util/schedulers';
import focusEditableElement from '../../../util/focusEditableElement';

type IProps = {
  id: string;
  html: string;
  placeholder: string;
  selectedChatId?: number;
  replyingTo?: number;
  shouldSetFocus: boolean;
  onUpdate: (html: string) => void;
  onSend: Function;
};

const MAX_INPUT_HEIGHT = 240;
const TAB_INDEX_PRIORITY_TIMEOUT = 2000;

let isJustSent = false;

const MessageInput: FC<IProps> = ({
  id, html, placeholder, selectedChatId, replyingTo, onUpdate, onSend, shouldSetFocus,
}) => {
  const inputRef = useRef<HTMLDivElement>();

  useLayoutEffect(() => {
    if (!inputRef.current) {
      return;
    }
    if (html !== undefined && html !== inputRef.current.innerHTML) {
      inputRef.current.innerHTML = html;
    }
    updateInputHeight();
  }, [html]);

  function focusInput() {
    if (inputRef.current) {
      focusEditableElement(inputRef.current);
    }
  }

  function handleChange(e: ChangeEvent<HTMLDivElement>) {
    if (isJustSent) {
      isJustSent = false;
      return;
    }

    const { currentTarget } = e;
    onUpdate(currentTarget.innerHTML);
  }

  function updateInputHeight() {
    if (!inputRef.current) {
      return;
    }
    if (inputRef.current.scrollHeight !== inputRef.current.offsetHeight) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, MAX_INPUT_HEIGHT)}px`;
    }

    inputRef.current.classList.toggle('overflown', inputRef.current.scrollHeight > MAX_INPUT_HEIGHT);
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLDivElement>) {
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

  useEffect(focusInput, [selectedChatId, replyingTo, shouldSetFocus]);

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

  const inputClassNames = ['form-control', 'custom-scroll'];
  if (html.length) {
    inputClassNames.push('touched');
  }

  return (
    <div id={id}>
      <div
        ref={inputRef}
        id="editable-message-text"
        className={inputClassNames.join(' ')}
        contentEditable
        onClick={focusInput}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />
      <span className="placeholder-text">{placeholder}</span>
    </div>
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
