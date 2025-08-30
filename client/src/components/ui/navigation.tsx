import { Link, useLocation } from "wouter";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();
  const user = auth.getUser();

  const handleLogout = () => {
    auth.logout();
    window.location.href = '/login';
  };

  if (!auth.isAuthenticated()) {
    return (
      <header className="gradient-bg shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <i className="fas fa-newspaper text-white text-xl"></i>
              </div>
              <div className="text-primary-foreground">
                <h1 className="text-xl font-bold">SautiCheck</h1>
                <p className="text-xs opacity-90">Civic News Platform</p>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link href="/login" data-testid="button-login">Login</Link>
              </Button>
              <Button asChild className="bg-secondary hover:bg-secondary/90">
                <Link href="/register" data-testid="button-register">Register</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="gradient-bg shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
              <i className="fas fa-newspaper text-white text-xl"></i>
            </div>
            <div className="text-primary-foreground">
              <h1 className="text-xl font-bold">SautiCheck</h1>
              <p className="text-xs opacity-90">Civic News Platform</p>
            </div>
          </Link>

          <nav className="desktop-nav hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`flex items-center space-x-2 transition-colors duration-200 font-medium ${
                location === '/' ? 'text-secondary' : 'text-primary-foreground hover:text-secondary'
              }`}
              data-testid="link-home"
            >
              <i className="fas fa-home"></i>
              <span>News Feed</span>
            </Link>
            <Link 
              href="/fact-check" 
              className={`flex items-center space-x-2 transition-colors duration-200 ${
                location === '/fact-check' ? 'text-secondary' : 'text-primary-foreground/80 hover:text-secondary'
              }`}
              data-testid="link-fact-check"
            >
              <i className="fas fa-search"></i>
              <span>Fact Check</span>
            </Link>
            <Link 
              href="/civic-alerts" 
              className={`flex items-center space-x-2 transition-colors duration-200 ${
                location === '/civic-alerts' ? 'text-secondary' : 'text-primary-foreground/80 hover:text-secondary'
              }`}
              data-testid="link-civic-alerts"
            >
              <i className="fas fa-bell"></i>
              <span>Civic Alerts</span>
            </Link>
            <Link 
              href="/jobs" 
              className={`flex items-center space-x-2 transition-colors duration-200 ${
                location === '/jobs' ? 'text-secondary' : 'text-primary-foreground/80 hover:text-secondary'
              }`}
              data-testid="link-jobs"
            >
              <i className="fas fa-briefcase"></i>
              <span>Jobs</span>
            </Link>
            <Link 
              href="/bookmarks" 
              className={`flex items-center space-x-2 transition-colors duration-200 ${
                location === '/bookmarks' ? 'text-secondary' : 'text-primary-foreground/80 hover:text-secondary'
              }`}
              data-testid="link-bookmarks"
            >
              <i className="fas fa-bookmark"></i>
              <span>Bookmarks</span>
            </Link>
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 text-primary-foreground hover:text-secondary transition-colors duration-200" data-testid="button-user-menu">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-secondary text-white text-sm font-semibold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block">{user?.firstName}</span>
                <i className="fas fa-chevron-down text-xs"></i>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center" data-testid="link-profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              {user?.role === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center" data-testid="link-admin">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
