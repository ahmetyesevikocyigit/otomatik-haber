import PostPreview from "@/components/PostPreview";
import getPostMetadata from "@/components/getPostMetadata";

function NewsPage() {
  const posts = getPostMetadata();

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 border-b-4 border-neutral-950 pb-4">
        <div className="ui-sans text-sm font-bold uppercase tracking-[0.18em] text-neutral-600">
          Haber Merkezi
        </div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-6xl">
          Son Haberler
        </h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-5">
          {posts.map((post) => (
            <PostPreview key={post.slug} {...post} />
          ))}
        </div>
        <aside className="h-fit border border-neutral-200 p-4">
          <h2 className="ui-sans border-b border-neutral-300 pb-2 text-sm font-bold uppercase tracking-[0.16em]">
            Kategoriler
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Gündem", "Siyaset", "Dünya", "Ekonomi", "Futbol", "Teknoloji", "Kültür"].map(
              (category) => (
                <span
                  key={category}
                  className="ui-sans bg-neutral-100 px-3 py-2 text-sm font-bold text-neutral-800"
                >
                  {category}
                </span>
              )
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default NewsPage;
