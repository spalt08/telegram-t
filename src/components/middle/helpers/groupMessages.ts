import { ApiMessage } from '../../../api/types';

import { isSameDay } from '../../../util/dateFormat';
import { getMessageRenderKey, isActionMessage } from '../../../modules/helpers';

type SenderGroup = ApiMessage[];

export type MessageDateGroup = {
  datetime: number;
  key: number;
  senderGroups: SenderGroup[];
};

export function groupMessages(messages: ApiMessage[]) {
  let currentSenderGroup: SenderGroup = [];
  let currentDateGroup = {
    datetime: messages[0].date * 1000,
    key: getMessageRenderKey(messages[0]),
    senderGroups: [currentSenderGroup],
  };

  const dateGroups: MessageDateGroup[] = [currentDateGroup];

  messages.forEach((message, index) => {
    currentSenderGroup.push(message);

    const nextMessage = messages[index + 1];
    if (nextMessage) {
      if (!isSameDay(currentDateGroup.datetime, nextMessage.date * 1000)) {
        currentDateGroup = {
          datetime: nextMessage.date * 1000,
          key: getMessageRenderKey(nextMessage),
          senderGroups: [],
        };
        dateGroups.push(currentDateGroup);

        currentSenderGroup = [];
        currentDateGroup.senderGroups.push(currentSenderGroup);
      } else if (
        message.sender_user_id !== nextMessage.sender_user_id
        || message.is_outgoing !== nextMessage.is_outgoing
        || isActionMessage(message)
        || isActionMessage(nextMessage)
      ) {
        currentSenderGroup = [];
        currentDateGroup.senderGroups.push(currentSenderGroup);
      }
    }
  });

  return dateGroups;
}
