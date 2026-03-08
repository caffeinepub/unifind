import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQRCode } from "@/lib/qr-code";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  Gem,
  Headphones,
  Key,
  Laptop,
  MapPin,
  Package,
  Phone,
  Plus,
  QrCode,
  Shirt,
  ShoppingBag,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { Item } from "../backend.d";
import { Type__1 } from "../backend.d";
import ItemsGrid from "../components/ItemsGrid";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetMyItems } from "../hooks/useQueries";
import {
  categoryColorClass,
  categoryLabels,
  formatDate,
} from "../utils/format";

const categoryIcons: Record<
  Type__1,
  React.ComponentType<{ className?: string }>
> = {
  [Type__1.wallet]: Wallet,
  [Type__1.phone]: Phone,
  [Type__1.idCard]: CreditCard,
  [Type__1.books]: BookOpen,
  [Type__1.keys]: Key,
  [Type__1.laptop]: Laptop,
  [Type__1.bag]: ShoppingBag,
  [Type__1.clothing]: Shirt,
  [Type__1.jewelry]: Gem,
  [Type__1.earbuds]: Headphones,
  [Type__1.accessories]: Sparkles,
  [Type__1.other]: Package,
};

function QRCodeCanvas({ value }: { value: string }) {
  const { ref } = useQRCode({ value, options: { width: 140 } });
  return (
    <div className="flex flex-col items-center gap-1">
      <canvas ref={ref} className="rounded border border-border" />
      <p className="text-xs text-muted-foreground text-center font-mono break-all max-w-36">
        {value.length > 16 ? `${value.slice(0, 16)}…` : value}
      </p>
    </div>
  );
}

function FoundItemCard({ item, index }: { item: Item; index: number }) {
  const Icon = categoryIcons[item.category] ?? Package;
  const colorClass = categoryColorClass[item.category] ?? "cat-other";

  return (
    <Card
      className="border-border shadow-card overflow-hidden"
      data-ocid={`my_items.found.item.${index}`}
    >
      <div className="flex gap-0">
        {/* Left: item info */}
        <div className="flex-1 p-4">
          <div className="flex items-start gap-3 mb-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border shrink-0",
                colorClass,
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <Link
                to="/item/$id"
                params={{ id: item.id }}
                className="font-display font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
              >
                {item.title}
              </Link>
              <Badge
                variant="outline"
                className={cn("text-xs border mt-1", colorClass)}
              >
                {categoryLabels[item.category]}
              </Badge>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span>{formatDate(item.date)}</span>
            </div>
          </div>
          <div className="mt-3">
            <span
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-full border capitalize",
                {
                  active: "status-active",
                  pending: "status-pending",
                  resolved: "status-resolved",
                  rejected: "status-rejected",
                  archived: "status-archived",
                }[item.status] ?? "status-pending",
              )}
            >
              {item.status}
            </span>
          </div>
        </div>

        {/* Right: QR Code */}
        <div className="w-44 bg-muted/30 border-l border-border p-3 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 mb-2">
            <QrCode className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">
              Claim Code
            </span>
          </div>
          {item.qrClaimCode ? (
            <QRCodeCanvas value={item.qrClaimCode} />
          ) : (
            <div className="text-center">
              <div className="w-28 h-28 bg-muted rounded-lg border border-dashed border-border flex items-center justify-center mb-1.5">
                <QrCode className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-xs text-muted-foreground text-center leading-tight">
                QR code will be generated by admin when approved
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function MyItemsPage() {
  const { identity, login } = useInternetIdentity();
  const { data: items = [], isLoading } = useGetMyItems();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-display text-xl font-bold mb-2">
          Sign In Required
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Sign in to view and manage your reported items.
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

  const lostItems = items.filter((i) => i.itemType === "lost");
  const foundItems = items.filter((i) => i.itemType === "found");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              My Items
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your lost and found reports
            </p>
          </div>
        </div>
        <Link to="/report">
          <Button
            className="bg-primary hover:bg-primary/90 text-white gap-2"
            data-ocid="my_items.report_button"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Report</span>
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border-border shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-display font-bold text-foreground">
                {items.length}
              </div>
              <div className="text-xs text-muted-foreground">Total Reports</div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-display font-bold text-red-500">
                {lostItems.length}
              </div>
              <div className="text-xs text-muted-foreground">Lost</div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-display font-bold text-teal-600">
                {foundItems.length}
              </div>
              <div className="text-xs text-muted-foreground">Found</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status badges legend */}
      {!isLoading && items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 p-3 bg-muted rounded-lg">
          <span className="text-xs text-muted-foreground font-medium">
            Status:
          </span>
          {["active", "pending", "resolved", "rejected", "archived"].map(
            (s) => {
              const count = items.filter((i) => i.status === s).length;
              if (count === 0) return null;
              return (
                <Badge
                  key={s}
                  variant="outline"
                  className={`text-xs capitalize status-${s} border`}
                >
                  {s}: {count}
                </Badge>
              );
            },
          )}
        </div>
      )}

      {/* Found Items with QR codes */}
      {!isLoading && foundItems.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-display font-semibold text-foreground">
              Found Items
            </h2>
            <Badge variant="secondary">{foundItems.length}</Badge>
            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
              <QrCode className="w-3 h-3" />
              QR codes for claiming
            </span>
          </div>
          <div className="space-y-3">
            {foundItems.map((item, i) => (
              <FoundItemCard key={item.id} item={item} index={i + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Lost Items */}
      {!isLoading && lostItems.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-display font-semibold text-foreground">
              Lost Items
            </h2>
            <Badge variant="secondary">{lostItems.length}</Badge>
          </div>
          <ItemsGrid
            items={lostItems}
            isLoading={false}
            emptyMessage="No lost items"
            emptySubtext=""
          />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <ItemsGrid
          items={[]}
          isLoading={false}
          emptyMessage="No reports yet"
          emptySubtext="You haven't reported any lost or found items yet. Click 'New Report' to get started."
        />
      )}

      {/* Loading state */}
      {isLoading && (
        <ItemsGrid
          items={[]}
          isLoading={true}
          emptyMessage=""
          emptySubtext=""
        />
      )}
    </div>
  );
}
