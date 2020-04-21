import React, { FC, memo } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiChat, ApiUser } from '../../api/types';

import { selectChat, selectUser } from '../../modules/selectors';
import { getChatTitle, getPrivateChatUserId, getUserFirstName } from '../../modules/helpers';

import Avatar from './Avatar';

type OwnProps = {
  chatId: number;
  onClick: () => void;
};

type StateProps = {
  chat?: ApiChat;
  privateChatUser?: ApiUser;
};

const PickerSelectedItem: FC<OwnProps & StateProps> = ({
  onClick,
  chat,
  privateChatUser,
}) => {
  if (!chat) {
    return undefined;
  }

  const name = privateChatUser && !privateChatUser.isSelf
    ? getUserFirstName(privateChatUser)
    : getChatTitle(chat, privateChatUser);

  return (
    <div className="picker-selected-item" onClick={onClick}>
      <Avatar
        chat={chat}
        user={privateChatUser}
        size="small"
        isSavedMessages={privateChatUser && privateChatUser.isSelf}
      />
      <div className="picker-selected-item-name">
        {name}
      </div>
      <div className="picker-selected-item-remove">
        <i className="icon-close" />
      </div>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { chatId }): StateProps => {
    const chat = selectChat(global, chatId);
    if (!chat) {
      return {};
    }

    const privateChatUserId = getPrivateChatUserId(chat);
    const privateChatUser = privateChatUserId ? selectUser(global, privateChatUserId) : undefined;

    return {
      chat,
      privateChatUser,
    };
  },
)(PickerSelectedItem));
