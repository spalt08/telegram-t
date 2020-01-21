import React, { FC } from '../../../lib/teact/teact';

import { ApiMessage, ApiMessageOutgoingStatus } from '../../../api/types';

import { formatTime } from '../../../util/dateFormat';

import MessageOutgoingStatus from '../../common/MessageOutgoingStatus';

import './MessageMeta.scss';

type IProps = {
  message: ApiMessage;
  outgoingStatus?: ApiMessageOutgoingStatus;
};

const MessageMeta: FC<IProps> = ({ message, outgoingStatus }) => {
  return (
    <span className="MessageMeta">
      <span className="message-time">
        {formatTime(message.date * 1000)}
      </span>
      {outgoingStatus && (
        <MessageOutgoingStatus status={outgoingStatus} />
      )}
    </span>
  );
};

export default MessageMeta;
