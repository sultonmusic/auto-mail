/* Auto Mail — avtomatik javob uchun HTML kartochka.
   Email mijozlari (Gmail, Outlook…) zamonaviy CSS'ni tushunmaydi,
   shuning uchun jadval va inline uslublar ishlatilgan. */
(function (global) {
  'use strict';

  /** Sozlamada logo ko'rsatilmagan bo'lsa, ilovaning o'z logosi ishlatiladi.
      Email uchun manzil to'liq (absolute) bo'lishi shart. */
  function defaultLogo() {
    try {
      return new URL('logo.png', location.href).href;
    } catch (err) {
      return '';
    }
  }

  function pad(number) { return (number < 10 ? '0' : '') + number; }

  /** Ro'yxat va sarlavhalar uchun: 9-sentabr, 2026 · 15:27 */
  function fullDate(time) {
    var date = new Date(time);
    return I18n.longDate(time) + ' · ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
  }

  function escapeHtml(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Mavzu oxiriga murojaat raqamini qo'yadi: «Hello [#7501809]».
      Raqam allaqachon bo'lsa, takrorlanmaydi. */
  function withCode(subject, code) {
    var text = String(subject || '').trim();
    if (!code) return text;
    return text.indexOf(code) !== -1 ? text : (text + ' [' + code + ']');
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
  /* O'rin egallovchilar o'zbekcha ham, inglizcha ham yozilishi mumkin. */
  var SLOTS = {
    ism: 'name', name: 'name',
    mavzu: 'subject', subject: 'subject',
    ticket: 'ticket',
    sana: 'date', date: 'date'
  };

  function fill(text, data) {
    return String(text || '').replace(/\{(\w+)\}/g, function (match, key) {
      var field = SLOTS[key.toLowerCase()];
      return field && data[field] !== undefined ? data[field] : match;
    });
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
    var lang = settings.cardLang || 'en';
    var L = function (key, vars) { return I18n.card(lang, key, vars); };
    var ticket = ticketCode(mail.threadId || mail.id);
    var data = {
      name: mail.from || mail.fromEmail || '',
      subject: mail.subject || '—',
      ticket: '#' + ticket,
      date: I18n.longDate(mail.date || Date.now(), lang)
    };

    var brand = settings.brandName || 'Auto Mail';
    var color = settings.brandColor || '#1b2338';
    var title = fill(settings.autoReplyTitle || L('defaultTitle'), data);
    var message = fill(settings.autoReplyText || L('defaultText'), data);
    var steps = (settings.autoReplySteps || L('defaultSteps')).split('\n')
      .map(function (line) { return line.trim(); })
      .filter(Boolean)
      .map(function (line) { return fill(line, data); });
    var buttonUrl = (settings.autoReplyUrl || '').trim();
    var buttonText = settings.autoReplyButton || L('defaultButton');
    var contact = (settings.autoReplyContact || '').trim();
    var responseTime = fill(settings.responseTime || L('defaultResponseTime'), data);
    var logo = (settings.logoUrl || '').trim() || defaultLogo();

    /* Pochta ro'yxatida ko'rinadigan matn (preheader). Ko'rinmas blok,
       lekin Gmail aynan shuni uchinchi qatorda ko'rsatadi — shuning uchun
       u brend nomidan emas, murojaatchining ismidan boshlanadi. */
    var preview = L('greeting', { name: data.name }) + ' ' + title;

    var html = '' +
'<!doctype html><html><body style="margin:0;padding:0;background:#eef1f7;">' +
'<div style="display:none;font-size:1px;color:#eef1f7;line-height:1px;max-height:0;' +
'max-width:0;opacity:0;overflow:hidden;">' + escapeHtml(preview) +
'&#8203;&#847;&#8203;&#847;&#8203;&#847;&#8203;&#847;&#8203;&#847;</div>' +
'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#eef1f7;padding:24px 12px;">' +
'<tr><td align="center">' +
  '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;">' +

    /* brend paneli — logo bo'lsa nom yonida turadi */
    '<tr><td style="background:' + escapeHtml(color) + ';border-radius:14px;padding:18px 24px;">' +
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>' +
        (logo ? '<td style="padding-right:14px;" valign="middle">' +
          '<img src="' + escapeHtml(logo) + '" width="44" height="44" alt="" ' +
          'style="display:block;width:44px;height:44px;border-radius:10px;object-fit:cover;background:#ffffff;">' +
        '</td>' : '') +
        '<td valign="middle">' +
          '<div style="font:700 20px/1.3 Arial,Helvetica,sans-serif;color:#ffffff;">' + escapeHtml(brand) + '</div>' +
        '</td>' +
      '</tr></table>' +
    '</td></tr>' +
    '<tr><td style="height:14px;line-height:14px;">&nbsp;</td></tr>' +

    /* asosiy kartochka */
    '<tr><td style="background:#ffffff;border-radius:14px;padding:30px 26px;">' +
      '<h1 style="margin:0 0 16px 0;font:700 24px/1.3 Arial,Helvetica,sans-serif;color:#111827;">' +
        escapeHtml(title) + '</h1>' +
      '<p style="margin:0 0 14px 0;font:400 16px/1.6 Arial,Helvetica,sans-serif;color:#374151;">' +
        escapeHtml(L('greeting', { name: data.name }))
          .replace(escapeHtml(data.name), '<b>' + escapeHtml(data.name) + '</b>') + '</p>' +
      (message ? '<p style="margin:0 0 22px 0;font:400 16px/1.6 Arial,Helvetica,sans-serif;color:#374151;">' +
        escapeHtml(message).replace(/\n/g, '<br>') + '</p>' : '') +

      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">' +
        infoRow(L('ticket'), data.ticket, escapeHtml(color)) +
        infoRow(L('subject'), data.subject, '#3b63f6') +
        infoRow(L('date'), data.date, '#22a06b') +
        infoRow(L('responseTimeLabel'), responseTime, '#f0a020') +
      '</table>' +

      (steps.length ? '<h2 style="margin:16px 0 10px 0;font:700 17px/1.4 Arial,Helvetica,sans-serif;color:#111827;">' +
        escapeHtml(L('steps')) + '</h2><ol style="margin:0 0 20px 0;padding-left:22px;' +
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
          escapeHtml(L('autoNote')) +
          (contact ? escapeHtml(L('autoNoteContact', { contact: contact }))
            .replace(escapeHtml(contact), '<a href="mailto:' + escapeHtml(contact) + '" ' +
              'style="color:#3b63f6;text-decoration:none;">' + escapeHtml(contact) + '</a>') : '') + '.' +
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
      L('greeting', { name: data.name }),
      '',
      title,
      message,
      '',
      L('ticket') + ': ' + data.ticket,
      L('subject') + ': ' + data.subject,
      L('date') + ': ' + data.date,
      L('responseTimeLabel') + ': ' + responseTime
    ].concat(steps.length ? ['', L('steps') + ':'].concat(steps.map(function (line, i) {
      return (i + 1) + '. ' + line;
    })) : []).concat([
      '',
      L('autoNote') + (contact ? L('autoNoteContact', { contact: contact }) : '') + '.',
      brand
    ]).join('\n');

    return {
      subject: withCode(mail.subject || data.subject, data.ticket),
      html: html,
      text: text,
      ticket: data.ticket
    };
  }

  global.Template = {
    buildAutoReply: buildAutoReply,
    ticketCode: ticketCode,
    fill: fill,
    withCode: withCode,
    fullDate: fullDate
  };
})(window);
