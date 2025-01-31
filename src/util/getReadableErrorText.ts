import { ApiError } from '../api/types';

const READABLE_ERROR_MESSAGES: Record<string, string> = {
  CHAT_RESTRICTED: 'You can\'t send messages in this chat, you were restricted',
  CHAT_WRITE_FORBIDDEN: 'You can\'t write in this chat',
  CHAT_SEND_POLL_FORBIDDEN: 'You can\'t create polls in this chat',
  CHAT_SEND_STICKERS_FORBIDDEN: 'You can\'t send stickers in this chat',
  CHAT_SEND_GIFS_FORBIDDEN: 'You can\'t send gifs in this chat',
  CHAT_SEND_MEDIA_FORBIDDEN: 'You can\'t send media in this chat',
  // eslint-disable-next-line max-len
  SLOWMODE_WAIT_X: 'Slowmode is enabled in this chat: you must wait for the specified number of seconds before sending another message to the chat.',
  USER_BANNED_IN_CHANNEL: 'You\'re banned from sending messages in supergroups / channels',
  USER_IS_BLOCKED: 'You were blocked by this user',
  YOU_BLOCKED_USER: 'You blocked this user',
  IMAGE_PROCESS_FAILED: 'Failure while processing image',
  MEDIA_EMPTY: 'The provided media object is invalid',
  MEDIA_INVALID: 'Media invalid',
  PHOTO_EXT_INVALID: 'The extension of the photo is invalid',
  PHOTO_INVALID_DIMENSIONS: 'The photo dimensions are invalid',
  PHOTO_SAVE_FILE_INVALID: 'Internal issues, try again later',
  // eslint-disable-next-line max-len
  MESSAGE_DELETE_FORBIDDEN: 'You can\'t delete one of the messages you tried to delete, most likely because it is a service message.',
  MESSAGE_POLL_CLOSED: 'Poll closed',
  MESSAGE_EDIT_TIME_EXPIRED: 'You can\'t edit this message anymore.',
  CHAT_ADMIN_REQUIRED: 'You must be an admin in this chat to do this',
  PINNED_DIALOGS_TOO_MUCH: 'Sorry, you can only pin 5 chats to the top',
  DIALOG_FILTERS_TOO_MUCH: 'Sorry, you can\'t have more than 10 folders',

  // Non-API errors
  SERVICE_WORKER_DISABLED: 'Service Worker is disabled. Please reload the page without holding <Shift> key.',
};

export default function getReadableErrorText(error: ApiError) {
  const { message, isSlowMode } = error;
  // Currently Telegram API doesn't return `SLOWMODE_WAIT_X` error as described in the docs
  if (isSlowMode) {
    const extraPartIndex = message.indexOf(' (caused by');
    return extraPartIndex > 0 ? message.substring(0, extraPartIndex) : message;
  }

  return READABLE_ERROR_MESSAGES[message];
}
