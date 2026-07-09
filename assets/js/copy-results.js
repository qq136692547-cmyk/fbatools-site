(function () {
  'use strict';

  function copyResults(btn) {
    var resultsContainer = btn.closest('.calc-results');
    if (!resultsContainer) return;

    var rows = resultsContainer.querySelectorAll('.calc-result-row');
    if (!rows.length) return;

    var lines = [];
    rows.forEach(function (row) {
      var lbl = row.querySelector('.lbl');
      var val = row.querySelector('.val');
      // Fallback: some rows may use bare <span> instead of .lbl/.val
      if (!lbl || !val) {
        var spans = row.querySelectorAll('span');
        if (spans.length >= 2) {
          lbl = spans[0];
          val = spans[1];
        }
      }
      var label = lbl ? lbl.textContent.trim() : '';
      var value = val ? val.textContent.trim() : '';
      if (label || value) {
        lines.push(label + '\t' + value);
      }
    });

    var text = lines.join('\n');

    function showCopied() {
      var original = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 2000);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(showCopied).catch(function () {
        fallbackCopy(text, showCopied);
      });
    } else {
      fallbackCopy(text, showCopied);
    }
  }

  function fallbackCopy(text, onSuccess) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      onSuccess();
    } catch (e) {
      // silently fail
    }
    document.body.removeChild(ta);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btns = document.querySelectorAll('.copy-results-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        copyResults(btn);
      });
    });
  });
})();
