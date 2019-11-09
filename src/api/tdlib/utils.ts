export function getOsName() {
  const { userAgent } = window.navigator;

  if (userAgent.includes('Windows NT 10.0')) return 'Windows 10';
  if (userAgent.includes('Windows NT 6.2')) return 'Windows 8';
  if (userAgent.includes('Windows NT 6.1')) return 'Windows 7';
  if (userAgent.includes('Windows NT 6.0')) return 'Windows Vista';
  if (userAgent.includes('Windows NT 5.1')) return 'Windows XP';
  if (userAgent.includes('Windows NT 5.0')) return 'Windows 2000';
  if (userAgent.includes('Mac')) return 'Mac/iOS';
  if (userAgent.includes('X11')) return 'UNIX';
  if (userAgent.includes('Linux')) return 'Linux';

  return 'Unknown';
}

export function getBrowser() {
  const isIE = /* @cc_on!@ */ false;
  const isEdge = !isIE && !!window.StyleMedia;

  if (navigator.userAgent.includes('Chrome') && !isEdge) {
    return 'Chrome';
  } else if (navigator.userAgent.includes('Safari') && !isEdge) {
    return 'Safari';
  } else if (navigator.userAgent.includes('Firefox')) {
    return 'Firefox';
  } else if (navigator.userAgent.includes('MSIE')) {
    // IF IE > 10
    return 'IE';
  } else if (isEdge) {
    return 'Edge';
  } else {
    return 'Unknown';
  }
}
