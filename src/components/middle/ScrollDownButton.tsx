import React, { FC, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import { selectChat } from '../../modules/selectors';
import { isChatChannel, getCanPostInChat } from '../../modules/helpers';
import { formatIntegerCompact } from '../../util/textFormat';
import buildClassName from '../../util/buildClassName';
import { pick } from '../../util/iteratees';

import Button from '../ui/Button';

import './ScrollDownButton.scss';

type OwnProps = {
  show: boolean;
};

type StateProps = {
  isReadOnlyChannel?: boolean;
  unreadCount?: number;
};

type DispatchProps = Pick<GlobalActions, 'focusLastMessage'>;

const ScrollDownButton: FC<OwnProps & StateProps & DispatchProps> = ({
  show,
  isReadOnlyChannel,
  unreadCount,
  focusLastMessage,
}) => {
  const handleClick = useCallback(() => {
    if (!show) {
      return;
    }

    focusLastMessage();
  }, [show, focusLastMessage]);

  const fabClassName = buildClassName(
    'ScrollDownButton',
    show && 'revealed',
    isReadOnlyChannel && 'bottom-padding',
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
    const isReadOnlyChannel = chat && isChatChannel(chat) && !getCanPostInChat(chat);

    return {
      isReadOnlyChannel,
      unreadCount: chat ? chat.unreadCount : undefined,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['focusLastMessage']),
)(ScrollDownButton);
