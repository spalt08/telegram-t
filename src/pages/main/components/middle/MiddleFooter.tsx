import React, { FC } from '../../../../lib/teact';

import Button from '../../../../components/ui/Button';
import MessageInput from './MessageInput';
import MessageInputReply from './MessageInputReply';

import './MiddleFooter.scss';

type IProps = {};

const MiddleFooter: FC<IProps> = () => {
  return (
    <div className="MiddleFooter">
      <div id="message-compose">
        <MessageInputReply />
        <div className="message-input-wrapper">
          <Button className="not-implemented" round color="translucent">
            <i className="icon-smile" />
          </Button>
          <MessageInput />
          <Button className="not-implemented" round color="translucent">
            <i className="icon-attach" />
          </Button>
        </div>
      </div>
      <Button className="not-implemented" round color="primary">
        <i className="icon-microphone" />
      </Button>
    </div>
  );
};

export default MiddleFooter;
