/* Auto Mail — Gmail API qatlami.
   Brauzerdan to'g'ridan-to'g'ri ishlaydi: Google Identity Services orqali
   access token olinadi va Gmail REST API chaqiriladi. Server kerak emas,
   token hech qayerga yuborilmaydi va faqat sahifa ochiq turganda saqlanadi. */
(function (global) {
  'use strict';

  var SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email'
  ].join(' ');

  var API = 'https://gmail.googleapis.com/gmail/v1/users/me';

  var TOKEN_KEY = 'automail.token';
  var SESSION_KEY = 'automail.signedIn';

  var tokenClient = null;
  var clientId = '';
  var accessToken = '';
  var tokenExpiresAt = 0;
  var pending = null;
  var forcePrompt = '';

  function saveToken(token, expiresAt) {
    accessToken = token;
    tokenExpiresAt = expiresAt;
    try {
      localStorage.setItem(TOKEN_KEY, JSON.stringify({ token: token, expiresAt: expiresAt }));
      localStorage.setItem(SESSION_KEY, '1');
    } catch (err) { /* xotira to'lgan bo'lsa ham ishlashda davom etamiz */ }
  }

  function clearToken(forget) {
    accessToken = '';
    tokenExpiresAt = 0;
    try {
      localStorage.removeItem(TOKEN_KEY);
      if (forget) localStorage.removeItem(SESSION_KEY);
    } catch (err) { /* ignore */ }
  }

  /* Sahifa qayta ochilganda saqlangan tokenni tiklaymiz. */
  (function restoreSavedToken() {
    try {
      var saved = JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null');
      if (saved && saved.token && saved.expiresAt > Date.now() + 60000) {
        accessToken = saved.token;
        tokenExpiresAt = saved.expiresAt;
      }
    } catch (err) { /* ignore */ }
  })();

  function gisReady() {
    return new Promise(function (resolve, reject) {
      var waited = 0;
      (function check() {
        if (global.google && global.google.accounts && global.google.accounts.oauth2) return resolve();
        if (waited > 12000) return reject(new Error('Google skripti yuklanmadi. Internetni tekshiring.'));
        waited += 150;
        setTimeout(check, 150);
      })();
    });
  }

  /** Access token oladi. interactive=false bo'lsa oyna ochmasdan urinadi. */
  function ensureToken(interactive) {
    if (accessToken && Date.now() < tokenExpiresAt - 60000) return Promise.resolve(accessToken);
    if (!clientId) return Promise.reject(new Error('Client ID kiritilmagan. Sozlamalarni oching.'));
    if (pending) return pending;

    pending = gisReady().then(function () {
      return new Promise(function (resolve, reject) {
        if (!tokenClient) {
          tokenClient = global.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: SCOPES,
            callback: function () {}
          });
        }
        tokenClient.callback = function (response) {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          saveToken(response.access_token, Date.now() + (Number(response.expires_in || 3600) * 1000));
          resolve(accessToken);
        };
        tokenClient.error_callback = function (err) {
          reject(new Error(err && err.type === 'popup_closed'
            ? 'Kirish oynasi yopildi.'
            : (err && err.message) || 'Avtorizatsiya bekor qilindi.'));
        };
        tokenClient.requestAccessToken({
          prompt: forcePrompt || (interactive ? '' : 'none')
        });
      });
    });

    pending.catch(function () { /* xatoni chaqiruvchi hal qiladi */ })
      .then(function () { pending = null; });
    return pending;
  }

  function request(path, options) {
    options = options || {};
    return ensureToken(false).catch(function (err) {
      if (options.interactive) return ensureToken(true);
      throw err;
    }).then(function (token) {
      return fetch(API + path, {
        method: options.method || 'GET',
        headers: Object.assign({
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        }, options.headers || {}),
        body: options.body ? JSON.stringify(options.body) : undefined
      });
    }).then(function (response) {
      if (response.status === 401) {
        clearToken(false);
        if (options._retried) throw new Error('Sessiya tugadi — qaytadan kiring.');
        /* Token eskirgan — jimgina yangilab, so'rovni bir marta qaytaramiz. */
        return ensureToken(false).then(function () {
          return request(path, Object.assign({}, options, { _retried: true }));
        }, function () {
          throw new Error('Sessiya tugadi — qaytadan kiring.');
        });
      }
      return response.json().then(function (data) {
        if (!response.ok) {
          var message = (data && data.error && data.error.message) || ('Gmail xatosi: ' + response.status);
          throw new Error(message);
        }
        return data;
      });
    });
  }

  /* ---------- yordamchi funksiyalar ---------- */

  function header(payload, name) {
    var headers = (payload && payload.headers) || [];
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].name.toLowerCase() === name.toLowerCase()) return headers[i].value || '';
    }
    return '';
  }

  function decodeBase64Url(data) {
    var normalized = String(data || '').replace(/-/g, '+').replace(/_/g, '/');
    while (normalized.length % 4) normalized += '=';
    var binary = atob(normalized);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  }

  function encodeBase64Url(text) {
    var bytes = new TextEncoder().encode(text);
    var binary = '';
    for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /** MIME daraxtidan text/plain va text/html qismlarini yig'adi. */
  function collectBody(payload, out) {
    out = out || { text: '', html: '', attachments: [] };
    if (!payload) return out;
    var mime = payload.mimeType || '';
    var data = payload.body && payload.body.data;

    if (payload.filename && payload.body && payload.body.attachmentId) {
      out.attachments.push({ name: payload.filename, size: payload.body.size || 0 });
    } else if (mime === 'text/plain' && data) {
      out.text += decodeBase64Url(data);
    } else if (mime === 'text/html' && data) {
      out.html += decodeBase64Url(data);
    }
    (payload.parts || []).forEach(function (part) { collectBody(part, out); });
    return out;
  }

  function parseAddress(value) {
    var match = /^\s*(?:"?([^"<]*?)"?\s*)?<([^>]+)>\s*$/.exec(value || '');
    if (match) return { name: (match[1] || '').trim() || match[2], email: match[2].trim() };
    var trimmed = (value || '').trim();
    return { name: trimmed, email: trimmed };
  }

  function encodeHeaderValue(text) {
    /* eslint-disable no-control-regex */
    if (/^[\x00-\x7F]*$/.test(text)) return text;
    return '=?UTF-8?B?' + encodeBase64Url(text).replace(/-/g, '+').replace(/_/g, '/') + '?=';
  }

  var Gmail = {
    scopes: SCOPES,

    configure: function (id) {
      var next = id || '';
      if (next === clientId) return;
      /* Birinchi sozlashda (bo'shdan haqiqiy ID ga) saqlangan sessiya saqlanib
         qoladi; ID haqiqatan almashsa, eski token yaroqsiz bo'ladi. */
      var hadClient = !!clientId;
      clientId = next;
      tokenClient = null;
      if (hadClient) clearToken(true);
    },

    isConfigured: function () { return !!clientId; },
    isSignedIn: function () { return !!accessToken && Date.now() < tokenExpiresAt; },

    /** Token muddati tugashiga necha soniya qolgani. */
    secondsLeft: function () {
      return accessToken ? Math.max(0, Math.round((tokenExpiresAt - Date.now()) / 1000)) : 0;
    },

    /** Muddati tugashini kutmasdan, jimgina yangi token oladi.
        Shu tufayli sahifa qayta ochilganda kirish qayta so'ralmaydi. */
    renew: function () {
      accessToken = '';
      tokenExpiresAt = 0;
      return ensureToken(false);
    },

    /** Ilgari kirgan bo'lsa, oyna ochmasdan sessiyani tiklashga urinadi. */
    wasSignedIn: function () {
      try { return localStorage.getItem(SESSION_KEY) === '1'; } catch (err) { return false; }
    },

    signIn: function () { return ensureToken(true); },

    /** Boshqa Google hisobini tanlash oynasini ochadi. */
    switchAccount: function () {
      clearToken(false);
      forcePrompt = 'select_account';
      return ensureToken(true).then(function (token) {
        forcePrompt = '';
        return token;
      }, function (err) {
        forcePrompt = '';
        throw err;
      });
    },

    signOut: function () {
      var token = accessToken;
      clearToken(true);
      if (token && global.google && global.google.accounts && global.google.accounts.oauth2) {
        global.google.accounts.oauth2.revoke(token, function () {});
      }
    },

    restore: function () { return ensureToken(false); },

    profile: function () {
      return request('/profile');
    },

    /** Qidiruv shartiga mos xatlar ro'yxati (faqat id va threadId). */
    listMessages: function (query, max) {
      var params = new URLSearchParams({
        q: query || 'in:inbox',
        maxResults: String(max || 40)
      });
      return request('/messages?' + params.toString()).then(function (data) {
        return data.messages || [];
      });
    },

    /** Pochta hozirgi holatining belgisi — keyingi tekshiruv shundan boshlanadi. */
    historyId: function () {
      return request('/profile').then(function (profile) { return profile.historyId; });
    },

    /**
     * O'zgarishlar tarixi: oxirgi tekshiruvdan beri qo'shilgan xatlar.
     * To'liq ro'yxatni so'rashdan ancha arzon, shuning uchun tez-tez
     * chaqirish mumkin. Belgi eskirgan bo'lsa null qaytaradi.
     */
    history: function (startHistoryId) {
      var params = new URLSearchParams({
        startHistoryId: String(startHistoryId),
        historyTypes: 'messageAdded',
        labelId: 'INBOX',
        maxResults: '100'
      });
      return request('/history?' + params.toString()).then(function (data) {
        var ids = [];
        (data.history || []).forEach(function (entry) {
          (entry.messagesAdded || []).forEach(function (added) {
            if (added.message && ids.indexOf(added.message.id) === -1) ids.push(added.message.id);
          });
        });
        return { ids: ids, historyId: data.historyId };
      }, function (err) {
        /* 404 — belgi juda eskirgan; chaqiruvchi to'liq tekshiruvga o'tadi. */
        if (/not found|404|invalid/i.test(err.message)) return null;
        throw err;
      });
    },

    /** Gmail yorliqlari: tizim qutilari va foydalanuvchi yorliqlari. */
    listLabels: function () {
      return request('/labels').then(function (data) {
        return (data.labels || []).map(function (label) {
          return { id: label.id, name: label.name, type: label.type };
        });
      });
    },

    /** Bitta yorliq bo'yicha sanoq (o'qilmagan / jami). */
    labelInfo: function (id) {
      return request('/labels/' + encodeURIComponent(id)).then(function (label) {
        return {
          id: label.id,
          name: label.name,
          unread: label.messagesUnread || 0,
          total: label.messagesTotal || 0
        };
      });
    },

    /** Sarlavhalar (ro'yxat uchun yetarli). */
    getHeaders: function (id) {
      var params = new URLSearchParams();
      params.set('format', 'metadata');
      ['From', 'Subject', 'Date', 'Message-ID', 'References'].forEach(function (name) {
        params.append('metadataHeaders', name);
      });
      return request('/messages/' + id + '?' + params.toString()).then(function (message) {
        var from = parseAddress(header(message.payload, 'From'));
        var dateHeader = header(message.payload, 'Date');
        return {
          id: message.id,
          threadId: message.threadId,
          from: from.name,
          fromEmail: from.email,
          subject: header(message.payload, 'Subject') || '(mavzusiz)',
          snippet: (message.snippet || '').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
          rfcMessageId: header(message.payload, 'Message-ID'),
          references: header(message.payload, 'References'),
          date: Number(message.internalDate) || (dateHeader ? Date.parse(dateHeader) : Date.now()),
          labelIds: message.labelIds || []
        };
      });
    },

    /** To'liq matn (text/plain, bo'lmasa html). */
    getBody: function (id) {
      return request('/messages/' + id + '?format=full').then(function (message) {
        var parts = collectBody(message.payload);
        return {
          text: parts.text,
          html: parts.html,
          attachments: parts.attachments,
          labelIds: message.labelIds || []
        };
      });
    },

    /** Xat yuboradi. HTML berilsa multipart/alternative bo'lib ketadi
        (eski mijozlar oddiy matnni, qolganlari kartochkani ko'radi). */
    sendMail: function (options) {
      var subject = options.subject || '';
      if (options.reply && !/^re:/i.test(subject)) subject = 'Re: ' + subject;

      var lines = [
        'To: ' + options.to,
        'Subject: ' + encodeHeaderValue(subject),
        'MIME-Version: 1.0'
      ];
      if (options.rfcMessageId) {
        lines.push('In-Reply-To: ' + options.rfcMessageId);
        lines.push('References: ' + ((options.references ? options.references + ' ' : '') + options.rfcMessageId));
      }

      if (options.html) {
        var boundary = 'automail-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        lines.push('Content-Type: multipart/alternative; boundary="' + boundary + '"', '');
        lines.push('--' + boundary);
        lines.push('Content-Type: text/plain; charset="UTF-8"', 'Content-Transfer-Encoding: 8bit', '');
        lines.push(options.text || '');
        lines.push('--' + boundary);
        lines.push('Content-Type: text/html; charset="UTF-8"', 'Content-Transfer-Encoding: 8bit', '');
        lines.push(options.html);
        lines.push('--' + boundary + '--');
      } else {
        lines.push('Content-Type: text/plain; charset="UTF-8"', 'Content-Transfer-Encoding: 8bit', '');
        lines.push(options.text || '');
      }

      var payload = { raw: encodeBase64Url(lines.join('\r\n')) };
      if (options.threadId) payload.threadId = options.threadId;

      return request('/messages/send', { method: 'POST', body: payload });
    },

    /** Xatga o'sha tred ichida javob yozadi. */
    sendReply: function (options) {
      return Gmail.sendMail({
        to: options.to,
        subject: options.subject,
        text: options.body || options.text,
        html: options.html,
        threadId: options.threadId,
        rfcMessageId: options.rfcMessageId,
        references: options.references,
        reply: true
      });
    },

    markRead: function (id) {
      return request('/messages/' + id + '/modify', {
        method: 'POST',
        body: { removeLabelIds: ['UNREAD'] }
      });
    },

    parseAddress: parseAddress
  };

  global.Gmail = Gmail;
})(window);
