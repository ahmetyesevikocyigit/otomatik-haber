# Otomatik Haber

CNN benzeri yoğun haber vitrini için hazırlanan Next.js tabanlı başlangıç projesi.

## Çalıştırma

```bash
npm install
npm run dev
```

Site varsayilan olarak `http://localhost:3000` adresinde acilir.

## İçerik

Haberler `posts/` klasöründeki Markdown dosyalarından okunur. Her dosyada şu alanlar kullanılır:

```md
---
title: "Haber basligi"
subtitle: "Kisa spot"
date: "2026-05-24"
category: ["Ekonomi"]
author: "Haber Merkezi"
featured_image: "https://images.unsplash.com/..."
source: "Kaynak"
breaking: true
---
```

Bir sonraki adımda RSS/API botu bu klasöre otomatik haber dosyaları yazacak veya CMS backend'e taşınacak.

## Otomatik Haber

RSS kaynaklarından haber üretmek için:

```bash
npm run news:generate
```

Kaynaklar `scripts/news-sources.json` dosyasından yönetilir. Script yeni haberleri `posts/` klasörüne Markdown olarak yazar ve tekrarları `data/generated/news-state.json` içinde takip eder.

GitHub Actions için `.github/workflows/update-news.yml` eklendi. Repo GitHub'a yüklendiğinde workflow elle veya saatlik zamanlamayla çalıştırılabilir.

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
