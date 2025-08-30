import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { bookmarks, type Bookmark } from "@/lib/bookmarks";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function BookmarksPage() {
  const [savedBookmarks, setSavedBookmarks] = useState<Bookmark[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setSavedBookmarks(bookmarks.getAll());
  }, []);

  const handleRemoveBookmark = (articleId: string, title: string) => {
    bookmarks.remove(articleId);
    setSavedBookmarks(bookmarks.getAll());
    
    toast({
      title: "Bookmark removed",
      description: `"${title}" has been removed from your bookmarks`,
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <i className="fas fa-bookmark text-secondary mr-3"></i>
            Your Bookmarks
          </h1>
          <p className="text-muted-foreground">
            Keep track of articles you want to read later
          </p>
        </div>

        {savedBookmarks.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-bookmark text-6xl text-muted-foreground mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">No Bookmarks Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start bookmarking articles you find interesting to access them later
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/" data-testid="button-browse-articles">
                <i className="fas fa-newspaper mr-2"></i>
                Browse Articles
              </Link>
            </Button>
          </div>
        )}

        {savedBookmarks.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {savedBookmarks.length} bookmark{savedBookmarks.length !== 1 ? 's' : ''} saved
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  savedBookmarks.forEach(bookmark => bookmarks.remove(bookmark.articleId));
                  setSavedBookmarks([]);
                  toast({
                    title: "All bookmarks cleared",
                    description: "All your bookmarks have been removed",
                  });
                }}
                data-testid="button-clear-all"
              >
                <i className="fas fa-trash mr-2"></i>
                Clear All
              </Button>
            </div>

            <div className="space-y-4">
              {savedBookmarks.map((bookmark) => (
                <Card key={bookmark.id} className="hover:shadow-md transition-shadow duration-200" data-testid={`bookmark-${bookmark.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {bookmark.imageUrl && (
                        <img 
                          src={bookmark.imageUrl} 
                          alt={bookmark.title}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={`${getCategoryColor(bookmark.category)} text-xs`}>
                            {bookmark.category}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveBookmark(bookmark.articleId, bookmark.title)}
                            className="text-muted-foreground hover:text-destructive transition-colors duration-200 p-0"
                            data-testid={`button-remove-${bookmark.id}`}
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        </div>
                        
                        <Link href={`/article/${bookmark.articleId}`}>
                          <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors duration-200 cursor-pointer" data-testid={`text-bookmark-title-${bookmark.id}`}>
                            {bookmark.title}
                          </h3>
                        </Link>
                        
                        <p className="text-muted-foreground text-sm mb-3" data-testid={`text-bookmark-excerpt-${bookmark.id}`}>
                          {bookmark.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-3">
                            <span data-testid={`text-bookmark-source-${bookmark.id}`}>
                              {bookmark.source}
                            </span>
                            <span>•</span>
                            <span data-testid={`text-bookmark-saved-${bookmark.id}`}>
                              Saved {formatDistanceToNow(new Date(bookmark.savedAt), { addSuffix: true })}
                            </span>
                          </div>
                          <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                            <Link href={`/article/${bookmark.articleId}`} data-testid={`link-read-article-${bookmark.id}`}>
                              Read Article →
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
