import React, { FC } from '../../../../lib/teact';

import getTime from '../../../../util/getTime';
import { ApiMessage } from '../../../../modules/tdlib/types/messages';
import { getSendingState } from '../../../../modules/tdlib/helpers';
import './LastMessageMeta.scss';

type IProps = {
  message: ApiMessage
}

const LastMessageMeta: FC<IProps> = ({ message }) => {
  return (
    <div className='LastMessageMeta'>
      <div className="sending-state">{renderSendingState(message)}</div>
      <div className="div time">{getTime(message.date * 1000)}</div>
    </div>
  );
};

// TODO Extract as a component.
function renderSendingState(message: ApiMessage) {
  switch (getSendingState(message)) {
    case 'pending':
      return '<P>';
    case 'succeeded':
      return '<S>';
    case 'failed':
      return '<F>';
  }
}

export default LastMessageMeta;
