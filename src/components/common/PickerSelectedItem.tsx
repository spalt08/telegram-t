import React, { FC, memo } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiChat, ApiUser } from '../../api/types';

import { selectChat, selectUser } from '../../modules/selectors';
import { getChatTitle, getPrivateChatUserId, getUserFirstName } from '../../modules/helpers';
import renderText from './helpers/renderText';

import Avatar from './Avatar';

import './PickerSelectedItem.scss';
import buildClassName from '../../util/buildClassName';

type OwnProps = {
  chatId?: number;
  icon?: string;
  title?: string;
  isMinimized?: boolean;
  onClick: (arg: any) => void;
  clickArg: any;
};

type StateProps = {
  chat?: ApiChat;
  privateChatUser?: ApiUser;
};

const PickerSelectedItem: FC<OwnProps & StateProps> = ({
  icon,
  title,
  isMinimized,
  onClick,
  clickArg,
  chat,
  privateChatUser,
}) => {
  let iconElement: any;
  let titleText: any;

  if (icon && title) {
    iconElement = (
      <div className="item-icon">
        <i className={`icon-${icon}`} />
      </div>
    );

    titleText = title;
  } else if (chat) {
    iconElement = (
      <Avatar
        chat={chat}
        user={privateChatUser}
        size="small"
        isSavedMessages={privateChatUser && privateChatUser.isSelf}
      />
    );

    const name = privateChatUser && !privateChatUser.isSelf
      ? getUserFirstName(privateChatUser)
      : getChatTitle(chat, privateChatUser);

    titleText = name ? renderText(name) : undefined;
  }

  const className = buildClassName(
    'PickerSelectedItem',
    isMinimized && 'minimized',
  );

  return (
    <div
      className={className}
      onClick={() => onClick(clickArg)}
      title={isMinimized ? titleText : undefined}
    >
      {iconElement}
      {!isMinimized && (
        <div className="item-name">
          {titleText}
        </div>
      )}
      <div className="item-remove">
        <i className="icon-close" />
      </div>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { chatId }): StateProps => {
    const chat = chatId ? selectChat(global, chatId) : undefined;
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
