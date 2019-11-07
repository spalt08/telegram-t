import React, { FC } from '../../../../lib/teact';
import { DispatchMap, withGlobal } from '../../../../lib/teactn';
import { ApiMessage } from '../../../../modules/tdlib/types/messages';

import { getMessageText, isOwnMessage } from '../../../../modules/tdlib/helpers';
import parseEmojiOnlyString from '../../../../util/parseEmojiOnlyString';
import Avatar from '../../../../components/Avatar';
import './Message.scss';

type IProps = {
  message: ApiMessage,
  isSelected: boolean,
} & Pick<DispatchMap, 'selectMessage'>;

const Message: FC<IProps> = ({ message, isSelected }) => {
  const text = getMessageText(message);

  let className;
  if (text) {
    const emojiOnlyCount = parseEmojiOnlyString(text);
    const emojiOnlyClassName = emojiOnlyCount ? `emoji-only-${emojiOnlyCount}` : null;

    className = emojiOnlyClassName || 'text';
  }

  return (
    <div className={`Message ${isSelected ? 'selected' : ''} ${isOwnMessage(message) ? 'own' : ''}`}>
      <Avatar size="small">HE</Avatar>
      <div className={className}>{getMessageText(message)}</div>
    </div>
  );
};

export default withGlobal(
  (global, ownProps) => {
    const { messages } = global;
    const { id } = ownProps;

    return {
      isSelected: Number(id) === messages.selectedId,
    };
  },
  (setGlobal, actions) => {
    const { selectMessage } = actions;
    return { selectMessage };
  },
)(Message);
