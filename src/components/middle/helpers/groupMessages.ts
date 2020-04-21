import { ApiMessage } from '../../../api/types';
import { IAlbum } from '../../../types';

import { getDayStart } from '../../../util/dateFormat';
import { isActionMessage } from '../../../modules/helpers';

type SenderGroup = (ApiMessage | IAlbum)[];

export type MessageDateGroup = {
  datetime: number;
  senderGroups: SenderGroup[];
};

export function isAlbum(messageOrAlbum: ApiMessage | IAlbum): messageOrAlbum is IAlbum {
  return 'albumId' in messageOrAlbum;
}

export function groupMessages(messages: ApiMessage[], firstUnreadId: number) {
  let currentSenderGroup: SenderGroup = [];
  let currentDateGroup = {
    datetime: Number(getDayStart(messages[0].date * 1000)),
    senderGroups: [currentSenderGroup],
  };
  let currentAlbum: IAlbum | undefined;

  const dateGroups: MessageDateGroup[] = [currentDateGroup];

  messages.forEach((message, index) => {
    if (message.groupedId) {
      if (!currentAlbum) {
        currentAlbum = {
          albumId: message.groupedId,
          messages: [message],
        };
      } else {
        currentAlbum.messages.push(message);
      }
    } else {
      currentSenderGroup.push(message);
    }

    const nextMessage = messages[index + 1];

    if (
      currentAlbum
      && (!nextMessage || !nextMessage.groupedId || nextMessage.groupedId !== currentAlbum.albumId)
    ) {
      currentSenderGroup.push(currentAlbum);
      currentAlbum = undefined;
    }
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
        nextMessage.id === firstUnreadId
        || message.senderUserId !== nextMessage.senderUserId
        || message.isOutgoing !== nextMessage.isOutgoing
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
