import React, { FC, useState } from '../../../../lib/teact';
import { GlobalActions } from '../../../../store/types';
import { withGlobal } from '../../../../lib/teactn';

import Button from '../../../../components/ui/Button';
import MessageInput from './MessageInput';
import MessageInputReply from './MessageInputReply';

import './MiddleFooter.scss';

type IProps = Pick<GlobalActions, 'sendTextMessage'> & {
  selectedChatId: number;
};

const MiddleFooter: FC<IProps> = ({ selectedChatId, sendTextMessage }) => {
  const [messageText, setMessageText] = useState('');
  const isSendButton = Boolean(messageText);

  const onSendMessage = () => {
    if (messageText !== '') {
      sendTextMessage({
        chatId: selectedChatId,
        text: messageText,
      });
      setMessageText('');
    }
  };

  return (
    <div className="MiddleFooter">
      <div id="message-compose">
        <MessageInputReply />
        <div className="message-input-wrapper">
          <Button className="not-implemented" round color="translucent">
            <i className="icon-smile" />
          </Button>
          <MessageInput messageText={messageText} setMessageText={setMessageText} onSendMessage={onSendMessage} />
          <Button className="not-implemented" round color="translucent">
            <i className="icon-attach" />
          </Button>
        </div>
      </div>
      <Button
        round
        color="primary"
        className={`${isSendButton ? 'send' : 'microphone not-implemented'}`}
        onClick={onSendMessage}
      >
        <i className="icon-send" />
        <i className="icon-microphone" />
      </Button>
    </div>
  );
};

export default withGlobal(
  (global) => {
    const { chats: { selectedId: selectedChatId } } = global;

    return {
      selectedChatId,
    };
  },
  (setGlobal, actions) => {
    const { sendTextMessage } = actions;
    return { sendTextMessage };
  },
)(MiddleFooter);
