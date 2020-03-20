import { ChangeEvent } from 'react';
import React, {
  FC, useEffect, useLayoutEffect, useRef,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';

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
} & Pick<GlobalActions, 'editLastChatMessage'>;

const MAX_INPUT_HEIGHT = 240;
const TAB_INDEX_PRIORITY_TIMEOUT = 2000;

const MessageInput: FC<IProps> = ({
  id,
  html,
  placeholder,
  selectedChatId,
  replyingTo,
  onUpdate,
  onSend,
  shouldSetFocus,
  editLastChatMessage,
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      onSend();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      editLastChatMessage();
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
        onKeyDown={handleKeyDown}
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
  (setGlobal, actions) => {
    const { editLastChatMessage } = actions;
    return { editLastChatMessage };
  },
)(MessageInput);
