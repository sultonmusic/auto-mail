/* Auto Mail — admin panel mantiqi: navbat, filtrlar, javob yuborish. */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  var el = {
    account: $('accountLabel'),
    statusPill: $('statusPill'),
    refresh: $('refreshBtn'),
    theme: $('themeBtn'),
    settings: $('settingsBtn'),
    back: $('backBtn'),
    search: $('searchInput'),
    tabs: $('tabs'),
    list: $('ticketList'),
    listEmpty: $('listEmpty'),
    detail: $('detail'),
    detailEmpty: $('detailEmpty'),
    subject: $('dSubject'),
    from: $('dFrom'),
    date: $('dDate'),
    statusRow: $('statusRow'),
    openGmail: $('openGmail'),
    body: $('bodyWrap'),
    note: $('noteInput'),
    reply: $('replyInput'),
    send: $('sendBtn'),
    markRead: $('markReadAfter'),
    templateSelect: $('templateSelect'),
    saveTemplate: $('saveTemplate'),
    dialog: $('setupDialog'),
    clientId: $('clientIdInput'),
    query: $('queryInput'),
    poll: $('pollInput'),
    notify: $('notifyInput'),
    signature: $('signatureInput'),
    originHint: $('originHint'),
    toast: $('toast')
  };

  var ui = { filter: 'new', search: '', selected: null, timer: null, syncing: false };

  /* ---------- kichik yordamchilar ---------- */

  function escapeHtml(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var toastTimer = null;
  function toast(message) {
    el.toast.textContent = message;
    el.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.hidden = true; }, 3600);
  }

  function setStatus(state, text) {
    el.statusPill.dataset.state = state;
    el.statusPill.textContent = text;
  }

  function formatDate(time) {
    if (!time) return '';
    var date = new Date(time);
    var now = new Date();
    var sameDay = date.toDateString() === now.toDateString();
    if (sameDay) return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' });
    }
    return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  /* ---------- mavzu ---------- */

  function applyTheme(theme) {
    if (theme === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
  }

  el.theme.addEventListener('click', function () {
    var order = ['auto', 'light', 'dark'];
    var next = order[(order.indexOf(Store.settings.theme) + 1) % order.length];
    Store.saveSettings({ theme: next });
    applyTheme(next);
    toast('Mavzu: ' + ({ auto: 'tizimga mos', light: 'yorug\'', dark: 'qorong\'i' })[next]);
  });

  /* ---------- ro'yxat ---------- */

  function matchesFilter(ticket) {
    if (ui.filter !== 'all' && ticket.status !== ui.filter) return false;
    if (!ui.search) return true;
    var haystack = [ticket.from, ticket.fromEmail, ticket.subject, ticket.snippet, ticket.note]
      .join(' ').toLowerCase();
    return haystack.indexOf(ui.search) !== -1;
  }

  function renderCounts() {
    var counts = Store.counts();
    Object.keys(counts).forEach(function (key) {
      var node = el.tabs.querySelector('[data-count="' + key + '"]');
      if (node) node.textContent = counts[key];
    });
    var pendingCount = counts.new;
    document.title = pendingCount ? '(' + pendingCount + ') Auto Mail' : 'Auto Mail — Gmail navbat';
  }

  function renderList() {
    var items = Store.list().filter(matchesFilter);
    el.list.innerHTML = items.map(function (ticket) {
      return '<li><button class="ticket' + (ui.selected === ticket.id ? ' selected' : '') + '"' +
        ' data-id="' + escapeHtml(ticket.id) + '" data-status="' + ticket.status + '">' +
        '<span class="t-row">' +
          '<span class="dot" data-status="' + ticket.status + '"></span>' +
          '<span class="t-from">' + escapeHtml(ticket.from) + '</span>' +
          '<time class="t-date">' + escapeHtml(formatDate(ticket.date)) + '</time>' +
        '</span>' +
        '<span class="t-subject">' + escapeHtml(ticket.subject) + '</span>' +
        '<span class="t-snippet">' + escapeHtml(ticket.snippet) + '</span>' +
        '</button></li>';
    }).join('');
    el.listEmpty.hidden = items.length > 0;
    renderCounts();
  }

  el.list.addEventListener('click', function (event) {
    var button = event.target.closest('.ticket');
    if (button) openTicket(button.dataset.id);
  });

  el.tabs.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-status]');
    if (!button) return;
    ui.filter = button.dataset.status;
    Array.prototype.forEach.call(el.tabs.children, function (node) {
      node.classList.toggle('active', node === button);
    });
    renderList();
  });

  el.search.addEventListener('input', function () {
    ui.search = el.search.value.trim().toLowerCase();
    renderList();
  });

  el.back.addEventListener('click', function () { document.body.dataset.view = 'list'; });

  /* ---------- xat ochish ---------- */

  function renderBody(parts) {
    if (parts.text && parts.text.trim()) {
      el.body.innerHTML = '<pre></pre>';
      el.body.firstChild.textContent = parts.text.trim();
    } else if (parts.html) {
      var frame = document.createElement('iframe');
      frame.setAttribute('sandbox', '');
      frame.setAttribute('title', 'Xat matni');
      frame.srcdoc = parts.html;
      el.body.innerHTML = '';
      el.body.appendChild(frame);
    } else {
      el.body.innerHTML = '<p class="loading">Matn topilmadi — Gmail\'da oching.</p>';
    }
    if (parts.attachments && parts.attachments.length) {
      var note = document.createElement('p');
      note.className = 'attachments';
      note.textContent = '📎 Ilova: ' + parts.attachments.map(function (file) {
        return file.name + ' (' + Math.max(1, Math.round(file.size / 1024)) + ' KB)';
      }).join(', ') + ' — Gmail\'da yuklab oling.';
      el.body.appendChild(note);
    }
  }

  function openTicket(id) {
    var ticket = Store.get(id);
    if (!ticket) return;
    ui.selected = id;
    document.body.dataset.view = 'detail';

    el.detailEmpty.hidden = true;
    el.detail.hidden = false;
    el.subject.textContent = ticket.subject;
    el.from.textContent = ticket.from + ' · ' + ticket.fromEmail;
    el.date.textContent = new Date(ticket.date).toLocaleString('uz-UZ');
    el.note.value = ticket.note || '';
    el.reply.value = '';
    el.body.innerHTML = '<p class="loading">Yuklanmoqda…</p>';

    Array.prototype.forEach.call(el.statusRow.querySelectorAll('button[data-set]'), function (button) {
      button.classList.toggle('active', button.dataset.set === ticket.status);
    });
    renderList();

    Gmail.getBody(ticket.messageId).then(renderBody).catch(function (err) {
      el.body.innerHTML = '<p class="loading">' + escapeHtml(err.message) + '</p>';
    });
  }

  el.statusRow.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-set]');
    if (!button || !ui.selected) return;
    Store.update(ui.selected, { status: button.dataset.set });
    openTicket(ui.selected);
    toast('Status yangilandi.');
  });

  el.openGmail.addEventListener('click', function () {
    if (!ui.selected) return;
    window.open('https://mail.google.com/mail/u/0/#all/' + ui.selected, '_blank', 'noopener');
  });

  var noteTimer = null;
  el.note.addEventListener('input', function () {
    if (!ui.selected) return;
    clearTimeout(noteTimer);
    var id = ui.selected;
    var value = el.note.value;
    noteTimer = setTimeout(function () { Store.update(id, { note: value }); }, 400);
  });

  /* ---------- shablonlar ---------- */

  function renderTemplates() {
    el.templateSelect.innerHTML = '<option value="">Shablon tanlash…</option>' +
      Store.templates.map(function (template, index) {
        return '<option value="' + index + '">' + escapeHtml(template.title) + '</option>';
      }).join('');
  }

  el.templateSelect.addEventListener('change', function () {
    var template = Store.templates[Number(el.templateSelect.value)];
    if (template) el.reply.value = template.body;
    el.templateSelect.value = '';
  });

  el.saveTemplate.addEventListener('click', function () {
    var body = el.reply.value.trim();
    if (!body) return toast('Avval javob matnini yozing.');
    var title = prompt('Shablon nomi:', body.slice(0, 30));
    if (!title) return;
    Store.addTemplate(title, body);
    renderTemplates();
    toast('Shablon saqlandi.');
  });

  /* ---------- javob yuborish ---------- */

  el.send.addEventListener('click', function () {
    if (!ui.selected) return;
    var ticket = Store.get(ui.selected);
    var text = el.reply.value.trim();
    if (!text) return toast('Javob matni bo\'sh.');

    var signature = (Store.settings.signature || '').trim();
    var fullText = signature ? text + '\n\n' + signature : text;

    el.send.disabled = true;
    el.send.textContent = 'Yuborilmoqda…';

    Gmail.sendReply({
      to: ticket.fromEmail,
      subject: ticket.subject,
      body: fullText,
      threadId: ticket.id,
      rfcMessageId: ticket.rfcMessageId,
      references: ticket.references
    }).then(function () {
      Store.addReply(ticket.id, fullText);
      if (el.markRead.checked) return Gmail.markRead(ticket.messageId).catch(function () {});
    }).then(function () {
      el.reply.value = '';
      toast('Javob yuborildi ✓');
      openTicket(ticket.id);
    }).catch(function (err) {
      toast('Yuborilmadi: ' + err.message);
    }).then(function () {
      el.send.disabled = false;
      el.send.textContent = 'Javobni yuborish';
    });
  });

  /* ---------- sinxronizatsiya ---------- */

  function notifyNew(count) {
    if (!Store.settings.notify || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    new Notification('Auto Mail', {
      body: count === 1 ? 'Navbatga 1 ta yangi xat tushdi.' : 'Navbatga ' + count + ' ta yangi xat tushdi.',
      icon: './icon.svg'
    });
  }

  function sync(interactive) {
    if (ui.syncing) return Promise.resolve();
    if (!Gmail.isConfigured()) {
      setStatus('off', 'Sozlanmagan');
      return Promise.resolve();
    }
    ui.syncing = true;
    setStatus('sync', 'Tekshirilmoqda…');

    var ready = Gmail.isSignedIn() ? Promise.resolve() : (interactive ? Gmail.signIn() : Gmail.restore());

    return ready
      .then(function () { return Gmail.listMessages(Store.settings.query, 40); })
      .then(function (messages) {
        var known = {};
        Store.list().forEach(function (ticket) { known[ticket.messageId] = true; });
        var fresh = messages.filter(function (message) { return !known[message.id]; });
        return fresh.reduce(function (chain, message) {
          return chain.then(function (added) {
            return Gmail.getHeaders(message.id).then(function (mail) {
              return added + (Store.upsertFromMail(mail) ? 1 : 0);
            });
          });
        }, Promise.resolve(0));
      })
      .then(function (added) {
        Store.setLastSync(Date.now());
        renderList();
        setStatus('on', 'Ulangan · ' + formatDate(Date.now()));
        if (added > 0) {
          notifyNew(added);
          toast(added + ' ta yangi xat navbatga olindi.');
        }
      })
      .catch(function (err) {
        setStatus('err', 'Xato');
        if (interactive) toast(err.message);
        else console.warn('Sinxronizatsiya:', err.message);
      })
      .then(function () { ui.syncing = false; });
  }

  function schedulePolling() {
    clearInterval(ui.timer);
    var seconds = Math.max(15, Number(Store.settings.pollSeconds) || 60);
    ui.timer = setInterval(function () {
      if (document.visibilityState === 'visible') sync(false);
    }, seconds * 1000);
  }

  el.refresh.addEventListener('click', function () { sync(true); });

  el.statusPill.addEventListener('click', function () {
    if (!Gmail.isConfigured()) return el.dialog.showModal();
    if (Gmail.isSignedIn()) {
      if (confirm('Gmail hisobidan chiqasizmi?')) {
        Gmail.signOut();
        el.account.textContent = 'ulanmagan';
        setStatus('off', 'Oflayn');
      }
      return;
    }
    sync(true).then(loadProfile);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') sync(false);
  });

  function loadProfile() {
    if (!Gmail.isSignedIn()) return;
    Gmail.profile().then(function (profile) {
      el.account.textContent = profile.emailAddress || 'ulangan';
    }).catch(function () {});
  }

  /* ---------- sozlamalar ---------- */

  function fillSettings() {
    var settings = Store.settings;
    el.clientId.value = settings.clientId;
    el.query.value = settings.query;
    el.poll.value = settings.pollSeconds;
    el.notify.checked = !!settings.notify;
    el.signature.value = settings.signature;
    el.originHint.textContent = location.origin;
  }

  el.settings.addEventListener('click', function () {
    fillSettings();
    el.dialog.showModal();
  });

  el.dialog.addEventListener('close', function () {
    if (el.dialog.returnValue !== 'save') return;

    var wantsNotify = el.notify.checked;
    Store.saveSettings({
      clientId: el.clientId.value.trim(),
      query: el.query.value.trim() || 'in:inbox -from:me newer_than:7d',
      pollSeconds: Math.min(3600, Math.max(15, Number(el.poll.value) || 60)),
      notify: wantsNotify,
      signature: el.signature.value
    });

    Gmail.configure(Store.settings.clientId);
    schedulePolling();

    if (wantsNotify && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    toast('Sozlamalar saqlandi.');
    sync(true).then(loadProfile);
  });

  /* ---------- ishga tushirish ---------- */

  function init() {
    applyTheme(Store.settings.theme);
    renderTemplates();
    renderList();
    fillSettings();
    Gmail.configure(Store.settings.clientId);

    if (!Store.settings.clientId) {
      setStatus('off', 'Sozlanmagan');
      el.dialog.showModal();
    } else {
      setStatus('off', 'Ulanmoqda…');
      schedulePolling();
      if (Gmail.wasSignedIn()) sync(false).then(loadProfile);
      else setStatus('off', 'Kirish kerak');
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('./service-worker.js').catch(function () {});
      });
    }
  }

  init();
})();
