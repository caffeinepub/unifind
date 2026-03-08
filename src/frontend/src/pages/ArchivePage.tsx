import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Archive, Calendar, Clock, MapPin } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetArchivedItems, useIsCallerAdmin } from "../hooks/useQueries";
import {
  categoryColorClass,
  categoryLabels,
  formatDate,
} from "../utils/format";

export default function ArchivePage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: archivedItems = [], isLoading } = useGetArchivedItems();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <Archive className="w-5 h-5 text-gray-500" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Item Archive
          </h1>
          <p className="text-muted-foreground text-sm">
            Unclaimed items archived after 45 days of inactivity
          </p>
        </div>
      </div>

      {/* Expiry Policy Banner */}
      <Card className="mb-6 border-gray-200 bg-gray-50">
        <CardContent className="p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700">Expiry Policy</p>
            <p className="text-xs text-gray-600 mt-0.5">
              Lost and found items that remain unclaimed for{" "}
              <strong>45 days</strong> are automatically moved to this archive.
              Admins can also manually trigger archiving. Archived items are
              kept for record-keeping purposes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Not admin: show policy-only view */}
      {!identity || !isAdmin ? (
        <div className="text-center py-16">
          <Archive className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">
            Admin Access Required
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            The archive is only accessible to university administrators.
            Students can browse active lost and found items on the main pages.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/lost">
              <Button variant="outline" data-ocid="archive.lost_link">
                Browse Lost Items
              </Button>
            </Link>
            <Link to="/found">
              <Button
                className="bg-primary hover:bg-primary/90 text-white"
                data-ocid="archive.found_link"
              >
                Browse Found Items
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Admin view: show archived items */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Loading…"
                : `${archivedItems.length} archived item${archivedItems.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : archivedItems.length === 0 ? (
            <div className="text-center py-16" data-ocid="archive.empty_state">
              <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">
                Archive is empty
              </h3>
              <p className="text-muted-foreground text-sm">
                No items have been archived yet. Items are archived after 45
                days.
              </p>
            </div>
          ) : (
            <div className="space-y-3" data-ocid="archive.list">
              {archivedItems.map((item, index) => (
                <Card
                  key={item.id}
                  className="border-border bg-white opacity-80 hover:opacity-100 transition-opacity"
                  data-ocid={`archive.item.${index + 1}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            to="/item/$id"
                            params={{ id: item.id }}
                            className="font-medium text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {item.title}
                          </Link>
                          <span
                            className={cn(
                              "px-2 py-0.5 text-xs font-semibold rounded-full border capitalize shrink-0",
                              item.itemType === "lost"
                                ? "type-lost"
                                : "type-found",
                            )}
                          >
                            {item.itemType}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs border",
                              categoryColorClass[item.category] ?? "cat-other",
                            )}
                          >
                            {categoryLabels[item.category] ?? item.category}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.date)}
                          </span>
                          {item.archivedAt && (
                            <span className="flex items-center gap-1 text-gray-400">
                              <Archive className="w-3 h-3" />
                              Archived: {formatDate(item.archivedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full border status-archived shrink-0">
                        Archived
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
