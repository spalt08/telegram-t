import { ChangeEvent } from 'react';
import React, {
  FC, useEffect, useRef, memo,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ISettings } from '../../../types';

import { debounce } from '../../../util/schedulers';
import focusEditableElement from '../../../util/focusEditableElement';
import buildClassName from '../../../util/buildClassName';
import { pick } from '../../../util/iteratees';
import useLayoutEffectWithPrevDeps from '../../../hooks/useLayoutEffectWithPrevDeps';
import { EDITABLE_INPUT_ID } from '../../../config';
import { IS_TOUCH_ENV } from '../../../util/environment';

type OwnProps = {
  id: string;
  html: string;
  placeholder: string;
  shouldSetFocus: boolean;
  shouldSupressFocus?: boolean;
  onUpdate: (html: string) => void;
  onSupressedFocus?: () => void;
  onSend: Function;
};

type StateProps = {
  selectedChatId?: number;
  replyingTo?: number;
  messageSendKeyCombo?: ISettings['messageSendKeyCombo'];
};

type DispatchProps = Pick<GlobalActions, 'editLastChatMessage'>;

const MAX_INPUT_HEIGHT = 240;
const TAB_INDEX_PRIORITY_TIMEOUT = 2000;

const MessageInput: FC<OwnProps & StateProps & DispatchProps> = ({
  id,
  html,
  placeholder,
  shouldSetFocus,
  shouldSupressFocus,
  onUpdate,
  onSupressedFocus,
  onSend,
  selectedChatId,
  replyingTo,
  messageSendKeyCombo,
  editLastChatMessage,
}) => {
  const inputRef = useRef<HTMLDivElement>();

  useLayoutEffectWithPrevDeps(([prevHtml]) => {
    if (html !== inputRef.current!.innerHTML) {
      inputRef.current!.innerHTML = html;
    }

    if (prevHtml !== undefined && prevHtml !== html) {
      updateInputHeight();
    }
  }, [html]);

  function focusInput() {
    focusEditableElement(inputRef.current!);
  }

  function handleChange(e: ChangeEvent<HTMLDivElement>) {
    onUpdate(e.currentTarget.innerHTML);
  }

  function updateInputHeight() {
    const input = inputRef.current!;

    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, MAX_INPUT_HEIGHT)}px`;
    input.classList.toggle('overflown', input.scrollHeight > MAX_INPUT_HEIGHT);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (
        (messageSendKeyCombo === 'enter' && !e.shiftKey)
        || (messageSendKeyCombo === 'ctrl-enter' && e.ctrlKey)
      ) {
        e.preventDefault();

        onSend();
      }
    }
    if (e.key === 'ArrowUp' && !html.length) {
      e.preventDefault();
      editLastChatMessage();
    }
  }

  useEffect(() => {
    if (!IS_TOUCH_ENV) {
      focusInput();
    }
  }, [selectedChatId, replyingTo, shouldSetFocus]);

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

  const className = buildClassName(
    'form-control custom-scroll',
    html.length > 0 && 'touched',
    shouldSupressFocus && 'focus-disabled',
  );

  return (
    <div id={id} onClick={shouldSupressFocus ? onSupressedFocus : undefined}>
      <div
        ref={inputRef}
        id={EDITABLE_INPUT_ID}
        className={className}
        contentEditable
        onClick={focusInput}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <span className="placeholder-text">{placeholder}</span>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const { chats: { selectedId: selectedChatId, replyingToById } } = global;
    const { messageSendKeyCombo } = global.settings.byKey;

    if (!selectedChatId) {
      return {};
    }

    return {
      selectedChatId,
      replyingTo: replyingToById[selectedChatId],
      messageSendKeyCombo,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['editLastChatMessage']),
)(MessageInput));
