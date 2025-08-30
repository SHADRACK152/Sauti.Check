import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Job } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function JobsPage() {
  const [selectedType, setSelectedType] = useState<string>("");

  const { data: jobsData, isLoading } = useQuery<{ jobs: Job[] }>({
    queryKey: ['/api/jobs', selectedType || 'all'],
    queryFn: async () => {
      const params = selectedType ? `?type=${selectedType}` : '';
      const response = await fetch(`/api/jobs${params}`);
      return response.json();
    },
  });

  const jobs = jobsData?.jobs || [];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-accent text-accent-foreground';
      case 'part-time': return 'bg-secondary text-secondary-foreground';
      case 'contract': return 'bg-primary text-primary-foreground';
      case 'internship': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <i className="fas fa-briefcase text-primary mr-3"></i>
            Jobs Hub
          </h1>
          <p className="text-muted-foreground">
            Discover employment opportunities from trusted organizations across Kenya
          </p>
        </div>

        {/* Filter Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Filter by type:</span>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40" data-testid="select-job-type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="full-time">Full Time</SelectItem>
                <SelectItem value="part-time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && jobs.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-search text-6xl text-muted-foreground mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">No Jobs Found</h2>
            <p className="text-muted-foreground">
              {selectedType 
                ? `No ${formatType(selectedType).toLowerCase()} positions available at the moment.`
                : "No job opportunities available at the moment. Check back later for updates."
              }
            </p>
          </div>
        )}

        {!isLoading && jobs.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200" data-testid={`job-card-${job.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2" data-testid={`text-job-title-${job.id}`}>
                        {job.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <i className="fas fa-building"></i>
                        <span data-testid={`text-job-company-${job.id}`}>{job.company}</span>
                        <span>•</span>
                        <i className="fas fa-map-marker-alt"></i>
                        <span data-testid={`text-job-location-${job.id}`}>{job.location}</span>
                      </div>
                    </div>
                    <Badge className={getTypeColor(job.type)} data-testid={`badge-job-type-${job.type}`}>
                      {formatType(job.type)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground" data-testid={`text-job-description-${job.id}`}>
                      {job.description}
                    </p>
                    
                    {job.salary && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Salary Range</h4>
                        <p className="text-sm text-accent font-medium" data-testid={`text-job-salary-${job.id}`}>
                          {job.salary}
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-sm mb-2">Key Requirements</h4>
                      <p className="text-sm text-muted-foreground" data-testid={`text-job-requirements-${job.id}`}>
                        {job.requirements}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <span className="text-xs text-muted-foreground" data-testid={`text-job-posted-${job.id}`}>
                        Posted {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
                      </span>
                      <Button 
                        className="bg-primary hover:bg-primary/90"
                        data-testid={`button-apply-${job.id}`}
                      >
                        <i className="fas fa-external-link-alt mr-2"></i>
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-muted rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <i className="fas fa-info-circle text-primary text-xl mt-1"></i>
            <div>
              <h3 className="font-semibold mb-2">About Our Jobs Hub</h3>
              <p className="text-sm text-muted-foreground">
                We partner with verified organizations and government agencies to bring you legitimate 
                employment opportunities. All job postings are screened for authenticity. Always be 
                cautious of job scams and verify employer details independently before sharing personal information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
