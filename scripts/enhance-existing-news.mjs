import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const rootDir = process.cwd();
const postsDir = path.join(rootDir, "posts");

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return ["Gündem"];
  return [value];
}

function categoryImage(category) {
  const images = {
    Gündem: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=80",
    Siyaset: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1400&q=80",
    Ekonomi: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1400&q=80",
    Futbol: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1400&q=80",
    Spor: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1400&q=80",
    Teknoloji: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
    Dünya: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1400&q=80",
    Kültür: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80",
  };

  return images[category] || images.Gündem;
}

function normalizedCategory(category) {
  if (category === "Spor") return "Futbol";
  return category;
}

function titleWithHook(title, category) {
  const cleanTitle = String(title || "Gündemde dikkat çeken gelişme")
    .replace(/^SON DAKİKA:\s*/iu, "")
    .trim();
  const titleStem = cleanTitle.replace(/[!?.,;:]+$/u, "").trim();

  const hooks = {
    Gündem: "Herkesin merak ettiği ayrıntı ortaya çıkıyor",
    Siyaset: "Ankara kulislerini hareketlendiren detay",
    Ekonomi: "Piyasalar bu sorunun yanıtını arıyor",
    Futbol: "Taraftarların konuşacağı gelişme",
    Teknoloji: "Bu hamle dengeleri değiştirebilir",
    Dünya: "Küresel gündemde yeni sayfa",
    Kültür: "Sahnenin arkasındaki detay",
  };

  const knownHooks = Object.values(hooks);
  if (knownHooks.some((hook) => titleStem.includes(hook))) {
    return titleStem.replace(/[!?.,;]+:\s*/u, ": ");
  }
  return `${titleStem}: ${hooks[category] || hooks.Gündem}`;
}

function seoKeywords(title, category) {
  const base = [category, "son dakika", "güncel haberler", "Haber Akışı"];
  const words = title
    .split(/\s+/u)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((word) => word.length > 4)
    .slice(0, 8);

  return [...new Set([...base, ...words])];
}

function cleanSubtitle(value, sourceName, title) {
  const source = String(sourceName || "").trim();
  let cleaned = String(value || "").trim();

  if (source) {
    const escapedSource = source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned.replace(new RegExp(`\\s*${escapedSource}$`, "iu"), "").trim();
  }

  if (!cleaned || cleaned === title) {
    return `${title} başlığı, gündemin öne çıkan gelişmeleri arasında yer aldı.`;
  }

  return cleaned;
}

function detailedArticle({ title, subtitle, category }) {
  const lines = {
    Gündem: [
      "Gündem başlıklarında öne çıkan bu gelişme, günlük hayatı ve kamuoyundaki tartışmaları doğrudan etkileyebilecek yönleriyle izleniyor.",
      "Yetkililerden ve ilgili kurumlardan gelecek yeni açıklamalar, haberin seyrini belirleyecek başlıklar arasında yer alıyor.",
      "Bu nedenle gelişmenin yalnızca tek bir duyuru olarak değil, devamı gelebilecek bir süreç olarak takip edilmesi gerekiyor.",
    ],
    Siyaset: [
      "Siyaset gündeminde yankı uyandıran gelişme, Ankara'daki karar süreçleri ve parti açıklamaları açısından yakından takip ediliyor.",
      "Kulislerde konuşulan başlıklar, resmi açıklamalarla birlikte değerlendirildiğinde daha net bir tablo ortaya çıkabilir.",
      "Önümüzdeki saatlerde yapılacak açıklamalar, tartışmanın hangi yöne evrileceğini belirleyecek.",
    ],
    Ekonomi: [
      "Ekonomi çevreleri, gelişmenin piyasa beklentileri, yatırımcı davranışı ve finansal gündem üzerindeki etkilerine odaklanmış durumda.",
      "Borsa, kur, faiz ve şirket haberleriyle birlikte okunacak yeni veriler, gelişmenin etkisini daha görünür hale getirecek.",
      "Piyasalarda kısa vadeli fiyatlamalar kadar orta vadeli beklentiler de bu başlıkla birlikte yeniden değerlendiriliyor.",
    ],
    Futbol: [
      "Futbol gündemindeki bu gelişme, kulüpler, taraftarlar ve sezon planlaması açısından kısa sürede geniş yankı buldu.",
      "Teknik heyetler, yönetimler ve federasyon cephesinden gelecek açıklamalar konunun seyrini belirleyecek.",
      "Taraftar cephesinde ise kararın sahaya, fikstüre ve transfer planlamasına nasıl yansıyacağı merak ediliyor.",
    ],
    Teknoloji: [
      "Teknoloji dünyasında öne çıkan gelişme, yapay zeka, dijital dönüşüm ve yeni nesil ürün stratejileriyle birlikte değerlendiriliyor.",
      "Şirketlerin bu alandaki adımları, hem kullanıcı deneyimini hem de sektör rekabetini doğrudan etkileyebilir.",
      "Yeni teknolojilerin yaygınlaşma hızı, düzenleme ve güvenlik başlıklarını da aynı anda gündeme taşıyor.",
    ],
    Dünya: [
      "Küresel gündemde öne çıkan gelişme, bölgesel dengeler ve diplomatik temaslar açısından yakından izleniyor.",
      "Uluslararası aktörlerden gelecek açıklamalar, konunun etkisini ve kapsamını daha görünür hale getirecek.",
      "Diplomasi trafiği, enerji, güvenlik ve ekonomi başlıklarıyla birlikte değerlendirildiğinde haberin önemi daha da artıyor.",
    ],
    Kültür: [
      "Kültür sanat gündemindeki gelişme, izleyici ilgisi, etkinlik takvimi ve yaratıcı sektörler açısından dikkat çekiyor.",
      "Program detayları, katılımcı açıklamaları ve yeni duyurular konunun daha geniş bir çerçevede ele alınmasını sağlayacak.",
      "Kültür dünyasında benzer etkinlik ve projelerin gördüğü ilgi, bu başlığın etkisini daha görünür hale getiriyor.",
    ],
  };

  const [context, next, extra] = lines[category] || lines.Gündem;
  const seoPhrase = `${category.toLocaleLowerCase("tr-TR")} haberleri`;

  return `${subtitle}

## Neler oldu?

${title} başlığı, ${seoPhrase} içinde günün öne çıkan gelişmelerinden biri olarak dikkat çekti. İlk bilgiler, konunun yalnızca kısa süreli bir gündem maddesi olmadığını; karar alıcılar, takipçiler ve ilgili sektörler açısından yakından izlenmesi gereken bir başlık haline geldiğini gösteriyor.

${context}

## Bu gelişme neden önemli?

Haberin önemi, yalnızca başlıktaki sıcak gelişmeden ibaret değil. Konunun etkisi; kamuoyu tepkisi, olası yeni açıklamalar ve önümüzdeki günlerde ortaya çıkabilecek yan gelişmelerle daha da belirginleşebilir.

${extra}

Okurların en çok merak ettiği nokta ise gelişmenin kısa vadede nasıl sonuçlar doğuracağı ve ilgili tarafların bundan sonra hangi adımları atacağı.

## Bundan sonra ne izlenecek?

${next} Haber Akışı, konuyla ilgili yeni bilgileri, resmi açıklamaları ve sahadan gelen güncellemeleri izlemeye devam edecek.

## Kısa değerlendirme

Bu başlıkta en kritik nokta, gelişmenin tek başına değil, bağlantılı olduğu daha geniş gündemle birlikte değerlendirilmesi. Yeni bilgiler geldikçe haberin etkisi, kapsamı ve olası sonuçları daha net görülecek.`;
}

const files = (await fs.readdir(postsDir)).filter((file) => file.endsWith(".md"));

for (const file of files) {
  const filePath = path.join(postsDir, file);
  const parsed = matter(await fs.readFile(filePath, "utf8"));
  const categories = asArray(parsed.data.category).map(normalizedCategory);
  const category = categories[0];
  const title = titleWithHook(parsed.data.title, category);
  const subtitle = cleanSubtitle(
    parsed.data.subtitle ||
      `${title} başlığı, ${category.toLocaleLowerCase("tr-TR")} gündeminde öne çıkan gelişmeler arasında yer aldı.`,
    parsed.data.source,
    title
  );

  const data = {
    ...parsed.data,
    title,
    subtitle,
    seo_title: `${title} | Son Dakika ${category} Haberleri`,
    seo_description: subtitle,
    keywords: seoKeywords(title, category),
    category: categories,
    author: "Haber Akışı",
    featured_image: categoryImage(category),
    auto_generated: Boolean(parsed.data.auto_generated),
  };

  const content = detailedArticle({ title, subtitle, category });
  await fs.writeFile(filePath, matter.stringify(content, data), "utf8");
  console.log(`Güncellendi: ${file}`);
}
