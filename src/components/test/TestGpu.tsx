import React, {
  FC, useEffect, useRef, useState,
} from '../../lib/teact/teact';
// import { pause } from '../../util/schedulers';

const READY_TIMEOUT = 3000;

const CANVAS_SIZE = 500;
const CANVAS_STYLE = 'position: absolute; top:0; left: 0; pointer-events: none; opacity: 0.1;';

const ITERATIONS_COUNT = 50;
const TICK_DRAWS_COUNT = 30;
// const ITERATION_DELAY = 30;

const TRIANGLES = [
  [-0.5, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5, 0.0],
  [-0.5, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, 0.5, 0.0],
  [-0.5, 0.5, 0.0, 0.5, 0.5, 0.0, 0.5, -0.5, 0.0],
  [-0.5, -0.5, 0.0, 0.5, 0.5, 0.0, 0.5, -0.5, 0.0],
];

const TestGpu: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const [gpuRates, setGpuRates] = useState<number[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsReady(true);
    }, READY_TIMEOUT);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void measureGpuRate(canvasRef.current!, (newRate) => {
      setGpuRates([
        ...gpuRates,
        newRate,
      ]);
    });
  }, [isReady, gpuRates]);

  if (!isReady) {
    return (
      <div>Preparing...</div>
    );
  }

  const { length } = gpuRates;
  const avg = Math.round(gpuRates.reduce((sum, value) => sum + value, 0) / length);
  const mean = [...gpuRates].sort()[Math.floor(length / 2)];

  return (
    <div>
      <h1>GPU benchmark</h1>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        // @ts-ignore
        style={CANVAS_STYLE}
      />
      <div><b>Takes:</b> {length}</div>
      <div><b>Average:</b> {avg}</div>
      <div><b>Mean:</b> {mean}</div>
      <div><b>All:</b> {gpuRates.join(', ')}...</div>
    </div>
  );
};

async function measureGpuRate(canvas: HTMLCanvasElement, callback: (rate: number) => void) {
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;

  if (!gl) {
    callback(-1);
    return;
  }

  const startTime = performance.now();

  let i = 0;
  while (i++ < ITERATIONS_COUNT) {
    await new Promise(requestAnimationFrame);
    let j = 0;
    while (j++ < TICK_DRAWS_COUNT) {
      drawTriangle(canvas, gl, i + j);
    }
  }

  const rate = Math.round(performance.now() - startTime);
  callback(rate);
}

function drawTriangle(canvas: HTMLCanvasElement, gl: WebGLRenderingContext, i: number) {
  gl.viewport(0, 0, canvas.width, canvas.height);
  const vertShader = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vertShader, 'attribute vec3 c;void main(void){gl_Position=vec4(c, 1.0);}');
  gl.compileShader(vertShader);
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fragShader, 'void main(void){gl_FragColor=vec4(0,1,1,1);}');
  gl.compileShader(fragShader);
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vertShader);
  gl.attachShader(prog, fragShader);
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.clearColor(1, 0, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  const vertexBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(TRIANGLES[i % 4]), gl.STATIC_DRAW);
  const coord = gl.getAttribLocation(prog, 'c');
  gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coord);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

export default TestGpu;
