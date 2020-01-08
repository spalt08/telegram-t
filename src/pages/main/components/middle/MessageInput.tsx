import { ChangeEvent, KeyboardEvent } from 'react';
import React, { FC, useState } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { GlobalActions } from '../../../../store/types';
import { onNextTick } from '../../../../util/schedulers';
import './MiddleFooter.scss';

type IProps = Pick<GlobalActions, 'sendTextMessage' | 'setChatReplyingTo'> & {
  selectedChatId: number;
  replyingTo?: number;
};

const MAX_INPUT_HEIGHT = 240;

let isJustSent = false;

const MiddleFooter: FC<IProps> = ({
  selectedChatId, replyingTo, sendTextMessage, setChatReplyingTo,
}) => {
  const [messageText, setMessageText] = useState('');

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
      sendTextMessage({
        chatId: selectedChatId,
        text: value,
      });

      setMessageText('');
      currentTarget.removeAttribute('style');

      setChatReplyingTo({ chatId: selectedChatId, messageId: undefined });

      // Disable `onChange` following immediately after `onKeyPress`.
      isJustSent = true;
      setTimeout(() => {
        isJustSent = false;
      }, 0);
    }
  }

  onNextTick(focusInput);

  return (
    <textarea
      id="message-input-text"
      className="form-control custom-scroll"
      placeholder={replyingTo ? 'Reply Message' : 'Message'}
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
    const replyingTo = selectedChatId ? replyingToById[selectedChatId] : undefined;

    return {
      selectedChatId,
      replyingTo,
    };
  },
  (setGlobal, actions) => {
    const { sendTextMessage, setChatReplyingTo } = actions;
    return { sendTextMessage, setChatReplyingTo };
  },
)(MiddleFooter);
