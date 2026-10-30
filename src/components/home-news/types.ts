export interface NewsItem {
  category: string;
  publishedOn: string;
  title: string;
  summary: string;
  url?: string | undefined;
  image?:
    | {
        src: string;
        alt: string;
        width: number;
        height: number;
      }
    | undefined;
}
