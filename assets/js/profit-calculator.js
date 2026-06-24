(function () {
  'use strict';
  var get = function (s) { return document.getElementById(s); };
  function num(s) { var v = parseFloat(s); return isNaN(v) || v < 0 ? 0 : v; }
  function fmt(n) { return '$' + n.toFixed(2); }

  var FBA_FULFILL = 3.83;

  function calc() {
    var el_sale    = get('sale');
    var el_cat     = get('cat');
    var el_cogs    = get('cogs');
    var el_inbound = get('inbound');
    var el_shipOut = get('shipOut');
    var el_ads     = get('ads');
    var el_storage = get('storage');

    if (!el_sale) return;

    var sale    = num(el_sale.value);
    var cat     = parseFloat(el_cat.value);
    var cogs    = num(el_cogs.value);
    var inbound = num(el_inbound.value);
    var shipOut = num(el_shipOut.value);
    var adsPct  = num(el_ads.value) / 100;
    var fbaStorage = num(el_storage.value);

    var referral = sale * cat;
    var fbaUnit  = sale - referral - FBA_FULFILL - fbaStorage;
    var fbmUnit  = sale - referral - shipOut;
    var ads      = sale * adsPct;
    var fbaProfit = fbaUnit - cogs - inbound - ads;
    var fbmProfit = fbmUnit - cogs - inbound - ads;
    var fbaMargin = sale > 0 ? (fbaProfit / sale) * 100 : 0;
    var fbmMargin = sale > 0 ? (fbmProfit / sale) * 100 : 0;
    var costBase = cogs + inbound;
    var fbaRoi = costBase > 0 ? (fbaProfit / costBase) * 100 : 0;
    var fbmRoi = costBase > 0 ? (fbmProfit / costBase) * 100 : 0;

    get('r_fba_profit').textContent = fmt(fbaProfit);
    get('r_fbm_profit').textContent = fmt(fbmProfit);
    get('r_fba_margin').textContent = fbaMargin.toFixed(1) + '%';
    get('r_fbm_margin').textContent = fbmMargin.toFixed(1) + '%';
    get('r_fba_roi').textContent = fbaRoi.toFixed(1) + '%';
    get('r_fbm_roi').textContent = fbmRoi.toFixed(1) + '%';
    var better = fbaProfit >= fbmProfit ? 'FBA' : 'FBM';
    get('r_better').textContent = better + ' earns ' + fmt(Math.abs(fbaProfit - fbmProfit)) + ' more per unit';
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['sale','cat','cogs','inbound','shipOut','ads','storage'].forEach(function (id) {
      var el = get(id); if (el) el.addEventListener('input', calc);
    });
    calc();
  });
})();