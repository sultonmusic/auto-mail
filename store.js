/* Auto Mail — lokal saqlash qatlami.
   Barcha holat (navbat, statuslar, izohlar, shablonlar) brauzerning
   localStorage'ida turadi. Xat matni Gmail'da qoladi, bu yerda faqat
   ish jarayoni (workflow) saqlanadi. */
(function (global) {
  'use strict';

  var KEY = 'automail.v1';

  var DEFAULTS = {
    settings: {
      clientId: '',
      query: 'in:inbox -from:me newer_than:7d',
      pollSeconds: 60,
      notify: false,
      signature: '',
      theme: 'auto'
    },
    tickets: {},   // threadId -> ticket
    templates: [], // { title, body }
    lastSync: 0
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
      }
    } catch (err) {
      console.warn('Saqlangan holatni o\'qib bo\'lmadi:', err);
    }
    return state;
  }

  var state = load();

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

    counts: function () {
      var result = { new: 0, progress: 0, done: 0, all: 0 };
      this.list().forEach(function (ticket) {
        result.all++;
        if (result[ticket.status] !== undefined) result[ticket.status]++;
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
    }
  };

  global.Store = Store;
})(window);
