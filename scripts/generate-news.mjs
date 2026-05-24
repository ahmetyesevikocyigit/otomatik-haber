import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { XMLParser } from "fast-xml-parser";

const rootDir = process.cwd();
const postsDir = path.join(rootDir, "posts");
const sourcesPath = path.join(rootDir, "scripts", "news-sources.json");
const statePath = path.join(rootDir, "data", "generated", "news-state.json");

const MAX_ITEMS_PER_SOURCE = Number(process.env.NEWS_ITEMS_PER_SOURCE || 2);
const MAX_TOTAL_ITEMS = Number(process.env.NEWS_MAX_TOTAL || 10);

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
});

function stripHtml(value = "") {
  return String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function removeSourceSuffix(title = "") {
  return title.replace(/\s+-\s+[^-]+$/u, "").trim();
}

function slugify(value) {
  const normalized = value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.slice(0, 80) || crypto.randomUUID();
}

function excerptFrom(description, fallbackTitle) {
  const cleaned = stripHtml(description);
  const source = cleaned || fallbackTitle;
  if (source.length <= 155) return source;
  return `${source.slice(0, 152).replace(/\s+\S*$/u, "")}...`;
}

function cleanSubtitle(value, sourceName, title) {
  const escapedSource = String(sourceName || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const withoutSource = String(value || "")
    .replace(new RegExp(`\\s*${escapedSource}$`, "iu"), "")
    .trim();

  if (!withoutSource || withoutSource === title) {
    return `${title} başlığı, gündemin öne çıkan gelişmeleri arasında yer aldı.`;
  }

  return withoutSource;
}

function getItemArray(feed) {
  const items = feed?.rss?.channel?.item || [];
  return Array.isArray(items) ? items : [items];
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function existingSlugs() {
  const files = await fs.readdir(postsDir);
  return new Set(files.filter((file) => file.endsWith(".md")).map((file) => file.replace(/\.md$/, "")));
}

function frontMatterValue(value) {
  return String(value).replace(/"/g, '\\"');
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

  return images[category] || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1400&q=80";
}

function titleWithHook(title, category) {
  const cleanTitle = title.replace(/^SON DAKİKA:\s*/iu, "").trim();
  const titleStem = cleanTitle.replace(/[!?.,;:]+$/u, "").trim();
  const hooks = {
    Gündem: "Gözden kaçan ayrıntı dikkat çekti",
    Siyaset: "Ankara kulislerini hareketlendiren başlık",
    Ekonomi: "Piyasaların beklediği sinyal geldi mi?",
    Futbol: "Taraftarların konuşacağı gelişme",
    Teknoloji: "Bu hamle dengeleri değiştirebilir",
    Dünya: "Küresel gündemde yeni sayfa",
    Kültür: "Sahnenin arkasındaki detay",
  };

  const hook = hooks[category] || "Gündemin dikkat çeken detayı";
  if (titleStem.includes(":")) return titleStem.replace(/[!?.,;]+:\s*/u, ": ");
  return `${titleStem}: ${hook}`;
}

function seoKeywords(title, category) {
  const base = [category, "son dakika", "güncel haberler", "Haber Akışı"];
  const words = title
    .split(/\s+/u)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((word) => word.length > 4)
    .slice(0, 6);

  return [...new Set([...base, ...words])];
}

function detailedArticle(item) {
  const categoryLines = {
    Gündem: [
      "Gündem başlıklarında öne çıkan bu gelişme, günlük hayatı ve kamuoyundaki tartışmaları doğrudan etkileyebilecek yönleriyle izleniyor.",
      "Uzmanlar ve yetkililerden gelecek yeni açıklamalar, haberin seyrini belirleyecek en önemli başlıklar arasında yer alıyor.",
    ],
    Siyaset: [
      "Siyaset gündeminde yankı uyandıran gelişme, Ankara'daki karar süreçleri ve parti açıklamaları açısından yakından takip ediliyor.",
      "Önümüzdeki saatlerde yapılacak yeni açıklamalar, tartışmanın hangi yöne evrileceği konusunda belirleyici olabilir.",
    ],
    Ekonomi: [
      "Ekonomi çevreleri, gelişmenin piyasa beklentileri, yatırımcı davranışı ve finansal gündem üzerindeki etkilerine odaklanmış durumda.",
      "Özellikle borsa, kur, faiz ve şirket haberleriyle birlikte okunacak yeni veriler, tabloyu daha net hale getirecek.",
    ],
    Futbol: [
      "Futbol gündemindeki bu başlık, kulüpler, taraftarlar ve sezon planlaması açısından kısa sürede geniş yankı buldu.",
      "Teknik heyetler, yönetimler ve federasyon cephesinden gelecek açıklamalar konunun seyrini belirleyecek.",
    ],
    Teknoloji: [
      "Teknoloji dünyasında öne çıkan gelişme, yapay zeka, dijital dönüşüm ve yeni nesil ürün stratejileriyle birlikte değerlendiriliyor.",
      "Şirketlerin bu alandaki adımları, hem kullanıcı deneyimini hem de sektör rekabetini doğrudan etkileyebilir.",
    ],
    Dünya: [
      "Küresel gündemde öne çıkan gelişme, bölgesel dengeler ve diplomatik temaslar açısından yakından izleniyor.",
      "Uluslararası aktörlerden gelecek açıklamalar, konunun etkisini ve kapsamını daha görünür hale getirecek.",
    ],
    Kültür: [
      "Kültür sanat gündemindeki gelişme, izleyici ilgisi, etkinlik takvimi ve yaratıcı sektörler açısından dikkat çekiyor.",
      "Program detayları, katılımcı açıklamaları ve yeni duyurular konunun daha geniş bir çerçevede ele alınmasını sağlayacak.",
    ],
  };

  const [context, next] = categoryLines[item.category] || categoryLines.Gündem;
  const seoPhrase = `${item.category.toLocaleLowerCase("tr-TR")} haberleri`;

  return `${item.subtitle}\n\n## Neler oldu?\n\n${item.title} başlığı, ${seoPhrase} içinde günün öne çıkan gelişmelerinden biri olarak dikkat çekti. İlk bilgiler, konunun yalnızca kısa süreli bir gündem maddesi olmadığını; karar alıcılar, takipçiler ve ilgili sektörler açısından yakından izlenmesi gereken bir başlık haline geldiğini gösteriyor.\n\n${context}\n\n## Bu gelişme neden önemli?\n\nHaberin önemi, yalnızca başlıktaki sıcak gelişmeden ibaret değil. Konunun etkisi; kamuoyu tepkisi, olası yeni açıklamalar ve önümüzdeki günlerde ortaya çıkabilecek yan gelişmelerle daha da belirginleşebilir. Bu yüzden gelişmeyi tek bir cümlelik duyuru gibi değil, devamı gelebilecek bir süreç olarak okumak gerekiyor.\n\nOkurların en çok merak ettiği nokta ise gelişmenin kısa vadede nasıl sonuçlar doğuracağı ve ilgili tarafların bundan sonra hangi adımları atacağı.\n\n## Bundan sonra ne izlenecek?\n\n${next} Haber Akışı, konuyla ilgili yeni bilgileri, resmi açıklamaları ve sahadan gelen güncellemeleri izlemeye devam edecek.\n\n## Kısa değerlendirme\n\nBu başlıkta en kritik nokta, gelişmenin tek başına değil, bağlantılı olduğu daha geniş gündemle birlikte değerlendirilmesi. Yeni bilgiler geldikçe haberin etkisi, kapsamı ve olası sonuçları daha net görülecek.`;
}

function markdownFor(item) {
  const date = new Date(item.pubDate || Date.now()).toISOString().slice(0, 10);
  const displayTitle = titleWithHook(item.title, item.category);
  const title = frontMatterValue(displayTitle);
  const subtitle = frontMatterValue(item.subtitle);
  const source = frontMatterValue(item.sourceName);
  const link = frontMatterValue(item.link);
  const keywords = seoKeywords(displayTitle, item.category).map(frontMatterValue);
  const seoDescription = frontMatterValue(item.subtitle);

  return `---\ntitle: "${title}"\nsubtitle: "${subtitle}"\nseo_title: "${title} | Son Dakika ${item.category} Haberleri"\nseo_description: "${seoDescription}"\nkeywords: [${keywords.map((keyword) => `"${keyword}"`).join(", ")}]\ndate: "${date}"\ncategory: ["${item.category}"]\nauthor: "Haber Akışı"\nfeatured_image: "${item.image}"\nsource: "${source}"\nsource_url: "${link}"\nauto_generated: true\n---\n\n${detailedArticle({ ...item, title: displayTitle })}\n`;
}

async function fetchSource(source) {
  const response = await fetch(source.url, {
    headers: {
      "user-agent": "otomatik-haber-bot/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`${source.name} RSS alınamadı: ${response.status}`);
  }

  const xml = await response.text();
  const feed = parser.parse(xml);

  return getItemArray(feed)
    .slice(0, MAX_ITEMS_PER_SOURCE)
    .map((item) => {
      const rawTitle = stripHtml(item.title);
      const title = removeSourceSuffix(rawTitle);
      const sourceName = rawTitle.includes(" - ") ? rawTitle.split(" - ").pop() : source.name;
      const subtitle = cleanSubtitle(excerptFrom(item.description, title), sourceName, title);

      return {
        id: item.guid?.["#text"] || item.guid || item.link || rawTitle,
        title,
        subtitle,
        category: source.category,
        link: item.link,
        pubDate: item.pubDate,
        sourceName,
        image: categoryImage(source.category),
      };
    })
    .filter((item) => item.title && item.link);
}

async function main() {
  await fs.mkdir(postsDir, { recursive: true });
  await fs.mkdir(path.dirname(statePath), { recursive: true });

  const sources = await readJson(sourcesPath, []);
  const state = await readJson(statePath, { seen: [] });
  const seen = new Set(state.seen || []);
  const slugs = await existingSlugs();
  const created = [];

  for (const source of sources) {
    const items = await fetchSource(source);

    for (const item of items) {
      if (created.length >= MAX_TOTAL_ITEMS) break;
      const fingerprint = crypto.createHash("sha256").update(item.id).digest("hex");
      if (seen.has(fingerprint)) continue;

      let slug = slugify(item.title);
      let index = 2;
      while (slugs.has(slug)) {
        slug = `${slugify(item.title)}-${index}`;
        index += 1;
      }

      const filePath = path.join(postsDir, `${slug}.md`);
      await fs.writeFile(filePath, markdownFor(item), "utf8");
      slugs.add(slug);
      seen.add(fingerprint);
      created.push({ slug, title: item.title, category: item.category });
    }
  }

  await fs.writeFile(
    statePath,
    `${JSON.stringify({ updatedAt: new Date().toISOString(), seen: [...seen].slice(-1000) }, null, 2)}\n`,
    "utf8"
  );

  console.log(`Oluşturulan haber sayısı: ${created.length}`);
  for (const item of created) {
    console.log(`- [${item.category}] ${item.title} -> posts/${item.slug}.md`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
