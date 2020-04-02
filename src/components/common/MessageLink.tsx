import React, { FC, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';
import { GlobalActions } from '../../global/types';
import { ApiMessage } from '../../api/types';
import { selectViewportIds } from '../../modules/selectors';

type OwnProps = {
  className?: string;
  message?: ApiMessage;
  children: any;
};

type StateProps = {
  isMessageInViewport?: boolean;
};

type DispatchProps = Pick<GlobalActions, 'focusMessage'>;

const MessageLink: FC<OwnProps & StateProps & DispatchProps> = ({
  className, message, children, isMessageInViewport, focusMessage,
}) => {
  const handleMessageClick = useCallback((): void => {
    if (message) {
      focusMessage({ chatId: message.chat_id, messageId: message.id });
    }
  }, [focusMessage, message]);

  if (!message) {
    return children;
  }

  return (
    <span
      className={`MessageLink${isMessageInViewport ? '' : ' not-implemented '} ${className || ''}`}
      onClick={isMessageInViewport ? handleMessageClick : undefined}
    >
      {children}
    </span>
  );
};

export default withGlobal<OwnProps>(
  (global, { message }) => {
    if (!message) {
      return {};
    }

    const viewportIds = selectViewportIds(global, message.chat_id);
    const isMessageInViewport = viewportIds && viewportIds.includes(message.id);

    return { isMessageInViewport };
  },
  (setGlobal, actions) => {
    const {
      focusMessage,
    } = actions;
    return {
      focusMessage,
    };
  },
)(MessageLink);
