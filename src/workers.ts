// For some reason workers are not properly bundled when imported from async modules,
// so we need to also import them from the main bundle. Probably will be fixed after upgrading Parcel.

export function initOpusWorker() {
  return new Worker('../node_modules/opus-media-recorder/encoderWorker.js');
}
