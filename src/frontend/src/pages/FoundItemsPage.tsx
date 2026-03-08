import { Package } from "lucide-react";
import { useMemo, useState } from "react";
import { type Type, type Type__1, Type__2 } from "../backend.d";
import FilterBar, { type FilterState } from "../components/FilterBar";
import ItemsGrid from "../components/ItemsGrid";
import { useSearchItems } from "../hooks/useQueries";
import { dateToTimestamp } from "../utils/format";

export default function FoundItemsPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    location: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  const backendFilters = useMemo(() => {
    const f: Record<string, unknown> = { itemType: Type__2.found };
    if (filters.category) f.category = filters.category as Type__1;
    if (filters.location) f.location = filters.location;
    if (filters.status) f.status = filters.status as Type;
    if (filters.dateFrom) f.dateFrom = dateToTimestamp(filters.dateFrom);
    if (filters.dateTo) f.dateTo = dateToTimestamp(filters.dateTo);
    return f;
  }, [filters]);

  const { data: items = [], isLoading } = useSearchItems(
    filters.search,
    backendFilters as never,
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
          <Package className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Found Items
          </h1>
          <p className="text-muted-foreground text-sm">
            Browse items found on campus waiting to be claimed
          </p>
        </div>
        <div className="ml-auto">
          <span className="text-sm text-muted-foreground">
            {isLoading ? "…" : items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          scope="found_items"
        />
      </div>

      {/* Items Grid */}
      <ItemsGrid
        items={items}
        isLoading={isLoading}
        emptyMessage="No found items reported"
        emptySubtext="If you found something, please report it to help the owner."
      />
    </div>
  );
}
