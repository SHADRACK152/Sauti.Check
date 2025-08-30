import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NewsCard } from "@/components/news-card";
import { CivicAlert } from "@/components/civic-alert";
import { FactChecker } from "@/components/fact-checker";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Article, CivicAlert as CivicAlertType } from "@shared/schema";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: articlesData, isLoading: articlesLoading } = useQuery<{ articles: Article[] }>({
    queryKey: ['/api/articles', selectedCategory || 'all'],
    queryFn: async () => {
      const params = selectedCategory ? `?category=${selectedCategory}` : '';
      const response = await fetch(`/api/articles${params}`);
      return response.json();
    },
  });

  const { data: alertsData, isLoading: alertsLoading } = useQuery<{ alerts: CivicAlertType[] }>({
    queryKey: ['/api/civic-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/civic-alerts?limit=3');
      return response.json();
    },
  });

  const articles = articlesData?.articles || [];
  const alerts = alertsData?.alerts || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Stay Informed, Stay Engaged</h1>
          <p className="text-xl opacity-90 mb-6">Your trusted source for verified civic news and information</p>
          
          {/* Fact Check Widget */}
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <FactChecker />
          </div>
        </div>
      </section>

      {/* News Feed */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Latest Civic News</h2>
            <div className="flex items-center space-x-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40" data-testid="select-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="Politics">Politics</SelectItem>
                  <SelectItem value="Economy">Economy</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Articles Loading State */}
          {articlesLoading && (
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-lg" />
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            </div>
          )}

          {/* Articles */}
          {!articlesLoading && articles.length > 0 && (
            <>
              {/* Featured Article */}
              <NewsCard article={articles[0]} variant="featured" />

              {/* Regular Articles Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {articles.slice(1).map((article) => (
                  <NewsCard key={article.id} article={article} variant="regular" />
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-8">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-load-more">
                  Load More Articles
                </Button>
              </div>
            </>
          )}

          {!articlesLoading && articles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found for the selected category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Civic Alerts Section */}
      <section className="bg-muted py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              <i className="fas fa-bell text-secondary mr-2"></i>
              Civic Alerts
            </h2>
            <Button variant="outline" data-testid="button-view-all-alerts">
              View All →
            </Button>
          </div>

          {alertsLoading && (
            <div className="grid md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          )}

          {!alertsLoading && (
            <div className="grid md:grid-cols-3 gap-4">
              {alerts.map((alert) => (
                <CivicAlert key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Floating Action Button */}
      <Button 
        className="floating-action fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-accent text-accent-foreground rounded-full hover:bg-accent/90 z-30 p-0"
        data-testid="button-floating-fact-check"
      >
        <i className="fas fa-shield-alt text-xl"></i>
      </Button>
    </div>
  );
}
