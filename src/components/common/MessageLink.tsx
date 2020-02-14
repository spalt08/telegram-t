import React, { FC, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';
import { GlobalActions } from '../../global/types';
import { ApiMessage } from '../../api/types';
import { selectChatMessageViewportIds } from '../../modules/selectors';

type IProps = {
  className?: string;
  message?: ApiMessage;
  children: any;
  isMessageInViewport?: boolean;
} & Pick<GlobalActions, 'focusMessage'>;

const MessageLink: FC<IProps> = ({
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

export default withGlobal(
  (global, ownProps: IProps) => {
    const { message } = ownProps;

    if (!message) {
      return {};
    }

    const viewportIds = selectChatMessageViewportIds(global, message.chat_id);
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
