import { useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { bookmarks } from "@/lib/bookmarks";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Article } from "@shared/schema";

interface NewsCardProps {
  article: Article;
  variant?: "featured" | "regular";
}

export function NewsCard({ article, variant = "regular" }: NewsCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(bookmarks.isBookmarked(article.id));
  const { toast } = useToast();

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wasBookmarked = bookmarks.toggle(article);
    setIsBookmarked(wasBookmarked);
    
    toast({
      title: wasBookmarked ? "Article bookmarked" : "Bookmark removed",
      description: wasBookmarked 
        ? "Article has been saved to your bookmarks" 
        : "Article has been removed from your bookmarks",
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'politics': return 'bg-primary/10 text-primary';
      case 'economy': return 'bg-secondary/10 text-secondary';
      case 'education': return 'bg-accent/10 text-accent';
      case 'health': return 'bg-destructive/10 text-destructive';
      case 'infrastructure': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (variant === "featured") {
    return (
      <article className="news-card bg-card rounded-lg shadow-md overflow-hidden mb-6 cursor-pointer" data-testid={`article-featured-${article.id}`}>
        <Link href={`/article/${article.id}`}>
          {article.imageUrl && (
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Badge className={getCategoryColor(article.category)} data-testid={`badge-category-${article.category.toLowerCase()}`}>
                {article.category}
              </Badge>
              <div className="flex items-center space-x-4">
                {article.verified && (
                  <span className="text-accent text-sm font-medium" data-testid="text-verified">
                    <i className="fas fa-check-circle mr-1"></i>Verified
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className="text-muted-foreground hover:text-secondary transition-colors duration-200 p-0"
                  data-testid={`button-bookmark-${article.id}`}
                >
                  <i className={isBookmarked ? "fas fa-bookmark" : "far fa-bookmark"}></i>
                </Button>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors duration-200" data-testid={`text-title-${article.id}`}>
              {article.title}
            </h3>
            <p className="text-muted-foreground mb-4" data-testid={`text-excerpt-${article.id}`}>
              {article.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground" data-testid={`text-source-${article.id}`}>
                  {article.source}
                </span>
                <span className="text-sm text-muted-foreground" data-testid={`text-time-${article.id}`}>
                  {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                </span>
              </div>
              <span className="text-primary hover:text-primary/80 font-medium">Read More →</span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="news-card bg-card rounded-lg shadow-md overflow-hidden cursor-pointer" data-testid={`article-regular-${article.id}`}>
      <Link href={`/article/${article.id}`}>
        {article.imageUrl && (
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-32 object-cover"
          />
        )}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge className={`${getCategoryColor(article.category)} text-xs`} data-testid={`badge-category-${article.category.toLowerCase()}`}>
              {article.category}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className="text-muted-foreground hover:text-secondary transition-colors duration-200 p-0"
              data-testid={`button-bookmark-${article.id}`}
            >
              <i className={isBookmarked ? "fas fa-bookmark" : "far fa-bookmark"}></i>
            </Button>
          </div>
          <h4 className="font-semibold mb-2 hover:text-primary transition-colors duration-200" data-testid={`text-title-${article.id}`}>
            {article.title}
          </h4>
          <p className="text-sm text-muted-foreground mb-3" data-testid={`text-excerpt-${article.id}`}>
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground" data-testid={`text-source-${article.id}`}>
              {article.source}
            </span>
            <span className="text-muted-foreground" data-testid={`text-time-${article.id}`}>
              {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
