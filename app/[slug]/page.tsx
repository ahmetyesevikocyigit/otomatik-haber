import fs from "fs";
import Markdown from "markdown-to-jsx";
import matter from "gray-matter";
import getPostMetadata from "@/components/getPostMetadata";
import Image from "next/image";

const getPostContent = (slug: string) => {
  const folder = "posts/";
  const file = `${folder}${slug}.md`;
  try {
    const content = fs.readFileSync(file, "utf8");
    const matterResult = matter(content);
    return matterResult;
  } catch (err) {
    const matterResult = null;
    return matterResult;
  }
};

export const generateStaticParams = async () => {
  const posts = getPostMetadata();
  return posts.map((post) => ({
    slug: post.slug,
  }));
};

export async function generateMetadata(props: any) {
  const post = getPostContent(props.params.slug);

  if (!post) {
    return {
      title: "Haber bulunamadı | Haber Akışı",
    };
  }

  return {
    title: post.data.seo_title || `${post.data.title} | Haber Akışı`,
    description: post.data.seo_description || post.data.subtitle,
    keywords: post.data.keywords || post.data.category,
    openGraph: {
      title: post.data.title,
      description: post.data.subtitle,
      images: [post.data.featured_image],
      type: "article",
    },
  };
}

function PostPage(props: any) {
  const slug = props.params.slug;

  const post = getPostContent(slug);
  if (post == null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="mb-5 text-4xl font-bold">404: Haber bulunamadı</h1>
        <article className="text-neutral-600">Ana sayfaya donup son haberleri inceleyebilirsin.</article>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 flex flex-wrap gap-2">
          {post!.data.category.map((category: string) => (
            <span
              key={category}
              className="ui-sans border border-neutral-950 px-2 py-1 text-xs font-bold uppercase tracking-[0.16em]"
            >
              {category}
            </span>
          ))}
        </div>
        <h1 className="text-4xl font-bold leading-none tracking-tight text-neutral-950 md:text-6xl">
          {post!.data.title}
        </h1>
        <p className="mt-4 text-xl leading-8 text-neutral-700">{post!.data.subtitle}</p>
        <div className="ui-sans mt-5 flex flex-wrap gap-x-2 gap-y-1 border-y border-neutral-200 py-3 text-sm font-semibold text-neutral-600">
          <span>{post!.data.author}</span>
          <span>·</span>
          <span>{post!.data.date}</span>
        </div>
      </div>

      <article className="mx-auto mt-8 max-w-4xl">
        <figure className="overflow-hidden bg-neutral-200">
          <Image
            src={post!.data.featured_image}
            alt=""
            width={1200}
            height={720}
            className="w-full object-cover"
            priority
          />
        </figure>
        <div className="prose prose-neutral mt-8 max-w-none prose-headings:font-bold prose-a:text-neutral-950 md:prose-xl">
          <Markdown>{post!.content}</Markdown>
        </div>
      </article>
    </div>
  );
}

export default PostPage;
