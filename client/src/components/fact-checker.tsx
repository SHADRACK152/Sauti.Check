import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { auth } from "@/lib/auth";
import { FactCheckRequest } from "@shared/schema";

interface FactCheckResult {
  result: string;
  confidence: number;
  explanation: string;
  text: string;
}

export function FactChecker() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const { toast } = useToast();

  const factCheckMutation = useMutation({
    mutationFn: async (data: FactCheckRequest) => {
      const response = await apiRequest("POST", "/api/fact-check", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data.factCheck);
      toast({
        title: "Fact check completed",
        description: "Your text has been analyzed for accuracy.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fact check failed",
        description: error.message || "Failed to analyze the text",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast({
        title: "Text required",
        description: "Please enter some text to fact-check",
        variant: "destructive",
      });
      return;
    }

    if (!auth.isAuthenticated()) {
      toast({
        title: "Login required",
        description: "Please login to use the fact checker",
        variant: "destructive",
      });
      return;
    }

    factCheckMutation.mutate({ text });
  };

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
      case 'true': return 'Likely True';
      case 'false': return 'Likely False';
      case 'partly-true': return 'Partly True';
      default: return 'Unverified';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="fas fa-shield-alt text-accent mr-2"></i>
          AI Fact Checker
        </CardTitle>
        <CardDescription>
          Enter news, claims, or statements to verify their accuracy using AI analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="Paste news article, claim, or statement to verify..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[120px]"
              data-testid="textarea-fact-check"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={factCheckMutation.isPending}
            data-testid="button-fact-check-submit"
          >
            {factCheckMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Analyzing...
              </>
            ) : (
              <>
                <i className="fas fa-search mr-2"></i>
                Verify Claim
              </>
            )}
          </Button>
        </form>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Analysis Result</h3>
              <Badge className={getResultColor(result.result)} data-testid="badge-fact-check-result">
                {getResultText(result.result)}
              </Badge>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Confidence Score</span>
                <span className="text-sm font-bold" data-testid="text-confidence-score">
                  {result.confidence}%
                </span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${result.confidence}%` }}
                ></div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Explanation</h4>
              <p className="text-sm text-muted-foreground" data-testid="text-fact-check-explanation">
                {result.explanation}
              </p>
            </div>

            <div className="text-xs text-muted-foreground bg-muted rounded p-3">
              <p><strong>Disclaimer:</strong> This analysis is generated by AI and should be used as a starting point for fact-checking. Always verify important information with authoritative sources.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
