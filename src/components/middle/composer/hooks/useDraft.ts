import { useCallback, useEffect, useMemo } from '../../../../lib/teact/teact';

import { ApiFormattedText, ApiMessage } from '../../../../api/types';
import { GlobalActions } from '../../../../global/types';

import { DRAFT_THROTTLE, EDITABLE_INPUT_ID } from '../../../../config';
import usePrevious from '../../../../hooks/usePrevious';
import { throttle } from '../../../../util/schedulers';
import focusEditableElement from '../../../../util/focusEditableElement';
import parseMessageInput from '../helpers/parseMessageInput';
import getMessageTextAsHtml from '../helpers/getMessageTextAsHtml';

// Used to avoid running throttled callbacks when chat changes.
let currentChatId: number | undefined;

export default (
  draft: ApiFormattedText | undefined,
  chatId: number | undefined,
  html: string,
  htmlRef: { current: string },
  setHtml: (html: string) => void,
  editedMessage: ApiMessage | undefined,
  saveDraft: GlobalActions['saveDraft'],
  clearDraft: GlobalActions['clearDraft'],
) => {
  const updateDraft = useCallback((draftChatId: number) => {
    if (htmlRef.current.length && !editedMessage) {
      saveDraft({ chatId: draftChatId, draft: parseMessageInput(htmlRef.current!) });
    } else {
      clearDraft({ chatId: draftChatId });
    }
  }, [clearDraft, editedMessage, htmlRef, saveDraft]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const runThrottledForSaveDraft = useMemo(() => throttle((cb) => cb(), DRAFT_THROTTLE, false), [chatId]);

  const prevChatId = usePrevious(chatId);

  // Update draft when input changes
  currentChatId = chatId;
  const prevHtml = usePrevious(html);
  useEffect(() => {
    if (!chatId || prevChatId !== chatId || prevHtml === html) {
      return;
    }

    if (html.length) {
      runThrottledForSaveDraft(() => {
        if (currentChatId !== chatId) {
          return;
        }

        updateDraft(chatId);
      });
    } else {
      updateDraft(chatId);
    }
  }, [chatId, html, prevChatId, prevHtml, runThrottledForSaveDraft, updateDraft]);

  // Handle chat change
  useEffect(() => {
    if (chatId === prevChatId) {
      return;
    }

    if (prevChatId) {
      updateDraft(prevChatId);
    }

    if (draft) {
      setHtml(getMessageTextAsHtml(draft));

      requestAnimationFrame(() => {
        const messageInput = document.getElementById(EDITABLE_INPUT_ID)!;
        focusEditableElement(messageInput, true);
      });
    }
  }, [chatId, draft, prevChatId, setHtml, updateDraft]);

  // Subscribe and handle `window.blur`
  useEffect(() => {
    function handleBlur() {
      if (chatId) {
        updateDraft(chatId);
      }
    }

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [chatId, updateDraft]);
};
