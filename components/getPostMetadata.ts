import fs from "fs";
import matter from "gray-matter";
import { PostMetadata } from "./PostMetadata";

const getPostMetadata = (): PostMetadata[] => {
  const folder = "posts/";
  const files = fs.readdirSync(folder);
  const markdownPosts = files.filter((file) => file.endsWith(".md"));

  //Get gray matter data from each file
  const posts = markdownPosts.map((fileName) => {
    const fileContents = fs.readFileSync(`posts/${fileName}`, "utf8");
    const matterResult = matter(fileContents);
    return {
      title: matterResult.data.title,
      date: matterResult.data.date,
      subtitle: matterResult.data.subtitle,
      slug: fileName.replace(".md", ""),
      category: Array.isArray(matterResult.data.category)
        ? matterResult.data.category
        : [matterResult.data.category].filter(Boolean),
      author: matterResult.data.author,
      featured_image: matterResult.data.featured_image,
      source: matterResult.data.source,
      source_url: matterResult.data.source_url,
      breaking: Boolean(matterResult.data.breaking),
      auto_generated: Boolean(matterResult.data.auto_generated),
    };
  });
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export default getPostMetadata;
