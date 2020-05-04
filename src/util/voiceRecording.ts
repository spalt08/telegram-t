import { initOpusWorker } from '../workers';

const POLYFILL_OPTIONS = {
  OggOpusEncoderWasmPath: './OggOpusEncoder.wasm',
  encoderWorkerFactory: initOpusWorker,
};
const MIN_RECORDING_TIME = 1000;

export type Result = { blob: Blob; duration: number; waveform: number[] };

type MediaRecorderParameters = ConstructorParameters<typeof MediaRecorder>;

interface OpusMediaRecorder extends MediaRecorder {
  new(
    p1: MediaRecorderParameters[0], p2: MediaRecorderParameters[1], polyfillOptions: typeof POLYFILL_OPTIONS,
  ): MediaRecorder;
}


const RECORDER_PARAMS = { mimeType: 'audio/ogg; codecs=opus' };
const BLOB_PARAMS = { type: 'audio/ogg' };

let opusMediaRecorderPromise: Promise<OpusMediaRecorder>;
let OpusMediaRecorder: OpusMediaRecorder;

async function ensureOpusMediaRecorder() {
  if (!opusMediaRecorderPromise) {
    // @ts-ignore
    opusMediaRecorderPromise = import('opus-media-recorder');
    OpusMediaRecorder = await opusMediaRecorderPromise;
  }

  return opusMediaRecorderPromise;
}

export async function start(analyzerCallback: Function) {
  const chunks: Blob[] = [];
  const waveform: number[] = [];
  const startedAt = Date.now();

  const { stream, release: releaseStream } = await requestStream();

  const releaseAnalyzer = subscribeToAnalyzer(stream, (volume: number) => {
    waveform.push((volume - 128) * 2);
    analyzerCallback(volume);
  });

  let mediaRecorder: MediaRecorder | OpusMediaRecorder;
  try {
    mediaRecorder = await initMediaRecorder(stream);
    mediaRecorder.start();
  } catch (err) {
    releaseAnalyzer();
    releaseStream();

    throw err;
  }

  mediaRecorder.ondataavailable = (e: BlobEvent) => {
    chunks.push(e.data);
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
      () => {
        mediaRecorder.stop();

        releaseAnalyzer();
        releaseStream();
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

async function initMediaRecorder(stream: MediaStream) {
  const isNativeMediaRecorder = typeof MediaRecorder !== 'undefined'
    && MediaRecorder.isTypeSupported(RECORDER_PARAMS.mimeType);

  let mediaRecorder: MediaRecorder | OpusMediaRecorder;
  if (isNativeMediaRecorder) {
    mediaRecorder = new MediaRecorder(stream, RECORDER_PARAMS);
  } else {
    await ensureOpusMediaRecorder();
    mediaRecorder = new OpusMediaRecorder(stream, RECORDER_PARAMS, POLYFILL_OPTIONS);
  }

  return mediaRecorder;
}

function subscribeToAnalyzer(stream: MediaStream, cb: Function) {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) {
    return () => {
    };
  }

  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(stream);
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
