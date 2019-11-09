export interface ApiMessage {
  id: number;
  chat_id: number;
  content: {
    text?: {
      text: string
    };
  };
  date: number;
  is_outgoing: boolean;
  sender_user_id: number;
  sending_state?: {
    '@type': 'messageSendingStateFailed'
  }
}
