export interface NewsItem {
  category: string;
  publishedOn: string;
  title: string;
  summary: string;
  url?: string;
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
}
