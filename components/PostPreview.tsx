import Link from "next/link";
import { PostMetadata } from "./PostMetadata";
import Image from "next/image";

const PostPreview = (props: PostMetadata) => {
  return (
    <article className="group border-b border-neutral-200 pb-5">
      <Link href={`/${props.slug}`} className="grid gap-4 sm:grid-cols-[220px_1fr]">
        <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200">
          <Image
            src={props.featured_image}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 640px) 220px, 100vw"
          />
        </div>
        <div>
          <div className="ui-sans text-xs font-bold uppercase tracking-[0.16em] text-neutral-600">
            {props.category[0]}
          </div>
          <h3 className="mt-2 text-2xl font-bold leading-tight group-hover:underline">
            {props.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-neutral-600">{props.subtitle}</p>
          <p className="ui-sans mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            {props.author} · {props.date}
          </p>
        </div>
      </Link>
    </article>
  );
};

export default PostPreview;
