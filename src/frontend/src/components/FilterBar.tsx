import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Filter, Search, X } from "lucide-react";
import { useState } from "react";
import { Type, Type__1 } from "../backend.d";
import { categoryLabels } from "../utils/format";

export interface FilterState {
  search: string;
  category: string;
  location: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  scope: "lost_items" | "found_items";
}

const CATEGORY_GROUPS = [
  {
    label: "Electronics",
    categories: [Type__1.phone, Type__1.laptop, Type__1.earbuds],
  },
  {
    label: "Documents",
    categories: [Type__1.idCard],
  },
  {
    label: "Personal",
    categories: [
      Type__1.wallet,
      Type__1.keys,
      Type__1.jewelry,
      Type__1.accessories,
    ],
  },
  {
    label: "Other",
    categories: [Type__1.books, Type__1.bag, Type__1.clothing, Type__1.other],
  },
];

export default function FilterBar({
  filters,
  onFiltersChange,
  scope,
}: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFilterCount = [
    filters.category,
    filters.location,
    filters.status,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onFiltersChange({
      search: "",
      category: "",
      location: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  return (
    <div className="space-y-3">
      {/* Search + Filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or description…"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9"
            data-ocid={`${scope}.search_input`}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="shrink-0 gap-2"
          data-ocid={`${scope}.filter_button`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <Badge className="h-5 min-w-5 px-1 bg-primary text-white text-xs border-0">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        {(activeFilterCount > 0 || filters.search) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearAll}
            className="shrink-0 text-muted-foreground hover:text-destructive"
            data-ocid={`${scope}.clear_filter_button`}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Active category pill */}
      {filters.category && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Category:</span>
          <button
            type="button"
            onClick={() => updateFilter("category", "")}
            className="flex items-center gap-1.5 px-3 py-1 bg-primary text-white rounded-full text-xs font-medium"
          >
            {categoryLabels[filters.category as Type__1] ?? filters.category}
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="bg-white rounded-xl border border-border p-4 space-y-4 animate-fade-in shadow-card">
          {/* Category Groups */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">
              Category
            </Label>
            <div className="space-y-2">
              {CATEGORY_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="text-xs text-muted-foreground/70 uppercase tracking-wide font-semibold mb-1.5">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() =>
                          updateFilter(
                            "category",
                            filters.category === cat ? "" : cat,
                          )
                        }
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                          filters.category === cat
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary",
                        )}
                        data-ocid={`${scope}.category_pill`}
                      >
                        {categoryLabels[cat]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Location
              </Label>
              <Input
                placeholder="e.g. Library, Canteen…"
                value={filters.location}
                onChange={(e) => updateFilter("location", e.target.value)}
                data-ocid={`${scope}.location_input`}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Status
              </Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(v) =>
                  updateFilter("status", v === "all" ? "" : v)
                }
              >
                <SelectTrigger data-ocid={`${scope}.status_select`}>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.values(Type).map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Date From
              </Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
                data-ocid={`${scope}.date_input`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
