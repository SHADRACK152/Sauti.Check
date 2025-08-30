import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/ui/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileNav } from "@/components/ui/mobile-nav";
import { SautiChatbot } from "@/components/sauti-chatbot";
import { auth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import FactCheckPage from "@/pages/fact-check";
import CivicAlertsPage from "@/pages/civic-alerts";
import JobsPage from "@/pages/jobs";
import BookmarksPage from "@/pages/bookmarks";
import AdminDashboard from "@/pages/admin-dashboard";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [chatbotOpen, setChatbotOpen] = useState(false);

  return (
    <>
      <Navigation />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
      <MobileNav />
      <SautiChatbot isOpen={chatbotOpen} onToggle={() => setChatbotOpen(!chatbotOpen)} />
    </>
  );
}

function UnauthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        {children}
      </main>
    </>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!auth.isAuthenticated()) {
    return <Login />;
  }
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = auth.getUser();
  if (!auth.isAuthenticated()) {
    return <Login />;
  }
  if (user?.role !== 'admin') {
    return <NotFound />;
  }
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

function Router() {
  const isAuthenticated = auth.isAuthenticated();

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login">
        {isAuthenticated ? (
          <AuthenticatedLayout><Home /></AuthenticatedLayout>
        ) : (
          <UnauthenticatedLayout><Login /></UnauthenticatedLayout>
        )}
      </Route>
      
      <Route path="/register">
        {isAuthenticated ? (
          <AuthenticatedLayout><Home /></AuthenticatedLayout>
        ) : (
          <UnauthenticatedLayout><Register /></UnauthenticatedLayout>
        )}
      </Route>

      {/* Protected routes */}
      <Route path="/">
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Route>

      <Route path="/fact-check">
        <ProtectedRoute>
          <FactCheckPage />
        </ProtectedRoute>
      </Route>

      <Route path="/civic-alerts">
        <ProtectedRoute>
          <CivicAlertsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/jobs">
        <ProtectedRoute>
          <JobsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/bookmarks">
        <ProtectedRoute>
          <BookmarksPage />
        </ProtectedRoute>
      </Route>

      {/* Admin routes */}
      <Route path="/admin">
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
