import React, { FC } from '../../../../lib/teact';

import { ApiMessage, ApiMessageOutgoingStatus } from '../../../../api/types';
import { formatPastTimeShort } from '../../../../util/dateFormat';
import MessageOutgoingStatus from '../../../../components/MessageOutgoingStatus';
import './LastMessageMeta.scss';

type IProps = {
  message: ApiMessage;
  outgoingStatus?: ApiMessageOutgoingStatus;
};

const LastMessageMeta: FC<IProps> = ({ message, outgoingStatus }) => {
  return (
    <div className="LastMessageMeta">
      {outgoingStatus && (
        <MessageOutgoingStatus status={outgoingStatus} />
      )}
      <span className="time">{formatPastTimeShort(message.date * 1000)}</span>
    </div>
  );
};

export default LastMessageMeta;
