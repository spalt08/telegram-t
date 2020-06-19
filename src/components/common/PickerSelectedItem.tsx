import React, { FC, memo } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiChat, ApiUser } from '../../api/types';

import { selectChat, selectUser } from '../../modules/selectors';
import { getChatTitle, getUserFirstName, isChatPrivate } from '../../modules/helpers';
import renderText from './helpers/renderText';

import Avatar from './Avatar';

import './PickerSelectedItem.scss';
import buildClassName from '../../util/buildClassName';

type OwnProps = {
  chatOrUserId?: number;
  icon?: string;
  title?: string;
  isMinimized?: boolean;
  onClick: (arg: any) => void;
  clickArg: any;
};

type StateProps = {
  chat?: ApiChat;
  user?: ApiUser;
};

const PickerSelectedItem: FC<OwnProps & StateProps> = ({
  icon,
  title,
  isMinimized,
  onClick,
  clickArg,
  chat,
  user,
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
  } else if (chat || user) {
    iconElement = (
      <Avatar
        chat={chat}
        user={user}
        size="small"
        isSavedMessages={user && user.isSelf}
      />
    );

    const name = !chat || (user && !user.isSelf)
      ? getUserFirstName(user)
      : getChatTitle(chat, user);

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
  (global, { chatOrUserId }): StateProps => {
    if (!chatOrUserId) {
      return {};
    }

    const chat = chatOrUserId ? selectChat(global, chatOrUserId) : undefined;
    const user = isChatPrivate(chatOrUserId) ? selectUser(global, chatOrUserId) : undefined;

    return {
      chat,
      user,
    };
  },
)(PickerSelectedItem));
