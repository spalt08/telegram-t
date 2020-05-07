import { useEffect } from '../../../../lib/teact/teact';
import { ApiAttachment, ApiMessage } from '../../../../api/types';

import buildAttachment from '../helpers/buildAttachment';
import { EDITABLE_INPUT_ID } from '../../../../config';

const CLIPBOARD_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif'];
const MAX_MESSAGE_LENGTH = 4096;

export default (
  insertTextAndUpdateCursor: (text: string) => void,
  setAttachment: (attachment: ApiAttachment) => void,
  editedMessage: ApiMessage | undefined,
  openPollModal: () => void,
) => {
  useEffect(() => {
    async function handlePaste(e: ClipboardEvent) {
      if (!e.clipboardData) {
        return;
      }

      const input = document.getElementById(EDITABLE_INPUT_ID);
      if (input !== document.activeElement) {
        return;
      }

      const { items } = e.clipboardData;
      const media = Array.from(items).find((item) => CLIPBOARD_ACCEPTED_TYPES.includes(item.type));
      const file = media && media.getAsFile();
      const pastedText = e.clipboardData.getData('text').substring(0, MAX_MESSAGE_LENGTH);

      if (!file && !pastedText) {
        return;
      }

      if (pastedText.startsWith('%QUIZ%')) {
        openPollModal();
        return;
      }

      e.preventDefault();

      if (file && !editedMessage) {
        setAttachment(await buildAttachment(file.name, file, true));
      }

      if (pastedText) {
        insertTextAndUpdateCursor(pastedText);
      }
    }

    document.addEventListener('paste', handlePaste, false);

    return () => {
      document.removeEventListener('paste', handlePaste, false);
    };
  }, [insertTextAndUpdateCursor, editedMessage, setAttachment]);
};
