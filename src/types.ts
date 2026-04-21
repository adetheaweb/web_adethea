export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  coverImage: string;
  externalUrl?: string;
  gallery?: string[];
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
  color?: string;
  icon?: any;
}

export interface SocialLinks {
  twitter: string;
  instagram: string;
  linkedin: string;
  github: string;
}
