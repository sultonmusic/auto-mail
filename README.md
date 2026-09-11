# Auto Mail — Gmail navbat va admin panel

Gmail'ga kelgan xatlar **avtomatik navbatga olinadi**, admin panelda ko'riladi, statusi belgilanadi va shu yerdan javob yuboriladi.

Serversiz ishlaydi: butun mantiq brauzerda, GitHub Pages'da bepul turadi. PWA — telefonga oddiy ilova kabi o'rnatiladi.

## Nima qiladi

- **Deyarli real vaqtda.** Har **15 soniyada** (sozlanadi, eng kami 10) Gmail tekshiriladi. Tekshiruv Gmail'ning **History API**'si orqali ketadi — bu «oxirgi tekshiruvdan beri nima o'zgardi?» degan arzon so'rov, shuning uchun tez-tez so'rasa ham yuk bermaydi. Har 5 daqiqada bir marta to'liq qidiruv ham qilinadi, hech narsa e'tibordan qolmasin uchun. Oynaga qaytilganda va internet tiklanganda darhol yangilanadi.
- **AI tahlil.** Har bir xat mavzusi, matni va jo'natuvchisi bo'yicha baholanadi: **Muhim** (ish bilan bog'liq so'zlar, savol, javobsiz turgan yozishma) tepaga chiqadi, **Bekorchi** (`jddhddldjdkdld` kabi ma'nosiz yozuvlar, robot xabarlari) bosh ro'yxatdan olib, alohida bo'limga tushadi. Tashqi xizmat kerak emas — tahlil brauzerda bajariladi. Xat ochilganda AI qarori sababi bilan ko'rsatiladi.
- **Avtomatik javob.** Yangi xat kelishi bilan chiroyli HTML kartochka javob bo'lib ketadi: brend paneli, murojaat raqami, mavzu, sana, **javob berish muddati** va keyingi qadamlar. Javob mavzusining oxiriga murojaat raqami qo'shiladi: `Re: Hello [#7501809]`.
- **Yangi xat.** Panelning o'zidan yangi manzilga xat yozish (xohlasangiz o'sha kartochka ko'rinishida).
- **Doimiy kirish.** Bir marta ulangach, chiqmaguningizcha kirgan holicha qolasiz — brauzer yopilib ochilsa ham. Token muddati tugashiga 8 daqiqa qolganda **oldindan, jimgina** yangilanadi, shuning uchun kirish qayta so'ralmaydi.
- **Uch til.** Panel o'zbek, ingliz va rus tillarida — yuqoridagi 🌐 tanlagichdan almashadi. Mijozga ketadigan kartochka tili alohida sozlanadi (standart: ingliz).
- **Admin panel.** Chapda navbat ro'yxati (kim, mavzu, qisqacha matn, vaqt), o'ngda to'liq xat.
- **Statuslar.** Navbatda → Ishlanmoqda → Javob berilgan. Har bir bo'limda nechta xat borligi ko'rinib turadi.
- **Javob yozish.** To'g'ridan-to'g'ri panelda javob yoziladi va Gmail orqali **o'sha tred ichida** yuboriladi (`In-Reply-To` sarlavhasi bilan).
- **Shablonlar.** Tez-tez ishlatiladigan javoblarni saqlab qo'yish va bir bosishda qo'yish.
- **Imzo.** Har bir javob oxiriga avtomatik qo'shiladi.
- **Ichki izoh.** Har bir xatga o'zingiz uchun eslatma.
- **Hisob almashsa navbat ham almashadi.** Boshqa Gmail'ga kirilganda oldingi hisobning navbati avtomatik tozalanadi — begona xatlar aralashib ketmaydi. Sozlamalarda qo'lda **Navbatni tozalash** tugmasi ham bor.
- **Chap menyu — Gmail'dagidek.** Kiruvchi, Belgilangan, Muhim, Yuborilgan, Qoralamalar, Spam, Savat, Barcha xatlar; toifalar (Ijtimoiy tarmoqlar, Reklama, Yangilanishlar, Forumlar) va sizning yorliqlaringiz (Instagram, T-Bank, Uber…) — o'qilmaganlar soni bilan. Har qanday qutidagi xatni bir bosishda **navbatga qo'shish** mumkin.
- **Qidiruv va filtr**, qorong'i/yorug' mavzu, mobil ko'rinish, oflayn qobiq.

## Ishga tushirish

### 1. Google OAuth Client ID

Loyihaning Client ID'si kodga kiritilgan (`store.js` → `DEFAULT_CLIENT_ID`), shuning uchun odatda hech narsa qilish shart emas. OAuth client ID ochiq bo'lishi mo'ljallangan qiymat — maxfiysi client secret, u bu ilovada umuman ishlatilmaydi.

Boshqa Google loyihasiga o'tmoqchi bo'lsangiz, yangi ID ni ⚙ Sozlamalardan qo'ysangiz bo'ladi (u kodagisini bosib o'tadi). Noldan olish tartibi:

1. [console.cloud.google.com](https://console.cloud.google.com/projectcreate) da yangi loyiha oching.
2. **APIs & Services → Library** da `Gmail API` ni yoqing.
3. **OAuth consent screen** — turi `External`, so'ng **Test users** ro'yxatiga o'z Gmail manzilingizni qo'shing.
4. **Credentials → Create credentials → OAuth client ID → Web application**.
5. **Authorized JavaScript origins** ga sayt manzilini qo'shing:
   - `https://sultonmusic.github.io`
   - lokal sinov uchun: `http://localhost:8080`
6. Chiqqan `...apps.googleusercontent.com` qatorini nusxalang.

### 2. Saytni yoqish (GitHub Pages)

Repozitoriy **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.
Bir necha daqiqadan so'ng manzil: `https://sultonmusic.github.io/auto-mail/`

### Boshqa Gmail hisobini qo'shish

Yangi Client ID olish **shart emas** — bitta Client ID barcha hisoblar uchun ishlaydi. Ikki yo'l bor:

1. **Tez yo'l (tavsiya).** Google Cloud → **Google Auth Platform → Audience → Test users → Add users** ga yangi manzilni qo'shing (bir marta, 30 soniya). So'ng ilovada chapdagi menyu pastidagi **＋ Boshqa hisob** tugmasini bosing va hisobni tanlang.
2. **Butunlay ochiq qilish.** O'sha sahifadagi **Publish app** tugmasi bosilsa, test users ro'yxati kerak bo'lmaydi. Lekin ilova Google tekshiruvidan o'tmagani uchun kirishda «Google hasn't verified this app» ogohlantirishi chiqadi (**Advanced → Go to site** bosiladi) va foydalanuvchilar soni 100 tagacha cheklanadi.

`Testing` holatida kirish har 7 kunda yangilanishi kerak; `Publish app` qilinsa bu cheklov yo'qoladi.

### 3. Ilovani sozlash

Saytni oching → **Google bilan kirish** tugmasini bosing → hisobni tanlang va ruxsat bering.
(Boshqa Client ID ishlatmoqchi bo'lsangiz: ⚙ **Sozlamalar** → Client ID → **Saqlash**.)

Statusdagi «Ulangan» yozuvi paydo bo'lsa, navbat ishlay boshlaydi.

### Lokal sinov

```bash
python3 -m http.server 8080
# keyin http://localhost:8080 ni oching
```

## Sozlamalar

| Sozlama | Ma'nosi |
|---|---|
| **Client ID** | Google OAuth Web client identifikatori. Bo'sh qoldirilsa, kodagi standart ID ishlatiladi |
| **Gmail qidiruv sharti** | Qaysi xatlar navbatga olinishi. Standart: `in:inbox -from:me newer_than:7d`. Masalan faqat o'qilmaganlar: `is:unread in:inbox` |
| **Avtomatik tekshiruv** | Necha soniyada bir Gmail tekshirilsin (10–3600, standart 15) |
| **Bildirishnoma** | Yangi xat kelganda brauzer bildirishnomasi |
| **Imzo** | Qo'lda yozilgan javob oxiriga qo'shiladigan matn |
| **Panel tili** | Interfeys tili (uz / en / ru) |
| **Avtomatik javob** | Yangi xatga kartochkali javob avtomatik ketsin |
| **Javob tili** | Mijozga ketadigan kartochka tili. Standart — **rus** |
| **Jo'natuvchi nomi** | Gmail'da xat yonida ko'rinadigan nom (standart: brend nomi) |
| **Brend nomi / rangi** | Kartochka yuqorisidagi panel. Panel sarlavhasi ham shu nomni oladi (standart: **Founder Capline Group**) |
| **Logo havolasi** | Kartochkada brend nomi yonida turadigan rasm. Bo'sh qoldirilsa, repodagi `logo.png` ishlatiladi |
| **Javob berish muddati** | Kartochkadagi muddat qatori (standart: 7 ish kuni) |
| **Javob sarlavhasi / matni** | Kartochka mazmuni |
| **Keyingi qadamlar** | Raqamlangan ro'yxat — har bir qator alohida band |
| **Tugma havolasi / yozuvi** | Kartochkadagi chaqiruv tugmasi (ixtiyoriy) |
| **Bog'lanish e-pochtasi** | Kartochka pastidagi manzil (ixtiyoriy) |

Matnlarda o'rin egallovchilar ishlaydi: `{name}`/`{ism}`, `{subject}`/`{mavzu}`, `{ticket}`, `{date}`/`{sana}`.

Kartochka matn maydonlari **bo'sh** qoldirilsa, tanlangan javob tilidagi tayyor matn ishlatiladi — «Tanlangan tildagi tayyor matnni qo'yish» tugmasi uni maydonlarga chiqaradi.

### Kirish nega vaqti-vaqti bilan so'raladi

Google brauzerga **1 soatlik** kalit beradi va uni yangilash uchun brauzerda Google sessiyasi ochiq bo'lishi kerak. Android Chrome uchinchi tomon cookie'larini cheklaganda bu yangilanish bloklanib qoladi — shunda ilova qayta kirishni so'raydi.

Buni butunlay yo'q qilish statik saytda mumkin emas: doimiy kalitni saqlash uchun server kerak, u esa o'g'irlansa butun pochta ochiladi. Shuning uchun ikki narsa qilingan:

- Kalit muddati tugashiga 8 daqiqa qolganda **jimgina yangilanadi**, jimgina yangilash ishlamasa yana ikki marta urinib ko'riladi.
- Baribir uzilsa, ro'yxat tepasida **«Kirish»** tugmasi chiqadi — bir bosish kifoya, parol so'ralmaydi (Google hisobingiz brauzerda ochiq bo'lsa, faqat hisobni tasdiqlaysiz).

Eng muhimi: **avtomatik javob bunga bog'liq emas.** U Google serverida (Apps Script) ishlaydi, shuning uchun ilovaga kirmagan bo'lsangiz ham mijozlar javob oladi. Ilovaga kirish faqat navbatni ko'rish va qo'lda javob yozish uchun kerak.

### Tez yoqish tugmalari

Yuqoridagi panelda ikkita tugma bor:

- **🤖 / 💤** — avtomatik javobni yoqadi va o'chiradi. Yoqilganda oxirgi **10 daqiqada** kelgan xatlar ham qamrab olinadi, shunda hozirgina tushgan xat javobsiz qolmaydi.
- **🔔 / 🔕** — qurilma bildirishnomasi. Birinchi bosganda brauzer ruxsat so'raydi. Bildirishnoma service worker orqali chiqariladi (Android'da faqat shu yo'l ishlaydi) va bosilganda ilova ochiladi.

### Nega avtomatik javob kelmasligi mumkin

Xatni ochsangiz, sarlavha ostida holat yozib turadi: **🤖 Avto-javob yuborilgan**, **🤖 navbatda** yoki nega to'xtagani (**o'chiq**, **bekorchi**, **robot manzil**, **o'z manzilingiz**, **yoqilgandan oldin kelgan**). Ya'ni taxmin qilib o'tirish shart emas.

1. **O'chiq turibdi.** Ro'yxat tepasida sariq ogohlantirish chiqadi — **Yoqish** bosiladi (yoki yuqoridagi 🤖 tugmasi).
2. **Xat o'zingizdan.** O'zingizga yozilgan xat na navbatga tushadi (`-from:me`), na javob oladi — cheksiz halqa bo'lmasligi uchun.
3. **Robot manzil yoki bekorchi.** `noreply@` kabi manzillar va ma'nosiz matnlar chetlab o'tiladi.
4. **Xat yoqishdan oldin kelgan.** Yoqilganda oxirgi 10 daqiqa qamrab olinadi, undan eskisiga javob ketmaydi.

Istalgan xatga **shu zahoti** kartochkali javob yuborish uchun xatni ochib **🤖 Kartochka bilan javob berish** tugmasini bosing — u cheklovlarga bog'liq emas.

### Avtomatik javob qanday himoyalangan

Xatolik bilan yuzlab xat ketib qolmasligi uchun bir nechta cheklov qo'yilgan:

- Javob **faqat sozlama yoqilgandan keyin** kelgan xatlarga boradi — eski navbatga tegmaydi.
- Har bir suhbatga **bir marta** (`autoReplied` belgisi bilan).
- `noreply@`, `no-reply@`, `mailer-daemon`, `notifications@` kabi robot manzillar chetlab o'tiladi.
- O'z manzilingizga javob yozilmaydi.
- Bitta tekshiruvda ko'pi bilan **5 ta** javob yuboriladi.
- **Bekorchi** deb baholangan xatlarga javob yozilmaydi.
- Javob ketgan xat avtomatik **«Ishlanmoqda»** holatiga o'tadi — odam baribir ko'rib chiqadi.

## Fayllar

| Fayl | Vazifasi |
|---|---|
| `index.html` | Panel tuzilishi |
| `style.css` | Dizayn, mavzular, mobil ko'rinish |
| `store.js` | Navbat, statuslar, izoh va shablonlarni `localStorage` da saqlash |
| `i18n.js` | Panel va kartochka tarjimalari (uz / en / ru), sana formatlari |
| `analyzer.js` | Xatlarni baholash: muhim / odatiy / bekorchi (brauzerda, tashqi xizmatsiz) |
| `template.js` | Avtomatik javob kartochkasi (email uchun jadvalli HTML) |
| `gmail.js` | Google avtorizatsiyasi va Gmail API (o'qish, javob yuborish, belgilash) |
| `app.js` | Panel mantiqi: filtr, qidiruv, sinxronizatsiya, javob yuborish |
| `service-worker.js` | Oflayn qobiq (Gmail so'rovlari keshlanmaydi) |

## Maxfiylik va xavfsizlik

- Xat matnlari **Gmail'da qoladi** — bu ilova faqat ish jarayonini (status, izoh, shablon) o'z qurilmangizdagi `localStorage` da saqlaydi.
- Kirish tokeni brauzeringizning `localStorage` ida saqlanadi (shuning uchun qayta kirish so'ralmaydi) va hech qayerga yuborilmaydi. **Chiqish** bosilganda o'chiriladi va Google'da bekor qilinadi. Umumiy kompyuterda ishlatmang.
- HTML ko'rinishidagi xatlar `sandbox` qilingan `iframe` ichida ochiladi — ulardagi skriptlar ishlamaydi.
- Ruxsatlar: `gmail.modify` (o'qish va belgilash), `gmail.send` (javob yuborish).

## 24/7 avtomatik javob (Google Apps Script)

Sayt ochiq bo'lmasa, brauzer tekshira olmaydi — bu statik ilovaning tabiiy chegarasi. Shu sababli `apps-script/Code.gs` faylida **Google serverida** ishlaydigan skript bor: telefon o'chiq bo'lsa ham har daqiqada pochtani tekshiradi va xuddi shu kartochka bilan javob yuboradi.

### O'rnatish (bir marta, ~3 daqiqa)

1. [script.google.com](https://script.google.com) → **New project**.
2. `apps-script/Code.gs` fayl mazmunini to'liq nusxalab, tahrirlagichga qo'ying (eskisini o'chirib).
3. Chapdagi **Services** yonidagi **+** → ro'yxatdan **Gmail API** → **Add**.
4. Yuqoridagi funksiya ro'yxatidan **`setup`** ni tanlang → **Run**.
5. Google ruxsat so'raydi: hisobni tanlang → **Advanced** → **Go to … (unsafe)** → **Allow**.
   *(«unsafe» yozuvi skript Google tekshiruvidan o'tmagani uchun — bu sizning o'z skriptingiz.)*

Tayyor. Endi har daqiqada tekshiriladi — sayt ochiq bo'lmasa ham.

Kodni telefonda nusxalash uchun qulay havola:
[raw.githubusercontent.com/sultonmusic/auto-mail/main/apps-script/Code.gs](https://raw.githubusercontent.com/sultonmusic/auto-mail/main/apps-script/Code.gs)

**Funksiyalar:**

| Funksiya | Vazifasi |
|---|---|
| `setup` | Har daqiqalik tekshiruvni yoqadi (bir marta bosiladi) |
| `testCard` | O'zingizga bitta sinov kartochkasini yuboradi — ko'rinishini tekshirish uchun |
| `autoReply` | Tekshiruvni qo'lda bir marta ishga tushiradi |
| `stop` | Avtomatik javobni butunlay to'xtatadi |

### Sozlash — qayta nusxalash shart emas

Skript matnlarni `apps-script/config.json` dan o'qiydi va **soatiga bir marta** yangilab turadi. Ya'ni kartochka so'zlarini, brend nomini, rangni, muddatni yoki qidiruv shartini o'zgartirish uchun Apps Script'dagi kodni qayta qo'yish kerak emas — shu faylni repoda tahrirlasangiz yetadi.

Darhol ko'rish uchun skriptdagi **`refreshConfig`** funksiyasini ishga tushiring (bir soat kutmaysiz).

| Nima o'zgardi | Nima qilish kerak |
|---|---|
| Matn, brend, rang, logo, muddat, qidiruv sharti | `config.json` ni tahrirlang — skript o'zi oladi |
| Skriptning ishlash mantiqi (kamdan-kam) | `Code.gs` ni qayta nusxalang |

Faqat shu skript uchun amal qiladigan sozlama kerak bo'lsa, `Code.gs` boshidagi `LOCAL` obyektiga yozing — u har doim ustun turadi:

```js
var LOCAL = { senderName: 'Boshqa nom', maxPerRun: 3 };
```

Internet bo'lmasa yoki fayl ochilmasa, skript `Code.gs` ichidagi standart qiymatlar bilan ishlayveradi — hech narsa to'xtamaydi. Mustaqil ishlashini xohlasangiz, `REMOTE_CONFIG_URL` ni `''` qiling.

⚠️ **`query` ni ehtiyot bo'lib o'zgartiring.** Standart holatda `newer_than:1h` — faqat oxirgi bir soatda kelgan xatlar. Uni `newer_than:2d` qilsangiz, birinchi yugurishdayoq pochtangizdagi ikki kunlik xatlarga javob ketadi (ko'pi bilan `maxPerRun` tasiga). Sinashdan oldin `maxPerRun` ni 1 ga tushirib ko'rish ham foydali.

### Ikki marta javob ketmasligi

Skript javob bergan suhbatga Gmail'da **`AutoReplied`** yorlig'ini qo'yadi va boshqa tegmaydi. Saytdagi ilova ham shu yorliqni ko'radi va bunday xatga javob yozmaydi — xat ochilganda «🤖 Apps Script javob bergan» deb turadi.

Gmail'da `AutoReplied` yorlig'i paydo bo'lishi bilan ilova avtomatik javobni **butunlay to'xtatadi** — 🤖 tugmasi «Apps Script javob bermoqda» holatiga o'tadi va xat ochilganda ham shu yozuv turadi. Qo'lda **🤖 Kartochka bilan javob berish** tugmasi ishlaydi.

## Cheklovlar

- Panel ochiq turganda ishlaydi — yopiq brauzerda fon rejimida tekshirmaydi. **24/7 kerak bo'lsa — yuqoridagi Apps Script bo'limiga qarang.**
- Ilovalarni (attachment) ko'rsatadi, lekin yuklab olish Gmail orqali.
- Avtomatik javob ham panel ochiq turganda ishlaydi — telefon qulflangan bo'lsa, ilova ochilgach yuboriladi. Apps Script bu chegarani yo'q qiladi.
- Google OAuth consent screen `Testing` holatida bo'lsa, token 7 kunda bir yangilanadi — `Publish app` qilinsa bu cheklov yo'qoladi.
