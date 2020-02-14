type IWaveformProps = {
  width: number;
  height: number;
  fillStyle: string;
  spikeWidth: number;
  spikeStep: number;
  spikeRadius: number;
};

export function renderWaveformToDataUri(spikes: number[], {
  width, height, fillStyle, spikeWidth, spikeStep, spikeRadius,
}: IWaveformProps) {
  const scale = 255 / height;

  const c = document.createElement('canvas');
  c.width = width * 2;
  c.height = height * 2;
  c.style.width = `${width}px`;
  c.style.height = `${height}px`;

  const ctx = c.getContext('2d')!;
  ctx.scale(2, 2);

  ctx.fillStyle = fillStyle;
  spikes.forEach((item, i) => {
    roundedRectangle(ctx, i * spikeStep, height, spikeWidth, Math.max(2, item / scale), spikeRadius);
    ctx.fill();
  });

  return c.toDataURL();
}

function roundedRectangle(
  ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number,
) {
  if (width < 2 * radius) {
    radius = width / 2;
  }
  if (height < 2 * radius) {
    radius = height / 2;
  }

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y - height, radius);
  ctx.arcTo(x + width, y - height, x, y - height, radius);
  ctx.arcTo(x, y - height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}
