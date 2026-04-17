(function () {
  var GA_ID = 'G-XXXXXXXXXX'; // Replace with your GA4 Measurement ID

  var STORAGE_KEY = 'arcliva_cookie_consent';

  function loadGA() {
    if (!GA_ID || GA_ID === 'G-XXXXXXXXXX') return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  function removeBanner() {
    var b = document.getElementById('arcliva-cookie-banner');
    if (b) b.remove();
  }

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    loadGA();
    removeBanner();
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined');
    removeBanner();
  }

  var consent = localStorage.getItem(STORAGE_KEY);
  if (consent === 'accepted') { loadGA(); return; }
  if (consent === 'declined') { return; }

  // Build banner
  setTimeout(function () {
    var banner = document.createElement('div');
    banner.id = 'arcliva-cookie-banner';
    banner.innerHTML = [
      '<div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;">',
        '<div style="flex:1;min-width:220px;">',
          '<p style="margin:0 0 4px;font-weight:700;font-size:13px;color:#1A1A1A;">We use cookies</p>',
          '<p style="margin:0;font-size:12px;color:#4B5563;line-height:1.6;">',
            'We use cookies to analyze site traffic and improve your experience. ',
            'See our <a href="/privacy.html" style="color:#2D7A6D;text-decoration:underline;font-weight:600;">Privacy Policy</a> for details.',
          '</p>',
        '</div>',
        '<div style="display:flex;gap:8px;align-items:center;flex-shrink:0;margin-top:2px;">',
          '<button id="arc-cookie-decline" style="',
            'background:none;border:1px solid #D1D5DB;color:#6B7280;',
            'font-family:inherit;font-size:12px;font-weight:600;',
            'padding:8px 16px;border-radius:6px;cursor:pointer;white-space:nowrap;',
          '">Decline</button>',
          '<button id="arc-cookie-accept" style="',
            'background:linear-gradient(135deg,#2D7A6D,#1A5C52);border:none;color:#fff;',
            'font-family:inherit;font-size:12px;font-weight:700;',
            'padding:8px 18px;border-radius:6px;cursor:pointer;white-space:nowrap;',
            'box-shadow:0 2px 8px rgba(45,122,109,0.25);',
          '">Accept</button>',
        '</div>',
      '</div>'
    ].join('');

    Object.assign(banner.style, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '9999',
      background: '#fff',
      border: '1px solid #E5E7EB',
      borderRadius: '12px',
      padding: '16px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      fontFamily: "'Inter', sans-serif",
      maxWidth: '560px',
      width: 'calc(100% - 32px)',
      boxSizing: 'border-box',
      animation: 'arcSlideUp 0.35s cubic-bezier(0.34,1.2,0.64,1) both',
    });

    // Inject keyframe once
    if (!document.getElementById('arc-cookie-style')) {
      var style = document.createElement('style');
      style.id = 'arc-cookie-style';
      style.textContent = '@keyframes arcSlideUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
      document.head.appendChild(style);
    }

    document.body.appendChild(banner);

    document.getElementById('arc-cookie-accept').addEventListener('click', accept);
    document.getElementById('arc-cookie-decline').addEventListener('click', decline);
  }, 900);
})();
