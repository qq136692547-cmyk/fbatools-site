// ux.js — deng/fbatools shared UX (copy results + subscribe mock)
(function () {
  'use strict';

  // ---- Copy all calc-result-rows ----
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copy-results]');
    if (!btn) return;
    var results = btn.closest('.calc-results');
    if (!results) return;
    var rows = results.querySelectorAll('.calc-result-row');
    var lines = [];
    rows.forEach(function (r) {
      var l = r.querySelector('.lbl'), v = r.querySelector('.val');
      var lt = l ? l.textContent.trim() : '', vt = v ? v.textContent.trim() : '';
      if (lt || vt) lines.push(lt + '\t' + vt);
    });
    var text = lines.join('\n');
    var done = function () {
      var orig = btn.textContent;
      btn.textContent = '✓ Copied';
      btn.classList.add('copied');
      setTimeout(function () { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  });

  // ---- Subscribe form mock ----
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('.subscribe-form');
    if (!form) return;
    e.preventDefault();
    var email = form.querySelector('input[type=email]');
    if (!email || !email.value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
      if (email) { email.focus(); email.style.borderColor = '#F87171'; }
      return;
    }
    var wrap = form.closest('.subscribe-wrap');
    if (wrap) wrap.classList.add('done');
  });
})();
