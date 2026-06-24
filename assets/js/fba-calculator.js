(function () {
  'use strict';

  // 2026 Amazon FBA US fee tables (verified against Amazon official 2026-01-15 announcement,
  // cross-checked with FeeYield 2026-05-27 and YieldCalcHub 2026-06-19)
  var FULFILLMENT = {
    small_standard:   3.30,
    large_standard:   4.98,
    small_oversize:   8.74,
    medium_oversize: 11.45,
    large_oversize:  75.86
  };

  // Low-Price FBA (applies if sale price < $10)
  var LOW_PRICE_FULFILLMENT = {
    small_standard: 1.43,
    large_standard: 3.27,
    small_oversize: 0,
    medium_oversize: 0,
    large_oversize: 0
  };

  // Standard-size: Inbound Placement Fee (Apr 2024+)
  var PLACEMENT = {
    small_standard:  { minimal: 0.00, partial: 0.12, amazon_partnered: 0.10 },
    large_standard:  { minimal: 0.00, partial: 0.21, amazon_partnered: 0.18 },
    small_oversize:  { minimal: 0.08, partial: 0.34, amazon_partnered: 0.28 },
    medium_oversize: { minimal: 0.10, partial: 0.40, amazon_partnered: 0.34 },
    large_oversize:  { minimal: 0.12, partial: 0.46, amazon_partnered: 0.40 }
  };

  // Low-Inventory Fee (Apr 2024+, applies when days-of-supply < 28)
  var LOW_INV = {
    small_standard: 0.32,
    large_standard: 0.35,
    small_oversize: 0.55,
    medium_oversize: 0.55,
    large_oversize: 1.10
  };

  // Cubic feet per size tier (rough industry average for storage estimate)
  var CUBIC_FEET = {
    small_standard: 0.04,
    large_standard: 0.12,
    small_oversize: 0.8,
    medium_oversize: 1.5,
    large_oversize: 4.5
  };

  // Monthly storage (US, 2026)
  var STORAGE = {
    standard: { nonQ4: 0.87, q4: 2.40 },
    oversize: { nonQ4: 0.56, q4: 1.40 }
  };

  var FUEL_SURCHARGE = 0.035;  // +3.5% on FBA fulfillment, effective Apr 17 2026
  var LOW_PRICE_REFERRAL_ADDON = 0.05;  // +$0.05 for items under $10
  var LOW_PRICE_THRESHOLD = 10;

  var $id = function (s) { return document.getElementById(s); };
  var $num = function (s) { var v = parseFloat(s); return isNaN(v) || v < 0 ? 0 : v; };
  var fmt = function (n) { return '$' + n.toFixed(2); };

  function isOversize(tier) { return tier !== 'small_standard' && tier !== 'large_standard'; }

  function calculate() {
    var salePrice = $num($id('salePrice').value);
    var refRate = $num($id('category').value);
    var cogs = $num($id('cogs').value);
    var ship = $num($id('shippingInbound').value);
    var tier = $id('sizeTier').value;
    var months = $num($id('storageMonths').value);
    var isQ4 = $id('isQ4').value === '1';
    var invLevel = $id('inventoryLevel').value;
    var placement = $id('placement').value;
    var refMin = 0.30;

    // 1. Referral fee
    var referral = Math.max(salePrice * refRate, refMin);
    if (salePrice > 0 && salePrice < LOW_PRICE_THRESHOLD) {
      referral = Math.max(referral, refMin) + LOW_PRICE_REFERRAL_ADDON;
    }

    // 2. FBA fulfillment (with low-price override + fuel surcharge)
    var baseFulfill = FULFILLMENT[tier];
    if (salePrice > 0 && salePrice < LOW_PRICE_THRESHOLD) {
      var lp = LOW_PRICE_FULFILLMENT[tier];
      if (lp > 0) baseFulfill = lp;
    }
    var fulfillment = baseFulfill * (1 + FUEL_SURCHARGE);

    // 3. Inbound placement
    var placementFee = PLACEMENT[tier] ? PLACEMENT[tier][placement] : 0;

    // 4. Low-inventory fee
    var lowInv = invLevel === 'low' ? LOW_INV[tier] : 0;

    // 5. Storage
    var cf = CUBIC_FEET[tier];
    var isOver = isOversize(tier);
    var rate = isOver ? STORAGE.oversize : STORAGE.standard;
    var storage = cf * (isQ4 ? rate.q4 : rate.nonQ4) * months;

    var proceeds = salePrice - referral - fulfillment - placementFee - lowInv - storage;
    var profit = proceeds - cogs - ship;
    var margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
    var totalCost = cogs + ship;
    var roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    $id('r_sale').textContent = fmt(salePrice);
    $id('r_referral').textContent = '−' + fmt(referral);
    $id('r_fulfillment').textContent = '−' + fmt(fulfillment);
    $id('r_placement').textContent = '−' + fmt(placementFee);
    $id('r_lowInv').textContent = '−' + fmt(lowInv);
    $id('r_storage').textContent = '−' + fmt(storage);
    $id('r_proceeds').textContent = fmt(proceeds);
    $id('r_cogs').textContent = '−' + fmt(cogs);
    $id('r_ship').textContent = '−' + fmt(ship);
    $id('r_profit').textContent = fmt(profit);
    $id('r_roi').textContent = margin.toFixed(1) + '% · ' + roi.toFixed(1) + '%';
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['salePrice','category','cogs','shippingInbound','sizeTier','storageMonths','isQ4','inventoryLevel','placement']
      .forEach(function (id) { var el = $id(id); if (el) el.addEventListener('input', calculate); });
    calculate();
  });
})();