import React, { FC } from '../lib/teact';
import { GlobalState, withGlobal } from '../lib/teactn';

import { ApiMessage } from '../modules/tdlib/types';
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
      return <i className="icon-message-read" />;
    case 'pending':
      return <i className="icon-message-sending" />;
    case 'succeeded':
      return <i className="icon-message-delivered" />;
    case 'failed':
      return <i className="icon-message-sending-error" />;
  }
}

export default withGlobal(
  (global: GlobalState, { message }: IProps) => {
    return {
      outgoingStatus: selectOutgoingStatus(global, message),
    };
  },
)(MessageOutgoingStatus);
