import { ApiMessage } from '../../../api/types';

import { isSameDay } from '../../../util/dateFormat';
import parseEmojiOnlyString from '../../common/helpers/parseEmojiOnlyString';
import {
  getMessageRenderKey,
  isActionMessage,
  getMessageSticker,
  getMessageText,
} from '../../../modules/helpers';

type SenderGroup = ApiMessage[];

export type MessageDateGroup = {
  datetime: number;
  key: number;
  senderGroups: SenderGroup[];
};

export function groupMessages(messages: ApiMessage[]) {
  const dateGroups: MessageDateGroup[] = [
    {
      datetime: messages[0].date * 1000,
      key: getMessageRenderKey(messages[0]),
      senderGroups: [],
    },
  ];
  let currentSenderGroup: SenderGroup = [];
  let currentDateGroup = dateGroups[0];

  messages.forEach((message, index) => {
    if (!isSameDay(currentDateGroup.datetime, message.date * 1000)) {
      if (currentDateGroup && currentSenderGroup && currentSenderGroup.length) {
        currentDateGroup.senderGroups.push(currentSenderGroup);
        currentSenderGroup = [];
      }
      dateGroups.push({
        datetime: message.date * 1000,
        key: getMessageRenderKey(message),
        senderGroups: [],
      });
      currentDateGroup = dateGroups[dateGroups.length - 1];
    }

    if (
      !currentSenderGroup.length || (
        message.sender_user_id === currentSenderGroup[currentSenderGroup.length - 1].sender_user_id
        // Forwarded messages to chat with self.
        && message.is_outgoing === currentSenderGroup[currentSenderGroup.length - 1].is_outgoing
      )
    ) {
      currentSenderGroup.push(message);
    }

    if (messages[index + 1]) {
      const text = getMessageText(messages[index + 1]);
      const sticker = getMessageSticker(messages[index + 1]);
      const isSticker = sticker || (text && parseEmojiOnlyString(text));

      if (
        message.sender_user_id !== messages[index + 1].sender_user_id
        || message.is_outgoing !== messages[index + 1].is_outgoing
        || isActionMessage(message)
        || isActionMessage(messages[index + 1])
        || isSticker
      ) {
        currentDateGroup.senderGroups.push(currentSenderGroup);
        currentSenderGroup = [];
      }
    }
  });

  if (currentSenderGroup.length) {
    currentDateGroup.senderGroups.push(currentSenderGroup);
  }

  return dateGroups;
}
