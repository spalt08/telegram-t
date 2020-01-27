import { ChangeEvent, KeyboardEvent } from 'react';
import React, { FC, useEffect } from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../store/types';

type IProps = Pick<GlobalActions, 'setChatReplyingTo'> & {
  selectedChatId?: number;
  replyingTo?: number;
  messageText: string;
  setMessageText: Function;
  onSendMessage: Function;
};

const MAX_INPUT_HEIGHT = 240;

let isJustSent = false;

const MessageInput: FC<IProps> = ({
  selectedChatId, replyingTo, messageText, setMessageText, onSendMessage, setChatReplyingTo,
}) => {
  function onChange(e: ChangeEvent<HTMLTextAreaElement>) {
    if (isJustSent) {
      isJustSent = false;
      return;
    }

    const { currentTarget } = e;
    setMessageText(currentTarget.value);
    if (currentTarget.scrollHeight !== currentTarget.offsetHeight) {
      currentTarget.style.height = 'auto';
      currentTarget.style.height = `${Math.min(currentTarget.scrollHeight, MAX_INPUT_HEIGHT)}px`;
    }

    currentTarget.style.overflowY = currentTarget.scrollHeight <= MAX_INPUT_HEIGHT ? 'hidden' : 'auto';
  }

  function onKeyPress(e: KeyboardEvent<HTMLTextAreaElement>) {
    const { currentTarget } = e;
    const value = currentTarget.value.trim();

    if (e.keyCode === 13 && !e.shiftKey && value.length) {
      onSendMessage();
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

  return (
    <textarea
      id="message-input-text"
      className="form-control custom-scroll"
      placeholder="Message"
      rows={1}
      autoComplete="off"
      onChange={onChange}
      onKeyPress={onKeyPress}
      value={messageText}
    />
  );
};

function focusInput() {
  const input = document.getElementById('message-input-text');

  if (input) {
    input.focus();
  }
}

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
