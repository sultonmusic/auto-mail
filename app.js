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
    signIn: $('signInBtn'),
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
    menuBtn: $('menuBtn'),
    notifyBtn: $('notifyBtn'),
    autoReplyBtn: $('autoReplyBtn'),
    autoReplyNotice: $('autoReplyNotice'),
    enableAutoReply: $('enableAutoReply'),
    cardReplyBtn: $('cardReplyBtn'),
    scrim: $('scrim'),
    sidePanel: $('sidePanel'),
    boxList: $('boxList'),
    aiList: $('aiList'),
    aiBadge: $('aiBadge'),
    autoBadge: $('autoBadge'),
    brandLabel: $('brandLabel'),
    addAccount: $('addAccountBtn'),
    switchAccount: $('switchAccountBtn'),
    responseTime: $('responseTimeInput'),
    logoUrl: $('logoUrlInput'),
    senderName: $('senderNameInput'),
    categoryList: $('categoryList'),
    labelList: $('labelList'),
    boxIcon: $('boxIcon'),
    boxTitle: $('boxTitle'),
    queueBtn: $('queueBtn'),
    langSelect: $('langSelect'),
    langSettings: $('langSelectSettings'),
    cardLang: $('cardLangInput'),
    loadDefaults: $('loadDefaultsBtn'),
    compose: $('composeBtn'),
    newChat: $('newChatBtn'),
    composeDialog: $('composeDialog'),
    composeTo: $('composeTo'),
    composeSubject: $('composeSubject'),
    composeBody: $('composeBody'),
    composeCard: $('composeCard'),
    previewBtn: $('previewBtn'),
    clearQueue: $('clearQueueBtn'),
    previewDialog: $('previewDialog'),
    previewFrame: $('previewFrame'),
    autoReply: $('autoReplyInput'),
    brandName: $('brandNameInput'),
    brandColor: $('brandColorInput'),
    autoTitle: $('autoTitleInput'),
    autoText: $('autoTextInput'),
    autoSteps: $('autoStepsInput'),
    autoUrl: $('autoUrlInput'),
    autoButton: $('autoButtonInput'),
    autoContact: $('autoContactInput'),
    dialog: $('setupDialog'),
    clientId: $('clientIdInput'),
    query: $('queryInput'),
    poll: $('pollInput'),
    notify: $('notifyInput'),
    signature: $('signatureInput'),
    originHint: $('originHint'),
    toast: $('toast')
  };

  var t = function (key, vars) { return I18n.t(key, vars); };

  /* Chap menyudagi qutilar. queue — ilovaning o'z navbati, qolganlari
     to'g'ridan-to'g'ri Gmail'dan o'qiladi. */
  var BOXES = [
    { id: 'queue', icon: '🗂', key: 'box.queue' },
    { id: 'INBOX', icon: '📥', key: 'box.inbox', query: 'in:inbox' },
    { id: 'STARRED', icon: '⭐', key: 'box.starred', query: 'is:starred' },
    { id: 'IMPORTANT', icon: '❗', key: 'box.important', query: 'is:important' },
    { id: 'SENT', icon: '📤', key: 'box.sent', query: 'in:sent' },
    { id: 'DRAFT', icon: '📝', key: 'box.drafts', query: 'in:drafts' },
    { id: 'SPAM', icon: '🚫', key: 'box.spam', query: 'in:spam' },
    { id: 'TRASH', icon: '🗑', key: 'box.trash', query: 'in:trash' },
    { id: 'ALL', icon: '📚', key: 'box.allmail', query: 'in:anywhere' }
  ];

  var CATEGORIES = [
    { id: 'CATEGORY_PERSONAL', icon: '📬', key: 'box.primary', query: 'category:primary' },
    { id: 'CATEGORY_SOCIAL', icon: '👥', key: 'box.social', query: 'category:social' },
    { id: 'CATEGORY_PROMOTIONS', icon: '🏷', key: 'box.promo', query: 'category:promotions' },
    { id: 'CATEGORY_UPDATES', icon: '🔔', key: 'box.updates', query: 'category:updates' },
    { id: 'CATEGORY_FORUMS', icon: '💬', key: 'box.forums', query: 'category:forums' }
  ];

  /* AI tahlili bo'yicha bo'limlar — navbatning ichidan ajratiladi. */
  var AI_BOXES = [
    { id: 'ai:high', icon: '🔥', key: 'box.high', priority: 'high' },
    { id: 'ai:normal', icon: '📄', key: 'box.normal', priority: 'normal' },
    { id: 'ai:junk', icon: '🧹', key: 'box.junk', priority: 'junk' }
  ];

  /* Apps Script javob bergan suhbatlarga shu yorliq qo'yiladi —
     ikkalasi bir vaqtda ishlasa ham javob ikki marta ketmaydi. */
  var SCRIPT_LABEL = 'AutoReplied';

  var COUNT_TTL = 5 * 60 * 1000;
  var FULL_SYNC_EVERY = 5 * 60 * 1000;   // shuncha vaqtda bir marta to'liq tekshiruv
  var RENEW_BEFORE = 8 * 60;             // token tugashiga shuncha soniya qolganda yangilanadi

  var ui = {
    filter: 'new', search: '', selected: null, current: null,
    timer: null, syncing: false, myEmail: '',
    lastFullSync: 0,
    authRetries: 0,
    box: BOXES[0],            // ochiq quti
    browse: [],               // Gmail'dan jonli o'qilgan xatlar
    browsing: false,
    labels: [],               // foydalanuvchi yorliqlari
    scriptLabelId: '',        // Apps Script qo'yadigan yorliq
    counts: {},               // yorliq -> o'qilmaganlar soni
    countsAt: 0
  };

  /* Avtomatik javob yuborilmaydigan manzillar — robotlar bilan yozishmaslik uchun. */
  var ROBOT_HINTS = ['noreply', 'no-reply', 'donotreply', 'do-not-reply', 'mailer-daemon',
    'postmaster', 'bounce', 'notification', 'notifications', 'automated'];
  var MAX_AUTO_REPLIES_PER_SYNC = 5;

  /* ---------- kichik yordamchilar ---------- */

  function escapeHtml(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** Ro'yxatni bir vaqtda `limit` tadan qayta ishlaydi (Gmail'ni ortiqcha
      yuklamaslik uchun, lekin ketma-ketdan ancha tez). */
  function mapLimit(items, limit, fn) {
    var index = 0;
    var results = [];
    function worker() {
      if (index >= items.length) return Promise.resolve();
      var current = index++;
      return Promise.resolve(fn(items[current])).then(function (value) {
        results[current] = value;
        return worker();
      });
    }
    var workers = [];
    for (var i = 0; i < Math.min(limit, items.length); i++) workers.push(worker());
    return Promise.all(workers).then(function () { return results; });
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
    if (date.toDateString() === now.toDateString()) {
      return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
    }
    if (date.getFullYear() === now.getFullYear()) return Template.shortDate(time);
    return Template.longDate(time);
  }

  /* ---------- chap menyu ---------- */

  function boxLabel(box) {
    return box.key ? t(box.key) : box.name;
  }

  function boxRow(box) {
    var counts = Store.counts();
    var count = box.id === 'queue'
      ? queueItems(box).filter(function (ticket) { return ticket.status === 'new'; }).length
      : (box.priority ? counts[box.priority] : (ui.counts[box.id] || 0));
    return '<li><button class="box-item' + (ui.box.id === box.id ? ' active' : '') + '"' +
      ' data-box="' + escapeHtml(box.id) + '">' +
      '<span class="box-icon">' + box.icon + '</span>' +
      '<span class="box-name">' + escapeHtml(boxLabel(box)) + '</span>' +
      (count ? '<span class="box-count">' + count + '</span>' : '') +
      '</button></li>';
  }

  function renderMenu() {
    el.boxList.innerHTML = BOXES.map(boxRow).join('');
    el.aiList.innerHTML = AI_BOXES.map(boxRow).join('');
    el.categoryList.innerHTML = CATEGORIES.map(boxRow).join('');
    el.labelList.innerHTML = ui.labels.length
      ? ui.labels.map(boxRow).join('')
      : '<li class="side-empty">' + escapeHtml(t(Gmail.isSignedIn() ? 'menu.noLabels' : 'menu.loading')) + '</li>';

    el.boxIcon.textContent = ui.box.icon;
    el.boxTitle.textContent = boxLabel(ui.box);
  }

  function allBoxes() {
    return BOXES.concat(AI_BOXES, CATEGORIES, ui.labels);
  }

  /** Navbat ichida qaysi xatlar shu qutiga tegishli. */
  function queueItems(box) {
    var list = Store.list();
    if (box.priority) {
      list = list.filter(function (ticket) { return ticket.priority === box.priority; });
    } else {
      /* Bosh ro'yxatda bekorchilar ko'rinmaydi, muhimlari esa tepada. */
      list = list.filter(function (ticket) { return ticket.priority !== 'junk'; })
        .sort(function (a, b) {
          var weight = function (ticket) { return ticket.priority === 'high' ? 1 : 0; };
          return (weight(b) - weight(a)) || (b.date - a.date);
        });
    }
    return list;
  }

  function isQueueBox(box) {
    return box.id === 'queue' || !!box.priority;
  }

  function findBox(id) {
    var found = allBoxes().filter(function (box) { return box.id === id; });
    return found[0] || BOXES[0];
  }

  function setMenuOpen(open) {
    document.body.dataset.menu = open ? 'open' : 'closed';
    el.scrim.hidden = !open;
  }

  el.menuBtn.addEventListener('click', function () {
    setMenuOpen(document.body.dataset.menu !== 'open');
  });
  el.scrim.addEventListener('click', function () { setMenuOpen(false); });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  el.sidePanel.addEventListener('click', function (event) {
    var button = event.target.closest('.box-item');
    if (button) selectBox(button.dataset.box);
  });

  /** Yorliq sanoqlarini yangilaydi (5 daqiqada bir marta). */
  function refreshCounts(force) {
    if (!Gmail.isSignedIn()) return Promise.resolve();
    if (!force && Date.now() - ui.countsAt < COUNT_TTL) return Promise.resolve();
    ui.countsAt = Date.now();

    var ids = BOXES.filter(function (box) { return box.query && box.id !== 'ALL'; })
      .map(function (box) { return box.id; })
      .concat(ui.labels.slice(0, 15).map(function (label) { return label.id; }));

    return mapLimit(ids, 4, function (id) {
      return Gmail.labelInfo(id).then(function (info) {
        ui.counts[id] = info.unread;
      }, function () { /* yo'q yorliqni jimgina o'tkazamiz */ });
    }).then(function () { renderMenu(); });
  }

  function loadLabels() {
    if (!Gmail.isSignedIn()) return Promise.resolve();
    return Gmail.listLabels().then(function (labels) {
      ui.labels = labels
        .filter(function (label) { return label.type === 'user'; })
        .sort(function (a, b) { return a.name.localeCompare(b.name); })
        .map(function (label) {
          return { id: label.id, icon: '🏷', name: label.name, query: 'label:"' + label.name + '"' };
        });
      var scriptLabel = ui.labels.filter(function (label) {
        return label.name === SCRIPT_LABEL;
      })[0];
      ui.scriptLabelId = scriptLabel ? scriptLabel.id : '';
      renderMenu();
      return refreshCounts(true);
    }, function () { /* ruxsat yo'q bo'lsa menyu tizim qutilari bilan qoladi */ });
  }

  function selectBox(id) {
    var box = findBox(id);
    ui.box = box;
    ui.selected = null;
    ui.current = null;
    ui.search = '';
    el.search.value = '';
    el.detail.hidden = true;
    el.detailEmpty.hidden = false;
    document.body.dataset.view = 'list';
    setMenuOpen(false);
    renderMenu();
    renderList();
    if (!isQueueBox(box)) loadBox();
  }

  /** Tanlangan qutini Gmail'dan o'qiydi (navbatga tegmaydi). */
  function loadBox() {
    if (!Gmail.isSignedIn()) return Promise.resolve();
    var box = ui.box;
    ui.browsing = true;
    ui.browse = [];
    renderList();

    return Gmail.listMessages(box.query, 30)
      .then(function (messages) {
        return mapLimit(messages, 6, function (message) {
          return Gmail.getHeaders(message.id).catch(function () { return null; });
        });
      })
      .then(function (mails) {
        if (ui.box.id !== box.id) return;      // boshqa qutiga o'tib ketildi
        ui.browse = mails.filter(Boolean).sort(function (a, b) { return b.date - a.date; });
        ui.browsing = false;
        renderList();
      })
      .catch(function (err) {
        if (ui.box.id !== box.id) return;
        ui.browsing = false;
        renderList();
        toast(err.message);
      });
  }

  /* ---------- til ---------- */

  function fillLangSelect(select, selected, short) {
    select.innerHTML = I18n.list().map(function (item) {
      var label = short ? item.code.toUpperCase() : item.name;
      return '<option value="' + item.code + '"' +
        (item.code === selected ? ' selected' : '') + '>' + escapeHtml(label) + '</option>';
    }).join('');
  }

  /** Butun sahifani tanlangan tilga o'giradi. */
  /** Gmail'da ko'rinadigan jo'natuvchi nomi. */
  function senderName() {
    return (Store.settings.senderName || Store.settings.brandName || 'Auto Mail').trim();
  }

  function applyBrand() {
    var brand = (Store.settings.brandName || 'Auto Mail').trim();
    el.brandLabel.textContent = brand;
    document.title = brand;
  }

  function applyLanguage(lang) {
    I18n.setLang(lang);
    I18n.translate();
    fillLangSelect(el.langSelect, I18n.lang, true);
    fillLangSelect(el.langSettings, I18n.lang);
    renderTemplates();
    renderList();
    updateAuthUi();
    updateNotifyUi();
    updateAutoReplyUi();
    updateCardHints();
    applyBrand();

    if (Gmail.isSignedIn()) {
      el.account.textContent = ui.myEmail || t('status.connected');
      setStatus('on', t('status.connected') + ' · ' + formatDate(Store.state.lastSync || Date.now()));
    } else {
      el.account.textContent = t('top.accountNone');
      setStatus('off', Gmail.isConfigured() ? t('status.needSignIn') : t('status.unconfigured'));
    }
    renderMenu();
    if (ui.current) showDetail(ui.current);
  }

  function changeLanguage(lang) {
    Store.saveSettings({ lang: lang });
    applyLanguage(lang);
  }

  el.langSelect.addEventListener('change', function () { changeLanguage(el.langSelect.value); });
  el.langSettings.addEventListener('change', function () { changeLanguage(el.langSettings.value); });

  /** Kartochka maydonlari bo'sh bo'lsa — javob tilidagi tayyor matnni
      placeholder qilib ko'rsatamiz, shunda nima ketishi ko'rinib turadi. */
  function updateCardHints() {
    var lang = el.cardLang.value || Store.settings.cardLang || 'en';
    el.autoTitle.placeholder = I18n.card(lang, 'defaultTitle');
    el.autoText.placeholder = I18n.card(lang, 'defaultText');
    el.autoSteps.placeholder = I18n.card(lang, 'defaultSteps');
    el.autoButton.placeholder = I18n.card(lang, 'defaultButton');
    el.responseTime.placeholder = I18n.card(lang, 'defaultResponseTime');
  }

  el.cardLang.addEventListener('change', updateCardHints);

  el.loadDefaults.addEventListener('click', function () {
    var lang = el.cardLang.value || 'en';
    el.autoTitle.value = I18n.card(lang, 'defaultTitle');
    el.autoText.value = I18n.card(lang, 'defaultText');
    el.autoSteps.value = I18n.card(lang, 'defaultSteps');
    el.autoButton.value = I18n.card(lang, 'defaultButton');
    el.responseTime.value = I18n.card(lang, 'defaultResponseTime');
    toast(t('toast.defaultsLoaded'));
  });

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
    toast(t('toast.theme', { value: t('toast.theme' + next.charAt(0).toUpperCase() + next.slice(1)) }));
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
    /* Sanoqlar aynan ochiq qutidagi xatlarni ko'rsatadi — masalan bosh
       navbatda bekorchilar ko'rinmagani uchun ular sanalmaydi ham. */
    var items = isQueueBox(ui.box) ? queueItems(ui.box) : ui.browse;
    var counts = { new: 0, progress: 0, done: 0, all: items.length };
    items.forEach(function (item) {
      if (counts[item.status] !== undefined) counts[item.status]++;
    });
    Object.keys(counts).forEach(function (key) {
      var node = el.tabs.querySelector('[data-count="' + key + '"]');
      if (node) node.textContent = counts[key];
    });
    var pending = queueItems(BOXES[0]).filter(function (ticket) {
      return ticket.status === 'new';
    }).length;
    var brand = (Store.settings.brandName || 'Auto Mail').trim();
    document.title = (pending ? '(' + pending + ') ' : '') + brand;
  }

  function rowHtml(item) {
    var status = item.status || '';
    var unread = (item.labelIds || []).indexOf('UNREAD') !== -1;
    var flag = item.priority === 'high' ? '🔥' : (item.priority === 'junk' ? '🧹' : '');
    return '<li><button class="ticket' + (ui.selected === item.id ? ' selected' : '') +
      (unread ? ' unread' : '') + (item.priority === 'high' ? ' high' : '') + '"' +
      ' data-id="' + escapeHtml(item.id) + '"' + (status ? ' data-status="' + status + '"' : '') + '>' +
      '<span class="t-row">' +
        '<span class="dot"' + (status ? ' data-status="' + status + '"' : '') + '></span>' +
        (flag ? '<span class="flag">' + flag + '</span>' : '') +
        '<span class="t-from">' + escapeHtml(item.from || item.fromEmail || '—') + '</span>' +
        '<time class="t-date">' + escapeHtml(formatDate(item.date)) + '</time>' +
      '</span>' +
      '<span class="t-subject">' + escapeHtml(item.subject) + '</span>' +
      '<span class="t-snippet">' + escapeHtml(item.snippet) + '</span>' +
      '</button></li>';
  }

  function visibleItems() {
    if (isQueueBox(ui.box)) return queueItems(ui.box).filter(matchesFilter);
    return ui.browse.filter(function (mail) {
      if (!ui.search) return true;
      return [mail.from, mail.fromEmail, mail.subject, mail.snippet]
        .join(' ').toLowerCase().indexOf(ui.search) !== -1;
    });
  }

  function renderList() {
    var isQueue = isQueueBox(ui.box);
    el.tabs.hidden = !isQueue;

    if (!isQueue && ui.browsing) {
      el.list.innerHTML = '<li class="empty">' + escapeHtml(t('menu.loading')) + '</li>';
      el.listEmpty.hidden = true;
      renderCounts();
      return;
    }

    var items = visibleItems();
    el.list.innerHTML = items.map(rowHtml).join('');
    el.listEmpty.textContent = t(isQueue ? 'list.empty' : 'browse.empty');
    el.listEmpty.hidden = items.length > 0;
    renderCounts();
  }

  el.list.addEventListener('click', function (event) {
    var button = event.target.closest('.ticket');
    if (button) openItem(button.dataset.id);
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
      el.body.innerHTML = '<p class="loading">' + escapeHtml(t('detail.noBody')) + '</p>';
    }
    if (parts.attachments && parts.attachments.length) {
      var note = document.createElement('p');
      note.className = 'attachments';
      note.textContent = t('detail.attachments', {
        list: parts.attachments.map(function (file) {
          return file.name + ' (' + Math.max(1, Math.round(file.size / 1024)) + ' KB)';
        }).join(', ')
      });
      el.body.appendChild(note);
    }
  }

  /** Navbatdagi ticket yoki jonli qutidagi xatni bitta ko'rinishga keltiradi. */
  function openItem(id) {
    if (ui.box.id === 'queue') {
      var ticket = Store.get(id);
      if (!ticket) return;
      return showDetail({
        queue: true,
        id: ticket.id,
        threadId: ticket.id,
        messageId: ticket.messageId,
        from: ticket.from,
        fromEmail: ticket.fromEmail,
        subject: ticket.subject,
        snippet: ticket.snippet,
        date: ticket.date,
        rfcMessageId: ticket.rfcMessageId,
        references: ticket.references,
        status: ticket.status,
        note: ticket.note,
        priority: ticket.priority,
        reasons: ticket.reasons,
        autoReplied: ticket.autoReplied
      });
    }

    var mail = ui.browse.filter(function (item) { return item.id === id; })[0];
    if (!mail) return;
    showDetail({
      queue: false,
      id: mail.id,
      threadId: mail.threadId,
      messageId: mail.id,
      from: mail.from,
      fromEmail: mail.fromEmail,
      subject: mail.subject,
      snippet: mail.snippet,
      date: mail.date,
      rfcMessageId: mail.rfcMessageId,
      references: mail.references
    });
  }

  function showDetail(data) {
    ui.current = data;
    ui.selected = data.id;
    document.body.dataset.view = 'detail';

    el.detailEmpty.hidden = true;
    el.detail.hidden = false;
    el.subject.textContent = data.subject;
    el.from.textContent = data.from ? data.from + ' · ' + data.fromEmail : data.fromEmail;
    el.date.textContent = Template.fullDate(data.date);
    el.note.value = data.note || '';
    el.reply.value = '';
    el.body.innerHTML = '<p class="loading">' + escapeHtml(t('detail.loading')) + '</p>';

    /* Status va ichki izoh — faqat navbat uchun ma'noli. */
    Array.prototype.forEach.call(el.statusRow.querySelectorAll('button[data-set]'), function (button) {
      button.hidden = !data.queue;
      button.classList.toggle('active', data.queue && button.dataset.set === data.status);
    });
    el.note.parentNode.hidden = !data.queue;
    el.queueBtn.hidden = data.queue;

    el.cardReplyBtn.hidden = !data.fromEmail;
    var verdict = data.priority ? data : Analyzer.classify(data);
    el.aiBadge.hidden = false;
    el.aiBadge.dataset.priority = verdict.priority;
    el.aiBadge.textContent = t('box.' + verdict.priority) +
      ((verdict.reasons || []).length
        ? ' · ' + verdict.reasons.map(function (key) { return t(key); }).join(', ')
        : '');

    /* Avtomatik javob holati — nega ketgani yoki ketmagani ko'rinib tursin. */
    var autoKey = autoReplyState(data.queue ? data : Object.assign({ date: data.date }, verdict, data));
    el.autoBadge.hidden = false;
    el.autoBadge.dataset.priority = autoKey === 'auto.sent' || autoKey === 'auto.pending' ? 'ok' : 'off';
    el.autoBadge.textContent = t(autoKey);
    renderList();

    Gmail.getBody(data.messageId).then(renderBody).catch(function (err) {
      el.body.innerHTML = '<p class="loading">' + escapeHtml(err.message) + '</p>';
    });
  }

  /** Jonli qutidagi xatni ish navbatiga oladi. */
  /** Ochiq xatga avtomatik javob kartochkasini shu zahoti yuboradi.
      Cheklovlarga bog'liq emas — sinash va bir martalik javob uchun. */
  el.cardReplyBtn.addEventListener('click', function () {
    var data = ui.current;
    if (!data) return;
    if (ui.myEmail && data.fromEmail &&
        data.fromEmail.toLowerCase() === ui.myEmail.toLowerCase()) {
      toast(t('toast.selfMail'));
    }

    var card = Template.buildAutoReply(Store.settings, {
      threadId: data.threadId,
      from: data.from,
      fromEmail: data.fromEmail,
      subject: data.subject,
      date: data.date
    });

    el.cardReplyBtn.disabled = true;
    Gmail.sendReply({
      fromName: senderName(),
      fromEmail: ui.myEmail,
      to: data.fromEmail,
      subject: card.subject,
      text: card.text,
      html: card.html,
      threadId: data.threadId,
      rfcMessageId: data.rfcMessageId,
      references: data.references
    }).then(function () {
      if (data.queue) Store.markAutoReplied(data.id, card.ticket);
      toast(t('toast.cardSent'));
      renderMenu();
      renderList();
      if (data.queue) openItem(data.id);
    }).catch(function (err) {
      toast(t('toast.sendFailed', { error: err.message }));
    }).then(function () {
      el.cardReplyBtn.disabled = false;
    });
  });

  el.queueBtn.addEventListener('click', function () {
    var data = ui.current;
    if (!data || data.queue) return;
    var added = Store.upsertFromMail({
      id: data.messageId,
      threadId: data.threadId,
      from: data.from,
      fromEmail: data.fromEmail,
      subject: data.subject,
      snippet: data.snippet || '',
      date: data.date,
      rfcMessageId: data.rfcMessageId,
      references: data.references
    });
    toast(t(added ? 'toast.addedToQueue' : 'toast.alreadyQueued'));
    renderMenu();
    renderList();
  });

  el.statusRow.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-set]');
    if (!button || !ui.current || !ui.current.queue) return;
    Store.update(ui.current.id, { status: button.dataset.set });
    openItem(ui.current.id);
    renderMenu();
    toast(t('toast.statusUpdated'));
  });

  el.openGmail.addEventListener('click', function () {
    if (!ui.current) return;
    window.open('https://mail.google.com/mail/u/0/#all/' + ui.current.threadId, '_blank', 'noopener');
  });

  var noteTimer = null;
  el.note.addEventListener('input', function () {
    if (!ui.current || !ui.current.queue) return;
    clearTimeout(noteTimer);
    var id = ui.current.id;
    var value = el.note.value;
    noteTimer = setTimeout(function () { Store.update(id, { note: value }); }, 400);
  });

  /* ---------- shablonlar ---------- */

  function renderTemplates() {
    el.templateSelect.innerHTML = '<option value="">' + escapeHtml(t('composer.pickTemplate')) + '</option>' +
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
    if (!body) return toast(t('toast.writeFirst'));
    var title = prompt(t('toast.templateName'), body.slice(0, 30));
    if (!title) return;
    Store.addTemplate(title, body);
    renderTemplates();
    toast(t('toast.templateSaved'));
  });

  /* ---------- javob yuborish ---------- */

  el.send.addEventListener('click', function () {
    var ticket = ui.current;
    if (!ticket) return;
    var text = el.reply.value.trim();
    if (!text) return toast(t('toast.emptyReply'));

    var signature = (Store.settings.signature || '').trim();
    var fullText = signature ? text + '\n\n' + signature : text;

    el.send.disabled = true;
    el.send.textContent = t('composer.sending');

    var code = '#' + Template.ticketCode(ticket.threadId);
    Gmail.sendReply({
      fromName: senderName(),
      fromEmail: ui.myEmail,
      to: ticket.fromEmail,
      subject: Template.withCode(ticket.subject, code),
      body: fullText,
      threadId: ticket.threadId,
      rfcMessageId: ticket.rfcMessageId,
      references: ticket.references
    }).then(function () {
      if (ticket.queue) Store.addReply(ticket.id, fullText);
      if (el.markRead.checked) return Gmail.markRead(ticket.messageId).catch(function () {});
    }).then(function () {
      el.reply.value = '';
      toast(t('toast.sent'));
      renderMenu();
      openItem(ticket.id);
    }).catch(function (err) {
      toast(t('toast.sendFailed', { error: err.message }));
    }).then(function () {
      el.send.disabled = false;
      el.send.textContent = t('composer.send');
    });
  });

  /* ---------- avtomatik javob ---------- */

  function isRobotAddress(email) {
    var value = String(email || '').toLowerCase();
    return ROBOT_HINTS.some(function (hint) { return value.indexOf(hint) !== -1; });
  }

  /**
   * Xatga avtomatik javob ketadimi, ketmasa nega — bitta joyda.
   * @returns {string} 'auto.sent' | 'auto.pending' | to'xtatgan sabab kaliti
   */
  function autoReplyState(ticket) {
    if (ticket.autoReplied) return 'auto.sent';
    if (ui.scriptLabelId && (ticket.labelIds || []).indexOf(ui.scriptLabelId) !== -1) {
      return 'auto.script';
    }
    if (!Store.settings.autoReply) return 'auto.off';
    if (ticket.priority === 'junk') return 'auto.junk';
    if (!ticket.fromEmail) return 'auto.robot';
    if (ui.myEmail && ticket.fromEmail.toLowerCase() === ui.myEmail.toLowerCase()) return 'auto.self';
    if (isRobotAddress(ticket.fromEmail)) return 'auto.robot';
    if (ticket.date < (Store.settings.autoReplySince || 0)) return 'auto.old';
    return 'auto.pending';
  }

  function shouldAutoReply(ticket) {
    return autoReplyState(ticket) === 'auto.pending';
  }

  /** Navbatdagi mos xatlarga birma-bir avtomatik javob yuboradi. */
  function runAutoReplies() {
    var queue = Store.list().filter(shouldAutoReply).slice(0, MAX_AUTO_REPLIES_PER_SYNC);
    if (!queue.length) return Promise.resolve(0);

    return queue.reduce(function (chain, ticket) {
      return chain.then(function (sent) {
        var card = Template.buildAutoReply(Store.settings, {
          threadId: ticket.id,
          from: ticket.from,
          fromEmail: ticket.fromEmail,
          subject: ticket.subject,
          date: ticket.date
        });
        return Gmail.sendReply({
          fromName: senderName(),
          fromEmail: ui.myEmail,
          to: ticket.fromEmail,
          subject: card.subject,      // murojaat raqami bilan
          text: card.text,
          html: card.html,
          threadId: ticket.id,
          rfcMessageId: ticket.rfcMessageId,
          references: ticket.references
        }).then(function () {
          Store.markAutoReplied(ticket.id, card.ticket);
          return sent + 1;
        }, function (err) {
          console.warn('Avtomatik javob yuborilmadi:', err.message);
          toast(t('toast.autoReplyFailed', { error: err.message }));
          return sent;
        });
      });
    }, Promise.resolve(0));
  }

  /* ---------- yangi xat ---------- */

  function openCompose() {
    if (!Gmail.isSignedIn()) return toast(t('toast.signInFirst'));
    el.composeTo.value = '';
    el.composeSubject.value = '';
    el.composeBody.value = '';
    el.composeCard.checked = false;
    el.composeDialog.showModal();
    el.composeTo.focus();
  }

  el.compose.addEventListener('click', openCompose);
  el.newChat.addEventListener('click', openCompose);

  el.composeDialog.addEventListener('close', function () {
    if (el.composeDialog.returnValue !== 'send') return;

    var to = el.composeTo.value.trim();
    var subject = el.composeSubject.value.trim();
    var body = el.composeBody.value.trim();
    if (!to || to.indexOf('@') === -1) return toast(t('toast.badAddress'));
    if (!body) return toast(t('toast.emptyBody'));

    var signature = (Store.settings.signature || '').trim();
    var text = signature ? body + '\n\n' + signature : body;
    var payload = { to: to, subject: subject || '—', text: text };

    if (el.composeCard.checked) {
      var card = Template.buildAutoReply(
        Object.assign({}, Store.settings, {
          autoReplyTitle: subject || Store.settings.autoReplyTitle,
          autoReplyText: body,
          autoReplySteps: ''
        }),
        { threadId: to + subject, from: Gmail.parseAddress(to).name, fromEmail: to,
          subject: subject || '—', date: Date.now() }
      );
      payload.html = card.html;
      payload.text = card.text;
    }

    payload.fromName = senderName();
    payload.fromEmail = ui.myEmail;
    toast(t('composer.sending'));
    Gmail.sendMail(payload).then(function () {
      toast(t('toast.mailSent'));
      setTimeout(function () { sync(false); }, 1500);
    }).catch(function (err) {
      toast(t('toast.sendFailed', { error: err.message }));
    });
  });

  /* ---------- kartochka namunasi ---------- */

  el.clearQueue.addEventListener('click', function () {
    if (!confirm(t('confirm.clearQueue'))) return;
    Store.clearTickets();
    ui.selected = null;
    ui.current = null;
    ui.lastFullSync = 0;
    el.detail.hidden = true;
    el.detailEmpty.hidden = false;
    renderMenu();
    renderList();
    toast(t('toast.queueCleared'));
  });

  el.previewBtn.addEventListener('click', function () {
    var lang = el.cardLang.value || 'en';
    var card = Template.buildAutoReply(readAutoReplyFields(), {
      threadId: 'namuna',
      from: I18n.card(lang, 'sampleName'),
      fromEmail: 'sample@example.com',
      subject: I18n.card(lang, 'sampleSubject'),
      date: Date.now()
    });
    el.previewFrame.srcdoc = card.html;
    el.previewDialog.showModal();
  });

  /* ---------- sinxronizatsiya ---------- */

  function notifySupported() {
    return 'Notification' in window;
  }

  function updateNotifyUi() {
    var on = Store.settings.notify && notifySupported() && Notification.permission === 'granted';
    el.notifyBtn.dataset.on = on ? 'yes' : 'no';
    el.notifyBtn.textContent = on ? '🔔' : '🔕';
  }

  /**
   * Qurilmaga bildirishnoma chiqaradi.
   * Android'da `new Notification()` ishlamaydi — faqat service worker
   * orqali chiqarish mumkin, shuning uchun avval o'sha yo'l sinaladi.
   */
  function showNotification(title, body) {
    var options = {
      body: body,
      icon: './logo.png',
      badge: './logo.png',
      tag: 'automail-new',
      renotify: true,
      vibrate: [80, 40, 80],
      data: { url: location.href }
    };

    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(function (registration) {
        return registration.showNotification(title, options);
      }).catch(function () {
        try { new Notification(title, options); } catch (err) { /* qo'llab-quvvatlanmaydi */ }
      });
      return;
    }
    try { new Notification(title, options); } catch (err) { /* qo'llab-quvvatlanmaydi */ }
  }

  function notifyNew(mails) {
    if (!Store.settings.notify || !notifySupported()) return;
    if (Notification.permission !== 'granted') return;

    var brand = (Store.settings.brandName || 'Auto Mail').trim();
    var count = mails.length;
    var hasImportant = mails.some(function (mail) { return mail.priority === 'high'; });
    var title = (hasImportant ? '🔥 ' : '') + brand;
    var body = count === 1
      ? t('notify.from', {
          name: mails[0].from || mails[0].fromEmail,
          subject: mails[0].subject
        })
      : t('notify.many', { count: count });

    showNotification(title, body);
  }

  /** Tugma bosilganda ruxsat so'raydi yoki o'chiradi. */
  function toggleNotifications() {
    if (!notifySupported()) return toast(t('toast.notifyUnsupported'));

    if (Store.settings.notify && Notification.permission === 'granted') {
      Store.saveSettings({ notify: false });
      updateNotifyUi();
      return toast(t('toast.notifyOff'));
    }

    if (Notification.permission === 'denied') {
      updateNotifyUi();
      return toast(t('toast.notifyBlocked'));
    }

    /* Ruxsat faqat foydalanuvchi bosgan paytda so'ralishi mumkin. */
    Notification.requestPermission().then(function (result) {
      if (result === 'granted') {
        Store.saveSettings({ notify: true });
        updateNotifyUi();
        toast(t('toast.notifyOn'));
        showNotification((Store.settings.brandName || 'Auto Mail').trim(), t('toast.notifyOn'));
      } else {
        Store.saveSettings({ notify: false });
        updateNotifyUi();
        toast(t('toast.notifyBlocked'));
      }
    });
  }

  el.notifyBtn.addEventListener('click', toggleNotifications);

  function updateAutoReplyUi() {
    var on = !!Store.settings.autoReply;
    el.autoReplyBtn.dataset.on = on ? 'yes' : 'no';
    el.autoReplyBtn.textContent = on ? '🤖' : '💤';
    el.autoReplyNotice.hidden = on;
  }

  function setAutoReply(on) {
    var patch = { autoReply: on };
    /* Yoqilganda oxirgi 10 daqiqada kelgan xatlar ham qamrab olinadi —
       hozirgina tushgan xat javobsiz qolib ketmasin. */
    if (on) patch.autoReplySince = Date.now() - 10 * 60 * 1000;
    Store.saveSettings(patch);
    updateAutoReplyUi();
    toast(t(on ? 'toast.autoReplyOn' : 'toast.autoReplyOff'));
    if (on) sync(false);
  }

  el.autoReplyBtn.addEventListener('click', function () {
    setAutoReply(!Store.settings.autoReply);
  });

  el.enableAutoReply.addEventListener('click', function () { setAutoReply(true); });

  function sync(interactive) {
    if (ui.syncing) return Promise.resolve();
    if (!Gmail.isConfigured()) {
      setStatus('off', t('status.unconfigured'));
      return Promise.resolve();
    }
    ui.syncing = true;
    setStatus('sync', t('status.checking'));

    var ready = Gmail.isSignedIn() ? Promise.resolve() : (interactive ? Gmail.signIn() : Gmail.restore());

    return ready
      .then(function () { return ui.myEmail ? null : loadProfile(); })
      .then(function () { return collectNewIds(interactive); })
      .then(function (ids) {
        var known = {};
        Store.list().forEach(function (ticket) { known[ticket.messageId] = true; });
        var fresh = ids.filter(function (id) { return !known[id]; });
        if (!fresh.length) return [];

        return mapLimit(fresh, 4, function (id) {
          return Gmail.getHeaders(id).catch(function () { return null; });
        }).then(function (mails) {
          var addedMails = [];
          mails.filter(Boolean).forEach(function (mail) {
            /* Tarix butun pochta bo'yicha keladi — o'z xatlarimizni o'tkazamiz. */
            if (ui.myEmail && mail.fromEmail &&
                mail.fromEmail.toLowerCase() === ui.myEmail.toLowerCase()) return;
            if (Store.upsertFromMail(mail)) {
              var ticket = Store.get(mail.threadId);
              addedMails.push(ticket || mail);
            }
          });
          return addedMails;
        });
      })
      .then(function (addedMails) {
        var added = addedMails.length;
        Store.setLastSync(Date.now());
        renderList();
        ui.authRetries = 0;
        setStatus('on', t('status.connected') + ' · ' + formatDate(Date.now()));
        if (added > 0) {
          notifyNew(addedMails);
          toast(t('toast.newMails', { count: added }));
        }
        return runAutoReplies();
      })
      .then(function (replied) {
        if (replied) {
          renderList();
          toast(t('toast.autoReplied', { count: replied }));
        }
        if (!ui.labels.length) return loadLabels();
        return refreshCounts(false);
      })
      .catch(function (err) {
        setStatus('err', t('status.error'));
        if (interactive) {
          toast(err.message);
          return;
        }
        console.warn('Sinxronizatsiya:', err.message);
        /* Jimgina yangilash bir urinishda ishlamasligi mumkin (masalan,
           tarmoq uzilgan). Kirishni so'rashdan oldin yana ikki marta
           urinib ko'ramiz. */
        if (Gmail.wasSignedIn() && ui.authRetries < 2) {
          ui.authRetries++;
          setTimeout(function () { sync(false); }, 4000 * ui.authRetries);
        }
      })
      .then(function () {
        ui.syncing = false;
        updateAuthUi();
      });
  }

  /**
   * Yangi xatlarning identifikatorlarini qaytaradi.
   * Odatda Gmail tarixidan (arzon va tez), vaqti-vaqti bilan esa
   * to'liq qidiruv sharti bo'yicha — hech narsa e'tibordan qolmasligi uchun.
   */
  function collectNewIds(force) {
    var needsFull = force || !Store.state.historyId ||
      (Date.now() - ui.lastFullSync > FULL_SYNC_EVERY);

    if (!needsFull) {
      return Gmail.history(Store.state.historyId).then(function (result) {
        if (!result) return fullScan();           // belgi eskirgan
        Store.setHistoryId(result.historyId);
        return result.ids;
      });
    }
    return fullScan();
  }

  function fullScan() {
    ui.lastFullSync = Date.now();
    return Gmail.listMessages(Store.settings.query, 40).then(function (messages) {
      return Gmail.historyId().then(function (id) {
        Store.setHistoryId(id);
        return messages.map(function (message) { return message.id; });
      }, function () {
        return messages.map(function (message) { return message.id; });
      });
    });
  }

  function schedulePolling() {
    clearInterval(ui.timer);
    var seconds = Math.max(10, Number(Store.settings.pollSeconds) || 20);
    ui.timer = setInterval(function () {
      if (document.visibilityState !== 'visible') return;
      /* Kirish muddati tugashini kutmaymiz — oldindan jimgina yangilaymiz,
         shunda ilova qayta ochilganda login qayta so'ralmaydi. */
      if (Gmail.isSignedIn() && Gmail.secondsLeft() < RENEW_BEFORE) {
        Gmail.renew().then(function () { sync(false); }, function () { sync(false); });
        return;
      }
      sync(false);
    }, seconds * 1000);
  }

  el.refresh.addEventListener('click', function () {
    if (ui.box.id !== 'queue') return loadBox().then(function () { return refreshCounts(true); });
    sync(true);
  });

  el.statusPill.addEventListener('click', function () {
    if (!Gmail.isConfigured()) return el.dialog.showModal();
    if (Gmail.isSignedIn()) {
      if (confirm(t('confirm.signOut'))) {
        Gmail.signOut();
        ui.myEmail = '';
        el.account.textContent = t('top.accountNone');
        setStatus('off', t('status.needSignIn'));
        updateAuthUi();
      }
      return;
    }
    signInFlow();
  });

  el.signIn.addEventListener('click', signInFlow);

  function switchAccount() {
    setMenuOpen(false);
    if (el.dialog.open) el.dialog.close();
    Gmail.switchAccount().then(function () {
      ui.myEmail = '';
      ui.labels = [];
      ui.counts = {};
      return loadProfile();
    }).then(function () {
      return sync(false).then(loadLabels);
    }).catch(function (err) {
      toast(err.message);
    });
  }

  el.addAccount.addEventListener('click', switchAccount);
  el.switchAccount.addEventListener('click', switchAccount);

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') sync(false);
  });

  window.addEventListener('online', function () { sync(false); });
  window.addEventListener('focus', function () {
    /* Oynaga qaytilganda darhol yangilaymiz, keyingi taymerni kutmasdan. */
    if (Date.now() - (Store.state.lastSync || 0) > 5000) sync(false);
  });

  function updateAuthUi() {
    var signedIn = Gmail.isSignedIn();
    el.signIn.hidden = signedIn || !Gmail.isConfigured();
    el.statusPill.title = t(signedIn ? 'status.signOutHint' : 'status.signInHint');
  }

  function signInFlow() {
    return sync(true).then(updateAuthUi);
  }

  function loadProfile() {
    if (!Gmail.isSignedIn()) return Promise.resolve();
    return Gmail.profile().then(function (profile) {
      ui.myEmail = profile.emailAddress || '';
      el.account.textContent = ui.myEmail || t('status.connected');
      /* Boshqa pochtaga kirilgan bo'lsa, oldingi hisobning navbati o'chadi. */
      if (Store.setAccount(ui.myEmail)) {
        ui.browse = [];
        ui.labels = [];
        ui.counts = {};
        ui.selected = null;
        ui.current = null;
        ui.lastFullSync = 0;
        el.detail.hidden = true;
        el.detailEmpty.hidden = false;
        renderMenu();
        renderList();
      }
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

    fillLangSelect(el.cardLang, settings.cardLang);
    el.autoReply.checked = !!settings.autoReply;
    el.brandName.value = settings.brandName;
    el.brandColor.value = settings.brandColor;
    el.autoTitle.value = settings.autoReplyTitle;
    el.autoText.value = settings.autoReplyText;
    el.autoSteps.value = settings.autoReplySteps;
    el.autoUrl.value = settings.autoReplyUrl;
    el.autoButton.value = settings.autoReplyButton;
    el.autoContact.value = settings.autoReplyContact;
    el.responseTime.value = settings.responseTime;
    el.logoUrl.value = settings.logoUrl;
    el.senderName.value = settings.senderName;
    el.senderName.placeholder = settings.brandName || 'Auto Mail';
    updateCardHints();
  }

  /** Namuna uchun: hozir oynada turgan (hali saqlanmagan) qiymatlar. */
  function readAutoReplyFields() {
    return Object.assign({}, Store.settings, {
      cardLang: el.cardLang.value || 'en',
      brandName: el.brandName.value.trim() || Store.settings.brandName,
      brandColor: el.brandColor.value,
      autoReplyTitle: el.autoTitle.value.trim(),
      autoReplyText: el.autoText.value,
      autoReplySteps: el.autoSteps.value,
      autoReplyUrl: el.autoUrl.value.trim(),
      autoReplyButton: el.autoButton.value.trim(),
      autoReplyContact: el.autoContact.value.trim(),
      responseTime: el.responseTime.value.trim(),
      logoUrl: el.logoUrl.value.trim(),
      senderName: el.senderName.value.trim()
    });
  }

  el.settings.addEventListener('click', function () {
    fillSettings();
    el.dialog.showModal();
  });

  el.dialog.addEventListener('close', function () {
    if (el.dialog.returnValue !== 'save') return;

    var wantsNotify = el.notify.checked;
    var wasAutoReply = Store.settings.autoReply;
    var patch = Object.assign(readAutoReplyFields(), {
      clientId: el.clientId.value.trim(),
      query: el.query.value.trim() || 'in:inbox -from:me newer_than:7d',
      pollSeconds: Math.min(3600, Math.max(15, Number(el.poll.value) || 60)),
      notify: wantsNotify,
      signature: el.signature.value,
      autoReply: el.autoReply.checked
    });

    /* Avtomatik javob endi yoqildi — eski xatlarga javob ketib qolmasligi
       uchun sanoqni shu paytdan boshlaymiz. */
    if (patch.autoReply && !wasAutoReply) patch.autoReplySince = Date.now() - 10 * 60 * 1000;

    Store.saveSettings(patch);

    Gmail.configure(Store.settings.clientId);
    schedulePolling();

    if (wantsNotify && notifySupported() && Notification.permission === 'default') {
      Notification.requestPermission().then(updateNotifyUi);
    }
    updateNotifyUi();
    applyBrand();
    updateAutoReplyUi();
    toast(t('toast.settingsSaved'));
    signInFlow();
  });

  /* ---------- ishga tushirish ---------- */

  function init() {
    applyTheme(Store.settings.theme);
    I18n.setLang(Store.settings.lang);
    fillLangSelect(el.langSelect, I18n.lang, true);
    fillLangSelect(el.langSettings, I18n.lang);
    I18n.translate();
    renderTemplates();
    renderMenu();
    renderList();
    fillSettings();
    applyBrand();
    setMenuOpen(false);
    updateNotifyUi();
    updateAutoReplyUi();
    el.account.textContent = t('top.accountNone');
    Gmail.configure(Store.settings.clientId);

    if (!Store.settings.clientId) {
      setStatus('off', t('status.unconfigured'));
      el.dialog.showModal();
    } else {
      setStatus('off', t('status.needSignIn'));
      schedulePolling();
      if (Gmail.wasSignedIn()) sync(false);
    }
    updateAuthUi();

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('./service-worker.js').catch(function () {});
      });
    }
  }

  init();
})();
