import { Link, useLocation } from "wouter";
import { auth } from "@/lib/auth";

export function MobileNav() {
  const [location] = useLocation();

  if (!auth.isAuthenticated()) {
    return null;
  }

  return (
    <nav className="mobile-nav fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-40">
      <div className="grid grid-cols-5 h-16">
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center transition-colors duration-200 ${
            location === '/' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
          }`}
          data-testid="mobile-link-home"
        >
          <i className="fas fa-home text-lg"></i>
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link 
          href="/fact-check" 
          className={`flex flex-col items-center justify-center transition-colors duration-200 ${
            location === '/fact-check' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
          }`}
          data-testid="mobile-link-fact-check"
        >
          <i className="fas fa-search text-lg"></i>
          <span className="text-xs mt-1">Check</span>
        </Link>
        <Link 
          href="/civic-alerts" 
          className={`flex flex-col items-center justify-center transition-colors duration-200 ${
            location === '/civic-alerts' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
          }`}
          data-testid="mobile-link-alerts"
        >
          <i className="fas fa-bell text-lg"></i>
          <span className="text-xs mt-1">Alerts</span>
        </Link>
        <Link 
          href="/jobs" 
          className={`flex flex-col items-center justify-center transition-colors duration-200 ${
            location === '/jobs' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
          }`}
          data-testid="mobile-link-jobs"
        >
          <i className="fas fa-briefcase text-lg"></i>
          <span className="text-xs mt-1">Jobs</span>
        </Link>
        <Link 
          href="/bookmarks" 
          className={`flex flex-col items-center justify-center transition-colors duration-200 ${
            location === '/bookmarks' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
          }`}
          data-testid="mobile-link-bookmarks"
        >
          <i className="fas fa-bookmark text-lg"></i>
          <span className="text-xs mt-1">Saved</span>
        </Link>
      </div>
    </nav>
  );
}
