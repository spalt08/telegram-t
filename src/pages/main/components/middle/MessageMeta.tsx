import React, { FC } from '../../../../lib/teact';

import getTime from '../../../../util/getTime';
import { ApiMessage } from '../../../../modules/tdlib/types/messages';
import { getOutgoingStatus } from '../../../../modules/tdlib/helpers';
import './MessageMeta.scss';

type IProps = {
  message: ApiMessage
}

const MessageMeta: FC<IProps> = ({ message }) => {
  return (
    <span className='MessageMeta'>{getTime(message.date * 1000)} {renderOutgoingStatus(message)}</span>
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

export default MessageMeta;
