import { ChangeEvent } from 'react';
import React, {
  FC, useEffect, useLayoutEffect, useRef,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { debounce } from '../../../util/schedulers';
import focusEditableElement from '../../../util/focusEditableElement';
import buildClassName from '../../../util/buildClassName';

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

const MessageInput: FC<IProps> = ({
  id, html, placeholder, selectedChatId, replyingTo, onUpdate, onSend, shouldSetFocus,
}) => {
  const inputRef = useRef<HTMLDivElement>();

  useLayoutEffect(() => {
    if (html !== undefined && html !== inputRef.current!.innerHTML) {
      inputRef.current!.innerHTML = html;
    }
    updateInputHeight();
  }, [html]);

  function focusInput() {
    focusEditableElement(inputRef.current!);
  }

  function handleChange(e: ChangeEvent<HTMLDivElement>) {
    onUpdate(e.currentTarget.innerHTML);
  }

  function updateInputHeight() {
    const input = inputRef.current!;

    if (input.scrollHeight !== input.offsetHeight) {
      input.style.height = 'auto';
      input.style.height = `${Math.min(input.scrollHeight, MAX_INPUT_HEIGHT)}px`;
    }

    input.classList.toggle('overflown', input.scrollHeight > MAX_INPUT_HEIGHT);
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();

      onSend();
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

  return (
    <div id={id}>
      <div
        ref={inputRef}
        id="editable-message-text"
        className={buildClassName('form-control custom-scroll', html.length > 0 && 'touched')}
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
