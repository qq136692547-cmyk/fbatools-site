(function () {
  'use strict';

  // === 2026 Amazon FBA US fee tables (shared with fba-calculator) ===
  var FULFILLMENT = {
    small_standard:   3.30,
    large_standard:   4.98,
    small_oversize:   8.74,
    medium_oversize: 11.45,
    large_oversize:  75.86
  };
  var LOW_PRICE_FULFILLMENT = {
    small_standard: 1.43,  large_standard: 3.27,
    small_oversize: 0,     medium_oversize: 0,  large_oversize: 0
  };
  var PLACEMENT = {
    small_standard:  { minimal: 0.00, partial: 0.12, amazon_partnered: 0.10 },
    large_standard:  { minimal: 0.00, partial: 0.21, amazon_partnered: 0.18 },
    small_oversize:  { minimal: 0.08, partial: 0.34, amazon_partnered: 0.28 },
    medium_oversize: { minimal: 0.10, partial: 0.40, amazon_partnered: 0.34 },
    large_oversize:  { minimal: 0.12, partial: 0.46, amazon_partnered: 0.40 }
  };
  var LOW_INV = {
    small_standard: 0.32,  large_standard: 0.35,
    small_oversize: 0.55,  medium_oversize: 0.55,  large_oversize: 1.10
  };
  var CUBIC_FEET = {
    small_standard: 0.04,  large_standard: 0.12,
    small_oversize: 0.8,   medium_oversize: 1.5,   large_oversize: 4.5
  };
  var STORAGE = {
    standard: { nonQ4: 0.87, q4: 2.40 },
    oversize: { nonQ4: 0.56, q4: 1.40 }
  };
  var FUEL_SURCHARGE = 0.035;
  var LOW_PRICE_REFERRAL_ADDON = 0.05;
  var LOW_PRICE_THRESHOLD = 10;
  var REF_MIN = 0.30;

  function isOversize(tier) { return tier !== 'small_standard' && tier !== 'large_standard'; }

  var get = function (s) { return document.getElementById(s); };
  function num(s) { var v = parseFloat(s); return isNaN(v) || v < 0 ? 0 : v; }
  function fmt(n) { return '$' + n.toFixed(2); }

  // Multi-tier referral fee calculator (must match fba-calculator.js exactly)
  function calcReferral(category, salePrice) {
    var sel = get('cat');
    var opt = sel.options[sel.selectedIndex];
    var data = {
      rate: parseFloat(opt.getAttribute('data-rate') || 0),
      tier: parseFloat(opt.getAttribute('data-tier') || 0),
      tier1: parseFloat(opt.getAttribute('data-tier1') || 0),
      tier2: parseFloat(opt.getAttribute('data-tier2') || 0),
      tier3: parseFloat(opt.getAttribute('data-tier3') || 0),
      cap: parseFloat(opt.getAttribute('data-cap') || 0),
      min: parseFloat(opt.getAttribute('data-min') || 0),
      closing: parseFloat(opt.getAttribute('data-closing') || 0)
    };

    var ref = 0;
    if (category === 'most' || category === 'beauty_grocery' || category === 'clothing' || category === 'auto') {
      // Single tier
      ref = salePrice * data.rate;
    } else if (category === 'amazon_device') {
      // 45% capped $0.30
      ref = Math.min(salePrice * data.rate, data.cap);
    } else if (category === 'electronics' || category === 'cell_phones') {
      // ≤100: 8%, >$100: 15%
      if (salePrice <= 100) ref = salePrice * data.rate;
      else ref = 100 * data.rate + (salePrice - 100) * data.tier1;
    } else if (category === 'books') {
      // ≤15: 5%, $15-$20: 10%, >$20: 17% + closing fee $1.80
      if (salePrice <= 15) ref = salePrice * data.rate;
      else if (salePrice <= 20) ref = 15 * data.rate + (salePrice - 15) * data.tier1;
      else ref = 15 * data.rate + 5 * data.tier1 + (salePrice - 20) * data.tier2;
      ref += data.closing;
    } else if (category === 'watches') {
      // ≤1500: 16%, >$1500: 3%
      if (salePrice <= 1500) ref = salePrice * data.rate;
      else ref = 1500 * data.rate + (salePrice - 1500) * data.tier2;
    } else if (category === 'jewelry') {
      // ≤100: 20% (min $1), $100-$1K: 15%, $1K-$5K: 10%, >$5K: 5%
      if (salePrice <= 100) ref = Math.max(salePrice * data.rate, data.min);
      else if (salePrice <= 1000) ref = 100 * data.rate + (salePrice - 100) * data.tier1;
      else if (salePrice <= 5000) ref = 100 * data.rate + 900 * data.tier1 + (salePrice - 1000) * data.tier2;
      else ref = 100 * data.rate + 900 * data.tier1 + 4000 * data.tier2 + (salePrice - 5000) * data.tier3;
    } else {
      // fallback: most categories
      ref = salePrice * 0.15;
    }

    // Referral minimum $0.30 (not for Amazon Device which has capped logic)
    if (category !== 'amazon_device') {
      ref = Math.max(ref, REF_MIN);
    }

    return ref;
  }

  function calc() {
    var sale     = num(get('sale').value);
    var catKey   = get('cat').value;
    var cogs     = num(get('cogs').value);
    var inbound  = num(get('inbound').value);
    var shipOut  = num(get('shipOut').value);
    var adsPct   = num(get('ads').value) / 100;
    var fbaStorage = num(get('storage').value);
    var tier     = get('sizeTier').value;
    var placementMode = get('placement').value;
    var invLevel = get('isLowInv').value;

    // === FBA path: 5 Amazon fees ===
    // 1. Referral fee (multi-tier)
    var referral = calcReferral(catKey, sale);
    if (sale > 0 && sale < LOW_PRICE_THRESHOLD) {
      referral = referral + LOW_PRICE_REFERRAL_ADDON;
    }

    // 2. FBA fulfillment
    var baseFulfill = FULFILLMENT[tier];
    if (sale > 0 && sale < LOW_PRICE_THRESHOLD) {
      var lp = LOW_PRICE_FULFILLMENT[tier];
      if (lp > 0) baseFulfill = lp;
    }
    var fulfillment = baseFulfill * (1 + FUEL_SURCHARGE);

    // 3. Inbound placement
    var placementFee = PLACEMENT[tier] ? PLACEMENT[tier][placementMode] : 0;

    // 4. Low-inventory fee
    var lowInv = invLevel === 'low' ? LOW_INV[tier] : 0;

    // 5. Storage
    var fbaFees = referral + fulfillment + placementFee + lowInv + fbaStorage;
    var fbaRevenue = sale - fbaFees;
    var ads = sale * adsPct;
    var fbaProfit = fbaRevenue - cogs - inbound - ads;
    var fbaMargin = sale > 0 ? (fbaProfit / sale) * 100 : 0;
    var fbaCostBase = cogs + inbound + fbaStorage + ads;
    var fbaRoi = fbaCostBase > 0 ? (fbaProfit / fbaCostBase) * 100 : 0;

    // === FBM path ===
    var fbmReferral = calcReferral(catKey, sale);
    if (sale > 0 && sale < LOW_PRICE_THRESHOLD) {
      fbmReferral = fbmReferral + LOW_PRICE_REFERRAL_ADDON;
    }
    var fbmRevenue = sale - fbmReferral - shipOut;
    var fbmProfit = fbmRevenue - cogs - inbound - ads;
    var fbmMargin = sale > 0 ? (fbmProfit / sale) * 100 : 0;
    var fbmCostBase = cogs + inbound + ads;
    var fbmRoi = fbmCostBase > 0 ? (fbmProfit / fbmCostBase) * 100 : 0;

    // === Display ===
    get('r_fba_profit').textContent = fmt(fbaProfit);
    get('r_fbm_profit').textContent = fmt(fbmProfit);
    get('r_fba_margin').textContent = fbaMargin.toFixed(1) + '%';
    get('r_fbm_margin').textContent = fbmMargin.toFixed(1) + '%';
    get('r_fba_roi').textContent = fbaRoi.toFixed(1) + '%';
    get('r_fbm_roi').textContent = fbmRoi.toFixed(1) + '%';
    get('r_fba_fees').textContent = '-' + fmt(fbaFees);
    get('r_fbm_fees').textContent = '-' + fmt(fbmReferral + shipOut);

    var better = fbaProfit >= fbmProfit ? 'FBA' : 'FBM';
    get('r_better').textContent = better + ' earns ' + fmt(Math.abs(fbaProfit - fbmProfit)) + ' more per unit';
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['sale','cat','cogs','inbound','shipOut','ads','storage','sizeTier','placement','isLowInv'].forEach(function (id) {
          var el = get(id);
          if (el) {
            el.addEventListener('input', calc);
            el.addEventListener('change', calc);
          }
        });
    calc();
  });
})();