export interface Bookmark {
  id: string;
  title: string;
  excerpt: string;
  source: string;
  category: string;
  imageUrl?: string;
  savedAt: string;
  articleId: string;
}

const BOOKMARKS_KEY = 'sauticheck_bookmarks';

export const bookmarks = {
  getAll(): Bookmark[] {
    const saved = localStorage.getItem(BOOKMARKS_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  add(article: {
    id: string;
    title: string;
    excerpt: string;
    source: string;
    category: string;
    imageUrl?: string;
  }): void {
    const existing = this.getAll();
    const bookmark: Bookmark = {
      ...article,
      articleId: article.id,
      savedAt: new Date().toISOString(),
    };
    
    // Avoid duplicates
    if (!existing.find(b => b.articleId === article.id)) {
      existing.push(bookmark);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(existing));
    }
  },

  remove(articleId: string): void {
    const existing = this.getAll();
    const filtered = existing.filter(b => b.articleId !== articleId);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
  },

  isBookmarked(articleId: string): boolean {
    return this.getAll().some(b => b.articleId === articleId);
  },

  toggle(article: {
    id: string;
    title: string;
    excerpt: string;
    source: string;
    category: string;
    imageUrl?: string;
  }): boolean {
    if (this.isBookmarked(article.id)) {
      this.remove(article.id);
      return false;
    } else {
      this.add(article);
      return true;
    }
  }
};
