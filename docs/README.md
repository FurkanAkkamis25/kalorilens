
---

# KaloriLens — Tek Dosya Proje Kılavuzu (MVP)

> **Amaç:** 2 ayda; fotoğraftan/elle yemek ekleme, etiket OCR, kişiye özel kalori & makro hedefi, kan tahlili bilgilendirme, spor programı, sağlıklı tarifler, alışkanlık/rozet ve ilaç/takviye hatırlatıcıları olan **mobil** uygulama.
> **Uyarı:** Tıbbi içerikler **bilgilendirme** amaçlıdır; her yerde “**doktorunuza danışın**” uyarısı gösterilir.

---

## İçindekiler

* [Ürün Özeti](#ürün-özeti)
* [Teknoloji Yığını](#teknoloji-yığını)
* [İş Dağılımı (4 Kişi)](#iş-dağılımı-4-kişi)
* [Repo Yapısı](#repo-yapısı)
* [Kurulum ve Çalıştırma](#kurulum-ve-çalıştırma)
* [Veri Modeli (Özet)](#veri-modeli-özet)
* [API Sözleşmesi (MVP)](#api-sözleşmesi-mvp)
* [İş Kuralları](#iş-kuralları)
* [Sprint Planı (8 Hafta)](#sprint-planı-8-hafta)
* [Katkı & PR Kuralları](#katkı--pr-kuralları)
* [Terimler](#terimler)
* [Güvenlik & Uyum](#güvenlik--uyum)
* [Maliyet (Öğrenci Modu)](#maliyet-öğrenci-modu)
* [SSS](#sss)

---

## Ürün Özeti

**Kullanıcı Akışları**

* **Yemek Ekle:**

  * **Fotoğraf →** Gıda tanıma (hazır model) + porsiyon seçimi
  * **Etiket →** OCR ile besin değerleri → porsiyon
  * **Elle →** gıda sözlüğü + gram/porsiyon
* **Günlük Hedef:** BMR (Mifflin–St Jeor) + aktivite + hedef (± kalori, makro dağılım)
* **Kan Tahlili:** Değer girme → **kural tabanlı** bilgilendirme (disclaimer’lı)
* **Spor Programı:** Ev/salon, seviye, ekipman → şablondan kişisel plan
* **Tarifler:** Kalori/öğün/tag filtreli kartlar
* **Alışkanlık/Rozet:** Duolingo-benzeri seri (streak) ve rozetler
* **Hatırlatıcılar:** İlaç/takviye/su/spor — local/push bildirim

> **MVP dışı:** Diyetisyen sohbeti, gelişmiş öneri motoru (v2).

---

## Teknoloji Yığını

* **Mobil:** React Native + Expo
  UI: NativeWind (Tailwind RN) · Navigasyon: react-navigation
* **Backend (API):** Node.js + NestJS (veya Express + TypeScript)
* **Auth:** Firebase Auth
* **Depolama (resim):** Firebase Storage
* **Bildirim:** Expo Notifications (local) + Firebase Cloud Messaging (push)
* **Veritabanları (2 şartı):**

  * **PostgreSQL** (ilişkisel: users, goals, exercises, recipes, reminders, badges)
  * **MongoDB** (esnek JSON: meal_logs, ocr_logs, labs_raw, streaks, advice_logs)
* **Hazır AI:**

  * **OCR:** Google ML Kit (on-device), fallback Tesseract (backend)
  * **Gıda tanıma:** Food-101 TFLite (mobil) **veya** Roboflow Hosted API
* **Geliştirme Ortamı (opsiyonel):** Docker Compose (Postgres + Mongo + paneller)

---

## İş Dağılımı (4 Kişi)

**1) Takım Lideri / Backend (Full-stack odaklı)**

* Mimari, ORM (Prisma/TypeORM), Postgres+Mongo şemaları
* REST API, Firebase token doğrulama, Storage & FCM entegrasyonu
* Docker Compose, CI/CD (GitHub Actions), deploy (Render/Railway)

**2) AI / ML Entegrasyon**

* ML Kit OCR + Tesseract fallback
* Food-101 TFLite/Roboflow entegrasyonu, JSON çıktı standardı
* Kan tahlili **kural motoru** (JSON) → backend uyarlaması

**3) Mobil (RN + Expo)**

* Ekranlar: Auth, Günlük, Yemek Ekle (kamera/galeri/etiket), Spor, Tarif, Profil
* Expo Notifications, FCM, Firebase Auth/Storage, API client (axios)

**4) UI/UX & İçerik / Test**

* Figma mockup, tema/ikonografi, microcopy
* Tarif/rozet içerikleri (JSON), test checklist, mağaza/README metinleri

> **Ritüel:** Haftalık mini demo (Cuma) · Board: Backlog → In Progress → Review → Done

---

## Repo Yapısı

```txt
kalorilens/
├─ apps/
│  ├─ api/                      # Node.js (NestJS/Express) REST API
│  │  ├─ src/
│  │  │  ├─ main.ts             # bootstrap
│  │  │  ├─ config/             # env, validation
│  │  │  ├─ common/             # guards, interceptors, errors, utils
│  │  │  ├─ db/
│  │  │  │  ├─ postgres/        # Prisma/TypeORM entities + migrations
│  │  │  │  └─ mongo/           # Mongoose şemaları (meal_logs, streaks…)
│  │  │  ├─ modules/
│  │  │  │  ├─ auth/            # Firebase token verify
│  │  │  │  ├─ users/
│  │  │  │  ├─ goals/
│  │  │  │  ├─ meals/           # manuel & günlük özet
│  │  │  │  ├─ ocr/             # /ocr/label (etiket OCR)
│  │  │  │  ├─ food/            # /food/classify (foto’dan yemek)
│  │  │  │  ├─ labs/            # /labs + /labs/advice (kural motoru)
│  │  │  │  ├─ exercises/       # şablonlar & atama
│  │  │  │  ├─ recipes/
│  │  │  │  ├─ reminders/       # ilaç/alışkanlık bildirim planları
│  │  │  │  └─ badges/          # rozet & streak
│  │  │  └─ jobs/               # cron: günlük özet, rozet/seri kontrolü
│  │  ├─ test/
│  │  ├─ package.json
│  │  └─ Dockerfile             # (opsiyonel) API konteyneri
│  │
│  └─ mobile/                   # React Native + Expo
│     ├─ app/                   # expo-router (veya src/)
│     │  ├─ (tabs)/             # home, add, program, recipes, profile
│     │  ├─ auth/  meals/  labs/  exercises/  reminders/  components/
│     ├─ lib/                   # api.ts, notifications.ts, storage.ts, image.ts
│     ├─ assets/  app.json  package.json  README.md
│
├─ packages/
│  ├─ shared-types/             # DTO, response tipleri, enums
│  └─ shared-config/            # eslint, prettier, tsconfig base
│
├─ infra/
│  ├─ docker-compose.yml        # postgres, mongo, pgadmin, mongo-express
│  ├─ env/                      # api.example.env, local.example.env
│  └─ seeds/                    # gıda sözlüğü CSV + import script
│
├─ .github/
│  ├─ ISSUE_TEMPLATE.md  PULL_REQUEST_TEMPLATE.md  workflows/ci.yml  CODEOWNERS
├─ README.md  .editorconfig  package.json  LICENSE
```

**Ne, nasıl kullanılır?**

* `apps/api` → Tüm REST iş mantığı + DB katmanları
* `apps/mobile` → Ekranlar/akışlar, kamera/galeri/OCR çağrıları, bildirim
* `packages/shared-types` → Ortak tipler (mobil & api aynı tiplerle derlenir)
* `infra` → Docker Compose ile DB’leri/panelleri tek komutla aç
* `.github/workflows/ci.yml` → Lint, typecheck, (API test), (EAS build opsiyonel)

---

## Kurulum ve Çalıştırma

**Önkoşullar:** Node 18+, npm, Android Studio/Xcode, (opsiyonel) Docker Desktop

```bash
git clone <repo>
cd kalorilens
npm i
cp infra/env/api.example.env infra/env/api.local.env
```

**Veritabanları (opsiyonel Docker):**

```bash
npm run dev:up
# postgres(5432), mongo(27017), pgadmin(5050), mongo-express(8081)
```

**API (lokal):**

```bash
npm --prefix apps/api run start:dev
# http://localhost:3000/health
```

**Mobil (Expo):**

```bash
npm --prefix apps/mobile run start
# Expo dev tools → Android/iOS cihaz/emu
```

**Root Script Önerisi (package.json):**

```json
{
  "scripts": {
    "dev:up": "docker compose -f infra/docker-compose.yml up -d",
    "dev:down": "docker compose -f infra/docker-compose.yml down",
    "dev:api": "npm --prefix apps/api run start:dev",
    "dev:mobile": "npm --prefix apps/mobile run start",
    "lint": "eslint .",
    "typecheck": "tsc -b"
  },
  "workspaces": ["apps/*","packages/*"]
}
```

**API .env (örnek):**

```
PORT=3000
PG_HOST=postgres
PG_PORT=5432
PG_DB=kalorilens
PG_USER=kalorilens
PG_PASSWORD=devpass
MONGO_URI=mongodb://mongo:27017/kalorilens
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
```

---

## Veri Modeli (Özet)

**PostgreSQL**

* `users(id, email, display_name, age, height_cm, weight_kg, activity_level, goal_type, created_at)`
* `goals(user_id, daily_kcal, carb_pct, protein_pct, fat_pct, updated_at)`
* `exercise_programs(id, title, level, place, days_per_week)`
* `program_days(program_id, day_index, items_json)`
* `recipes(id, title, kcal, tags, items_json)`
* `reminders(id, user_id, type, title, times_json, days_json, enabled)`
* `badges(id, code, title, description)` · `user_badges(user_id, badge_id, earned_at)`
* `audit_logs(id, user_id, action, meta_json, at)`

**MongoDB**

* `meal_logs{ userId, date, source, photoUrl, label, grams, macros, confidence, ocrRaw }`
* `labs_raw{ userId, panel, value, unit, at }` · `advice_logs{ userId, rules, at }`
* `streaks{ userId, days, lastCheck }` · `ocr_logs{ userId, imageUrl, parsedFields, rawText, at }`

---

## API Sözleşmesi (MVP)

> Tüm isteklerde `Authorization: Bearer <firebase_id_token>`.

* **Sağlık:** `GET /health` → `{ "status": "ok" }`
* **Kullanıcı:** `GET /me`, `GET /users/:id`, `PUT /users/:id`
* **Hedef:** `POST /goals/recalc` → `{"dailyCalories":2600,"macroSplit":{"carbPct":50,"proteinPct":25,"fatPct":25}}`
* **Yemek:** `POST /meals`, `POST /meals/photo`, `GET /meals/daily?date=YYYY-MM-DD`, `DELETE /meals/:id`
* **OCR:** `POST /ocr/label` → `{ per:"100g", fields:{kcal,protein,carb,fat}, raw:{text:"..."} }`
* **Gıda Sınıflandırma:** `POST /food/classify` → `{ label, confidence, suggestedMacrosPer100g }`
* **Kan Tahlili:** `POST /labs`, `GET /labs`, `GET /labs/advice`
* **Spor:** `GET /exercises/plans`, `POST /exercises/assign`
* **Tarif:** `GET /recipes`, `GET /recipes/:id`
* **Hatırlatıcı:** `POST /reminders`, `GET /reminders`, `DELETE /reminders/:id`
* **Rozet/Seri:** `GET /badges`, `GET /streaks`

---

## İş Kuralları

**Günlük Kalori Hedefi**

* BMR (Mifflin–St Jeor) + aktivite = maintenance
* Hedefe göre ±300–500 kcal (kilo alma/verme)
* Makro default: **C %50 / P %25 / Y %25** (profilde değişebilir)

**Gıda Tanıma**

* Model `label + confidence` döndürür; `< 0.6` ise kullanıcı düzeltmesi istenir
* Porsiyon: ½ / 1 / 1½ / 2 veya gram

**Etiket OCR**

* ML Kit alanları okur; parser “per 100 g/serving” ayrımını bulur; kullanıcı porsiyon seçer
* Ham OCR & görsel URL’si **Mongo**’ya kaydedilir

**Kan Tahlili**

* JSON kural seti: `if vitamin_d_25oh < 20 → "Düşük… Doktora danışın."`
* Her çıktıda **disclaimer** gösterilir

**Rozet/Seri**

* Cron her gece rozet koşullarını ve streak’i günceller; gerekirse push gönderir

---

## Sprint Planı (8 Hafta)

1. **H1:** Repo/infra, DB şemaları, Figma temel
2. **H2:** Auth + Profil + Hedef hesap (API/mobil)
3. **H3:** Manuel yemek + günlük özet
4. **H4:** Kamera/galeri + Etiket OCR + parser
5. **H5:** Fotoğraftan gıda sınıflandırma + porsiyon
6. **H6:** Spor programı + tarif modülü
7. **H7:** Kan tahlili + kural motoru; hatırlatıcı & rozet/seri
8. **H8:** Test/performans (görsel sıkıştırma), Sentry, deploy

---

## Katkı & PR Kuralları

**Branch modeli:** `main` (stabil), `dev` (entegrasyon), `feature/<kısa-ad>` (kişisel)
**PR içeriği:** Amaç · Ekran görüntüsü/video (UI ise) · Test adımları · Checklist (lint/type/test/docs)
**CODEOWNERS (öneri):**

```
/apps/api/                 @lead-backend
/apps/api/src/modules/ocr/ @ai-dev
/apps/api/src/modules/food/@ai-dev
/apps/mobile/              @mobile-dev
/docs/                     @uiux-test
```

---

## Terimler

**BMR:** Bazal metabolizma hızı · **Makro:** Karb/Protein/Yağ · **OCR:** Etiket metni okuma
**Food-101:** Yemek sınıflandırma veri seti (TFLite modeli var) · **Streak:** Üst üste gün
**Badge:** Rozet · **FCM:** Firebase push · **MVP:** Minimum uygulanabilir ürün

---

## Güvenlik & Uyum

* Tüm ağ trafiği **HTTPS**
* Tıbbi kartlarda **“Tıbbi tavsiye değildir; doktorunuza danışın.”**
* Hesap sil → ilişkili verilerin silinmesi (GDPR-benzeri)
* Hassas alanlarda at-rest encryption tercihi

---

## Maliyet (Öğrenci Modu)

* **MongoDB Atlas M0:** 0$ · **Neon/Railway Postgres Free:** 0$
* **Render/Railway API Free:** 0$ · **Firebase Auth/Storage/FCM:** Ücretsiz kotalar
* **Domain (opsiyon):** ~10–20$/yıl

> MVP’de aylık **0–5$** aralığında yürür.

---

## SSS

**Neden iki veritabanı?**
Postgres (rapor/ilişki) + Mongo (OCR/analiz gibi esnek yapılar) → hızlı ve temiz.

**Docker şart mı?**
Hayır. Cloud DB URI’larıyla Docker’sız çalışırsınız.

**Model eğitimi var mı?**
MVP’de **yok**. Hazır modeller/SDK’lar kullanılıyor.

---

> Sorun/öneri için Issue açın. PR’larda küçük, odaklı değişiklikler tercih edilir.
