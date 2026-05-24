export interface PostMetadata {
  title: string;
  date: string;
  subtitle: string;
  slug: string;
  category: string[];
  author: string;
  featured_image: string;
  source?: string;
  source_url?: string;
  breaking?: boolean;
  auto_generated?: boolean;
}
