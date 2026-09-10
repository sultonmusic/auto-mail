/* Auto Mail — lokal saqlash qatlami.
   Barcha holat (navbat, statuslar, izohlar, shablonlar) brauzerning
   localStorage'ida turadi. Xat matni Gmail'da qoladi, bu yerda faqat
   ish jarayoni (workflow) saqlanadi. */
(function (global) {
  'use strict';

  var KEY = 'automail.v1';

  /* Loyihaning o'z Google OAuth Client ID'si. Bu maxfiy kalit emas —
     OAuth client ID ochiq bo'lishi mo'ljallangan (maxfiysi client secret,
     u bu ilovada umuman ishlatilmaydi). Sozlamalardan almashtirsa bo'ladi. */
  var DEFAULT_CLIENT_ID = '1008435124974-cdve0d4rkq1hs3v29a6qs3pmliieckbf.apps.googleusercontent.com';

  /* Eskirgan Google loyihalari. Shu prefiks bilan saqlangan ID yangisiga
     almashtiriladi va eski sessiya tozalanadi — aks holda ilova
     mavjud bo'lmagan loyihaga ulanishga urinib qolardi. */
  var RETIRED_PREFIXES = ['340616217035-'];

  function isRetired(clientId) {
    return RETIRED_PREFIXES.some(function (prefix) {
      return String(clientId || '').indexOf(prefix) === 0;
    });
  }

  function forgetSession() {
    try {
      localStorage.removeItem('automail.token');
      localStorage.removeItem('automail.signedIn');
    } catch (err) { /* ignore */ }
  }

  var DEFAULTS = {
    settings: {
      clientId: '',
      query: 'in:inbox -from:me newer_than:7d',
      pollSeconds: 20,
      notify: false,
      signature: '',
      theme: 'auto',
      lang: 'uz',               // panel tili

      /* Avtomatik javob. Matn maydonlari bo'sh bo'lsa, javob tilidagi
         tayyor matn ishlatiladi (i18n.js dagi card.defaultX). */
      autoReply: false,
      autoReplySince: 0,        // shu vaqtdan keyingi xatlargagina javob beriladi
      cardLang: 'en',           // mijozga ketadigan kartochka tili
      brandName: 'Founder Capline Group',
      logoUrl: '',
      brandColor: '#1b2338',
      autoReplyTitle: '',
      autoReplyText: '',
      autoReplySteps: '',
      autoReplyUrl: '',
      autoReplyButton: '',
      autoReplyContact: '',
      responseTime: ''        // bo'sh bo'lsa javob tilidagi standart muddat
    },
    tickets: {},   // threadId -> ticket
    templates: [], // { title, body }
    lastSync: 0,
    historyId: '', // Gmail tarixidagi oxirgi belgi
    account: ''    // navbat qaysi pochtaga tegishli
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function load() {
    var state = clone(DEFAULTS);
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        state.settings = Object.assign(state.settings, saved.settings || {});
        state.tickets = saved.tickets || {};
        state.templates = Array.isArray(saved.templates) ? saved.templates : [];
        state.lastSync = saved.lastSync || 0;
        state.historyId = saved.historyId || '';
        state.account = saved.account || '';
      }
    } catch (err) {
      console.warn('Saqlangan holatni o\'qib bo\'lmadi:', err);
    }
    return state;
  }

  var state = load();

  /* Eski standart brend nomlari yangisiga ko'chiriladi. */
  if (['Auto Mail', 'Capline Group'].indexOf(state.settings.brandName) !== -1) {
    state.settings.brandName = DEFAULTS.settings.brandName;
  }

  if (!state.settings.clientId || isRetired(state.settings.clientId)) {
    if (isRetired(state.settings.clientId)) forgetSession();
    state.settings.clientId = DEFAULT_CLIENT_ID;
  }

  /* Ilgari saqlangan xatlar hali baholanmagan bo'lishi mumkin. */
  Object.keys(state.tickets).forEach(function (id) {
    var ticket = state.tickets[id];
    if (!ticket.priority) {
      var verdict = global.Analyzer.classify(ticket);
      ticket.priority = verdict.priority;
      ticket.reasons = verdict.reasons;
    }
  });

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Saqlab bo\'lmadi:', err);
    }
  }

  var Store = {
    get state() { return state; },
    get settings() { return state.settings; },
    get templates() { return state.templates; },

    saveSettings: function (patch) {
      Object.assign(state.settings, patch);
      persist();
      return state.settings;
    },

    /** Barcha ticketlar, yangisi birinchi. */
    list: function () {
      return Object.keys(state.tickets)
        .map(function (id) { return state.tickets[id]; })
        .sort(function (a, b) { return (b.date || 0) - (a.date || 0); });
    },

    get: function (id) {
      return state.tickets[id] || null;
    },

    /** Gmail'dan kelgan xatni navbatga qo'shadi. Mavjud bo'lsa yangilaydi.
        Qaytaradi: yangi qo'shilgan bo'lsa true. */
    upsertFromMail: function (mail) {
      var verdict = global.Analyzer.classify(mail);
      var existing = state.tickets[mail.threadId];
      if (existing) {
        var changed = false;
        if (mail.date > (existing.date || 0)) {
          // Trediga yangi xat kelgan — qayta navbatga qaytaramiz.
          existing.date = mail.date;
          existing.snippet = mail.snippet;
          existing.messageId = mail.id;
          existing.rfcMessageId = mail.rfcMessageId;
          existing.references = mail.references;
          if (existing.status === 'done') existing.status = 'new';
          existing.priority = verdict.priority;
          existing.reasons = verdict.reasons;
          changed = true;
        }
        if (changed) persist();
        return false;
      }
      state.tickets[mail.threadId] = {
        id: mail.threadId,
        messageId: mail.id,
        rfcMessageId: mail.rfcMessageId || '',
        references: mail.references || '',
        from: mail.from,
        fromEmail: mail.fromEmail,
        subject: mail.subject,
        snippet: mail.snippet,
        date: mail.date,
        status: 'new',
        note: '',
        replies: [],
        autoReplied: 0,
        ticketCode: '',
        priority: verdict.priority,
        reasons: verdict.reasons,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      persist();
      return true;
    },

    update: function (id, patch) {
      var ticket = state.tickets[id];
      if (!ticket) return null;
      Object.assign(ticket, patch, { updatedAt: Date.now() });
      persist();
      return ticket;
    },

    addReply: function (id, text) {
      var ticket = state.tickets[id];
      if (!ticket) return null;
      ticket.replies.push({ text: text, at: Date.now() });
      ticket.status = 'done';
      ticket.updatedAt = Date.now();
      persist();
      return ticket;
    },

    /** Avtomatik javob yuborilganini belgilaydi. */
    markAutoReplied: function (id, ticketCode) {
      var ticket = state.tickets[id];
      if (!ticket) return null;
      ticket.autoReplied = Date.now();
      ticket.ticketCode = ticketCode;
      if (ticket.status === 'new') ticket.status = 'progress';
      ticket.updatedAt = Date.now();
      persist();
      return ticket;
    },

    counts: function () {
      var result = { new: 0, progress: 0, done: 0, all: 0, high: 0, normal: 0, junk: 0 };
      this.list().forEach(function (ticket) {
        result.all++;
        if (result[ticket.status] !== undefined) result[ticket.status]++;
        if (result[ticket.priority] !== undefined) result[ticket.priority]++;
      });
      return result;
    },

    addTemplate: function (title, body) {
      state.templates.push({ title: title, body: body });
      persist();
    },

    setLastSync: function (time) {
      state.lastSync = time;
      persist();
    },

    /** Kirilgan pochtani belgilaydi. Boshqa hisobga o'tilgan bo'lsa,
        oldingi hisobning navbati tozalanadi — aks holda begona xatlar
        yangi hisobda ko'rinib qolardi. */
    setAccount: function (email) {
      var next = String(email || '').toLowerCase();
      if (!next || next === state.account) return false;
      var switched = !!state.account;
      state.account = next;
      if (switched) {
        state.tickets = {};
        state.historyId = '';
        state.lastSync = 0;
      }
      persist();
      return switched;
    },

    /** Navbatni butunlay tozalaydi (xatlar Gmail'da qoladi). */
    clearTickets: function () {
      state.tickets = {};
      state.historyId = '';
      state.lastSync = 0;
      persist();
    },

    setHistoryId: function (id) {
      if (!id || id === state.historyId) return;
      state.historyId = String(id);
      persist();
    }
  };

  global.Store = Store;
})(window);
