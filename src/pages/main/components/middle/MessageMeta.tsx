import React, { FC } from '../../../../lib/teact';

import { ApiMessage } from '../../../../modules/tdlib/types/messages';
import getTime from '../../../../util/getTime';
import MessageOutgoingStatus from '../../../../components/MessageOutgoingStatus';
import './MessageMeta.scss';

type IProps = {
  message: ApiMessage,
}

const MessageMeta: FC<IProps> = ({ message }) => {
  return (
    <span className='MessageMeta'>
      {getTime(message.date * 1000)}
      {message.is_outgoing && (
        <MessageOutgoingStatus message={message} />
      )}
    </span>
  );
};


export default MessageMeta;
