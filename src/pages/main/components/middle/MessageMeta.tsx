import React, { FC } from '../../../../lib/teact';

import getTime from '../../../../util/getTime';
import { ApiMessage } from '../../../../modules/tdlib/types/messages';
import './MessageMeta.scss';

type IProps = {
  message: ApiMessage
}

const MessageMeta: FC<IProps> = ({ message }) => {
  return (
    <div className='MessageMeta'>{getTime(message.date * 1000)}</div>
  );
};

export default MessageMeta;
