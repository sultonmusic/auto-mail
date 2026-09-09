# Auto Mail — Gmail navbat va admin panel

Gmail'ga kelgan xatlar **avtomatik navbatga olinadi**, admin panelda ko'riladi, statusi belgilanadi va shu yerdan javob yuboriladi.

Serversiz ishlaydi: butun mantiq brauzerda, GitHub Pages'da bepul turadi. PWA — telefonga oddiy ilova kabi o'rnatiladi.

## Nima qiladi

- **Avtomatik navbat.** Belgilangan oraliqda (standart 60 soniya) Gmail tekshiriladi, yangi xat topilsa navbatga qo'shiladi va bildirishnoma chiqadi.
- **Avtomatik javob.** Yangi xat kelishi bilan chiroyli HTML kartochka javob bo'lib ketadi: brend paneli, murojaat raqami, mavzu, sana, keyingi qadamlar va tugma.
- **Yangi xat.** Panelning o'zidan yangi manzilga xat yozish (xohlasangiz o'sha kartochka ko'rinishida).
- **Doimiy kirish.** Bir marta ulangach, chiqmaguningizcha kirgan holicha qolasiz — brauzer yopilib ochilsa ham.
- **Admin panel.** Chapda navbat ro'yxati (kim, mavzu, qisqacha matn, vaqt), o'ngda to'liq xat.
- **Statuslar.** Navbatda → Ishlanmoqda → Javob berilgan. Har bir bo'limda nechta xat borligi ko'rinib turadi.
- **Javob yozish.** To'g'ridan-to'g'ri panelda javob yoziladi va Gmail orqali **o'sha tred ichida** yuboriladi (`In-Reply-To` sarlavhasi bilan).
- **Shablonlar.** Tez-tez ishlatiladigan javoblarni saqlab qo'yish va bir bosishda qo'yish.
- **Imzo.** Har bir javob oxiriga avtomatik qo'shiladi.
- **Ichki izoh.** Har bir xatga o'zingiz uchun eslatma.
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
| **Avtomatik tekshiruv** | Necha soniyada bir Gmail tekshirilsin (15–3600) |
| **Bildirishnoma** | Yangi xat kelganda brauzer bildirishnomasi |
| **Imzo** | Qo'lda yozilgan javob oxiriga qo'shiladigan matn |
| **Avtomatik javob** | Yangi xatga kartochkali javob avtomatik ketsin |
| **Brend nomi / rangi** | Kartochka yuqorisidagi panel |
| **Javob sarlavhasi / matni** | Kartochka mazmuni |
| **Keyingi qadamlar** | Raqamlangan ro'yxat — har bir qator alohida band |
| **Tugma havolasi / yozuvi** | Kartochkadagi chaqiruv tugmasi (ixtiyoriy) |
| **Bog'lanish e-pochtasi** | Kartochka pastidagi manzil (ixtiyoriy) |

Matnlarda o'rin egallovchilar ishlaydi: `{ism}`, `{mavzu}`, `{ticket}`, `{sana}`.

### Avtomatik javob qanday himoyalangan

Xatolik bilan yuzlab xat ketib qolmasligi uchun bir nechta cheklov qo'yilgan:

- Javob **faqat sozlama yoqilgandan keyin** kelgan xatlarga boradi — eski navbatga tegmaydi.
- Har bir suhbatga **bir marta** (`autoReplied` belgisi bilan).
- `noreply@`, `no-reply@`, `mailer-daemon`, `notifications@` kabi robot manzillar chetlab o'tiladi.
- O'z manzilingizga javob yozilmaydi.
- Bitta tekshiruvda ko'pi bilan **5 ta** javob yuboriladi.
- Javob ketgan xat avtomatik **«Ishlanmoqda»** holatiga o'tadi — odam baribir ko'rib chiqadi.

## Fayllar

| Fayl | Vazifasi |
|---|---|
| `index.html` | Panel tuzilishi |
| `style.css` | Dizayn, mavzular, mobil ko'rinish |
| `store.js` | Navbat, statuslar, izoh va shablonlarni `localStorage` da saqlash |
| `template.js` | Avtomatik javob kartochkasi (email uchun jadvalli HTML) va sana formatlari |
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
