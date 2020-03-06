import { ApiMessage } from '../../../api/types';

import { getDayStart } from '../../../util/dateFormat';
import { isActionMessage } from '../../../modules/helpers';

type SenderGroup = ApiMessage[];

export type MessageDateGroup = {
  datetime: number;
  senderGroups: SenderGroup[];
};

export function groupMessages(messages: ApiMessage[], lastReadId: number) {
  let currentSenderGroup: SenderGroup = [];
  let currentDateGroup = {
    datetime: Number(getDayStart(messages[0].date * 1000)),
    senderGroups: [currentSenderGroup],
  };

  const dateGroups: MessageDateGroup[] = [currentDateGroup];

  messages.forEach((message, index) => {
    currentSenderGroup.push(message);

    const nextMessage = messages[index + 1];
    if (nextMessage) {
      const nextMessageDatetime = Number(getDayStart(nextMessage.date * 1000));
      if (currentDateGroup.datetime !== nextMessageDatetime) {
        currentDateGroup = {
          datetime: nextMessageDatetime,
          senderGroups: [],
        };
        dateGroups.push(currentDateGroup);

        currentSenderGroup = [];
        currentDateGroup.senderGroups.push(currentSenderGroup);
      } else if (
        message.id === lastReadId
        || message.sender_user_id !== nextMessage.sender_user_id
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
