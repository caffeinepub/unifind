import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Calendar,
  CreditCard,
  Gem,
  Headphones,
  Key,
  Laptop,
  MapPin,
  Package,
  Phone,
  Shirt,
  ShoppingBag,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { Item } from "../backend.d";
import { Type__1 } from "../backend.d";
import {
  categoryColorClass,
  categoryLabels,
  formatDate,
  truncate,
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

interface ItemCardProps {
  item: Item;
  index?: number;
}

export default function ItemCard({ item, index }: ItemCardProps) {
  const Icon = categoryIcons[item.category] ?? Package;
  const colorClass = categoryColorClass[item.category] ?? "cat-other";

  const statusClass =
    {
      active: "status-active",
      pending: "status-pending",
      resolved: "status-resolved",
      rejected: "status-rejected",
      archived: "status-archived",
    }[item.status] ?? "status-pending";

  const typeClass = item.itemType === "lost" ? "type-lost" : "type-found";
  const ocid = index ? `items_list.item.${index}` : undefined;

  return (
    <Card
      className="group overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-border bg-white cursor-pointer"
      data-ocid={ocid}
    >
      {/* Photo or placeholder */}
      <div className="relative h-40 bg-gradient-to-br from-muted to-secondary overflow-hidden">
        {item.photoId ? (
          <img
            src={`/api/photo/${item.photoId}`}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center border",
                colorClass,
              )}
            >
              <Icon className="w-8 h-8" />
            </div>
          </div>
        )}
        {/* Type badge overlay */}
        <div className="absolute top-2 left-2">
          <span
            className={cn(
              "px-2 py-0.5 text-xs font-semibold rounded-full border capitalize",
              typeClass,
            )}
          >
            {item.itemType}
          </span>
        </div>
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <span
            className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full border capitalize",
              statusClass,
            )}
          >
            {item.status}
          </span>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Category badge */}
        <div className="mb-2">
          <Badge variant="outline" className={cn("text-xs border", colorClass)}>
            <Icon className="w-3 h-3 mr-1" />
            {categoryLabels[item.category]}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-sm text-foreground mb-1 line-clamp-1">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {truncate(item.description, 100)}
        </p>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="truncate">
              {item.location || "Location not specified"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span>{formatDate(item.date)}</span>
          </div>
        </div>

        <Link to="/item/$id" params={{ id: item.id }}>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs hover:bg-primary hover:text-white hover:border-primary transition-colors"
          >
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
