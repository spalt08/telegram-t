import React, { FC } from '../../../../lib/teact';

import getTime from '../../../../util/getTime';
import { ApiMessage } from '../../../../modules/tdlib/types/messages';
import { getOutgoingStatus } from '../../../../modules/tdlib/helpers';
import './LastMessageMeta.scss';

type IProps = {
  message: ApiMessage
}

const LastMessageMeta: FC<IProps> = ({ message }) => {
  return (
    <div className='LastMessageMeta'>
      <span className="sending-state">{renderOutgoingStatus(message)}</span>
      <span className="last-message-time">{getTime(message.date * 1000)}</span>
    </div>
  );
};

// TODO Extract as a component.
function renderOutgoingStatus(message: ApiMessage) {
  if (!message.is_outgoing) {
    return;
  }

  switch (getOutgoingStatus(message)) {
    case 'read':
      return '<R>';
    case 'pending':
      return '<P>';
    case 'succeeded':
      return '<S>';
    case 'failed':
      return '<F>';
  }
}

export default LastMessageMeta;
