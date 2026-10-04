// The Paper Atelier — smart checkout + UTM capture
// Captures UTMs from URL -> cookies -> sessionStorage (3-layer fallback),
// fires InitiateCheckout on click, then redirects to Shopify with the
// preserved UTMs after clearing any previous cart via a hidden iframe.

(function () {
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'sck', 'src', 'xcod'];

  // Save UTMs to sessionStorage on page load (backup layer)
  (function () {
    var urlParams = new URLSearchParams(window.location.search);
    UTM_KEYS.forEach(function (key) {
      if (urlParams.get(key)) sessionStorage.setItem(key, urlParams.get(key));
    });
  })();

  // Read UTMs from URL -> cookies -> sessionStorage
  function getUTMs() {
    var params = {};
    var urlParams = new URLSearchParams(window.location.search);

    UTM_KEYS.forEach(function (key) {
      if (urlParams.get(key)) params[key] = urlParams.get(key);
    });
    UTM_KEYS.forEach(function (key) {
      if (!params[key]) {
        var match = document.cookie.match(new RegExp('(?:^|; )' + key + '=([^;]*)'));
        if (match) params[key] = decodeURIComponent(match[1]);
      }
    });
    UTM_KEYS.forEach(function (key) {
      if (!params[key] && sessionStorage.getItem(key)) params[key] = sessionStorage.getItem(key);
    });

    return params;
  }

  // Smart checkout — fires InitiateCheckout, builds the Shopify URL with UTMs
  window.goToCheckout = function (e) {
    if (e && e.preventDefault) e.preventDefault();

    // Fire InitiateCheckout (UTMify intercepts fbq and handles CAPI)
    try {
      if (typeof fbq === 'function') fbq('track', 'InitiateCheckout');
    } catch (err) {}

    // Idempotency guard — prevent double fire
    if (window._goCheckoutFired) return;
    window._goCheckoutFired = true;

    var SHOP = 'https://getmykit.thepaperatelier.shop';
    // Direct checkout permalink — variant ID:quantity, skips /cart page
    var base = SHOP + '/cart/48475707310263:1';

    var utms = getUTMs();
    var extra = Object.keys(utms).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(utms[k]);
    }).join('&');

    if (extra) base += (base.indexOf('?') === -1 ? '?' : '&') + extra;

    // Clear previous cart first via hidden iframe, then navigate
    var iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.src = SHOP + '/cart/clear.js?t=' + Date.now();
    document.body.appendChild(iframe);

    var done = false;
    var go = function () {
      if (done) return;
      done = true;
      window.location.href = base;
    };
    iframe.onload = go;
    setTimeout(go, 800);
  };
})();
