import { useCallback, useRef, useState } from '../../../../lib/teact/teact';

import * as voiceRecording from '../../../../util/voiceRecording';

type ActiveVoiceRecording = { stop: () => Promise<voiceRecording.Result> } | undefined;

const VOICE_RECORDING_SUPPORTED = voiceRecording.isSupported();

export default () => {
  const recordButtonRef = useRef<HTMLButtonElement>();
  const [activeVoiceRecording, setActiveVoiceRecording] = useState<ActiveVoiceRecording>();
  const startRecordTimeRef = useRef<number>();
  const [currentRecordTime, setCurrentRecordTime] = useState();

  const startRecordingVoice = useCallback(async () => {
    try {
      const stop = await voiceRecording.start((tickVolume: number) => {
        if (recordButtonRef.current) {
          const volumeLevel = ((tickVolume - 128) / 127) * 2;
          const volumeFactor = volumeLevel ? 0.25 + volumeLevel * 0.75 : 0;
          if (startRecordTimeRef.current && Date.now() % 4 === 0) {
            recordButtonRef.current.style.boxShadow = `0 0 0 ${volumeFactor * 50}px rgba(0,0,0,.15)`;
          }
          setCurrentRecordTime(Date.now());
        }
      });
      startRecordTimeRef.current = Date.now();
      setCurrentRecordTime(Date.now());

      setActiveVoiceRecording({ stop });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }, []);

  const stopRecordingVoice = useCallback(() => {
    if (!activeVoiceRecording) {
      return undefined;
    }

    setActiveVoiceRecording(undefined);
    startRecordTimeRef.current = null;
    setCurrentRecordTime(undefined);
    if (recordButtonRef.current) {
      recordButtonRef.current.style.boxShadow = 'none';
    }
    try {
      return activeVoiceRecording!.stop();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return undefined;
    }
  }, [activeVoiceRecording]);

  return {
    isVoiceRecordingSupported: VOICE_RECORDING_SUPPORTED,
    startRecordingVoice,
    stopRecordingVoice,
    activeVoiceRecording,
    currentRecordTime,
    recordButtonRef,
    startRecordTimeRef,
  };
};
