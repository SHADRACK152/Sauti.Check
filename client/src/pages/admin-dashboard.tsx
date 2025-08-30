import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { auth } from "@/lib/auth";
import { insertArticleSchema, insertCivicAlertSchema, insertJobSchema } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";

// Form schemas
const articleFormSchema = insertArticleSchema.extend({
  publishedAt: z.string().optional(),
});

const alertFormSchema = insertCivicAlertSchema;

const jobFormSchema = insertJobSchema.extend({
  expiresAt: z.string().optional(),
});

type ArticleFormData = z.infer<typeof articleFormSchema>;
type AlertFormData = z.infer<typeof alertFormSchema>;
type JobFormData = z.infer<typeof jobFormSchema>;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Forms
  const articleForm = useForm<ArticleFormData>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      category: "",
      source: "",
      author: "",
      imageUrl: "",
      verified: true,
    },
  });

  const alertForm = useForm<AlertFormData>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "info",
      category: "",
      actionText: "",
      actionUrl: "",
      isActive: true,
    },
  });

  const jobForm = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      type: "full-time",
      description: "",
      requirements: "",
      salary: "",
      applicationUrl: "",
    },
  });

  // Queries
  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ['/api/articles'],
    queryFn: async () => {
      const response = await fetch('/api/articles?limit=50', {
        headers: auth.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/civic-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/civic-alerts?limit=50', {
        headers: auth.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/jobs'],
    queryFn: async () => {
      const response = await fetch('/api/jobs?limit=50', {
        headers: auth.getAuthHeaders(),
      });
      return response.json();
    },
  });

  // Mutations
  const createArticleMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      const response = await apiRequest("POST", "/api/admin/articles", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      articleForm.reset();
      toast({
        title: "Article created",
        description: "The article has been published successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create article",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: async (data: AlertFormData) => {
      const response = await apiRequest("POST", "/api/admin/civic-alerts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/civic-alerts'] });
      alertForm.reset();
      toast({
        title: "Alert created",
        description: "The civic alert has been published successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      const response = await apiRequest("POST", "/api/admin/jobs", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      jobForm.reset();
      toast({
        title: "Job created",
        description: "The job posting has been published successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const articles = articlesData?.articles || [];
  const alerts = alertsData?.alerts || [];
  const jobs = jobsData?.jobs || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <i className="fas fa-cog text-primary mr-3"></i>
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage content, monitor activity, and oversee platform operations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="articles" data-testid="tab-articles">Articles</TabsTrigger>
            <TabsTrigger value="alerts" data-testid="tab-alerts">Civic Alerts</TabsTrigger>
            <TabsTrigger value="jobs" data-testid="tab-jobs">Jobs</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                  <i className="fas fa-newspaper text-primary"></i>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-articles">
                    {articles.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active news articles
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                  <i className="fas fa-bell text-secondary"></i>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-alerts">
                    {alerts.filter(alert => alert.isActive).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Published civic alerts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Job Listings</CardTitle>
                  <i className="fas fa-briefcase text-accent"></i>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-jobs">
                    {jobs.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Available opportunities
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  {articlesLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {articles.slice(0, 5).map((article: any) => (
                        <div key={article.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium truncate">{article.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                            </p>
                          </div>
                          <Badge variant={article.verified ? "default" : "secondary"}>
                            {article.verified ? "Verified" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Content Management</span>
                      <Badge className="bg-accent text-accent-foreground">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Fact Checker AI</span>
                      <Badge className="bg-accent text-accent-foreground">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">User Authentication</span>
                      <Badge className="bg-accent text-accent-foreground">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Data Storage</span>
                      <Badge className="bg-accent text-accent-foreground">Operational</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Article</CardTitle>
                  <CardDescription>
                    Publish verified news articles for the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...articleForm}>
                    <form onSubmit={articleForm.handleSubmit((data) => createArticleMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={articleForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter article title" {...field} data-testid="input-article-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={articleForm.control}
                        name="excerpt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Excerpt</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Brief summary of the article" {...field} data-testid="textarea-article-excerpt" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={articleForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Full article content" 
                                className="min-h-[120px]" 
                                {...field} 
                                data-testid="textarea-article-content"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={articleForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-article-category">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Politics">Politics</SelectItem>
                                  <SelectItem value="Economy">Economy</SelectItem>
                                  <SelectItem value="Education">Education</SelectItem>
                                  <SelectItem value="Health">Health</SelectItem>
                                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={articleForm.control}
                          name="source"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Source</FormLabel>
                              <FormControl>
                                <Input placeholder="News source" {...field} data-testid="input-article-source" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={articleForm.control}
                          name="author"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Author</FormLabel>
                              <FormControl>
                                <Input placeholder="Article author" {...field} data-testid="input-article-author" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={articleForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://example.com/image.jpg" {...field} data-testid="input-article-image" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={createArticleMutation.isPending}
                        data-testid="button-create-article"
                      >
                        {createArticleMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Publishing...
                          </>
                        ) : (
                          "Publish Article"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  {articlesLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {articles.map((article: any) => (
                        <div key={article.id} className="border rounded-lg p-3">
                          <h4 className="font-medium text-sm mb-1">{article.title}</h4>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{article.category} • {article.source}</span>
                            <Badge variant={article.verified ? "default" : "secondary"}>
                              {article.verified ? "Verified" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Civic Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Civic Alert</CardTitle>
                  <CardDescription>
                    Publish important civic announcements and deadlines
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...alertForm}>
                    <form onSubmit={alertForm.handleSubmit((data) => createAlertMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={alertForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Alert title" {...field} data-testid="input-alert-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={alertForm.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Alert message" {...field} data-testid="textarea-alert-message" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={alertForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alert Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-alert-type">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="info">Info</SelectItem>
                                  <SelectItem value="warning">Warning</SelectItem>
                                  <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={alertForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Input placeholder="Alert category" {...field} data-testid="input-alert-category" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={alertForm.control}
                          name="actionText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Action Text</FormLabel>
                              <FormControl>
                                <Input placeholder="Learn More" {...field} data-testid="input-alert-action-text" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={alertForm.control}
                          name="actionUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Action URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://example.com" {...field} data-testid="input-alert-action-url" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-secondary hover:bg-secondary/90"
                        disabled={createAlertMutation.isPending}
                        data-testid="button-create-alert"
                      >
                        {createAlertMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Publishing...
                          </>
                        ) : (
                          "Publish Alert"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  {alertsLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {alerts.filter((alert: any) => alert.isActive).map((alert: any) => (
                        <div key={alert.id} className="border rounded-lg p-3">
                          <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{alert.message}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span>{alert.category}</span>
                            <Badge variant={alert.type === 'urgent' ? 'destructive' : 'default'}>
                              {alert.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Post New Job</CardTitle>
                  <CardDescription>
                    Add employment opportunities for platform users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...jobForm}>
                    <form onSubmit={jobForm.handleSubmit((data) => createJobMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={jobForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Software Developer" {...field} data-testid="input-job-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={jobForm.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input placeholder="Company name" {...field} data-testid="input-job-company" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={jobForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Nairobi, Kenya" {...field} data-testid="input-job-location" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={jobForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-job-type">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="full-time">Full Time</SelectItem>
                                  <SelectItem value="part-time">Part Time</SelectItem>
                                  <SelectItem value="contract">Contract</SelectItem>
                                  <SelectItem value="internship">Internship</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={jobForm.control}
                          name="salary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Salary Range</FormLabel>
                              <FormControl>
                                <Input placeholder="KSh 80,000 - 120,000" {...field} data-testid="input-job-salary" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={jobForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Job description" {...field} data-testid="textarea-job-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={jobForm.control}
                        name="requirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Requirements</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Job requirements" {...field} data-testid="textarea-job-requirements" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={jobForm.control}
                        name="applicationUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Application URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://company.com/apply" {...field} data-testid="input-job-application-url" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-accent hover:bg-accent/90"
                        disabled={createJobMutation.isPending}
                        data-testid="button-create-job"
                      >
                        {createJobMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Publishing...
                          </>
                        ) : (
                          "Post Job"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Job Postings</CardTitle>
                </CardHeader>
                <CardContent>
                  {jobsLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {jobs.map((job: any) => (
                        <div key={job.id} className="border rounded-lg p-3">
                          <h4 className="font-medium text-sm mb-1">{job.title}</h4>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{job.company} • {job.location}</span>
                            <Badge>{job.type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Platform Usage</CardTitle>
                  <i className="fas fa-users text-primary"></i>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Active</div>
                  <p className="text-xs text-muted-foreground">
                    Users engaging with content
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fact Checks</CardTitle>
                  <i className="fas fa-shield-alt text-accent"></i>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Operational</div>
                  <p className="text-xs text-muted-foreground">
                    AI verification system
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Content Quality</CardTitle>
                  <i className="fas fa-check-circle text-accent"></i>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Verified</div>
                  <p className="text-xs text-muted-foreground">
                    Articles are fact-checked
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <i className="fas fa-heartbeat text-accent"></i>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">100%</div>
                  <p className="text-xs text-muted-foreground">
                    All systems operational
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
                <CardDescription>
                  Overview of platform activity and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Content Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Articles</span>
                        <span className="font-medium">{articles.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Verified Articles</span>
                        <span className="font-medium">{articles.filter((a: any) => a.verified).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Active Alerts</span>
                        <span className="font-medium">{alerts.filter((a: any) => a.isActive).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Job Postings</span>
                        <span className="font-medium">{jobs.length}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">System Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">API Status</span>
                        <Badge className="bg-accent text-accent-foreground">Online</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Database</span>
                        <Badge className="bg-accent text-accent-foreground">Connected</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Authentication</span>
                        <Badge className="bg-accent text-accent-foreground">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Fact Checker</span>
                        <Badge className="bg-accent text-accent-foreground">Ready</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
