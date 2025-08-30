import { useQuery } from "@tanstack/react-query";
import { CivicAlert } from "@/components/civic-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CivicAlert as CivicAlertType } from "@shared/schema";

export default function CivicAlertsPage() {
  const { data: alertsData, isLoading } = useQuery<{ alerts: CivicAlertType[] }>({
    queryKey: ['/api/civic-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/civic-alerts?limit=50');
      return response.json();
    },
  });

  const alerts = alertsData?.alerts || [];

  const groupedAlerts = alerts.reduce((acc, alert) => {
    if (!acc[alert.category]) {
      acc[alert.category] = [];
    }
    acc[alert.category].push(alert);
    return acc;
  }, {} as Record<string, CivicAlertType[]>);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <i className="fas fa-bell text-secondary mr-3"></i>
            Civic Alerts
          </h1>
          <p className="text-muted-foreground">
            Stay updated with important civic announcements, deadlines, and public participation opportunities
          </p>
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && alerts.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-bell-slash text-6xl text-muted-foreground mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">No Active Alerts</h2>
            <p className="text-muted-foreground">
              There are currently no active civic alerts. Check back later for updates.
            </p>
          </div>
        )}

        {!isLoading && Object.keys(groupedAlerts).length > 0 && (
          <div className="space-y-8">
            {Object.entries(groupedAlerts).map(([category, categoryAlerts]) => (
              <div key={category}>
                <div className="flex items-center space-x-3 mb-4">
                  <Badge variant="outline" className="text-sm font-medium">
                    {category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {categoryAlerts.length} alert{categoryAlerts.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryAlerts.map((alert) => (
                    <CivicAlert key={alert.id} alert={alert} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Important Notice */}
        <div className="mt-12 bg-muted rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <i className="fas fa-info-circle text-primary text-xl mt-1"></i>
            <div>
              <h3 className="font-semibold mb-2">About Civic Alerts</h3>
              <p className="text-sm text-muted-foreground">
                These alerts are curated from official government sources and verified civic organizations. 
                They include important deadlines, public participation opportunities, and announcements that 
                affect Kenyan citizens. Always verify critical information through official channels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
