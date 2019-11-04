export function getOsName() {
  const { userAgent } = window.navigator;

  if (userAgent.indexOf('Windows NT 10.0') != -1) return 'Windows 10';
  if (userAgent.indexOf('Windows NT 6.2') != -1) return 'Windows 8';
  if (userAgent.indexOf('Windows NT 6.1') != -1) return 'Windows 7';
  if (userAgent.indexOf('Windows NT 6.0') != -1) return 'Windows Vista';
  if (userAgent.indexOf('Windows NT 5.1') != -1) return 'Windows XP';
  if (userAgent.indexOf('Windows NT 5.0') != -1) return 'Windows 2000';
  if (userAgent.indexOf('Mac') != -1) return 'Mac/iOS';
  if (userAgent.indexOf('X11') != -1) return 'UNIX';
  if (userAgent.indexOf('Linux') != -1) return 'Linux';

  return 'Unknown';
}

export function getBrowser() {
  let isIE = /*@cc_on!@*/ false;
  let isEdge = !isIE && !!window.StyleMedia;

  if (navigator.userAgent.indexOf('Chrome') != -1 && !isEdge) {
    return 'Chrome';
  } else if (navigator.userAgent.indexOf('Safari') != -1 && !isEdge) {
    return 'Safari';
  } else if (navigator.userAgent.indexOf('Firefox') != -1) {
    return 'Firefox';
  } else if (navigator.userAgent.indexOf('MSIE') != -1) {
    //IF IE > 10
    return 'IE';
  } else if (isEdge) {
    return 'Edge';
  } else {
    return 'Unknown';
  }
}
