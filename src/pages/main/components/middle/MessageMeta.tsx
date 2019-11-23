import React, { FC } from '../../../../lib/teact';

import { ApiMessage } from '../../../../api/types';
import { formatTime } from '../../../../util/dateFormat';
import MessageOutgoingStatus from '../../../../components/MessageOutgoingStatus';
import './MessageMeta.scss';

type IProps = {
  message: ApiMessage;
};

const MessageMeta: FC<IProps> = ({ message }) => {
  return (
    <span className="MessageMeta">
      <span className="message-time">
        {formatTime(message.date * 1000)}
      </span>
      {message.is_outgoing && (
        <MessageOutgoingStatus message={message} />
      )}
    </span>
  );
};


export default MessageMeta;
