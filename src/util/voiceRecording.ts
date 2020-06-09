// @ts-ignore
import encoderPath from 'file-loader!opus-recorder/dist/encoderWorker.min';

export type Result = { blob: Blob; duration: number; waveform: number[] };

interface OpusRecorder extends Omit<MediaRecorder, 'start' | 'ondataavailable'> {
  new(options: AnyLiteral): OpusRecorder;

  start(stream: MediaStreamAudioSourceNode): void;

  ondataavailable: (typedArray: Uint8Array) => void;
}

const MIN_RECORDING_TIME = 1000;
const POLYFILL_OPTIONS = { encoderPath, reuseWorker: true };
const BLOB_PARAMS = { type: 'audio/ogg' };

let opusRecorderPromise: Promise<{ default: OpusRecorder }>;
let OpusRecorder: OpusRecorder;

async function ensureOpusRecorder() {
  if (!opusRecorderPromise) {
    // @ts-ignore
    opusRecorderPromise = import('opus-recorder');
    OpusRecorder = (await opusRecorderPromise).default;
  }

  return opusRecorderPromise;
}

export async function start(analyzerCallback: Function) {
  const chunks: Uint8Array[] = [];
  const waveform: number[] = [];
  const startedAt = Date.now();

  const { stream, release: releaseStream } = await requestStream();

  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(stream);

  const releaseAnalyzer = subscribeToAnalyzer(audioCtx, source, (volume: number) => {
    waveform.push((volume - 128) * 2);
    analyzerCallback(volume);
  });

  async function releaseAll() {
    releaseAnalyzer();
    await audioCtx.close();
    releaseStream();
  }

  let mediaRecorder: OpusRecorder;
  try {
    mediaRecorder = await startMediaRecorder(source);
  } catch (err) {
    await releaseAll();

    throw err;
  }

  mediaRecorder.ondataavailable = (typedArray) => {
    chunks.push(typedArray);
  };

  return () => new Promise<Result>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      resolve({
        blob: new Blob(chunks, BLOB_PARAMS),
        duration: Math.round((Date.now() - startedAt) / 1000),
        waveform,
      });
    };
    mediaRecorder.onerror = reject;

    const delayStop = Math.max(0, startedAt + MIN_RECORDING_TIME - Date.now());
    setTimeout(
      async () => {
        mediaRecorder.stop();

        await releaseAll();
      },
      delayStop,
    );
  });
}

async function requestStream() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const release = () => {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  };

  return { stream, release };
}

async function startMediaRecorder(source: MediaStreamAudioSourceNode) {
  await ensureOpusRecorder();

  const mediaRecorder = new OpusRecorder(POLYFILL_OPTIONS);
  await mediaRecorder.start(source);
  return mediaRecorder;
}

function subscribeToAnalyzer(audioCtx: AudioContext, source: MediaStreamAudioSourceNode, cb: Function) {
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  source.connect(analyser);

  let isDestroyed = false;

  function tick() {
    if (isDestroyed) {
      return;
    }

    analyser.getByteTimeDomainData(dataArray);
    cb(Math.max(...dataArray));
    requestAnimationFrame(tick);
  }

  tick();

  return () => {
    isDestroyed = true;
  };
}
