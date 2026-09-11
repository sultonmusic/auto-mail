/**
 * Auto Mail — Google Apps Script avtomatik javob beruvchisi.
 *
 * Bu skript Google serverida ishlaydi: brauzer yopiq bo'lsa ham, telefon
 * o'chiq bo'lsa ham har daqiqada pochtani tekshiradi va yangi xatga
 * kartochkali javob yuboradi. Saytdagi ilova bilan bir xil qoidalarga
 * amal qiladi (robot manzillar, ma'nosiz matnlar chetlab o'tiladi,
 * har suhbatga bir marta javob).
 *
 * O'rnatish tartibi README.md dagi «24/7 avtomatik javob» bo'limida.
 */

/* ─────────────── Sozlamalar ─────────────── */

var CONFIG = {
  brand: 'Founder Capline Group',
  senderName: 'Founder Capline Group',   // Gmail'da ko'rinadigan nom
  color: '#1b2338',
  logoUrl: 'https://sultonmusic.github.io/auto-mail/logo.png',
  contact: '',                            // masalan 'info@example.com'
  buttonUrl: '',                          // bo'sh bo'lsa tugma chiqmaydi
  buttonText: 'Перейти на сайт',

  /* Javob matni (rus tilida). {name} {subject} {ticket} {date} ishlaydi. */
  title: 'Мы получили ваше обращение',
  text: 'Ваше обращение зарегистрировано. Специалист рассмотрит его и ответит на этот адрес в ближайшее время.',
  steps: [
    'Специалист рассмотрит указанные детали.',
    'Если что-то нужно уточнить, мы свяжемся с вами.',
    'Решение придёт на этот адрес отдельным письмом.'
  ],
  responseTime: 'В течение 7 рабочих дней',
  labels: {
    ticket: 'Номер обращения',
    subject: 'Тема обращения',
    date: 'Дата получения',
    responseTime: 'Срок ответа',
    steps: 'Что будет дальше',
    greeting: 'Здравствуйте!',
    autoNote: 'Это сообщение отправлено автоматически. Мы ответим в ближайшее время',
    autoNoteContact: ', срочные вопросы: {contact}'
  },

  /* Ish qoidalari */
  label: 'AutoReplied',                   // javob berilgan suhbatlarga qo'yiladi
  query: 'in:inbox -from:me newer_than:1h',   // faqat yangi xatlar; 2d qilsangiz eski xatlarga ham javob ketadi
  maxPerRun: 10,                          // bir yugurishda ko'pi bilan shuncha javob
  minMinutesOld: 0                        // xat kelgach shuncha daqiqa kutiladi
};

var MONTHS_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

var ROBOT_HINTS = ['noreply', 'no-reply', 'donotreply', 'do-not-reply', 'mailer-daemon',
  'postmaster', 'bounce', 'notification', 'notifications', 'automated', 'newsletter',
  'mailer', 'support@google'];

/* ─────────────── O'rnatish ─────────────── */

/** Bir marta ishga tushiring: har daqiqada tekshiruvni yoqadi. */
function setup() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'autoReply') ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('autoReply').timeBased().everyMinutes(1).create();
  getOrCreateLabel_(CONFIG.label);
  Logger.log('Tayyor: har daqiqada tekshiriladi. Sinash uchun autoReply() ni ishga tushiring.');
}

/**
 * Sinov: o'zingizga bitta kartochka yuboradi, shunda ko'rinishini
 * darhol tekshirib olasiz. Navbatga va yorliqlarga tegmaydi.
 */
function testCard() {
  var me = Session.getActiveUser().getEmail();
  var data = {
    name: 'Sulton',
    subject: 'Тест',
    ticket: '#' + ticketCode_('test'),
    date: formatDate_(new Date())
  };
  var boundary = 'automail-' + Utilities.getUuid();
  var mime = [
    'From: ' + encodeHeader_(CONFIG.senderName) + ' <' + me + '>',
    'To: ' + me,
    'Subject: ' + encodeHeader_('[ТЕСТ] ' + fill_(CONFIG.title, data)),
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' + boundary + '"',
    '',
    '--' + boundary,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    buildText_(data),
    '--' + boundary,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    buildCard_(data),
    '--' + boundary + '--'
  ].join('\r\n');

  Gmail.Users.Messages.send({
    raw: Utilities.base64EncodeWebSafe(Utilities.newBlob(mime).getBytes())
  }, 'me');
  Logger.log('Sinov xati ' + me + ' manziliga yuborildi.');
}

/** Avtomatik javobni butunlay to'xtatadi. */
function stop() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'autoReply') ScriptApp.deleteTrigger(trigger);
  });
  Logger.log('To\'xtatildi.');
}

/* ─────────────── Asosiy ish ─────────────── */

function autoReply() {
  var label = getOrCreateLabel_(CONFIG.label);
  var query = CONFIG.query + ' -label:' + CONFIG.label;
  var threads = GmailApp.search(query, 0, CONFIG.maxPerRun);
  var me = Session.getActiveUser().getEmail().toLowerCase();
  var sent = 0;

  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    var messages = thread.getMessages();
    var message = messages[messages.length - 1];

    var fromEmail = extractEmail_(message.getFrom()).toLowerCase();
    var fromName = extractName_(message.getFrom());
    var subject = message.getSubject() || '';
    var snippet = (message.getPlainBody() || '').slice(0, 200);
    var ageMinutes = (Date.now() - message.getDate().getTime()) / 60000;

    /* Javob berilmaydigan hollar — baribir belgilab qo'yamiz,
       shunda keyingi yugurishlarda qayta ko'rilmaydi. */
    if (ageMinutes < CONFIG.minMinutesOld) continue;
    if (!fromEmail || fromEmail === me || isRobot_(fromEmail) ||
        isGibberish_(subject + ' ' + snippet)) {
      thread.addLabel(label);
      continue;
    }

    try {
      sendCard_(thread, message, fromName || fromEmail, fromEmail, subject);
      thread.addLabel(label);
      sent++;
    } catch (err) {
      Logger.log('Javob yuborilmadi (' + fromEmail + '): ' + err.message);
    }
  }

  if (sent) Logger.log(sent + ' ta xatga avtomatik javob yuborildi.');
}

/* ─────────────── Xat yuborish ─────────────── */

function sendCard_(thread, message, name, toEmail, subject) {
  var ticket = '#' + ticketCode_(thread.getId());
  var data = {
    name: name,
    subject: subject || '—',
    ticket: ticket,
    date: formatDate_(message.getDate())
  };

  var replySubject = /^re:/i.test(subject) ? subject : 'Re: ' + subject;
  if (replySubject.indexOf(ticket) === -1) replySubject += ' [' + ticket + ']';

  var html = buildCard_(data);
  var text = buildText_(data);
  var boundary = 'automail-' + Utilities.getUuid();

  var mime = [
    'From: ' + encodeHeader_(CONFIG.senderName) + ' <' + Session.getActiveUser().getEmail() + '>',
    'To: ' + toEmail,
    'Subject: ' + encodeHeader_(replySubject),
    'In-Reply-To: ' + message.getHeader('Message-ID'),
    'References: ' + message.getHeader('Message-ID'),
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' + boundary + '"',
    '',
    '--' + boundary,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    text,
    '--' + boundary,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    html,
    '--' + boundary + '--'
  ].join('\r\n');

  Gmail.Users.Messages.send({
    raw: Utilities.base64EncodeWebSafe(Utilities.newBlob(mime).getBytes()),
    threadId: thread.getId()
  }, 'me');
}

/* ─────────────── Kartochka ─────────────── */

function buildCard_(data) {
  var L = CONFIG.labels;
  var contactLine = CONFIG.contact
    ? fill_(L.autoNoteContact, { contact: '<a href="mailto:' + CONFIG.contact +
        '" style="color:#3b63f6;text-decoration:none;">' + CONFIG.contact + '</a>' })
    : '';

  var rows =
    infoRow_(L.ticket, data.ticket, CONFIG.color) +
    infoRow_(L.subject, data.subject, '#3b63f6') +
    infoRow_(L.date, data.date, '#22a06b') +
    infoRow_(L.responseTime, fill_(CONFIG.responseTime, data), '#f0a020');

  var steps = CONFIG.steps.length
    ? '<h2 style="margin:16px 0 10px 0;font:700 17px/1.4 Arial,Helvetica,sans-serif;color:#111827;">' +
      escape_(L.steps) + '</h2><ol style="margin:0 0 20px 0;padding-left:22px;' +
      'font:400 15px/1.7 Arial,Helvetica,sans-serif;color:#374151;">' +
      CONFIG.steps.map(function (line) { return '<li>' + escape_(fill_(line, data)) + '</li>'; }).join('') +
      '</ol>'
    : '';

  var button = CONFIG.buttonUrl
    ? '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 20px 0;">' +
      '<tr><td style="background:' + CONFIG.color + ';border-radius:10px;">' +
      '<a href="' + escape_(CONFIG.buttonUrl) + '" style="display:inline-block;padding:13px 26px;' +
      'font:700 15px/1 Arial,Helvetica,sans-serif;color:#ffffff;text-decoration:none;">' +
      escape_(CONFIG.buttonText) + '</a></td></tr></table>'
    : '';

  var logo = CONFIG.logoUrl
    ? '<td style="padding-right:14px;" valign="middle">' +
      '<img src="' + escape_(CONFIG.logoUrl) + '" width="44" height="44" alt="" ' +
      'style="display:block;width:44px;height:44px;border-radius:10px;background:#ffffff;"></td>'
    : '';

  /* Pochta ro'yxatidagi uchinchi qator shu matndan olinadi. */
  var preview = fill_(L.greeting, { name: data.name }) + ' ' + fill_(CONFIG.title, data);

  return '<!doctype html><html><body style="margin:0;padding:0;background:#eef1f7;">' +
    '<div style="display:none;font-size:1px;color:#eef1f7;line-height:1px;max-height:0;' +
    'max-width:0;opacity:0;overflow:hidden;">' + escape_(preview) +
    '&#8203;&#847;&#8203;&#847;&#8203;&#847;&#8203;&#847;&#8203;&#847;</div>' +
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#eef1f7;padding:24px 12px;">' +
    '<tr><td align="center">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;">' +

      '<tr><td style="background:' + CONFIG.color + ';border-radius:14px;padding:18px 24px;">' +
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>' + logo +
          '<td valign="middle"><div style="font:700 20px/1.3 Arial,Helvetica,sans-serif;color:#ffffff;">' +
            escape_(CONFIG.brand) + '</div></td>' +
        '</tr></table>' +
      '</td></tr>' +
      '<tr><td style="height:14px;line-height:14px;">&nbsp;</td></tr>' +

      '<tr><td style="background:#ffffff;border-radius:14px;padding:30px 26px;">' +
        '<h1 style="margin:0 0 16px 0;font:700 24px/1.3 Arial,Helvetica,sans-serif;color:#111827;">' +
          escape_(fill_(CONFIG.title, data)) + '</h1>' +
        '<p style="margin:0 0 14px 0;font:400 16px/1.6 Arial,Helvetica,sans-serif;color:#374151;">' +
          fill_(escape_(L.greeting), { name: '<b>' + escape_(data.name) + '</b>' }) + '</p>' +
        '<p style="margin:0 0 22px 0;font:400 16px/1.6 Arial,Helvetica,sans-serif;color:#374151;">' +
          escape_(fill_(CONFIG.text, data)) + '</p>' +
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">' + rows + '</table>' +
        steps + button +
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4f6fb;border-radius:10px;">' +
          '<tr><td style="padding:14px 18px;font:400 14px/1.6 Arial,Helvetica,sans-serif;color:#6b7280;">' +
            escape_(L.autoNote) + contactLine + '.</td></tr>' +
        '</table>' +
      '</td></tr>' +

      '<tr><td style="padding:16px 26px;text-align:center;font:400 13px/1.6 Arial,Helvetica,sans-serif;color:#9099ad;">' +
        escape_(CONFIG.brand) + (CONFIG.contact ? ' · ' + escape_(CONFIG.contact) : '') +
      '</td></tr>' +

    '</table></td></tr></table></body></html>';
}

function buildText_(data) {
  var L = CONFIG.labels;
  var lines = [
    fill_(L.greeting, { name: data.name }),
    '',
    fill_(CONFIG.title, data),
    fill_(CONFIG.text, data),
    '',
    L.ticket + ': ' + data.ticket,
    L.subject + ': ' + data.subject,
    L.date + ': ' + data.date,
    L.responseTime + ': ' + fill_(CONFIG.responseTime, data)
  ];
  if (CONFIG.steps.length) {
    lines.push('', L.steps + ':');
    CONFIG.steps.forEach(function (line, index) {
      lines.push((index + 1) + '. ' + fill_(line, data));
    });
  }
  lines.push('', L.autoNote + (CONFIG.contact ? ', ' + CONFIG.contact : '') + '.', CONFIG.brand);
  return lines.join('\n');
}

function infoRow_(label, value, color) {
  return '<tr><td style="padding:0 0 12px 0;">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" ' +
      'style="background:#f4f6fb;border-left:4px solid ' + color + ';border-radius:8px;">' +
      '<tr><td style="padding:14px 18px;">' +
        '<div style="font:600 11px/1.4 Arial,Helvetica,sans-serif;letter-spacing:.08em;' +
          'text-transform:uppercase;color:#6b7280;">' + escape_(label) + '</div>' +
        '<div style="font:600 16px/1.5 Arial,Helvetica,sans-serif;color:#111827;margin-top:4px;">' +
          escape_(value) + '</div>' +
      '</td></tr></table></td></tr>';
}

/* ─────────────── Yordamchilar ─────────────── */

function getOrCreateLabel_(name) {
  return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
}

function extractEmail_(from) {
  var match = /<([^>]+)>/.exec(from || '');
  return (match ? match[1] : (from || '')).trim();
}

function extractName_(from) {
  var match = /^\s*"?([^"<]*?)"?\s*</.exec(from || '');
  return match ? match[1].trim() : '';
}

function isRobot_(email) {
  var value = String(email || '').toLowerCase();
  for (var i = 0; i < ROBOT_HINTS.length; i++) {
    if (value.indexOf(ROBOT_HINTS[i]) !== -1) return true;
  }
  return false;
}

/** Klaviatura bosib yuborilgan ma'nosiz matnni aniqlaydi. */
function isGibberish_(text) {
  var words = String(text || '').toLowerCase().match(/[a-zа-яё']{3,}/g);
  if (!words || !words.length) return String(text || '').replace(/\s/g, '').length === 0;
  var bad = 0;
  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    if (word.length < 6) continue;
    var vowels = (word.match(/[aeiouyаеёиоуыэюя]/g) || []).length;
    if (/[bcdfghjklmnpqrstvwxzбвгджзклмнпрстфхцчшщ]{5,}/.test(word) ||
        /(.)\1{2,}/.test(word) || vowels / word.length < 0.15) bad++;
  }
  return bad / words.length >= 0.5;
}

/** Suhbat identifikatoridan barqaror 7 xonali murojaat raqami. */
function ticketCode_(seed) {
  var hash = 0;
  var text = String(seed || '');
  for (var i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return String(Math.abs(hash) % 9000000 + 1000000);
}

function formatDate_(date) {
  return date.getDate() + ' ' + MONTHS_RU[date.getMonth()] + ' ' + date.getFullYear();
}

function fill_(text, data) {
  return String(text || '').replace(/\{(\w+)\}/g, function (match, key) {
    return data[key] !== undefined ? data[key] : match;
  });
}

/** Sarlavhada lotin bo'lmagan harflar bo'lsa, MIME qoidasiga o'raydi. */
function encodeHeader_(text) {
  var value = String(text || '');
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return '=?UTF-8?B?' + Utilities.base64Encode(Utilities.newBlob(value).getBytes()) + '?=';
}

function escape_(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
