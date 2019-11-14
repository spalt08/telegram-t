import { SendToWorker } from '../types/types';

let sendToClient: SendToWorker;

export function init(_sendToClient: SendToWorker) {
  sendToClient = _sendToClient;
}

export function provideAuthPhoneNumber(phoneNumber: string) {
  sendToClient({
    type: 'provideAuthPhoneNumber',
    phoneNumber,
  });
}

export function provideAuthCode(code: string) {
  sendToClient({
    type: 'provideAuthCode',
    code,
  });
}

export function provideAuthPassword(password: string) {
  sendToClient({
    type: 'provideAuthPassword',
    password,
  });
}
