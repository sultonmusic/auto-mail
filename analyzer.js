/* Auto Mail — xatlarni tahlil qiluvchi qatlam.
   Tashqi xizmatsiz, brauzerning o'zida ishlaydi: mavzu, matn va
   jo'natuvchi bo'yicha xatni uch guruhga ajratadi —
   muhim / odatiy / bekorchi (ma'nosiz yozuvlar, robot xabarlari). */
(function (global) {
  'use strict';

  /* Robot va ommaviy tarqatma manzillari. */
  var ROBOT_HINTS = ['noreply', 'no-reply', 'donotreply', 'do-not-reply', 'mailer-daemon',
    'postmaster', 'bounce', 'notification', 'notifications', 'automated', 'newsletter',
    'mailer', 'support@google', 'info@news'];

  /* Ish bilan bog'liq, e'tibor talab qiladigan so'zlar (uz / en / ru). */
  var IMPORTANT_WORDS = [
    'buyurtma', 'narx', 'narxlar', 'to\'lov', 'tolov', 'hisob', 'shartnoma', 'shoshilinch',
    'muammo', 'xato', 'yordam', 'kechikdi', 'qaytarish', 'kafolat', 'shikoyat', 'taklif',
    'order', 'price', 'quote', 'invoice', 'payment', 'contract', 'urgent', 'asap',
    'problem', 'issue', 'error', 'help', 'refund', 'complaint', 'deadline', 'proposal',
    'заказ', 'цена', 'счет', 'счёт', 'оплата', 'договор', 'срочно', 'проблема',
    'ошибка', 'помощь', 'возврат', 'жалоба', 'предложение', 'сроки'
  ];

  /* Reklama belgilari. */
  var PROMO_WORDS = ['unsubscribe', 'obuna', 'отписаться', 'sale', 'chegirma', 'скидка',
    'promo', 'aksiya', 'акция', 'discount', '% off', 'newsletter', 'rassilka'];

  var VOWELS = /[aeiouyаеёиоуыэюяoʻ']/i;
  var CONSONANT_RUN = /[bcdfghjklmnpqrstvwxzбвгджзклмнпрстфхцчшщ]{5,}/i;
  var REPEAT_RUN = /(.)\1{2,}/;

  /** Bitta so'z ma'nosizmi? (klaviatura bosib yuborilgan matn) */
  function isGibberishWord(word) {
    if (word.length < 6) return false;
    if (CONSONANT_RUN.test(word)) return true;
    if (REPEAT_RUN.test(word)) return true;
    var vowels = (word.match(new RegExp(VOWELS.source, 'gi')) || []).length;
    return vowels / word.length < 0.15;
  }

  /** Matnning qanchasi ma'nosiz (0 dan 1 gacha). */
  function gibberishRatio(text) {
    var words = String(text || '').toLowerCase().match(/[\p{L}']{3,}/gu) || [];
    if (!words.length) return 0;
    var bad = 0;
    words.forEach(function (word) { if (isGibberishWord(word)) bad++; });
    return bad / words.length;
  }

  function contains(text, list) {
    var value = String(text || '').toLowerCase();
    return list.some(function (word) { return value.indexOf(word) !== -1; });
  }

  function isRobot(email) {
    var value = String(email || '').toLowerCase();
    return ROBOT_HINTS.some(function (hint) { return value.indexOf(hint) !== -1; });
  }

  /**
   * Xatni baholaydi.
   * @returns {{priority: 'high'|'normal'|'junk', score: number, reasons: string[]}}
   *   reasons — tarjima kalitlari ro'yxati (i18n dagi 'why.*').
   */
  function classify(mail) {
    var subject = mail.subject || '';
    var snippet = mail.snippet || '';
    var text = subject + ' ' + snippet;
    var reasons = [];
    var score = 0;

    var junkRatio = gibberishRatio(text);
    var length = text.replace(/\s/g, '').length;

    /* Faqat ma'nosiz matn bekorchi hisoblanadi. Qisqa xat (masalan «01»
       yoki «Hi») odam yozgan bo'lishi mumkin — uni yo'qotib qo'ymaymiz. */
    if (junkRatio >= 0.5 || length === 0) {
      reasons.push('why.gibberish');
      return { priority: 'junk', score: -5, reasons: reasons };
    }

    if (isRobot(mail.fromEmail)) {
      score -= 3;
      reasons.push('why.robot');
    } else {
      score += 1;
    }

    if (contains(text, PROMO_WORDS)) {
      score -= 2;
      reasons.push('why.promo');
    }

    if (contains(text, IMPORTANT_WORDS)) {
      score += 3;
      reasons.push('why.keyword');
    }

    if (/\?|\bсрочно\b|\burgent\b/i.test(text)) {
      score += 1;
      reasons.push('why.question');
    }

    if (/^re:/i.test(subject)) {
      score += 1;
      reasons.push('why.thread');
    }

    /* Reklama va robotlardan bo'lmagan, ammo bir necha kundan beri
       javobsiz turgan xat ham diqqatga loyiq. */
    var ageDays = (Date.now() - (mail.date || Date.now())) / 86400000;
    if (ageDays > 2 && score > 0) {
      score += 1;
      reasons.push('why.waiting');
    }

    if (junkRatio >= 0.3) {
      score -= 2;
      reasons.push('why.noisy');
    }

    if (length < 4) {
      score -= 1;
      reasons.push('why.short');
    }

    return {
      priority: score >= 3 ? 'high' : (score <= -3 ? 'junk' : 'normal'),
      score: score,
      reasons: reasons
    };
  }

  global.Analyzer = {
    classify: classify,
    gibberishRatio: gibberishRatio,
    isRobot: isRobot
  };
})(window);
