import React, { FC, memo } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiChat, ApiUser } from '../../api/types';

import { selectChat, selectUser } from '../../modules/selectors';
import { getChatTitle, getPrivateChatUserId, getUserFirstName } from '../../modules/helpers';

import Avatar from './Avatar';

type IProps = {
  chatId: number;
  onClick: () => void;
  chat: ApiChat;
  privateChatUser?: ApiUser;
};

const PickerSelectedItem: FC<IProps> = ({
  onClick,
  chat,
  privateChatUser,
}) => {
  if (!chat) {
    return null;
  }

  const name = privateChatUser && !privateChatUser.is_self
    ? getUserFirstName(privateChatUser)
    : getChatTitle(chat, privateChatUser);

  return (
    <div className="picker-selected-item" onClick={onClick}>
      <Avatar
        chat={chat}
        user={privateChatUser}
        size="small"
        isSavedMessages={privateChatUser && privateChatUser.is_self}
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

export default memo(withGlobal(
  (global, { chatId }: IProps) => {
    const chat = selectChat(global, chatId);
    if (!chat) {
      return {};
    }

    const privateChatUserId = getPrivateChatUserId(chat);

    return {
      chat,
      ...(privateChatUserId && { privateChatUser: selectUser(global, privateChatUserId) }),
    };
  },
)(PickerSelectedItem));
