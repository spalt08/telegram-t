import React, { FC } from '../../../../lib/teact';

import { ApiMessage } from '../../../../api/types';
import { formatPastTimeShort } from '../../../../util/dateFormat';
import MessageOutgoingStatus from '../../../../components/MessageOutgoingStatus';
import './LastMessageMeta.scss';

type IProps = {
  message: ApiMessage;
};

const LastMessageMeta: FC<IProps> = ({ message }) => {
  return (
    <div className="LastMessageMeta">
      {message.is_outgoing && (
        <MessageOutgoingStatus message={message} />
      )}
      <span className="time">{formatPastTimeShort(message.date * 1000)}</span>
    </div>
  );
};

export default LastMessageMeta;
