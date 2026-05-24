# Otomatik Haber

CNN benzeri yoğun haber vitrini için hazırlanan Next.js tabanlı başlangıç projesi.

## Çalıştırma

```bash
npm install
npm run dev
```

Site varsayılan olarak `http://localhost:3000` adresinde açılır.

## İçerik

Haberler `posts/` klasöründeki Markdown dosyalarından okunur. Her dosyada şu alanlar kullanılır:

```md
---
title: "Haber başlığı"
subtitle: "Kısa spot"
date: "2026-05-24"
category: ["Ekonomi"]
author: "Haber Merkezi"
featured_image: "https://images.unsplash.com/..."
source: "Kaynak"
breaking: true
---
```

RSS/API botu bu klasöre otomatik haber dosyaları yazar. İstenirse sonraki aşamada içerik yönetimi ayrı bir CMS veya backend'e taşınabilir.

## Otomatik Haber

RSS kaynaklarından haber üretmek için:

```bash
npm run news:generate
```

Kaynaklar `scripts/news-sources.json` dosyasından yönetilir. Script yeni haberleri `posts/` klasörüne Markdown olarak yazar ve tekrarları `data/generated/news-state.json` içinde takip eder.

GitHub Actions için `.github/workflows/update-news.yml` eklendi. Repo GitHub'a yüklendiğinde workflow elle veya saatlik zamanlamayla çalıştırılabilir.

Mevcut haberleri OpenAI API ile yeniden yazmak için sunucudaki `.env` dosyasına gerçek anahtarı ekleyin:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.5
```

Ardından:

```bash
npm run news:enhance
```

Bu komut başlık, spot, SEO başlığı, SEO açıklaması, anahtar kelimeler ve Markdown haber gövdesini yeniden üretir.

## Piyasa Verisi

Ana sayfadaki döviz bandını güncellemek için:

```bash
npm run market:update
```

`COLLECTAPI_KEY` tanımlıysa CollectAPI kullanılır. Anahtar yoksa sistem TCMB günlük döviz XML verisini fallback olarak okur.

## VPS Deploy Notları

Sunucuda temel akış:

```bash
git clone <repo-url>
cd otomatik-haber
cp .env.example .env
npm ci
npm run news:generate
npm run news:enhance
npm run build
npm start -- --hostname 0.0.0.0 --port 3000
```

OpenAI entegrasyonu eklendiğinde `OPENAI_API_KEY` değeri sunucudaki `.env` dosyasına yazılmalı. Bu dosya GitHub'a gönderilmemelidir.
