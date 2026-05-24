import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const rootDir = process.cwd();
const postsDir = path.join(rootDir, "posts");
const envPath = path.join(rootDir, ".env");
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.5";
const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const ONLY_PENDING = process.env.NEWS_ENHANCE_ONLY_PENDING === "true";

async function loadEnvFile() {
  try {
    const env = await fs.readFile(envPath, "utf8");
    for (const line of env.split(/\r?\n/u)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/u);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^["']|["']$/gu, "");
    }
  } catch {
    // .env is optional; production can pass environment variables directly.
  }
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return ["Gündem"];
  return [value];
}

function normalizedCategory(category) {
  if (category === "Spor") return "Futbol";
  return category || "Gündem";
}

function categoryImage(category) {
  const images = {
    Gündem: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=80",
    Siyaset: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1400&q=80",
    Ekonomi: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1400&q=80",
    Futbol: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1400&q=80",
    Teknoloji: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
    Dünya: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1400&q=80",
    Kültür: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80",
  };

  return images[category] || images.Gündem;
}

function seoKeywords(title, category, keywords = []) {
  const base = [category, "son dakika", "güncel haberler", "Haber Akışı"];
  const words = String(title)
    .split(/\s+/u)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((word) => word.length > 4)
    .slice(0, 8);

  return [...new Set([...base, ...keywords, ...words])].slice(0, 14);
}

function extractResponseText(responseJson) {
  if (responseJson.output_text) return responseJson.output_text;

  const chunks = [];
  for (const item of responseJson.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) chunks.push(content.text);
      if (content.type === "text" && content.text) chunks.push(content.text);
    }
  }

  return chunks.join("\n").trim();
}

function normalizeArticleJson(value, fallback) {
  return {
    title: String(value.title || fallback.title).trim(),
    subtitle: String(value.subtitle || fallback.subtitle).trim(),
    seo_title: String(value.seo_title || value.title || fallback.title).trim(),
    seo_description: String(value.seo_description || value.subtitle || fallback.subtitle).trim(),
    keywords: Array.isArray(value.keywords) ? value.keywords.map(String).filter(Boolean) : [],
    content_md: String(value.content_md || fallback.content).trim(),
  };
}

async function rewriteWithOpenAI({ file, data, content, category }) {
  const sourceBundle = {
    file,
    current_title: data.title,
    current_subtitle: data.subtitle,
    category,
    date: data.date,
    source_name: data.source,
    source_url: data.source_url,
    current_article_markdown: content,
  };

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions:
        "Sen deneyimli bir Türkçe haber editörüsün. Görevin verilen haber dosyasını daha doğal, açık, kaliteli ve SEO uyumlu biçimde yeniden yazmak. Türkçe karakterleri kusursuz kullan. Haber dili insan eliyle yazılmış gibi olmalı; yapay zeka kalıpları, boş genellemeler, tekrarlı paragraflar ve 'önemli gelişme' gibi dolgu ifadelerinden kaçın. Bilgi uydurma, olmayan sayı/tarih/isim ekleme. Kaynak adını metinde görünür şekilde yazma. Başlıkta hafif merak uyandıran ama yanıltıcı olmayan clickbait kullan. İçerik ciddi haberlerde ciddi, hafif konularda daha canlı olabilir.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Aşağıdaki haber dosyasını yeniden yaz.

Beklenen çıktı:
- title: 58-82 karakter arası, doğal, net, hafif merak uyandıran.
- subtitle: 135-165 karakter arası, haberin özünü açıklayan.
- seo_title: 55-70 karakter arası; ana kelime başa yakın olsun.
- seo_description: 145-160 karakter arası, arama sonucunda tıklama isteği uyandırsın.
- keywords: 8-12 adet Türkçe SEO anahtar kelime.
- content_md: Markdown gövde. 650-950 kelime. Giriş paragrafı güçlü olsun. 4-6 adet ## ara başlık kullan. Kısa paragraflar yaz. Okura "ne oldu, neden önemli, sırada ne var" cevaplarını ver. Başlık tekrarını cümle içinde kaba şekilde kullanma.

Haber dosyası:
${JSON.stringify(sourceBundle, null, 2)}`,
            },
          ],
        },
      ],
      max_output_tokens: 3200,
      text: {
        format: {
          type: "json_schema",
          name: "rewritten_news_article",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              subtitle: { type: "string" },
              seo_title: { type: "string" },
              seo_description: { type: "string" },
              keywords: {
                type: "array",
                items: { type: "string" },
                minItems: 8,
                maxItems: 12,
              },
              content_md: { type: "string" },
            },
            required: ["title", "subtitle", "seo_title", "seo_description", "keywords", "content_md"],
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI isteği başarısız (${response.status}) ${file}: ${errorBody}`);
  }

  const responseJson = await response.json();
  const outputText = extractResponseText(responseJson);
  if (!outputText) throw new Error(`OpenAI boş yanıt döndürdü: ${file}`);

  return normalizeArticleJson(JSON.parse(outputText), {
    title: data.title,
    subtitle: data.subtitle,
    content,
  });
}

async function main() {
  await loadEnvFile();

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY bulunamadı. .env içine ekle veya ortam değişkeni olarak ver.");
  }

  const files = (await fs.readdir(postsDir)).filter((file) => file.endsWith(".md")).sort();

  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const parsed = matter(await fs.readFile(filePath, "utf8"));
    if (ONLY_PENDING && parsed.data.ai_enhanced) {
      console.log(`Atlandı: ${file}`);
      continue;
    }

    const categories = asArray(parsed.data.category).map(normalizedCategory);
    const category = categories[0];
    const rewritten = await rewriteWithOpenAI({
      file,
      data: parsed.data,
      content: parsed.content,
      category,
    });

    const data = {
      ...parsed.data,
      title: rewritten.title,
      subtitle: rewritten.subtitle,
      seo_title: rewritten.seo_title,
      seo_description: rewritten.seo_description,
      keywords: seoKeywords(rewritten.title, category, rewritten.keywords),
      category: categories,
      author: "Haber Akışı",
      featured_image: parsed.data.featured_image || categoryImage(category),
      ai_enhanced: true,
      enhanced_at: new Date().toISOString(),
    };

    await fs.writeFile(filePath, matter.stringify(rewritten.content_md, data), "utf8");
    console.log(`OpenAI ile güncellendi: ${file}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
