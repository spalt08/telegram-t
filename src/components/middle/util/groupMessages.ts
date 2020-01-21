import { ApiMessage } from '../../../api/types';

import { isSameDay } from '../../../util/dateFormat';
import { isActionMessage } from '../../../modules/helpers';

export type MessageDateGroup = {
  datetime: number;
  messageGroups: ApiMessage[][];
};

export function groupMessages(messages: ApiMessage[]) {
  const messageDateGroups: MessageDateGroup[] = [
    {
      datetime: messages[0].date * 1000,
      messageGroups: [],
    },
  ];
  let currentMessageGroup: ApiMessage[] = [];
  let currentMessageDateGroup = messageDateGroups[0];

  messages.forEach((message, index) => {
    if (!isSameDay(currentMessageDateGroup.datetime, message.date * 1000)) {
      if (currentMessageDateGroup && currentMessageGroup && currentMessageGroup.length) {
        currentMessageDateGroup.messageGroups.push(currentMessageGroup);
        currentMessageGroup = [];
      }
      messageDateGroups.push({
        datetime: message.date * 1000,
        messageGroups: [],
      });
      currentMessageDateGroup = messageDateGroups[messageDateGroups.length - 1];
    }

    if (
      !currentMessageGroup.length || (
        message.sender_user_id === currentMessageGroup[currentMessageGroup.length - 1].sender_user_id
        // Forwarded messages to chat with self.
        && message.is_outgoing === currentMessageGroup[currentMessageGroup.length - 1].is_outgoing
      )
    ) {
      currentMessageGroup.push(message);
    }

    if (
      messages[index + 1] && (
        message.sender_user_id !== messages[index + 1].sender_user_id
        || message.is_outgoing !== messages[index + 1].is_outgoing
        || isActionMessage(message)
        || isActionMessage(messages[index + 1])
      )
    ) {
      currentMessageDateGroup.messageGroups.push(currentMessageGroup);
      currentMessageGroup = [];
    }
  });

  if (currentMessageGroup.length) {
    currentMessageDateGroup.messageGroups.push(currentMessageGroup);
  }

  return messageDateGroups;
}
