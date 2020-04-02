import React, { FC } from '../../lib/teact/teact';

import { ApiMessageOutgoingStatus } from '../../api/types';

type OwnProps = {
  status: ApiMessageOutgoingStatus;
};

const MessageOutgoingStatus: FC<OwnProps> = ({ status }) => {
  return (
    <span className="MessageOutgoingStatus">{renderOutgoingStatus(status)}</span>
  );
};

function renderOutgoingStatus(outgoingStatus: ApiMessageOutgoingStatus) {
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

  return null;
}

export default MessageOutgoingStatus;
