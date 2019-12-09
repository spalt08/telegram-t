import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import {
  ApiUser,
  ApiMessage,
  ApiMiniThumbnail,
} from '../../../../api/types';
import { getUserFullName } from '../../../../modules/helpers';
import { selectUser } from '../../../../modules/selectors';
import { getReplyImageDimensions } from '../../../../util/imageDimensions';

import { buildMessageContent } from './message/utils';
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
    replyThumbnail,
  } = buildMessageContent(message, { isReply: true });

  return (
    <div className="ReplyMessage not-implemented">
      {renderMessagePhoto(replyThumbnail)}
      <div className="reply-text">
        <div className="sender-name">{getUserFullName(sender)}</div>
        <p>{text}</p>
      </div>
    </div>
  );
};

function renderMessagePhoto(thumbnail?: ApiMiniThumbnail) {
  if (!thumbnail) {
    return null;
  }

  const { width, height } = getReplyImageDimensions();

  return (
    <img src={`data:image/jpeg;base64, ${thumbnail.data}`} width={width} height={height} alt="" />
  );
}

export default withGlobal(
  (global, { message }: IProps) => {
    return {
      sender: selectUser(global, message.sender_user_id),
    };
  },
)(ReplyMessage);
