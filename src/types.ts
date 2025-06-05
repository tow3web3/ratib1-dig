export interface RedditPost {
  id: string;
  title: string;
  author: string;
  created_utc: number;
  subreddit: string;
  url: string;
  thumbnail: string;
  score: number;
}

export interface HackerNewsPost {
  id: number;
  title: string;
  by: string;
  time: number;
  url: string;
  score: number;
  descendants: number;
}

export interface LemmyPost {
  id: string;
  title: string;
  creator: string;
  community: string;
  published: string;
  url?: string;
  score: number;
  comments_count: number;
}

export interface ContentToLaunch {
  type: 'reddit' | 'hackernews' | 'lemmy' | 'yahoo' | 'bitcointalk' | '4chan' | 'cnn' | 'nbc' | 'fox';
  title: string;
  description: string;
  image?: string;
  url: string;
  author?: string;
}