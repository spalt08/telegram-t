import { OnUpdate, SendToWorker } from '../types/types';

import { buildApiChatFromDialog } from '../connectors/chats';
import { buildApiMessage } from '../connectors/messages';
import { buildApiUser } from '../connectors/users';

let sendToClient: SendToWorker;
let onUpdate: OnUpdate;

export function init(_sendToClient: SendToWorker, _onUpdate: OnUpdate) {
  sendToClient = _sendToClient;
  onUpdate = _onUpdate;
}

// TODO Own chat should be loaded first.

export async function fetchChats(args: {
  limit: number;
}): Promise<{ chat_ids: number[] } | null> {
  const result = await sendToClient({
    type: 'invokeRequest',
    name: 'GetDialogsRequest',
    args,
  }, true) as MTP.messages$Dialogs;

  if (!result || !result.dialogs) {
    return null;
  }

  const chatIds: number[] = [];

  result.dialogs.forEach((dialog) => {
    const chat = buildApiChatFromDialog(dialog);

    chatIds.push(chat.id);

    onUpdate({
      '@type': 'updateNewChat',
      chat,
    });
  });

  (result.users as MTP.user[]).forEach((mtpUser) => {
    const user = buildApiUser(mtpUser);

    onUpdate({
      '@type': 'updateUser',
      user,
    });
  });

  (result.messages as MTP.message[]).forEach((mtpMessage) => {
    const message = buildApiMessage(mtpMessage);

    onUpdate({
      '@type': 'updateChatLastMessage',
      chat_id: message.chat_id,
      last_message: message,
    });
  });

  return {
    chat_ids: chatIds,
  };
}

// const getPeerName = (peerType: MTP.PeerType, peerData: MTP.User | MTP.Chat) => {
//   switch (peerType) {
//     case 'peerUser': {
//       const { firstName = '', username = '', lastName = '' } = peerData as MTP.user;
//       return `${firstName} ${lastName}`;
//     }
//     case 'peerChat':
//     case 'peerChannel': {
//       const { title = '' } = peerData as MTP.chat;
//       return title;
//     }
//     default:
//       throw new TypeError(`Unknown peer type ${peerType}`);
//   }
// };
