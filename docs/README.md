# 🥑 KaloriLens — Akıllı Sağlık Asistanı (MVP)

> **⚠️ YASAL UYARI:** Bu uygulama tıbbi tavsiye vermez veya tanı koymaz. Sunulan veriler ve analizler sadece bilgilendirme amaçlıdır. Kullanıcı arayüzünde her zaman "Doktorunuza danışın" uyarısı gösterilir.

## 🎯 Proje Amacı
2 ay içinde; fotoğraftan yemek tanıma, kişiye özel kalori takibi, kan tahlili yorumlama ve spor programı sunan yapay zeka destekli, hibrit veritabanı mimarisine sahip bir mobil yaşam koçu geliştirmek. Proje, **Cloud-First** (Önce Bulut) yaklaşımıyla ve App Store/Play Store standartlarına uygun olarak tasarlanmıştır.

---

## 📋 İçindekiler
1. [Ürün Özeti](#-ürün-özeti)
2. [Teknoloji Yığını](#-teknoloji-yığını)
3. [Altyapı Mimarisi](#-altyapı-mimarisi-dev-vs-prod)
4. [Proje Ekibi](#-proje-ekibi-ve-görevler)
5. [Klasör Yapısı](#-klasör-yapısı)
6. [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
7. [Veri Modeli](#-veri-modeli)
8. [Sprint Planı](#-sprint-planı)

---

## 📱 Ürün Özeti

* **📸 AI Destekli Yemek Takibi:** Fotoğraf çekerek veya barkod okutarak yemeği tanıma, otomatik kalori ve makro hesabı.
* **📊 Kişisel Hedef:** Kullanıcının BMR (Bazal Metabolizma) ve aktivite seviyesine göre dinamik hedef belirleme (Kilo Alma/Verme).
* **🩸 Laboratuvar Asistanı:** Kan tahlili sonuçlarını yorumlayıp beslenme önerisi sunan kural motoru.
* **🏋️ Spor Programı:** Ekipman, seviye ve hedefe göre kişiselleştirilmiş antrenman planları.
* **🏆 Oyunlaştırma:** "Streak" (Seri) takibi, su hatırlatıcısı ve başarı rozetleri.

---

## 🛠 Teknoloji Yığını

| Alan | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Mobil** | **Kotlin** (Android) | Native Android Geliştirme, Jetpack Compose UI. |
| **Backend** | **NestJS** (Node.js) | Modüler mimari, TypeScript, REST API. |
| **Veritabanı 1** | **PostgreSQL** | İlişkisel veriler (User, Goal, Recipe). |
| **Veritabanı 2** | **MongoDB** | Loglar, AI çıktıları, Ham veriler. |
| **Altyapı** | **Docker** | Geliştirme ortamı sanallaştırması. |
| **Auth** | **Firebase Auth** | Güvenli kimlik doğrulama. |
| **AI / ML** | **HuggingFace / ML Kit** | Görüntü işleme ve sınıflandırma modelleri. |

---

## ☁️ Altyapı Mimarisi (Dev vs Prod)

Proje iki farklı ortamda çalışacak şekilde kurgulanmıştır:

### 1. Geliştirme Ortamı (Localhost)
* **Yöntem:** Docker Container.
* **Araçlar:** Docker Compose ile yerel bilgisayarda çalışan sanal PostgreSQL ve MongoDB sunucuları.
* **Amaç:** İnternet bağımlılığı olmadan, tüm ekipte standart çalışma ortamı sağlamak.

### 2. Canlı Ortamı (Production)
* **Backend API:** Render.com (Web Service).
* **PostgreSQL:** Supabase (Managed Cloud DB).
* **MongoDB:** MongoDB Atlas (Cloud Cluster).
* **Amaç:** 7/24 erişilebilirlik, otomatik yedekleme ve Play Store entegrasyonu.

---

## 👥 Proje Ekibi ve Görevler

### 👑 Furkan Akkamış (Scrum Master & System Architect)
* **Rol:** Takım Lideri, DevOps ve Altyapı Sorumlusu.
* **Görevler:**
    * Sprint planlaması, görev dağılımı ve proje yönetimi.
    * `docker-compose` ile geliştirme ortamının kurulması.
    * PostgreSQL ve MongoDB veritabanı şemalarının tasarımı.
    * Firebase, Google Play Store ve Cloud Sunucu deploy süreçlerinin yönetimi.

### ⚙️ Tarık Mengüç (Backend Developer)
* **Rol:** API Geliştirme ve Entegrasyon.
* **Görevler:**
    * NestJS ile RESTful servislerin (Auth, User, Meals) kodlanması.
    * API Güvenliği (JWT Guard) ve Validasyonlar.
    * AI servislerinden gelen verinin işlenip mobile iletilmesi.

### 🧠 Zeliha Sena Güllü (AI Researcher)
* **Rol:** Model Avcısı ve Görüntü İşleme.
* **Görevler:**
    * En uygun "Food Classification" (Yemek Tanıma) modellerinin bulunması (HuggingFace).
    * Görüntü işleme mikro-servisinin (Python/Flask) geliştirilmesi.
    * Etiket okuma (OCR) performansı için model testleri.

### 📱 Mehmet Emin Yılmaz (AI Data Engineer & Android Dev)
* **Rol:** Android Geliştirme (Kotlin) ve Veri Mantığı.
* **Görevler:**
    * **Kotlin & Jetpack Compose** ile modern UI tasarımlarının kodlanması.
    * Retrofit kütüphanesi ile Backend API bağlantıları.
    * Kan tahlili sonuçlarını yorumlayan JSON tabanlı kural setlerinin yazılması.
    * Tanımlanan yemeğin kalori karşılığını bulan algoritmalar.

---

## 📂 Klasör Yapısı

Proje Monorepo yapısında kurgulanmıştır:

```text
kalorilens/
├─ apps/
│  ├─ api/                      # Backend (NestJS) - Tarık
│  │  ├─ src/modules/           # (Auth, Users, Meals...)
│  │  └─ Dockerfile
│  │
│  └─ mobile/                   # Android App (Kotlin) - Mehmet Emin
│     ├─ app/src/main/java/     # Kotlin Kaynak Kodları
│     ├─ app/src/main/res/      # Layout (XML) ve Görseller
│     └─ build.gradle.kts       # Bağımlılık Yönetimi
│
├─ ai-service/                  # Python AI Modelleri - Zeliha
│  ├─ models/
│  └─ app.py
│
├─ infra/                       # Altyapı - Furkan
│  ├─ docker-compose.yml        # Dev ortamı için DB başlatıcı
│  └─ seeds/                    # Başlangıç verileri
│
└─ README.md
