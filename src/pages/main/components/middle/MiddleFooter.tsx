import { KeyboardEvent } from 'react';
import React, { FC, useState } from '../../../../lib/teact';
import { DispatchMap, withGlobal } from '../../../../lib/teactn';

import InputText from '../../../../components/ui/InputText';
import onNextTick from '../../../../util/onNextTick';
import './MiddleFooter.scss';

type IProps = Pick<DispatchMap, 'sendTextMessage'> & {
  selectedChatId: number;
};

const MiddleFooter: FC<IProps> = ({ selectedChatId, sendTextMessage }) => {
  const [message, setMessage] = useState('');

  function onKeyPress(e: KeyboardEvent<HTMLInputElement>) {
    const { currentTarget } = e;
    setMessage(currentTarget.value.trim());

    if (e.keyCode === 13 && currentTarget.value.trim().length) {
      sendTextMessage({
        chatId: selectedChatId,
        text: currentTarget.value,
      });

      setMessage('');
    }
  }

  onNextTick(focusInput);

  return (
    <div className="MiddleFooter">
      <div id="message-input-wrapper">
        {/* TODO @not-implemented */}
        {/* <Button round color="translucent" onClick={() => {}}>
         <i className="icon-smile" />
         </Button> */}
        {/* TODO Convert to textarea, add auto-sizing */}
        <InputText
          id="message-input-text"
          placeholder="Message"
          onKeyPress={onKeyPress}
          value={message}
        />
        {/* TODO @not-implemented */}
        {/* <Button round color="translucent" onClick={() => { }}>
         <i className="icon-attach" />
         </Button> */}
      </div>
      {/* TODO @not-implemented */}
      {/* <Button round color="primary" onClick={() => { }}>
       <i className="icon-microphone" />
       </Button> */}
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
