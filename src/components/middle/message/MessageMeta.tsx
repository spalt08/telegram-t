import React, { FC } from '../../../lib/teact/teact';

import { ApiMessage, ApiMessageOutgoingStatus } from '../../../api/types';

import { formatTime } from '../../../util/dateFormat';
import { formatIntegerCompact } from '../../../util/textFormat';

import MessageOutgoingStatus from '../../common/MessageOutgoingStatus';

import './MessageMeta.scss';

type IProps = {
  message: ApiMessage;
  outgoingStatus?: ApiMessageOutgoingStatus;
};

const MessageMeta: FC<IProps> = ({ message, outgoingStatus }) => {
  return (
    <span className="MessageMeta">
      {message.views && [
        <span className="message-views">
          {formatIntegerCompact(message.views)}
        </span>,
        <i className="icon-channelviews" />,
      ]}
      <span className="message-time">
        {message.isEdited ? 'edited ' : ''}
        {formatTime(message.date * 1000)}
      </span>
      {outgoingStatus && (
        <MessageOutgoingStatus status={outgoingStatus} />
      )}
    </span>
  );
};

export default MessageMeta;
