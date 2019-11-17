import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import {
  ApiUser,
  ApiMessage,
  ApiPhoto,
} from '../../../../api/tdlib/types';
import { getUserFullName } from '../../../../modules/helpers';
import { selectUser } from '../../../../modules/selectors';

import { buildMessageContent } from './util/messages';
import './ReplyMessage.scss';

type IProps = {
  message: ApiMessage;
  sender: ApiUser;
};

const ReplyMessage: FC<IProps> = ({
  message, sender,
}) => {
  const {
    text,
    photo,
  } = buildMessageContent(message);

  return (
    <div className="ReplyMessage not-implemented">
      {renderMessagePhoto(photo)}
      <div className="reply-text">
        <div className="sender-name">{getUserFullName(sender)}</div>
        <p>{text}</p>
      </div>
    </div>
  );
};

function renderMessagePhoto(photo?: ApiPhoto) {
  if (!photo) {
    return null;
  }

  const thumbnail = photo.minithumbnail;
  if (!thumbnail) {
    return null;
  }

  return (
    <img src={`data:image/jpeg;base64, ${thumbnail.data}`} alt="" />
  );
}

export default withGlobal(
  (global, { message }: IProps) => {
    return {
      sender: selectUser(global, message.sender_user_id),
    };
  },
)(ReplyMessage);
