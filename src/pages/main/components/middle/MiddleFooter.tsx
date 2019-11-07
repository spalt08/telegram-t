import React, { FC } from '../../../../lib/teact';
import { DispatchMap, withGlobal } from '../../../../lib/teactn';

import InputText from '../../../../components/ui/InputText';
import './MiddleFooter.scss';
import onNextTick from '../../../../util/onNextTick';

type IProps = Pick<DispatchMap, 'sendTextMessage'> & {
  selectedChatId: number;
};

const MiddleFooter: FC<IProps> = ({ selectedChatId, sendTextMessage }) => {
  function onKeyPress(this: HTMLInputElement, e: React.KeyboardEvent) {
    if (e.keyCode === 13 && this.value.trim().length) {
      sendTextMessage({
        chatId: selectedChatId,
        text: this.value,
      });

      this.value = '';
    }
  }

  onNextTick(focusInput);

  return (
    <div className="MiddleFooter">{
      <InputText id="message-input-text" placeholder="Message" onKeyPress={onKeyPress} />
    }</div>
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
