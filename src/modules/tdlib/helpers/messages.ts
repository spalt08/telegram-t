import { ApiMessage } from '../types/messages';
import { getChatById } from './chats';

export function getMessageText(message: ApiMessage) {
  return message.content.text ? message.content.text.text : '%NO_TEXT_MESSAGE%';
}

export function isOwnMessage(message: ApiMessage) {
  return message.is_outgoing;
}

function isUnread(message: ApiMessage) {
  if (!message.is_outgoing) {
    return false;
  }

  const chat = getChatById(message.chat_id);

  return chat.last_read_outbox_message_id < message.id;
}

export function getSendingState(message: ApiMessage) {
  if (!message.is_outgoing) {
    return;
  }

  if (!message.sending_state) {
    return 'succeeded';
  }

  return message.sending_state['@type'] === 'messageSendingStateFailed' ? 'failed' : 'pending';
}

export function getOutgoingStatus(message: ApiMessage) {
  if (!message.is_outgoing) {
    return;
  }
  if (!isUnread(message)) {
    return 'read';
  }

  return getSendingState(message);
}
