import React, {
  FC, memo, useCallback, useEffect, useState,
} from '../../../lib/teact/teact';
import { GlobalActions } from '../../../global/types';
import { withGlobal } from '../../../lib/teact/teactn';

import { ApiAttachment } from '../../../api/types';

import Button from '../../ui/Button';
import AttachMenu from './AttachMenu';
import MessageInput from './MessageInput';
import MessageInputReply from './MessageInputReply';
import Attachment from './Attachment';

import { blobToFile, getImageDataFromFile, getVideoDataFromFile } from '../../../util/files';

import './MiddleFooter.scss';
import * as voiceRecording from '../../../util/voiceRecording';

type IProps = Pick<GlobalActions, 'sendMessage'>;
type ActiveVoiceRecording = { stop: () => Promise<voiceRecording.Result> } | undefined;

const CLIPBOARD_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif'];
const MAX_QUICK_FILE_SIZE = 10 * 1024 ** 2; // 10 MB
const VOICE_RECORDING_SUPPORTED = voiceRecording.isSupported();
const VOICE_RECORDING_FILENAME = 'wonderful-voice-message.ogg';

// TODO This component renders a lot when typing and it has many children. Consider refactoring.
const MiddleFooter: FC<IProps> = ({ sendMessage }) => {
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment] = useState<ApiAttachment | undefined>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeVoiceRecording, setActiveVoiceRecording] = useState<ActiveVoiceRecording>();

  const isMainButtonSend = !VOICE_RECORDING_SUPPORTED || activeVoiceRecording || (messageText && !attachment);

  const handleSend = useCallback(async () => {
    let currentAttachment = attachment;

    if (activeVoiceRecording) {
      try {
        const { blob, duration, waveform } = await activeVoiceRecording.stop();
        currentAttachment = {
          file: blobToFile(blob, VOICE_RECORDING_FILENAME),
          voice: { duration, waveform },
        };
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }

      setActiveVoiceRecording(undefined);
    }

    if (messageText || currentAttachment) {
      sendMessage({
        text: messageText,
        attachment: currentAttachment,
      });

      setMessageText('');
      setAttachment(undefined);
    }
  }, [messageText, attachment, activeVoiceRecording, sendMessage]);

  const handleRecordVoice = useCallback(async () => {
    try {
      // TODO Visualize bitrate
      const stop = await voiceRecording.start((/* tickVolume: number */) => {
      });

      setActiveVoiceRecording({ stop });
      // TODO This is temprorary
      setMessageText('Recording...');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }, []);

  // TODO Add Stop button
  // const handleStopRecordingVoice = useCallback(async () => {
  //   try {
  //     await activeVoiceRecording!.stop();
  //   } catch (err) {
  //     // eslint-disable-next-line no-console
  //     console.error(err);
  //   }
  //   setActiveVoiceRecording(undefined);
  // }, [activeVoiceRecording]);

  useEffect(() => {
    async function pasteImageFromClipboard(e: ClipboardEvent) {
      if (!e.clipboardData) {
        return;
      }

      const { items } = e.clipboardData;

      const media = Array.from(items).find((item) => CLIPBOARD_ACCEPTED_TYPES.includes(item.type));
      const file = media && media.getAsFile();

      if (file) {
        e.preventDefault();

        setAttachment(await buildAttachment(file, true));
      }
    }

    document.addEventListener('paste', pasteImageFromClipboard, false);

    return () => {
      document.removeEventListener('paste', pasteImageFromClipboard, false);
    };
  }, []);

  const handleClearAttachment = useCallback(() => {
    setAttachment(undefined);
  }, []);

  const handleOpenMenu = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleFileSelect = useCallback(async (file: File, isQuick: boolean) => {
    setAttachment(await buildAttachment(file, isQuick));
  }, []);

  return (
    <div className="MiddleFooter">
      <Attachment
        attachment={attachment}
        caption={attachment ? messageText : ''}
        onCaptionUpdate={setMessageText}
        onSend={handleSend}
        onClear={handleClearAttachment}
      />
      <div id="message-compose">
        <MessageInputReply />
        <div className="message-input-wrapper">
          <Button className="not-implemented" round color="translucent">
            <i className="icon-smile" />
          </Button>
          <MessageInput
            messageText={!attachment ? messageText : ''}
            onUpdate={setMessageText}
            onSend={handleSend}
          />
          <Button
            className={`${isMenuOpen ? 'activated' : ''}`}
            round
            color="translucent"
            onClick={handleOpenMenu}
          >
            <i className="icon-attach" />
          </Button>
          <AttachMenu
            isOpen={isMenuOpen}
            onFileSelect={handleFileSelect}
            onClose={handleCloseMenu}
          />
        </div>
      </div>
      <Button
        round
        color="secondary"
        className={`${isMainButtonSend ? 'send' : 'microphone'}`}
        onClick={isMainButtonSend ? handleSend : handleRecordVoice}
      >
        <i className="icon-send" />
        <i className="icon-microphone-alt" />
      </Button>
    </div>
  );
};

async function buildAttachment(file: File, isQuick: boolean): Promise<ApiAttachment> {
  if (!isQuick || file.size >= MAX_QUICK_FILE_SIZE) {
    return { file };
  }

  return {
    file,
    quick: file.type.startsWith('image/')
      ? await getImageDataFromFile(file)
      : await getVideoDataFromFile(file),
  };
}

export default memo(withGlobal(
  undefined,
  (setGlobal, actions) => {
    const { sendMessage } = actions;
    return { sendMessage };
  },
)(MiddleFooter));
