import { ChangeEvent, KeyboardEvent } from 'react';
import React, { FC, useState } from '../../../../lib/teact';
import { DispatchMap, withGlobal } from '../../../../lib/teactn';

import Button from '../../../../components/ui/Button';
import { onNextTick } from '../../../../util/schedulers';
import InputText from '../../../../components/ui/InputText';
import './MiddleFooter.scss';

type IProps = Pick<DispatchMap, 'sendTextMessage'> & {
  selectedChatId: number;
};

const MiddleFooter: FC<IProps> = ({ selectedChatId, sendTextMessage }) => {
  const [messageText, setMessageText] = useState('');

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const { currentTarget } = e;
    setMessageText(currentTarget.value.trim());
  }

  function onKeyPress(e: KeyboardEvent<HTMLInputElement>) {
    const { currentTarget } = e;

    if (e.keyCode === 13 && currentTarget.value.trim().length) {
      sendTextMessage({
        chatId: selectedChatId,
        text: currentTarget.value,
      });

      // Make sure to clear the text after the latest `onChange`.
      setTimeout(() => setMessageText(''), 0);
    }
  }

  onNextTick(focusInput);

  return (
    <div className="MiddleFooter">
      <div id="message-input-wrapper">
        <Button className="not-implemented" round color="translucent">
          <i className="icon-smile" />
        </Button>
        {/* TODO Convert to textarea, add auto-sizing */}
        <InputText
          id="message-input-text"
          placeholder="Message"
          onChange={onChange}
          onKeyPress={onKeyPress}
          value={messageText}
        />
        <Button className="not-implemented" round color="translucent">
          <i className="icon-attach" />
        </Button>
      </div>
      <Button className="not-implemented" round color="primary">
        <i className="icon-microphone" />
      </Button>
    </div>
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
    const { chats } = global;

    return {
      selectedChatId: chats.selectedId,
    };
  },
  (setGlobal, actions) => {
    const { sendTextMessage } = actions;
    return { sendTextMessage };
  },
)(MiddleFooter);
