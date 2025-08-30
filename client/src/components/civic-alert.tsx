import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CivicAlert as CivicAlertType } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface CivicAlertProps {
  alert: CivicAlertType;
}

export function CivicAlert({ alert }: CivicAlertProps) {
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'border-destructive';
      case 'warning': return 'border-secondary';
      case 'info': return 'border-primary';
      default: return 'border-muted';
    }
  };

  const getButtonColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
      case 'warning': return 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
      case 'info': return 'bg-primary text-primary-foreground hover:bg-primary/90';
      default: return 'bg-muted text-muted-foreground hover:bg-muted/90';
    }
  };

  return (
    <div 
      className={`bg-card rounded-lg p-4 border-l-4 ${getAlertColor(alert.type)}`}
      data-testid={`alert-${alert.id}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm" data-testid={`text-alert-title-${alert.id}`}>
          {alert.title}
        </h4>
        <span className="text-xs text-muted-foreground" data-testid={`text-alert-time-${alert.id}`}>
          {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-3" data-testid={`text-alert-message-${alert.id}`}>
        {alert.message}
      </p>
      {alert.actionText && (
        <Button 
          size="sm"
          className={`text-xs px-3 py-1 rounded-full ${getButtonColor(alert.type)}`}
          data-testid={`button-alert-action-${alert.id}`}
        >
          {alert.actionText}
        </Button>
      )}
    </div>
  );
}
