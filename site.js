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
  goatcounter: 'matana',  // https://matana.goatcounter.com
  cloudflareToken: '',    // לדוגמה: 'a1b2c3d4...'
  counterPath: 'TOTAL',   // 'TOTAL' = כל האתר, או '/index.html' לעמוד בודד
  counterMin: 1           // מתחת לזה המונה מוסתר. 1 = להציג מהביקור הראשון
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
      s.onload = () => log('✓ count.js נטען — הביקור נספר');
      s.onerror = () => log('✗ count.js לא נטען — כמעט תמיד חוסם פרסומות בדפדפן שלכם');
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
     כל כישלון (אין חשבון, חסימת CORS, אופליין) פשוט משאיר את המונה מוסתר.

     לאבחון: מוסיפים ?debug=1 לכתובת ופותחים את הקונסול (F12). כל שלב
     בשרשרת ידווח על עצמו, כולל הסיבה המדויקת שבגללה המונה לא הוצג. */
  const DEBUG = /[?&]debug=1(&|$)/.test(location.search);
  const log = (...a) => { if (DEBUG) console.log('%c[counter]', 'color:#6d3bf5;font-weight:bold', ...a); };

  async function counter() {
    const el = document.getElementById('visitCounter');
    log('config', { ...ANALYTICS, isLocal, protocol: location.protocol, host: location.hostname });

    if (!el) return log('✗ אין אלמנט #visitCounter בעמוד הזה');
    if (!ANALYTICS.goatcounter) return log('✗ ANALYTICS.goatcounter ריק — כנראה מוגש קובץ site.js ישן');
    if (isLocal) return log('✗ ריצה מקומית (file:// או localhost) — המונה מושבת בכוונה');

    const url = `https://${ANALYTICS.goatcounter}.goatcounter.com/counter/${ANALYTICS.counterPath}.json`;
    log('פונה אל', url);

    try {
      const res = await fetch(url, { mode: 'cors' });
      log('סטטוס HTTP', res.status);
      if (!res.ok) return log('✗ השרת החזיר שגיאה. 404 = נתיב לא נכון, 403 = הסטטיסטיקות אינן ציבוריות');

      const data = await res.json();
      log('תשובה', data);

      const n = parseInt(String(data.count).replace(/[^\d]/g, ''), 10);
      if (!Number.isFinite(n)) return log('✗ לא הצלחתי לקרוא מספר מהתשובה');
      if (n < ANALYTICS.counterMin) return log(`✗ ${n} קטן מ-counterMin (${ANALYTICS.counterMin})`);

      el.querySelector('[data-count]').textContent = n.toLocaleString('he-IL');
      el.hidden = false;
      log('✓ המונה מוצג:', n);
    } catch (e) {
      log('✗ הבקשה נכשלה:', e.name, e.message);
      log('  TypeError/Failed to fetch = חסימת CORS או חוסם פרסומות שחוסם את goatcounter');
    }
  }

  track();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', counter);
  } else {
    counter();
  }
})();
