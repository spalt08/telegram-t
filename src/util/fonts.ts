const SITE_FONTS = ['400 1em Roboto', '500 1em Roboto', 'bold 1em Roboto', '400 1em icomoon'];
const TEXT_FOR_FORCE_DOWNLOAD = 'ꙀҰἀ₭ẠʻͰ';

export default function preloadFonts() {
  if ('fonts' in document) {
    const fonts = SITE_FONTS.map((font) => document.fonts.load(font, TEXT_FOR_FORCE_DOWNLOAD));

    return Promise.all(fonts);
  }

  return null;
}
