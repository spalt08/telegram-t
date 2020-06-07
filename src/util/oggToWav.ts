import DecoderWorker from 'worker-loader!opus-recorder/dist/decoderWorker.min';
import WavWorker from 'worker-loader!opus-recorder/dist/waveWorker.min';

const SAMPLE_RATE = 8000;
const BIT_DEPTH = 16;

export async function oggToWav(opusData: Blob): Promise<Blob> {
  const arrayBuffer = await new Response(opusData).arrayBuffer();

  return new Promise((resolve) => {
    const typedArray = new Uint8Array(arrayBuffer);

    const decoderWorker = new DecoderWorker();
    const wavWorker = new WavWorker();

    decoderWorker.onmessage = (e) => {
      if (e.data === null) {
        // `null` means decoder is finished
        wavWorker.postMessage({ command: 'done' });
      } else {
        // `e.data` contains decoded buffers as float32 values
        wavWorker.postMessage(
          {
            command: 'encode',
            buffers: e.data,
          },
          e.data.map(({ buffer }: Float32Array) => buffer),
        );
      }
    };

    wavWorker.onmessage = (e) => {
      if (e.data.message === 'page') {
        resolve(new Blob([e.data.page], { type: 'audio/wav' }));
      }
    };

    wavWorker.postMessage({
      command: 'init',
      wavBitDepth: BIT_DEPTH,
      wavSampleRate: SAMPLE_RATE,
    });

    decoderWorker.postMessage({
      command: 'init',
      decoderSampleRate: SAMPLE_RATE,
      outputBufferSampleRate: SAMPLE_RATE,
    });

    decoderWorker.postMessage({
      command: 'decode',
      pages: typedArray,
    }, [typedArray.buffer]);
  });
}
