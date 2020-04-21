import { MouseEvent } from 'react';
import React, { FC, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import { selectChat } from '../../modules/selectors';
import { isChatChannel } from '../../modules/helpers';
import { formatIntegerCompact } from '../../util/textFormat';
import buildClassName from '../../util/buildClassName';
import { pick } from '../../util/iteratees';

import Button from '../ui/Button';

import './ScrollDownButton.scss';

type OwnProps = {
  show: boolean;
};

type StateProps = {
  isChannel?: boolean;
  unreadCount?: number;
};

type DispatchProps = Pick<GlobalActions, 'focusLastMessage'>;

const ScrollDownButton: FC<OwnProps & StateProps & DispatchProps> = ({
  show,
  isChannel,
  unreadCount,
  focusLastMessage,
}) => {
  const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    if (!show) {
      return;
    }

    focusLastMessage();
    e.currentTarget.blur();
  }, [show, focusLastMessage]);

  const fabClassName = buildClassName(
    'ScrollDownButton',
    show && 'revealed',
    isChannel && 'is-channel',
  );

  return (
    <div className={fabClassName}>
      <Button
        color="gray"
        round
        onClick={handleClick}
      >
        <i className="icon-down" />
      </Button>
      {Boolean(unreadCount) && (
        <div className="unread-count">{formatIntegerCompact(unreadCount!)}</div>
      )}
    </div>
  );
};

export default withGlobal<OwnProps>(
  (global): StateProps => {
    const { selectedId: openChatId } = global.chats;
    if (!openChatId) {
      return {};
    }

    const chat = selectChat(global, openChatId);
    const isChannel = chat && isChatChannel(chat);

    return {
      isChannel,
      unreadCount: chat ? chat.unreadCount : undefined,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['focusLastMessage']),
)(ScrollDownButton);
