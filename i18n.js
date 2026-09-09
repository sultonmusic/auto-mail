/* Auto Mail — tarjima qatlami.
   Panel tili (ui) va mijozga ketadigan kartochka tili (card) alohida:
   panelni o'zbekchada ishlatib, javobni inglizchada yuborish mumkin. */
(function (global) {
  'use strict';

  var DICT = {
    uz: {
      name: 'O\'zbekcha',
      months: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
      monthsShort: ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'],
      longDate: '{d}-{month}, {y}',
      shortDate: '{d}-{monthShort}',
      ui: {
        'app.tagline': 'Gmail navbat',
        'top.accountNone': 'ulanmagan',
        'top.newMail': 'Yangi xat',
        'top.refresh': 'Yangilash',
        'top.theme': 'Mavzu',
        'top.settings': 'Sozlamalar',
        'top.back': 'Ro\'yxatga qaytish',
        'top.lang': 'Til',
        'status.off': 'Oflayn',
        'status.unconfigured': 'Sozlanmagan',
        'status.needSignIn': 'Kirish kerak',
        'status.checking': 'Tekshirilmoqda…',
        'status.connected': 'Ulangan',
        'status.error': 'Xato',
        'status.signInHint': 'Kirish uchun bosing',
        'status.signOutHint': 'Chiqish uchun bosing',
        'menu.open': 'Menyu',
        'menu.mailboxes': 'Pochta',
        'menu.categories': 'Toifalar',
        'menu.labels': 'Yorliqlar',
        'menu.noLabels': 'Yorliq yo\'q',
        'menu.loading': 'Yuklanmoqda…',
        'box.queue': 'Navbat',
        'box.inbox': 'Kiruvchi',
        'box.starred': 'Belgilangan',
        'box.important': 'Muhim',
        'box.sent': 'Yuborilgan',
        'box.drafts': 'Qoralamalar',
        'box.spam': 'Spam',
        'box.trash': 'Savat',
        'box.allmail': 'Barcha xatlar',
        'box.primary': 'Asosiy',
        'box.social': 'Ijtimoiy tarmoqlar',
        'box.promo': 'Reklama',
        'box.updates': 'Yangilanishlar',
        'box.forums': 'Forumlar',
        'browse.empty': 'Bu qutida xat yo\'q.',
        'browse.addToQueue': 'Navbatga qo\'shish',
        'toast.addedToQueue': 'Navbatga qo\'shildi.',
        'toast.alreadyQueued': 'Bu xat allaqachon navbatda.',
        'list.newChat': '✎ Yangi xat yozish',
        'list.search': 'Qidirish: ism, mavzu, matn…',
        'tab.new': 'Navbat',
        'tab.progress': 'Ishlanmoqda',
        'tab.done': 'Javob berilgan',
        'tab.all': 'Barchasi',
        'list.empty': 'Bu bo\'limda xat yo\'q.',
        'detail.emptyTitle': 'Xat tanlang',
        'detail.emptyText': 'Chapdagi navbatdan xatni tanlang — bu yerda to\'liq matni va javob oynasi ochiladi.',
        'detail.signIn': 'Google bilan kirish',
        'detail.loading': 'Yuklanmoqda…',
        'detail.noBody': 'Matn topilmadi — Gmail\'da oching.',
        'detail.attachments': '📎 Ilova: {list} — Gmail\'da yuklab oling.',
        'detail.setNew': 'Navbatda',
        'detail.setProgress': 'Ishlanmoqda',
        'detail.setDone': 'Javob berilgan',
        'detail.openGmail': 'Gmail\'da ochish ↗',
        'note.label': 'Ichki izoh (faqat shu qurilmada saqlanadi)',
        'note.ph': 'Masalan: mijozga narx ro\'yxati yuborilsin',
        'composer.title': 'Javob yozish',
        'composer.pickTemplate': 'Shablon tanlash…',
        'composer.saveTemplate': 'Shablon sifatida saqlash',
        'composer.replyPh': 'Javob matni…',
        'composer.markRead': 'Yuborilgach o\'qilgan deb belgilansin',
        'composer.send': 'Javobni yuborish',
        'composer.sending': 'Yuborilmoqda…',
        'settings.title': 'Sozlamalar',
        'settings.hint': 'Auto Mail to\'g\'ridan-to\'g\'ri brauzerdan Gmail API bilan ishlaydi. Serversiz ishlashi uchun Google OAuth Client ID kerak — u maxfiy kalit emas.',
        'settings.lang': 'Panel tili',
        'settings.clientId': 'Google OAuth Client ID',
        'settings.query': 'Gmail qidiruv sharti (qaysi xatlar navbatga olinadi)',
        'settings.poll': 'Avtomatik tekshiruv (soniya)',
        'settings.notify': 'Yangi xatda bildirishnoma',
        'settings.signature': 'Imzo (qo\'lda yozilgan javob oxiriga qo\'shiladi)',
        'settings.howto': 'Client ID qanday olinadi? (5 qadam)',
        'settings.step1': 'console.cloud.google.com da yangi loyiha oching.',
        'settings.step2': '«APIs & Services → Library» da Gmail API ni yoqing.',
        'settings.step3': '«OAuth consent screen» da External turini tanlang va o\'z Gmail manzilingizni Test users ga qo\'shing.',
        'settings.step4': '«Credentials → Create credentials → OAuth client ID → Web application» tanlang.',
        'settings.step5': 'Authorized JavaScript origins ga shu sayt manzilini qo\'shing:',
        'settings.autoSection': 'Avtomatik javob',
        'settings.autoEnable': 'Yangi xatga avtomatik javob yuborilsin',
        'settings.autoHint': 'Yoqilgan paytdan keyin kelgan xatlargagina javob boradi va har bir suhbatga faqat bir marta. noreply@ kabi manzillar chetlab o\'tiladi.',
        'settings.cardLang': 'Javob tili (mijozga ketadigan kartochka)',
        'settings.brandName': 'Brend nomi',
        'settings.brandColor': 'Brend rangi',
        'settings.cardTitle': 'Javob sarlavhasi',
        'settings.cardText': 'Javob matni',
        'settings.cardSteps': 'Keyingi qadamlar (har biri yangi qatorda)',
        'settings.cardUrl': 'Tugma havolasi (ixtiyoriy)',
        'settings.cardButton': 'Tugma yozuvi',
        'settings.cardContact': 'Bog\'lanish uchun e-pochta (ixtiyoriy)',
        'settings.placeholders': 'Matnlarda ishlatsa bo\'ladi:',
        'settings.preview': 'Kartochka namunasini ko\'rish',
        'settings.loadDefaults': 'Tanlangan tildagi tayyor matnni qo\'yish',
        'compose.title': 'Yangi xat',
        'compose.to': 'Kimga',
        'compose.subject': 'Mavzu',
        'compose.body': 'Matn',
        'compose.bodyPh': 'Xat matni…',
        'compose.asCard': 'Chiroyli kartochka ko\'rinishida yuborilsin',
        'preview.title': 'Kartochka namunasi',
        'btn.cancel': 'Bekor qilish',
        'btn.save': 'Saqlash',
        'btn.close': 'Yopish',
        'btn.send': 'Yuborish',
        'toast.theme': 'Mavzu: {value}',
        'toast.themeAuto': 'tizimga mos',
        'toast.themeLight': 'yorug\'',
        'toast.themeDark': 'qorong\'i',
        'toast.settingsSaved': 'Sozlamalar saqlandi.',
        'toast.statusUpdated': 'Status yangilandi.',
        'toast.templateSaved': 'Shablon saqlandi.',
        'toast.templateName': 'Shablon nomi:',
        'toast.writeFirst': 'Avval javob matnini yozing.',
        'toast.emptyReply': 'Javob matni bo\'sh.',
        'toast.emptyBody': 'Xat matni bo\'sh.',
        'toast.badAddress': 'Manzil noto\'g\'ri.',
        'toast.sent': 'Javob yuborildi ✓',
        'toast.mailSent': 'Xat yuborildi ✓',
        'toast.sendFailed': 'Yuborilmadi: {error}',
        'toast.newMails': '{count} ta yangi xat navbatga olindi.',
        'toast.autoReplied': '{count} ta xatga avtomatik javob yuborildi.',
        'toast.signInFirst': 'Avval Gmail hisobiga kiring.',
        'toast.defaultsLoaded': 'Tayyor matn qo\'yildi.',
        'confirm.signOut': 'Gmail hisobidan chiqasizmi?',
        'notify.one': 'Navbatga 1 ta yangi xat tushdi.',
        'notify.many': 'Navbatga {count} ta yangi xat tushdi.'
      },
      card: {
        greeting: 'Assalomu alaykum, {name}!',
        ticket: 'Murojaat raqami',
        subject: 'Mavzu',
        date: 'Qabul qilingan sana',
        steps: 'Keyingi qadamlar',
        autoNote: 'Bu xabar avtomatik yuborildi. Tez orada javob beramiz',
        autoNoteContact: ', shoshilinch bo\'lsa: {contact}',
        defaultTitle: 'Xabaringiz qabul qilindi',
        defaultText: 'Murojaatingiz ro\'yxatga olindi. Mutaxassisimiz uni ko\'rib chiqib, tez orada shu manzilga javob yozadi.',
        defaultSteps: 'Mutaxassis murojaatingizni ko\'rib chiqadi.\nZarur bo\'lsa, qo\'shimcha ma\'lumot uchun bog\'lanamiz.\nYakuniy javob shu manzilga alohida xat bo\'lib keladi.',
        defaultButton: 'Saytga o\'tish',
        sampleName: 'Aziz Karimov',
        sampleSubject: 'Buyurtma haqida savol'
      }
    },

    en: {
      name: 'English',
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      longDate: '{d} {month} {y}',
      shortDate: '{d} {monthShort}',
      ui: {
        'app.tagline': 'Gmail queue',
        'top.accountNone': 'not connected',
        'top.newMail': 'New message',
        'top.refresh': 'Refresh',
        'top.theme': 'Theme',
        'top.settings': 'Settings',
        'top.back': 'Back to list',
        'top.lang': 'Language',
        'status.off': 'Offline',
        'status.unconfigured': 'Not configured',
        'status.needSignIn': 'Sign in',
        'status.checking': 'Checking…',
        'status.connected': 'Connected',
        'status.error': 'Error',
        'status.signInHint': 'Click to sign in',
        'status.signOutHint': 'Click to sign out',
        'menu.open': 'Menu',
        'menu.mailboxes': 'Mail',
        'menu.categories': 'Categories',
        'menu.labels': 'Labels',
        'menu.noLabels': 'No labels',
        'menu.loading': 'Loading…',
        'box.queue': 'Queue',
        'box.inbox': 'Inbox',
        'box.starred': 'Starred',
        'box.important': 'Important',
        'box.sent': 'Sent',
        'box.drafts': 'Drafts',
        'box.spam': 'Spam',
        'box.trash': 'Trash',
        'box.allmail': 'All mail',
        'box.primary': 'Primary',
        'box.social': 'Social',
        'box.promo': 'Promotions',
        'box.updates': 'Updates',
        'box.forums': 'Forums',
        'browse.empty': 'No messages in this mailbox.',
        'browse.addToQueue': 'Add to queue',
        'toast.addedToQueue': 'Added to the queue.',
        'toast.alreadyQueued': 'This message is already in the queue.',
        'list.newChat': '✎ Write a new message',
        'list.search': 'Search: name, subject, text…',
        'tab.new': 'Queue',
        'tab.progress': 'In progress',
        'tab.done': 'Answered',
        'tab.all': 'All',
        'list.empty': 'No messages here.',
        'detail.emptyTitle': 'Select a message',
        'detail.emptyText': 'Pick a message from the queue on the left — its full text and the reply box open here.',
        'detail.signIn': 'Sign in with Google',
        'detail.loading': 'Loading…',
        'detail.noBody': 'No text found — open it in Gmail.',
        'detail.attachments': '📎 Attachments: {list} — download them in Gmail.',
        'detail.setNew': 'In queue',
        'detail.setProgress': 'In progress',
        'detail.setDone': 'Answered',
        'detail.openGmail': 'Open in Gmail ↗',
        'note.label': 'Internal note (stored on this device only)',
        'note.ph': 'For example: send the price list',
        'composer.title': 'Write a reply',
        'composer.pickTemplate': 'Pick a template…',
        'composer.saveTemplate': 'Save as template',
        'composer.replyPh': 'Reply text…',
        'composer.markRead': 'Mark as read after sending',
        'composer.send': 'Send reply',
        'composer.sending': 'Sending…',
        'settings.title': 'Settings',
        'settings.hint': 'Auto Mail talks to the Gmail API straight from your browser. It needs a Google OAuth Client ID — that is not a secret key.',
        'settings.lang': 'Panel language',
        'settings.clientId': 'Google OAuth Client ID',
        'settings.query': 'Gmail search query (which messages enter the queue)',
        'settings.poll': 'Auto check (seconds)',
        'settings.notify': 'Notify on new mail',
        'settings.signature': 'Signature (added to replies you write by hand)',
        'settings.howto': 'How do I get a Client ID? (5 steps)',
        'settings.step1': 'Create a new project at console.cloud.google.com.',
        'settings.step2': 'Enable Gmail API under «APIs & Services → Library».',
        'settings.step3': 'On «OAuth consent screen» choose External and add your Gmail address to Test users.',
        'settings.step4': 'Go to «Credentials → Create credentials → OAuth client ID → Web application».',
        'settings.step5': 'Add this site address to Authorized JavaScript origins:',
        'settings.autoSection': 'Automatic reply',
        'settings.autoEnable': 'Send an automatic reply to new messages',
        'settings.autoHint': 'Only messages that arrive after you switch this on get a reply, and each conversation gets one. Addresses like noreply@ are skipped.',
        'settings.cardLang': 'Reply language (the card sent to the customer)',
        'settings.brandName': 'Brand name',
        'settings.brandColor': 'Brand color',
        'settings.cardTitle': 'Reply headline',
        'settings.cardText': 'Reply text',
        'settings.cardSteps': 'Next steps (one per line)',
        'settings.cardUrl': 'Button link (optional)',
        'settings.cardButton': 'Button label',
        'settings.cardContact': 'Contact email (optional)',
        'settings.placeholders': 'You can use in the texts:',
        'settings.preview': 'Preview the card',
        'settings.loadDefaults': 'Load the ready-made text for this language',
        'compose.title': 'New message',
        'compose.to': 'To',
        'compose.subject': 'Subject',
        'compose.body': 'Message',
        'compose.bodyPh': 'Message text…',
        'compose.asCard': 'Send it as a designed card',
        'preview.title': 'Card preview',
        'btn.cancel': 'Cancel',
        'btn.save': 'Save',
        'btn.close': 'Close',
        'btn.send': 'Send',
        'toast.theme': 'Theme: {value}',
        'toast.themeAuto': 'system',
        'toast.themeLight': 'light',
        'toast.themeDark': 'dark',
        'toast.settingsSaved': 'Settings saved.',
        'toast.statusUpdated': 'Status updated.',
        'toast.templateSaved': 'Template saved.',
        'toast.templateName': 'Template name:',
        'toast.writeFirst': 'Write the reply text first.',
        'toast.emptyReply': 'The reply is empty.',
        'toast.emptyBody': 'The message is empty.',
        'toast.badAddress': 'That address is not valid.',
        'toast.sent': 'Reply sent ✓',
        'toast.mailSent': 'Message sent ✓',
        'toast.sendFailed': 'Not sent: {error}',
        'toast.newMails': '{count} new message(s) added to the queue.',
        'toast.autoReplied': 'Automatic reply sent to {count} message(s).',
        'toast.signInFirst': 'Sign in to Gmail first.',
        'toast.defaultsLoaded': 'Ready-made text loaded.',
        'confirm.signOut': 'Sign out of your Gmail account?',
        'notify.one': '1 new message in the queue.',
        'notify.many': '{count} new messages in the queue.'
      },
      card: {
        greeting: 'Hello, {name}!',
        ticket: 'Ticket ID',
        subject: 'Request subject',
        date: 'Received on',
        steps: 'What happens next',
        autoNote: 'This message was sent automatically. We will get back to you shortly',
        autoNoteContact: ', for anything urgent write to {contact}',
        defaultTitle: 'We received your request',
        defaultText: 'Your request has been registered. A specialist will review it and reply to this address shortly.',
        defaultSteps: 'A specialist will review the details you provided.\nIf anything needs clarifying, we will contact you.\nThe decision will arrive at this address in a separate email.',
        defaultButton: 'Open the website',
        sampleName: 'Alex Carter',
        sampleSubject: 'Question about my order'
      }
    },

    ru: {
      name: 'Русский',
      months: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
      monthsShort: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
      longDate: '{d} {month} {y}',
      shortDate: '{d} {monthShort}',
      ui: {
        'app.tagline': 'Очередь Gmail',
        'top.accountNone': 'не подключено',
        'top.newMail': 'Новое письмо',
        'top.refresh': 'Обновить',
        'top.theme': 'Тема',
        'top.settings': 'Настройки',
        'top.back': 'К списку',
        'top.lang': 'Язык',
        'status.off': 'Оффлайн',
        'status.unconfigured': 'Не настроено',
        'status.needSignIn': 'Нужен вход',
        'status.checking': 'Проверка…',
        'status.connected': 'Подключено',
        'status.error': 'Ошибка',
        'status.signInHint': 'Нажмите, чтобы войти',
        'status.signOutHint': 'Нажмите, чтобы выйти',
        'menu.open': 'Меню',
        'menu.mailboxes': 'Почта',
        'menu.categories': 'Категории',
        'menu.labels': 'Ярлыки',
        'menu.noLabels': 'Ярлыков нет',
        'menu.loading': 'Загрузка…',
        'box.queue': 'Очередь',
        'box.inbox': 'Входящие',
        'box.starred': 'Помеченные',
        'box.important': 'Важные',
        'box.sent': 'Отправленные',
        'box.drafts': 'Черновики',
        'box.spam': 'Спам',
        'box.trash': 'Корзина',
        'box.allmail': 'Вся почта',
        'box.primary': 'Несортированные',
        'box.social': 'Соцсети',
        'box.promo': 'Промоакции',
        'box.updates': 'Оповещения',
        'box.forums': 'Форумы',
        'browse.empty': 'В этом ящике нет писем.',
        'browse.addToQueue': 'Добавить в очередь',
        'toast.addedToQueue': 'Добавлено в очередь.',
        'toast.alreadyQueued': 'Это письмо уже в очереди.',
        'list.newChat': '✎ Написать письмо',
        'list.search': 'Поиск: имя, тема, текст…',
        'tab.new': 'Очередь',
        'tab.progress': 'В работе',
        'tab.done': 'Отвечено',
        'tab.all': 'Все',
        'list.empty': 'Здесь писем нет.',
        'detail.emptyTitle': 'Выберите письмо',
        'detail.emptyText': 'Выберите письмо из очереди слева — здесь откроется полный текст и окно ответа.',
        'detail.signIn': 'Войти через Google',
        'detail.loading': 'Загрузка…',
        'detail.noBody': 'Текст не найден — откройте в Gmail.',
        'detail.attachments': '📎 Вложения: {list} — скачайте их в Gmail.',
        'detail.setNew': 'В очереди',
        'detail.setProgress': 'В работе',
        'detail.setDone': 'Отвечено',
        'detail.openGmail': 'Открыть в Gmail ↗',
        'note.label': 'Внутренняя заметка (хранится только на этом устройстве)',
        'note.ph': 'Например: отправить прайс-лист',
        'composer.title': 'Ответ',
        'composer.pickTemplate': 'Выбрать шаблон…',
        'composer.saveTemplate': 'Сохранить как шаблон',
        'composer.replyPh': 'Текст ответа…',
        'composer.markRead': 'Пометить прочитанным после отправки',
        'composer.send': 'Отправить ответ',
        'composer.sending': 'Отправляется…',
        'settings.title': 'Настройки',
        'settings.hint': 'Auto Mail работает с Gmail API прямо из браузера. Нужен Google OAuth Client ID — это не секретный ключ.',
        'settings.lang': 'Язык панели',
        'settings.clientId': 'Google OAuth Client ID',
        'settings.query': 'Поисковый запрос Gmail (какие письма попадают в очередь)',
        'settings.poll': 'Автопроверка (секунды)',
        'settings.notify': 'Уведомление о новом письме',
        'settings.signature': 'Подпись (добавляется к ответам, написанным вручную)',
        'settings.howto': 'Как получить Client ID? (5 шагов)',
        'settings.step1': 'Создайте новый проект на console.cloud.google.com.',
        'settings.step2': 'Включите Gmail API в «APIs & Services → Library».',
        'settings.step3': 'В «OAuth consent screen» выберите External и добавьте свой Gmail в Test users.',
        'settings.step4': 'Откройте «Credentials → Create credentials → OAuth client ID → Web application».',
        'settings.step5': 'Добавьте адрес этого сайта в Authorized JavaScript origins:',
        'settings.autoSection': 'Автоответ',
        'settings.autoEnable': 'Отправлять автоответ на новые письма',
        'settings.autoHint': 'Ответ уходит только на письма, пришедшие после включения, и один раз на диалог. Адреса вроде noreply@ пропускаются.',
        'settings.cardLang': 'Язык ответа (карточка для клиента)',
        'settings.brandName': 'Название бренда',
        'settings.brandColor': 'Цвет бренда',
        'settings.cardTitle': 'Заголовок ответа',
        'settings.cardText': 'Текст ответа',
        'settings.cardSteps': 'Дальнейшие шаги (по одному в строке)',
        'settings.cardUrl': 'Ссылка кнопки (необязательно)',
        'settings.cardButton': 'Надпись на кнопке',
        'settings.cardContact': 'Контактный e-mail (необязательно)',
        'settings.placeholders': 'В текстах можно использовать:',
        'settings.preview': 'Посмотреть карточку',
        'settings.loadDefaults': 'Подставить готовый текст на выбранном языке',
        'compose.title': 'Новое письмо',
        'compose.to': 'Кому',
        'compose.subject': 'Тема',
        'compose.body': 'Текст',
        'compose.bodyPh': 'Текст письма…',
        'compose.asCard': 'Отправить в виде красивой карточки',
        'preview.title': 'Пример карточки',
        'btn.cancel': 'Отмена',
        'btn.save': 'Сохранить',
        'btn.close': 'Закрыть',
        'btn.send': 'Отправить',
        'toast.theme': 'Тема: {value}',
        'toast.themeAuto': 'как в системе',
        'toast.themeLight': 'светлая',
        'toast.themeDark': 'тёмная',
        'toast.settingsSaved': 'Настройки сохранены.',
        'toast.statusUpdated': 'Статус обновлён.',
        'toast.templateSaved': 'Шаблон сохранён.',
        'toast.templateName': 'Название шаблона:',
        'toast.writeFirst': 'Сначала напишите текст ответа.',
        'toast.emptyReply': 'Ответ пустой.',
        'toast.emptyBody': 'Письмо пустое.',
        'toast.badAddress': 'Неверный адрес.',
        'toast.sent': 'Ответ отправлен ✓',
        'toast.mailSent': 'Письмо отправлено ✓',
        'toast.sendFailed': 'Не отправлено: {error}',
        'toast.newMails': 'В очередь добавлено писем: {count}.',
        'toast.autoReplied': 'Автоответ отправлен на письма: {count}.',
        'toast.signInFirst': 'Сначала войдите в Gmail.',
        'toast.defaultsLoaded': 'Готовый текст подставлен.',
        'confirm.signOut': 'Выйти из аккаунта Gmail?',
        'notify.one': 'В очереди 1 новое письмо.',
        'notify.many': 'Новых писем в очереди: {count}.'
      },
      card: {
        greeting: 'Здравствуйте, {name}!',
        ticket: 'Номер обращения',
        subject: 'Тема обращения',
        date: 'Дата получения',
        steps: 'Что будет дальше',
        autoNote: 'Это сообщение отправлено автоматически. Мы ответим в ближайшее время',
        autoNoteContact: ', срочные вопросы: {contact}',
        defaultTitle: 'Мы получили ваше обращение',
        defaultText: 'Ваше обращение зарегистрировано. Специалист рассмотрит его и ответит на этот адрес в ближайшее время.',
        defaultSteps: 'Специалист рассмотрит указанные детали.\nЕсли что-то нужно уточнить, мы свяжемся с вами.\nРешение придёт на этот адрес отдельным письмом.',
        defaultButton: 'Перейти на сайт',
        sampleName: 'Алексей Петров',
        sampleSubject: 'Вопрос по заказу'
      }
    }
  };

  var current = 'uz';

  function pack(lang) { return DICT[lang] || DICT.uz; }

  function apply(text, vars) {
    if (!vars) return text;
    return String(text).replace(/\{(\w+)\}/g, function (match, key) {
      return vars[key] !== undefined ? vars[key] : match;
    });
  }

  /** Panel matni. */
  function t(key, vars) {
    var dict = pack(current).ui;
    var value = dict[key];
    if (value === undefined) value = DICT.uz.ui[key];
    return apply(value === undefined ? key : value, vars);
  }

  /** Kartochka matni — o'z tilida. */
  function card(lang, key, vars) {
    var dict = pack(lang).card;
    var value = dict[key];
    if (value === undefined) value = DICT.en.card[key];
    return apply(value === undefined ? key : value, vars);
  }

  function dateParts(time, lang) {
    var date = new Date(time);
    var meta = pack(lang);
    return {
      d: date.getDate(),
      y: date.getFullYear(),
      month: meta.months[date.getMonth()],
      monthShort: meta.monthsShort[date.getMonth()]
    };
  }

  function longDate(time, lang) {
    return apply(pack(lang || current).longDate, dateParts(time, lang || current));
  }

  function shortDate(time, lang) {
    return apply(pack(lang || current).shortDate, dateParts(time, lang || current));
  }

  /** Matnni almashtiradi, lekin ichidagi elementlarni saqlab qoladi:
      <label data-i18n="…"><input></label> dagi input yo'qolmasligi kerak. */
  function setText(node, text) {
    if (!node.children.length) {
      node.textContent = text;
      return;
    }
    for (var i = 0; i < node.childNodes.length; i++) {
      if (node.childNodes[i].nodeType === 3) {
        node.childNodes[i].nodeValue = text;
        return;
      }
    }
    node.insertBefore(document.createTextNode(text), node.firstChild);
  }

  /** Sahifadagi barcha belgilangan matnlarni almashtiradi. */
  function translate(root) {
    (root || document).querySelectorAll('[data-i18n]').forEach(function (node) {
      setText(node, t(node.getAttribute('data-i18n')));
    });
    (root || document).querySelectorAll('[data-i18n-ph]').forEach(function (node) {
      node.placeholder = t(node.getAttribute('data-i18n-ph'));
    });
    (root || document).querySelectorAll('[data-i18n-title]').forEach(function (node) {
      var text = t(node.getAttribute('data-i18n-title'));
      node.title = text;
      if (node.hasAttribute('aria-label')) node.setAttribute('aria-label', text);
    });
    document.documentElement.lang = current;
  }

  global.I18n = {
    get lang() { return current; },
    setLang: function (lang) { current = DICT[lang] ? lang : 'uz'; return current; },
    list: function () {
      return Object.keys(DICT).map(function (code) { return { code: code, name: DICT[code].name }; });
    },
    t: t,
    card: card,
    longDate: longDate,
    shortDate: shortDate,
    translate: translate
  };
})(window);
