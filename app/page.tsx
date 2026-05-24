import getPostMetadata from "@/components/getPostMetadata";
import getMarketData from "@/components/getMarketData";
import MarketTicker from "@/components/MarketTicker";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

const HomePage = () => {
  const posts = getPostMetadata();
  const market = getMarketData();
  const [lead, secondary, third, fourth, fifth, sixth] = posts;
  const breaking = posts.find((post) => post.breaking) || lead;
  const topList = posts.slice(1, 5);
  const latest = posts.slice(3, 9);
  const gridPosts = posts.slice(0, 8);

  return (
    <>
      <section className="border-b border-neutral-300 bg-neutral-50">
        <div className="ui-sans mx-auto flex max-w-[1180px] flex-col gap-2 px-4 py-3 text-sm font-semibold md:flex-row md:items-center">
          <span className="shrink-0 border border-neutral-950 px-2 py-1 text-xs uppercase tracking-[0.18em]">
            Son Dakika
          </span>
          <Link href={`/${breaking.slug}`} className="leading-5 hover:underline">
            {breaking.title}
          </Link>
        </div>
      </section>

      <MarketTicker items={market.items} source={market.source} updatedAt={market.updatedAt} />

      <section className="mx-auto max-w-[1180px] px-4 py-5">
        <div className="ui-sans mb-5 flex flex-wrap gap-x-5 gap-y-2 border-b border-neutral-300 pb-4 text-sm font-semibold">
          {["Siyaset", "Piyasa", "Seçim", "Futbol", "Yapay Zeka"].map((topic) => (
            <Link key={topic} href="/news" className="hover:underline">
              {topic}
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)_310px]">
          <aside className="order-2 border-t border-neutral-300 pt-4 lg:order-1 lg:border-r lg:border-t-0 lg:pr-5 lg:pt-0">
            <h2 className="ui-sans mb-3 text-xs font-bold uppercase tracking-[0.16em]">
              Üst Haberler
            </h2>
            <div className="divide-y divide-neutral-300">
              {topList.map((post) => (
                <Link key={post.slug} href={`/${post.slug}`} className="group block py-4 first:pt-0">
                  <div className="ui-sans text-xs font-bold uppercase tracking-[0.14em] text-neutral-600">
                    {post.category[0]}
                  </div>
                  <h3 className="mt-1 text-xl font-bold leading-tight group-hover:underline">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm leading-5 text-neutral-600">{post.subtitle}</p>
                </Link>
              ))}
            </div>
          </aside>

          <article className="order-1 lg:order-2">
            <Link href={`/${lead.slug}`} className="group block">
              <div className="relative aspect-[16/9] overflow-hidden bg-neutral-200">
                <Image
                  src={lead.featured_image}
                  alt=""
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                  sizes="(min-width: 1024px) 560px, 100vw"
                  priority
                />
              </div>
              <div className="ui-sans mt-4 text-xs font-bold uppercase tracking-[0.18em] text-neutral-600">
                {lead.category[0]}
              </div>
              <h1 className="mt-2 text-4xl font-bold leading-[0.96] tracking-tight text-neutral-950 md:text-6xl">
                {lead.title}
              </h1>
              <p className="mt-4 border-b border-neutral-300 pb-5 text-lg leading-7 text-neutral-700">
                {lead.subtitle}
              </p>
            </Link>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[fifth, sixth].filter(Boolean).map((post) => (
                <Link key={post.slug} href={`/${post.slug}`} className="group block border-b border-neutral-300 pb-4">
                  <div className="ui-sans text-xs font-bold uppercase tracking-[0.14em] text-neutral-600">
                    {post.category[0]}
                  </div>
                  <h3 className="mt-1 text-xl font-bold leading-tight group-hover:underline">
                    {post.title}
                  </h3>
                </Link>
              ))}
            </div>
          </article>

          <aside className="order-3 border-t border-neutral-300 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <Link href={`/${secondary.slug}`} className="group block border-b border-neutral-300 pb-5">
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200">
                <Image
                  src={secondary.featured_image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 310px, 100vw"
                />
              </div>
              <div className="ui-sans mt-3 text-xs font-bold uppercase tracking-[0.14em] text-neutral-600">
                {secondary.category[0]}
              </div>
              <h2 className="mt-1 text-2xl font-bold leading-tight group-hover:underline">
                {secondary.title}
              </h2>
            </Link>
            <Link href={`/${third.slug}`} className="group block border-b border-neutral-300 py-5">
              <div className="ui-sans text-xs font-bold uppercase tracking-[0.14em] text-neutral-600">
                {third.category[0]}
              </div>
              <h3 className="mt-1 text-xl font-bold leading-tight group-hover:underline">
                {third.title}
              </h3>
              <p className="mt-2 text-sm leading-5 text-neutral-600">{third.subtitle}</p>
            </Link>
            <Link href={`/${fourth.slug}`} className="group block py-5">
              <div className="ui-sans text-xs font-bold uppercase tracking-[0.14em] text-neutral-600">
                {fourth.category[0]}
              </div>
              <h3 className="mt-1 text-xl font-bold leading-tight group-hover:underline">
                {fourth.title}
              </h3>
            </Link>
          </aside>
        </div>
      </section>

      <section className="border-y border-neutral-300 bg-neutral-50">
        <div className="mx-auto grid max-w-[1180px] gap-6 px-4 py-8 lg:grid-cols-[1fr_1fr_1fr]">
          <div>
            <h2 className="ui-sans border-b border-neutral-300 pb-3 text-xs font-bold uppercase tracking-[0.18em]">
              Analiz
            </h2>
            <Link href={`/${lead.slug}`} className="group mt-4 block">
              <h3 className="text-3xl font-bold leading-tight group-hover:underline">
                Ekonomi paketinin piyasalar için anlamı ne?
              </h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Veri, beklenti ve politika başlıklarında hızlı okuma.
              </p>
            </Link>
          </div>
          <div>
            <h2 className="ui-sans border-b border-neutral-300 pb-3 text-xs font-bold uppercase tracking-[0.18em]">
              Canlı
            </h2>
            <div className="mt-4 space-y-4">
              {latest.slice(0, 3).map((post) => (
                <Link key={post.slug} href={`/${post.slug}`} className="block border-b border-neutral-300 pb-4 last:border-0">
                  <span className="ui-sans text-xs font-bold uppercase tracking-[0.14em] text-neutral-600">
                    {post.category[0]}
                  </span>
                  <h3 className="mt-1 font-bold leading-tight hover:underline">{post.title}</h3>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="ui-sans border-b border-neutral-300 pb-3 text-xs font-bold uppercase tracking-[0.18em]">
              Editörden
            </h2>
            <p className="mt-4 text-xl font-bold leading-tight">
              Otomatik haber sistemi için taslak, kaynak ve yayın onayı katmanları hazırlanıyor.
            </p>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Bir sonraki adımda RSS botu, AI özetleme ve admin panel bağlantısı eklenecek.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 py-8">
        <div className="mb-5 flex items-end justify-between border-b-4 border-neutral-950 pb-3">
          <h2 className="text-3xl font-bold tracking-tight">Son Haberler</h2>
          <Link href="/news" className="ui-sans text-sm font-bold uppercase hover:underline">
            Tümü
          </Link>
        </div>
        <div className="grid gap-x-6 gap-y-7 md:grid-cols-2 lg:grid-cols-4">
          {gridPosts.map((post) => (
            <Link key={post.slug} href={`/${post.slug}`} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200">
                <Image
                  src={post.featured_image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="ui-sans mt-3 text-xs font-bold uppercase tracking-[0.14em] text-neutral-600">
                {post.category[0]}
              </div>
              <h3 className="mt-1 text-xl font-bold leading-tight group-hover:underline">
                {post.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default HomePage;
