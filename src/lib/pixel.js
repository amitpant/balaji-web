// Facebook (Meta) Pixel: loaded only when the owner adds a Pixel ID in Social media settings.
let loadedId = null;

export function initPixel(id) {
  if (!id || loadedId === id || typeof window === 'undefined') return;
  loadedId = id;
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', id);
}

export function track(event, params) {
  if (typeof window !== 'undefined' && window.fbq) window.fbq('track', event, params);
}
