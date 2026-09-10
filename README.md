# Auto Mail — Gmail navbat va admin panel

Gmail'ga kelgan xatlar **avtomatik navbatga olinadi**, admin panelda ko'riladi, statusi belgilanadi va shu yerdan javob yuboriladi.

Serversiz ishlaydi: butun mantiq brauzerda, GitHub Pages'da bepul turadi. PWA — telefonga oddiy ilova kabi o'rnatiladi.

## Nima qiladi

- **Deyarli real vaqtda.** Har **20 soniyada** (sozlanadi, eng kami 10) Gmail tekshiriladi. Tekshiruv Gmail'ning **History API**'si orqali ketadi — bu «oxirgi tekshiruvdan beri nima o'zgardi?» degan arzon so'rov, shuning uchun tez-tez so'rasa ham yuk bermaydi. Har 5 daqiqada bir marta to'liq qidiruv ham qilinadi, hech narsa e'tibordan qolmasin uchun. Oynaga qaytilganda va internet tiklanganda darhol yangilanadi.
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
| **Avtomatik tekshiruv** | Necha soniyada bir Gmail tekshirilsin (10–3600, standart 20) |
| **Bildirishnoma** | Yangi xat kelganda brauzer bildirishnomasi |
| **Imzo** | Qo'lda yozilgan javob oxiriga qo'shiladigan matn |
| **Panel tili** | Interfeys tili (uz / en / ru) |
| **Avtomatik javob** | Yangi xatga kartochkali javob avtomatik ketsin |
| **Javob tili** | Mijozga ketadigan kartochka tili. Standart — **ingliz** |
| **Brend nomi / rangi** | Kartochka yuqorisidagi panel. Panel sarlavhasi ham shu nomni oladi (standart: **Founder Capline Group**) |
| **Logo havolasi** | Kartochkada brend nomi yonida turadigan rasm. Bo'sh qoldirilsa, repodagi `logo.png` ishlatiladi |
| **Javob berish muddati** | Kartochkadagi muddat qatori (standart: 7 ish kuni) |
| **Javob sarlavhasi / matni** | Kartochka mazmuni |
| **Keyingi qadamlar** | Raqamlangan ro'yxat — har bir qator alohida band |
| **Tugma havolasi / yozuvi** | Kartochkadagi chaqiruv tugmasi (ixtiyoriy) |
| **Bog'lanish e-pochtasi** | Kartochka pastidagi manzil (ixtiyoriy) |

Matnlarda o'rin egallovchilar ishlaydi: `{name}`/`{ism}`, `{subject}`/`{mavzu}`, `{ticket}`, `{date}`/`{sana}`.

Kartochka matn maydonlari **bo'sh** qoldirilsa, tanlangan javob tilidagi tayyor matn ishlatiladi — «Tanlangan tildagi tayyor matnni qo'yish» tugmasi uni maydonlarga chiqaradi.

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

## Cheklovlar

- Panel ochiq turganda ishlaydi — yopiq brauzerda fon rejimida tekshirmaydi (buning uchun server yoki Google Apps Script kerak bo'ladi).
- Ilovalarni (attachment) ko'rsatadi, lekin yuklab olish Gmail orqali.
- Avtomatik javob ham panel ochiq turganda ishlaydi — telefon qulflangan bo'lsa, ilova ochilgach yuboriladi.
- Google OAuth consent screen `Testing` holatida bo'lsa, token 7 kunda bir yangilanadi — `Publish app` qilinsa bu cheklov yo'qoladi.
