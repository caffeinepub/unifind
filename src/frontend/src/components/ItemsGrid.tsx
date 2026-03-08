import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";
import type { Item } from "../backend.d";
import ItemCard from "./ItemCard";

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"];

interface ItemsGridProps {
  items: Item[];
  isLoading: boolean;
  emptyMessage?: string;
  emptySubtext?: string;
}

function ItemCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-white shadow-card">
      <Skeleton className="h-40 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

export default function ItemsGrid({
  items,
  isLoading,
  emptyMessage = "No items found",
  emptySubtext = "Try adjusting your search or filters",
}: ItemsGridProps) {
  if (isLoading) {
    return (
      <div
        data-ocid="items_list.loading_state"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {SKELETON_KEYS.map((k) => (
          <ItemCardSkeleton key={k} />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div
        data-ocid="items_list.empty_state"
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Package className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="font-display font-semibold text-lg text-foreground mb-2">
          {emptyMessage}
        </h3>
        <p className="text-muted-foreground text-sm max-w-xs">{emptySubtext}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <ItemCard key={item.id} item={item} index={index + 1} />
      ))}
    </div>
  );
}
