import React, { FC } from '../../../../lib/teact';

import getTime from '../../../../util/getTime';
import { ApiMessage } from '../../../../modules/tdlib/types/messages';
import { getSendingState } from '../../../../modules/tdlib/helpers';
import './MessageMeta.scss';

type IProps = {
  message: ApiMessage
}

const MessageMeta: FC<IProps> = ({ message }) => {
  return (
    <div className='MessageMeta'>{getTime(message.date * 1000)} {renderSendingState(message)}</div>
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

export default MessageMeta;
