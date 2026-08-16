/* ═══════════════════════════════════════════════════════════════
   site.js — מדידת תעבורה ומונה ביקורים, משותף לכל עמודי האתר.

   שני השירותים אופציונליים ומכובים כברירת מחדל: כל עוד השדות ריקים
   העמוד לא טוען שום סקריפט חיצוני ולא שולח שום בקשה. מלאו את המזהים
   אחרי פתיחת החשבון — אין צורך לגעת בשום דבר אחר.

   1) GoatCounter  — https://www.goatcounter.com  (חינם, בלי עוגיות)
      נרשמים, מקבלים כתובת בסגנון  https://matana.goatcounter.com
      ומכניסים כאן רק את הקוד עצמו: 'matana'.
      הוא גם מזין את מונה הביקורים שבתחתית העמוד.

   2) Cloudflare Web Analytics — אופציונלי, גם חינם ובלי עוגיות.
      Dashboard → Web Analytics → Add a site → מעתיקים את ה-token.

   שני השירותים לא מציבים עוגיות, ולכן לא נדרש באנר הסכמה.
   ═══════════════════════════════════════════════════════════════ */
const ANALYTICS = {
  goatcounter: '',        // לדוגמה: 'matana'
  cloudflareToken: '',    // לדוגמה: 'a1b2c3d4...'
  counterPath: 'TOTAL',   // 'TOTAL' = כל האתר, או '/index.html' לעמוד בודד
  counterMin: 25          // מתחת לזה המונה מוסתר — עדיף בלי מספר מאשר מספר עלוב
};

(function () {
  'use strict';
  const isLocal = !location.protocol.startsWith('http') || location.hostname === 'localhost';

  /* ── מדידת תעבורה ── */
  function track() {
    if (isLocal) return; // לא מזהמים את הנתונים בפיתוח מקומי

    if (ANALYTICS.goatcounter) {
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://gc.zgo.at/count.js';
      s.setAttribute('data-goatcounter', `https://${ANALYTICS.goatcounter}.goatcounter.com/count`);
      document.head.appendChild(s);
    }

    if (ANALYTICS.cloudflareToken) {
      const s = document.createElement('script');
      s.defer = true;
      s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
      s.setAttribute('data-cf-beacon', JSON.stringify({ token: ANALYTICS.cloudflareToken }));
      document.head.appendChild(s);
    }
  }

  /* ── מונה הביקורים המוצג בעמוד ──
     GoatCounter חושף מונה ציבורי ב-/counter/<path>.json.
     כל כישלון (אין חשבון, חסימת CORS, אופליין) פשוט משאיר את המונה מוסתר. */
  async function counter() {
    const el = document.getElementById('visitCounter');
    if (!el || !ANALYTICS.goatcounter || isLocal) return;

    try {
      const url = `https://${ANALYTICS.goatcounter}.goatcounter.com/counter/${encodeURIComponent(ANALYTICS.counterPath)}.json`;
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) return;

      const data = await res.json();
      const n = parseInt(String(data.count).replace(/[^\d]/g, ''), 10);
      if (!Number.isFinite(n) || n < ANALYTICS.counterMin) return;

      el.querySelector('[data-count]').textContent = n.toLocaleString('he-IL');
      el.hidden = false;
    } catch (e) { /* המונה נשאר מוסתר */ }
  }

  track();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', counter);
  } else {
    counter();
  }
})();
