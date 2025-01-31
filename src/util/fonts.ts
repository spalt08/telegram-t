const SITE_FONTS = ['400 1em Roboto', '500 1em Roboto', '400 1em icomoon'];

export default function preloadFonts() {
  if ('fonts' in document) {
    return Promise.all(SITE_FONTS.map((font) => document.fonts.load(font)));
  }

  return undefined;
}
