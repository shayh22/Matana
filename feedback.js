/* ═══════════════════════════════════════════════════════════════
   feedback.js — תגובות ולייקים למבקרים.

   הווידג'ט מוזרק לתוך <div id="feedback"></div> בכל עמוד שמכיל אותו,
   כולל העיצוב — אין מה להוסיף ל-HTML או ל-CSS.

   ── לייקים ──
   עובדים מיד בלי הגדרה: כל לחיצה נרשמת כאירוע ב-GoatCounter (אותו חשבון
   של site.js) ורואים אותה בדשבורד תחת Events. הבחירה של המבקר נשמרת
   אצלו ב-localStorage כדי שהכפתור יישאר מסומן בביקור הבא.

   ── טקסט חופשי ──
   דורש שירות שיקבל את הטופס. שתי אפשרויות, מגדירים אחת:

   1) FEEDBACK.endpoint — מומלץ. נרשמים ב-https://formspree.io (חינם),
      יוצרים טופס, ומדביקים כאן את הכתובת שמתקבלת:
      'https://formspree.io/f/xxxxxxxx'. ההודעות מגיעות למייל ונשמרות שם.

   2) FEEDBACK.email — נפילה לאחור בלי שום שירות: פותח טיוטת מייל אצל
      המבקר עם הטקסט שכתב. חינם לגמרי, אבל חושף את הכתובת שלך בקוד
      המקור של העמוד ולכן חוטף ספאם. עדיף (1).

   כל עוד שניהם ריקים — אזור הכתיבה לא מוצג בכלל, והלייקים לבדם עובדים.
   לאבחון: ?debug=1 בכתובת + קונסול.
   ═══════════════════════════════════════════════════════════════ */
const FEEDBACK = {
  endpoint: '',   // 'https://formspree.io/f/xxxxxxxx'
  email: '',      // חלופה: 'you@example.com'
  showCounts: true, // להציג את מספר הלייקים ליד כל אייקון, אם GoatCounter מחזיר אותו

  reactions: [
    { id: 'helped',  icon: '👍', label: 'עזר לי' },
    { id: 'loved',   icon: '😍', label: 'מעולה' },
    { id: 'unsure',  icon: '🤔', label: 'לא בטוח' },
    { id: 'nope',    icon: '👎', label: 'לא עזר' }
  ],

  texts: {
    title: 'מה דעתכם?',
    subtitle: 'לחיצה אחת עוזרת לי לדעת אם זה שימושי',
    thanks: 'תודה! נרשם.',
    commentLabel: 'רוצים להוסיף משהו?',
    placeholder: 'הערה, טעות שמצאתם, סכום שלא הסתדר לכם…',
    send: 'שליחה',
    sending: 'שולח…',
    sent: 'תודה, ההודעה נשלחה 💜',
    error: 'משהו השתבש. נסו שוב עוד רגע.',
    empty: 'צריך לכתוב משהו קודם'
  },

  storageKey: 'matana-reaction'
};

(function () {
  'use strict';

  const host = document.getElementById('feedback');
  if (!host) return;

  const DEBUG = /[?&]debug=1(&|$)/.test(location.search);
  const log = (...a) => { if (DEBUG) console.log('%c[feedback]', 'color:#c026d3;font-weight:bold', ...a); };

  /* ── עיצוב ── */
  const css = `
    #feedback .fb-card{background:var(--card,#fff);border:1px solid var(--line,#e5e0f2);
      border-radius:18px;box-shadow:var(--shadow,0 10px 30px rgba(50,20,120,.10));
      padding:18px 16px;margin-bottom:14px}
    #feedback h2{margin:0;font-size:17px;font-weight:700}
    #feedback .fb-sub{margin:2px 0 12px;font-size:13px;color:var(--ink-faint,#8b83a8)}
    #feedback .fb-row{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
    #feedback .fb-btn{font:inherit;cursor:pointer;background:var(--card-soft,#faf8ff);
      border:1.5px solid var(--line,#e5e0f2);border-radius:14px;padding:10px 4px;
      display:flex;flex-direction:column;align-items:center;gap:3px;
      transition:transform .12s ease,border-color .12s ease,background .12s ease;
      color:var(--ink,#1d1830);-webkit-tap-highlight-color:transparent}
    #feedback .fb-btn:hover{border-color:var(--brand,#6d3bf5)}
    #feedback .fb-btn:active{transform:scale(.94)}
    #feedback .fb-btn .fb-ic{font-size:23px;line-height:1.1}
    #feedback .fb-btn .fb-lb{font-size:12px;font-weight:600}
    #feedback .fb-btn .fb-ct{font-size:11px;color:var(--ink-faint,#8b83a8);
      font-variant-numeric:tabular-nums;min-height:14px}
    #feedback .fb-btn[aria-pressed="true"]{background:var(--brand-soft,#efe9ff);
      border-color:var(--brand,#6d3bf5);color:var(--brand-ink,#4a1fd0)}
    #feedback .fb-btn[aria-pressed="true"] .fb-ct{color:var(--brand-ink,#4a1fd0)}
    #feedback .fb-btn:focus-visible{outline:3px solid var(--brand,#6d3bf5);outline-offset:2px}
    #feedback .fb-thanks{margin:10px 0 0;font-size:13px;font-weight:600;
      color:var(--brand-ink,#4a1fd0);text-align:center}
    #feedback .fb-form{margin-top:16px;padding-top:14px;
      border-top:1px solid var(--line,#e5e0f2)}
    #feedback label{display:block;font-size:13px;font-weight:600;
      color:var(--ink-soft,#5c5578);margin-bottom:6px}
    #feedback textarea{width:100%;min-height:78px;resize:vertical;font:inherit;font-size:14.5px;
      padding:10px 12px;border-radius:12px;border:1.5px solid var(--line,#e5e0f2);
      background:var(--card-soft,#faf8ff);color:var(--ink,#1d1830);line-height:1.5}
    #feedback textarea:focus{outline:none;border-color:var(--brand,#6d3bf5)}
    #feedback .fb-send{margin-top:8px;width:100%;font:inherit;font-size:15px;font-weight:700;
      cursor:pointer;border:none;border-radius:14px;padding:12px;color:#fff;
      background:linear-gradient(150deg,#6d3bf5 0%,#9333ea 55%,#c026d3 100%)}
    #feedback .fb-send:active{transform:scale(.99)}
    #feedback .fb-send[disabled]{opacity:.6;cursor:default}
    #feedback .fb-msg{margin:8px 0 0;font-size:13px;text-align:center;min-height:18px}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ── מבנה ── */
  const t = FEEDBACK.texts;
  const card = document.createElement('section');
  card.className = 'fb-card';
  card.innerHTML =
    `<h2>💬 ${t.title}</h2><p class="fb-sub">${t.subtitle}</p>` +
    `<div class="fb-row" role="group" aria-label="${t.title}">` +
      FEEDBACK.reactions.map(r =>
        `<button type="button" class="fb-btn" data-id="${r.id}" aria-pressed="false" aria-label="${r.label}">
           <span class="fb-ic">${r.icon}</span>
           <span class="fb-lb">${r.label}</span>
           <span class="fb-ct" data-count-for="${r.id}"></span>
         </button>`).join('') +
    `</div><p class="fb-thanks" hidden></p>`;

  const canWrite = !!(FEEDBACK.endpoint || FEEDBACK.email);
  if (canWrite) {
    const form = document.createElement('form');
    form.className = 'fb-form';
    form.innerHTML =
      `<label for="fb-text">${t.commentLabel}</label>
       <textarea id="fb-text" maxlength="1500" placeholder="${t.placeholder}"></textarea>
       <button type="submit" class="fb-send">${t.send}</button>
       <p class="fb-msg" role="status"></p>`;
    card.appendChild(form);
  } else {
    log('אזור הכתיבה מוסתר — לא הוגדר FEEDBACK.endpoint ולא FEEDBACK.email');
  }
  host.appendChild(card);

  /* ── לייקים ── */
  const thanks = card.querySelector('.fb-thanks');
  let chosen = null;
  try { chosen = localStorage.getItem(FEEDBACK.storageKey); } catch (e) {}

  function paint() {
    card.querySelectorAll('.fb-btn').forEach(b =>
      b.setAttribute('aria-pressed', b.dataset.id === chosen ? 'true' : 'false'));
    thanks.hidden = !chosen;
    if (chosen) thanks.textContent = t.thanks;
  }

  // count.js נטען אסינכרונית, אז מחכים לו קצת לפני שמוותרים
  function sendEvent(path, tries) {
    const gc = window.goatcounter;
    if (gc && typeof gc.count === 'function') {
      gc.count({ path, title: 'Feedback: ' + path, event: true });
      return log('✓ נרשם אירוע', path);
    }
    if ((tries || 0) < 10) return setTimeout(() => sendEvent(path, (tries || 0) + 1), 400);
    log('✗ count.js לא זמין — האירוע לא נרשם (חוסם פרסומות?)');
  }

  card.querySelectorAll('.fb-btn').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.id;
    if (chosen === id) return;
    chosen = id;
    try { localStorage.setItem(FEEDBACK.storageKey, id); } catch (e) {}
    paint();
    sendEvent('reaction-' + id);
  }));
  paint();

  /* ── מספרי הלייקים ──
     GoatCounter שומר אירועים כנתיבים, ולכן נקודת הקצה של המונה אמורה
     להחזיר גם אותם. לא הצלחתי לאמת את זה מול שרת אמיתי, ולכן כל כישלון
     פשוט משאיר את המספרים ריקים במקום להציג טעות. */
  async function counts() {
    const code = (window.ANALYTICS && window.ANALYTICS.goatcounter) ||
                 (typeof ANALYTICS !== 'undefined' && ANALYTICS.goatcounter);
    if (!FEEDBACK.showCounts || !code) return;
    if (!location.protocol.startsWith('http') || location.hostname === 'localhost') return;

    for (const r of FEEDBACK.reactions) {
      try {
        const res = await fetch(`https://${code}.goatcounter.com/counter/reaction-${r.id}.json`,
                                { mode: 'cors', cache: 'no-store' });
        if (!res.ok) { log('אין מספר עבור', r.id, res.status); continue; }
        const n = parseInt(String((await res.json()).count).replace(/[^\d]/g, ''), 10);
        if (Number.isFinite(n) && n > 0) {
          card.querySelector(`[data-count-for="${r.id}"]`).textContent = n.toLocaleString('he-IL');
        }
      } catch (e) { log('בקשת מספר נכשלה עבור', r.id, e.name); return; }
    }
  }
  counts();

  /* ── שליחת טקסט ── */
  const form = card.querySelector('.fb-form');
  if (!form) return;

  const msg = form.querySelector('.fb-msg');
  const send = form.querySelector('.fb-send');

  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    const text = form.querySelector('#fb-text').value.trim();
    if (!text) { msg.textContent = t.empty; return; }

    if (!FEEDBACK.endpoint) { // נפילה לאחור: טיוטת מייל
      location.href = `mailto:${FEEDBACK.email}?subject=${encodeURIComponent('פידבק מהאתר')}` +
                      `&body=${encodeURIComponent(text + '\n\n— נשלח מ-' + location.href)}`;
      return;
    }

    send.disabled = true;
    send.textContent = t.sending;
    msg.textContent = '';
    try {
      const res = await fetch(FEEDBACK.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ message: text, page: location.href, reaction: chosen || '' })
      });
      log('סטטוס שליחה', res.status);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      form.innerHTML = `<p class="fb-msg">${t.sent}</p>`;
      sendEvent('comment-sent');
    } catch (e) {
      log('✗ השליחה נכשלה:', e.name, e.message);
      msg.textContent = t.error;
      send.disabled = false;
      send.textContent = t.send;
    }
  });
})();
