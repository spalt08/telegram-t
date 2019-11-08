import React, { FC } from '../lib/teact';
import { GlobalState, withGlobal } from '../lib/teactn';

import { ApiMessage } from '../modules/tdlib/types/messages';
import { selectOutgoingStatus } from '../modules/tdlib/selectors';

type IProps = {
  message: ApiMessage,
  outgoingStatus: ReturnType<typeof selectOutgoingStatus>,
}

const MessageOutgoingStatus: FC<IProps> = ({ message, outgoingStatus }) => {
  return (
    <span className='MessageOutgoingStatus'>{renderOutgoingStatus(message, outgoingStatus)}</span>
  );
};

function renderOutgoingStatus(message: ApiMessage, outgoingStatus: ReturnType<typeof selectOutgoingStatus>) {
  switch (outgoingStatus) {
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

export default withGlobal(
  (global: GlobalState, { message }: IProps) => {
    return {
      outgoingStatus: selectOutgoingStatus(global, message),
    };
  },
)(MessageOutgoingStatus);
