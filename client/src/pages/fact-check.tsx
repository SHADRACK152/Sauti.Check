import { useQuery } from "@tanstack/react-query";
import { FactChecker } from "@/components/fact-checker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";
import { FactCheck } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function FactCheckPage() {
  const { data: factChecksData, isLoading } = useQuery<{ factChecks: FactCheck[] }>({
    queryKey: ['/api/fact-checks'],
    queryFn: async () => {
      const response = await fetch('/api/fact-checks', {
        headers: auth.getAuthHeaders(),
      });
      return response.json();
    },
    enabled: auth.isAuthenticated(),
  });

  const factChecks = factChecksData?.factChecks || [];

  const getResultColor = (result: string) => {
    switch (result) {
      case 'true': return 'bg-accent text-accent-foreground';
      case 'false': return 'bg-destructive text-destructive-foreground';
      case 'partly-true': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getResultText = (result: string) => {
    switch (result) {
      case 'true': return 'True';
      case 'false': return 'False';
      case 'partly-true': return 'Partly True';
      default: return 'Unverified';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AI-Powered Fact Checker</h1>
          <p className="text-muted-foreground">
            Verify news and claims using advanced AI analysis to combat misinformation
          </p>
        </div>

        {/* Fact Checker Widget */}
        <div className="mb-12">
          <FactChecker />
        </div>

        {/* Previous Fact Checks */}
        {auth.isAuthenticated() && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Previous Fact Checks</h2>
            
            {isLoading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            )}

            {!isLoading && factChecks.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <i className="fas fa-search text-4xl text-muted-foreground mb-4"></i>
                  <p className="text-muted-foreground">
                    You haven't performed any fact checks yet. Use the tool above to get started!
                  </p>
                </CardContent>
              </Card>
            )}

            {!isLoading && factChecks.length > 0 && (
              <div className="space-y-4">
                {factChecks.map((factCheck) => (
                  <Card key={factCheck.id} data-testid={`fact-check-${factCheck.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">
                            Fact Check Result
                          </CardTitle>
                          <div className="flex items-center space-x-3">
                            <Badge className={getResultColor(factCheck.result)} data-testid={`badge-result-${factCheck.result}`}>
                              {getResultText(factCheck.result)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {factCheck.confidence}% confidence
                            </span>
                            <span className="text-sm text-muted-foreground" data-testid={`text-time-${factCheck.id}`}>
                              {formatDistanceToNow(new Date(factCheck.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-1">Analyzed Text:</h4>
                          <p className="text-sm text-muted-foreground bg-muted rounded p-3" data-testid={`text-analyzed-${factCheck.id}`}>
                            {factCheck.text}
                          </p>
                        </div>
                        {factCheck.explanation && (
                          <div>
                            <h4 className="font-medium text-sm mb-1">Explanation:</h4>
                            <p className="text-sm text-muted-foreground" data-testid={`text-explanation-${factCheck.id}`}>
                              {factCheck.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {!auth.isAuthenticated() && (
          <Card>
            <CardContent className="py-8 text-center">
              <i className="fas fa-user-lock text-4xl text-muted-foreground mb-4"></i>
              <h3 className="text-lg font-semibold mb-2">Login Required</h3>
              <p className="text-muted-foreground mb-4">
                Please login to view your fact check history and save your results.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
