import { Link, useLocation } from "wouter";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Sidebar() {
  const [location] = useLocation();
  const user = auth.getUser();

  if (!auth.isAuthenticated() || !user) {
    return null;
  }

  return (
    <aside className="desktop-nav hidden lg:block w-64 bg-card border-r border-border">
      <div className="p-6">
        {/* User Profile Section */}
        <div className="bg-muted rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold" data-testid="text-user-name">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-user-location">
                {user.location}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-primary" data-testid="text-articles-read">
                {user.articlesRead}
              </p>
              <p className="text-xs text-muted-foreground">Articles</p>
            </div>
            <div>
              <p className="text-lg font-bold text-accent" data-testid="text-facts-checked">
                {user.factsChecked}
              </p>
              <p className="text-xs text-muted-foreground">Fact Checks</p>
            </div>
            <div>
              <p className="text-lg font-bold text-secondary" data-testid="text-bookmarks-count">
                {user.bookmarksCount}
              </p>
              <p className="text-xs text-muted-foreground">Bookmarks</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Quick Actions</h4>
          <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 justify-start">
            <Link href="/fact-check" data-testid="button-quick-fact-check">
              <i className="fas fa-search mr-3"></i>
              Fact Check News
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" data-testid="button-report-misinformation">
            <i className="fas fa-plus mr-3"></i>
            Report Misinformation
          </Button>
        </div>

        {/* Categories */}
        <div className="mt-6">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Categories</h4>
          <div className="space-y-1">
            <Link 
              href="/?category=Politics" 
              className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors duration-200"
              data-testid="link-category-politics"
            >
              <i className="fas fa-landmark mr-3 text-primary"></i>Politics
            </Link>
            <Link 
              href="/?category=Economy" 
              className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors duration-200"
              data-testid="link-category-economy"
            >
              <i className="fas fa-chart-line mr-3 text-accent"></i>Economy
            </Link>
            <Link 
              href="/?category=Education" 
              className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors duration-200"
              data-testid="link-category-education"
            >
              <i className="fas fa-graduation-cap mr-3 text-secondary"></i>Education
            </Link>
            <Link 
              href="/?category=Health" 
              className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors duration-200"
              data-testid="link-category-health"
            >
              <i className="fas fa-heartbeat mr-3 text-destructive"></i>Health
            </Link>
            <Link 
              href="/?category=Infrastructure" 
              className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors duration-200"
              data-testid="link-category-infrastructure"
            >
              <i className="fas fa-building mr-3 text-muted-foreground"></i>Infrastructure
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
