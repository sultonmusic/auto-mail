/* Auto Mail — avtomatik javob uchun HTML kartochka.
   Email mijozlari (Gmail, Outlook…) zamonaviy CSS'ni tushunmaydi,
   shuning uchun jadval va inline uslublar ishlatilgan. */
(function (global) {
  'use strict';

  var MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  var MONTHS_SHORT = ['yan', 'fev', 'mar', 'apr', 'may', 'iyun',
    'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'];

  function pad(number) { return (number < 10 ? '0' : '') + number; }

  /** 9-sentabr, 2026 */
  function longDate(time) {
    var date = new Date(time);
    return date.getDate() + '-' + MONTHS[date.getMonth()] + ', ' + date.getFullYear();
  }

  /** 9-sen */
  function shortDate(time) {
    var date = new Date(time);
    return date.getDate() + '-' + MONTHS_SHORT[date.getMonth()];
  }

  /** 9-sentabr, 2026 · 15:27 */
  function fullDate(time) {
    var date = new Date(time);
    return longDate(time) + ' · ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
  }

  function escapeHtml(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Tred identifikatoridan barqaror 7 xonali murojaat raqami. */
  function ticketCode(seed) {
    var hash = 0;
    var text = String(seed || Date.now());
    for (var i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }
    return String(Math.abs(hash) % 9000000 + 1000000);
  }

  /** Matndagi o'rin egallovchilarni almashtiradi. */
  function fill(text, data) {
    return String(text || '')
      .replace(/\{ism\}/g, data.name)
      .replace(/\{mavzu\}/g, data.subject)
      .replace(/\{ticket\}/g, data.ticket)
      .replace(/\{sana\}/g, data.date);
  }

  function infoRow(label, value, color) {
    return '' +
      '<tr><td style="padding:0 0 12px 0;">' +
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" ' +
          'style="background:#f4f6fb;border-left:4px solid ' + color + ';border-radius:8px;">' +
          '<tr><td style="padding:14px 18px;">' +
            '<div style="font:600 11px/1.4 Arial,Helvetica,sans-serif;letter-spacing:.08em;' +
              'text-transform:uppercase;color:#6b7280;">' + escapeHtml(label) + '</div>' +
            '<div style="font:600 16px/1.5 Arial,Helvetica,sans-serif;color:#111827;margin-top:4px;">' +
              escapeHtml(value) + '</div>' +
          '</td></tr>' +
        '</table>' +
      '</td></tr>';
  }

  /** Avtomatik javobni tayyorlaydi: {subject, html, text, ticket}. */
  function buildAutoReply(settings, mail) {
    var ticket = ticketCode(mail.threadId || mail.id);
    var data = {
      name: mail.from || mail.fromEmail || '',
      subject: mail.subject || '(mavzusiz)',
      ticket: '#' + ticket,
      date: longDate(mail.date || Date.now())
    };

    var brand = settings.brandName || 'Auto Mail';
    var color = settings.brandColor || '#1b2338';
    var title = fill(settings.autoReplyTitle || 'Xabaringiz qabul qilindi', data);
    var message = fill(settings.autoReplyText || '', data);
    var steps = (settings.autoReplySteps || '').split('\n')
      .map(function (line) { return line.trim(); })
      .filter(Boolean)
      .map(function (line) { return fill(line, data); });
    var buttonUrl = (settings.autoReplyUrl || '').trim();
    var buttonText = settings.autoReplyButton || 'Saytga o\'tish';
    var contact = (settings.autoReplyContact || '').trim();

    var html = '' +
'<!doctype html><html><body style="margin:0;padding:0;background:#eef1f7;">' +
'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#eef1f7;padding:24px 12px;">' +
'<tr><td align="center">' +
  '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;">' +

    /* brend paneli */
    '<tr><td style="background:' + escapeHtml(color) + ';border-radius:14px;padding:20px 26px;">' +
      '<div style="font:700 20px/1.3 Arial,Helvetica,sans-serif;color:#ffffff;">' + escapeHtml(brand) + '</div>' +
    '</td></tr>' +
    '<tr><td style="height:14px;line-height:14px;">&nbsp;</td></tr>' +

    /* asosiy kartochka */
    '<tr><td style="background:#ffffff;border-radius:14px;padding:30px 26px;">' +
      '<h1 style="margin:0 0 16px 0;font:700 24px/1.3 Arial,Helvetica,sans-serif;color:#111827;">' +
        escapeHtml(title) + '</h1>' +
      '<p style="margin:0 0 14px 0;font:400 16px/1.6 Arial,Helvetica,sans-serif;color:#374151;">' +
        'Assalomu alaykum, <b>' + escapeHtml(data.name) + '</b>!</p>' +
      (message ? '<p style="margin:0 0 22px 0;font:400 16px/1.6 Arial,Helvetica,sans-serif;color:#374151;">' +
        escapeHtml(message).replace(/\n/g, '<br>') + '</p>' : '') +

      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">' +
        infoRow('Murojaat raqami', data.ticket, escapeHtml(color)) +
        infoRow('Mavzu', data.subject, '#3b63f6') +
        infoRow('Qabul qilingan sana', data.date, '#22a06b') +
      '</table>' +

      (steps.length ? '<h2 style="margin:16px 0 10px 0;font:700 17px/1.4 Arial,Helvetica,sans-serif;color:#111827;">' +
        'Keyingi qadamlar</h2><ol style="margin:0 0 20px 0;padding-left:22px;' +
        'font:400 15px/1.7 Arial,Helvetica,sans-serif;color:#374151;">' +
        steps.map(function (line) { return '<li>' + escapeHtml(line) + '</li>'; }).join('') +
        '</ol>' : '') +

      (buttonUrl ? '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 20px 0;">' +
        '<tr><td style="background:' + escapeHtml(color) + ';border-radius:10px;">' +
        '<a href="' + escapeHtml(buttonUrl) + '" style="display:inline-block;padding:13px 26px;' +
        'font:700 15px/1 Arial,Helvetica,sans-serif;color:#ffffff;text-decoration:none;">' +
        escapeHtml(buttonText) + '</a></td></tr></table>' : '') +

      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" ' +
        'style="background:#f4f6fb;border-radius:10px;">' +
        '<tr><td style="padding:14px 18px;font:400 14px/1.6 Arial,Helvetica,sans-serif;color:#6b7280;">' +
          'Bu xabar avtomatik yuborildi. Tez orada javob beramiz' +
          (contact ? ', shoshilinch bo\'lsa: <a href="mailto:' + escapeHtml(contact) + '" ' +
            'style="color:#3b63f6;text-decoration:none;">' + escapeHtml(contact) + '</a>' : '') + '.' +
        '</td></tr>' +
      '</table>' +
    '</td></tr>' +

    /* pastki qism */
    '<tr><td style="padding:16px 26px;text-align:center;' +
      'font:400 13px/1.6 Arial,Helvetica,sans-serif;color:#9099ad;">' +
      escapeHtml(brand) + (contact ? ' · ' + escapeHtml(contact) : '') +
    '</td></tr>' +

  '</table>' +
'</td></tr></table></body></html>';

    var text = [
      title,
      '',
      'Assalomu alaykum, ' + data.name + '!',
      message,
      '',
      'Murojaat raqami: ' + data.ticket,
      'Mavzu: ' + data.subject,
      'Qabul qilingan sana: ' + data.date
    ].concat(steps.length ? ['', 'Keyingi qadamlar:'].concat(steps.map(function (line, i) {
      return (i + 1) + '. ' + line;
    })) : []).concat([
      '',
      'Bu xabar avtomatik yuborildi.' + (contact ? ' Shoshilinch bo\'lsa: ' + contact : ''),
      brand
    ]).join('\n');

    return {
      subject: mail.subject || '(mavzusiz)',
      html: html,
      text: text,
      ticket: data.ticket
    };
  }

  global.Template = {
    buildAutoReply: buildAutoReply,
    ticketCode: ticketCode,
    fill: fill,
    longDate: longDate,
    shortDate: shortDate,
    fullDate: fullDate
  };
})(window);
