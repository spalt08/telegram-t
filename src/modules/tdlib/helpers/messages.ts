import { ApiMessage } from '../types/messages';

export function getMessageText(message: ApiMessage) {
  return message.content.text ? message.content.text.text : '%NO_TEXT_MESSAGE%';
}

export function isOwnMessage(message: ApiMessage) {
  return message.is_outgoing;
}
