(function () {
  'use strict';

  // Fee tables (Amazon US, 2026)
  var FULFILLMENT = {
    small_standard:  { base: 3.06, perLbOver: 0.20, thresholdLb: 0.25 },
    large_standard:  { base: 3.83, perLbOver: 0.20, thresholdLb: 0.75 },
    large_bulky:     { base: 9.61, perLbOver: 0.42, thresholdLb: 1.50 },
    extra_large:     { base: 78.58, perLbOver: 0.83, thresholdLb: 50 }
  };
  var STORAGE = {
    standard: { nonQ4: 0.87, q4: 2.40 },
    bulky:    { nonQ4: 0.56, q4: 1.40 }
  };
  var PLACEMENT = {
    minimal:         { small_standard: 0.00, large_standard: 0.00, large_bulky: 0.08, extra_large: 0.12 },
    partial:         { small_standard: 0.12, large_standard: 0.21, large_bulky: 0.34, extra_large: 0.46 },
    amazon_partnered:{ small_standard: 0.10, large_standard: 0.18, large_bulky: 0.28, extra_large: 0.40 }
  };
  var LOW_INV = { small_standard: 0.32, large_standard: 0.35, large_bulky: 0.55, extra_large: 1.10 };
  var CUBIC_FEET = { small_standard: 0.04, large_standard: 0.12, large_bulky: 1.0, extra_large: 4.5 };

  function $id(s) { return document.getElementById(s); }
  function $num(s) { var v = parseFloat(s); return isNaN(v) || v < 0 ? 0 : v; }
  function fmt(n) { return '$' + n.toFixed(2); }

  function calcFulfillment(tier, weight) {
    var t = FULFILLMENT[tier];
    var over = Math.max(0, weight - t.thresholdLb);
    return t.base + over * t.perLbOver;
  }

  function calcStorage(tier, months, isQ4) {
    var cf = CUBIC_FEET[tier];
    var isBulky = (tier === 'large_bulky' || tier === 'extra_large');
    var rate = isBulky ? STORAGE.bulky : STORAGE.standard;
    return cf * (isQ4 ? rate.q4 : rate.nonQ4) * months;
  }

  function calculate() {
    var salePrice   = $num($id('salePrice').value);
    var refRate     = $num($id('category').value);
    var cogs        = $num($id('cogs').value);
    var ship        = $num($id('shippingInbound').value);
    var tier        = $id('sizeTier').value;
    var weight      = $num($id('weight').value);
    var months      = $num($id('storageMonths').value);
    var isQ4        = $id('isQ4').value === '1';
    var invLevel    = $id('inventoryLevel').value;
    var placement   = $id('placement').value;

    var referral  = salePrice * refRate;
    var fulfill   = calcFulfillment(tier, weight);
    var placementFee = PLACEMENT[placement][tier];
    var lowInv    = invLevel === 'low' ? LOW_INV[tier] : 0;
    var storage   = calcStorage(tier, months, isQ4);
    var proceeds  = salePrice - referral - fulfill - placementFee - lowInv - storage;
    var profit    = proceeds - cogs - ship;
    var margin    = salePrice > 0 ? (profit / salePrice) * 100 : 0;
    var totalCost = cogs + ship;
    var roi       = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    $id('r_sale').textContent       = fmt(salePrice);
    $id('r_referral').textContent   = '-' + fmt(referral);
    $id('r_fulfillment').textContent= '-' + fmt(fulfill);
    $id('r_placement').textContent  = '-' + fmt(placementFee);
    $id('r_lowInv').textContent     = '-' + fmt(lowInv);
    $id('r_storage').textContent    = '-' + fmt(storage);
    $id('r_proceeds').textContent   = fmt(proceeds);
    $id('r_cogs').textContent       = '-' + fmt(cogs);
    $id('r_ship').textContent       = '-' + fmt(ship);
    $id('r_profit').textContent     = fmt(profit);
    $id('r_roi').textContent        = margin.toFixed(1) + '% / ' + roi.toFixed(1) + '%';
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['salePrice','category','cogs','shippingInbound','sizeTier','weight','storageMonths','isQ4','inventoryLevel','placement']
      .forEach(function (id) { var el = $id(id); if (el) el.addEventListener('input', calculate); });
    calculate();
  });
})();