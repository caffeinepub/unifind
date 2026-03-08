import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { Bell, CheckCircle, Clock, Package } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetNotifications,
  useMarkNotificationRead,
} from "../hooks/useQueries";
import { formatDateTime } from "../utils/format";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { data: notifications = [], isLoading } = useGetNotifications();
  const markRead = useMarkNotificationRead();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold mb-2">
          Sign In Required
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Sign in to view your notifications.
        </p>
        <Button
          onClick={login}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Sign In
        </Button>
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  const handleNotificationClick = async (
    notifId: string,
    itemId: string,
    isRead: boolean,
  ) => {
    if (!isRead) {
      await markRead.mutateAsync(notifId);
    }
    navigate({ to: "/item/$id", params: { id: itemId } });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
            {unread.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-xs text-white flex items-center justify-center font-bold">
                {unread.length}
              </span>
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Notifications
            </h1>
            <p className="text-muted-foreground text-sm">
              {unread.length > 0
                ? `${unread.length} unread notification${unread.length > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-border p-4 flex gap-3"
            >
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div
          data-ocid="notifications.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Bell className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-display font-semibold text-lg text-foreground mb-2">
            No notifications yet
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            You'll be notified when someone posts a matching item for your
            reports.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Unread */}
          {unread.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-foreground">New</h2>
                <Badge className="bg-primary text-white text-xs h-5 px-1.5 border-0">
                  {unread.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {unread.map((notif, index) => (
                  <button
                    type="button"
                    key={notif.id}
                    onClick={() =>
                      handleNotificationClick(
                        notif.id,
                        notif.itemId,
                        notif.isRead,
                      )
                    }
                    className={cn(
                      "w-full text-left bg-primary/5 border border-primary/20 rounded-xl p-4 hover:bg-primary/10 transition-colors",
                    )}
                    data-ocid={`notifications.item.${index + 1}`}
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-snug">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(notif.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1 shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Read */}
          {read.length > 0 && (
            <div>
              {unread.length > 0 && (
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Earlier
                </h2>
              )}
              <div className="space-y-2">
                {read.map((notif, index) => (
                  <button
                    type="button"
                    key={notif.id}
                    onClick={() =>
                      handleNotificationClick(
                        notif.id,
                        notif.itemId,
                        notif.isRead,
                      )
                    }
                    className="w-full text-left bg-white border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors opacity-70 hover:opacity-100"
                    data-ocid={`notifications.item.${unread.length + index + 1}`}
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-snug">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(notif.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
