// `_wasm` is to avoid Parcel default import behavior for Web Assembly.
// @ts-ignore
import OggOpusEncoderWasmPath from '../lib/opus-media-recorder/OggOpusEncoder._wasm';

const POLYFILL_OPTIONS = {
  OggOpusEncoderWasmPath,
  encoderWorkerFactory() {
    return new Worker('../../node_modules/opus-media-recorder/encoderWorker.js');
  },
};

export type Result = { blob: Blob; duration: number; waveForm: number[] };

type MediaRecorderParameters = ConstructorParameters<typeof MediaRecorder>;

interface OpusMediaRecorder extends MediaRecorder {
  new(
    p1: MediaRecorderParameters[0], p2: MediaRecorderParameters[1], polyfillOptions: typeof POLYFILL_OPTIONS,
  ): MediaRecorder;
}

const RECORDER_PARAMS = { mimeType: 'audio/ogg; codecs=opus' };
const BLOB_PARAMS = { type: 'audio/ogg' };

let isNativeMediaRecorder: boolean;
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

export function isSupported() {
  return 'getUserMedia' in navigator.mediaDevices;
}

export async function start(analyzerCallback: Function) {
  const { stream, mediaRecorder } = await requestRecording();

  const chunks: Blob[] = [];
  const waveForm: number[] = [];
  const startedAt = Date.now();

  function releaseStream() {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  const releaseAnalyzer = subscribeToAnalyzer(stream, (volume: number) => {
    waveForm.push((volume - 128) * 2);
    analyzerCallback(volume);
  });

  try {
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
        waveForm,
      });
    };
    mediaRecorder.onerror = reject;
    mediaRecorder.stop();

    releaseAnalyzer();
    releaseStream();
  });
}

async function requestRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  isNativeMediaRecorder = typeof MediaRecorder !== 'undefined'
    && MediaRecorder.isTypeSupported(RECORDER_PARAMS.mimeType);

  let mediaRecorder: MediaRecorder | OpusMediaRecorder;
  if (isNativeMediaRecorder) {
    mediaRecorder = new MediaRecorder(stream, RECORDER_PARAMS);
  } else {
    await ensureOpusMediaRecorder();
    mediaRecorder = new OpusMediaRecorder(stream, RECORDER_PARAMS, POLYFILL_OPTIONS);
  }

  return { stream, mediaRecorder };
}

function subscribeToAnalyzer(stream: MediaStream, cb: Function) {
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
