import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface EventFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const categories = ["Concert", "Conference", "Sports", "Festival", "Workshop", "Theater", "Comedy"];
const locations = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Pune", "Hyderabad"];
const languages = ["English", "Hindi", "Marathi", "Tamil", "Telugu", "Bengali"];
const types = ["Online", "In-person", "Hybrid"];

export function EventFilters({ filters, onFiltersChange, searchQuery, onSearchChange }: EventFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: string) => {
    onFiltersChange({ ...filters, [key]: key === "priceRange" ? [0, 1000] : "" });
  };

  const quickCategories = ["Concert", "Conference", "Festival", "Workshop"];

  return (
    <div className="w-full space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events by name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Quick Category Chips */}
      <div className="flex flex-wrap gap-2">
        {quickCategories.map((category) => (
          <Badge
            key={category}
            variant={filters.category === category ? "default" : "outline"}
            className="cursor-pointer hover:scale-105 transition-transform px-4 py-2"
            onClick={() => updateFilter("category", filters.category === category ? "" : category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Filter Toggle Button (Mobile) */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filter Panel */}
      <div className={`${isFilterOpen || "hidden lg:block"} space-y-6 card-elevated p-6`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Button variant="ghost" size="sm" onClick={() => setIsFilterOpen(false)} className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Location</label>
              {filters.location && (
                <Button variant="ghost" size="sm" onClick={() => clearFilter("location")}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select value={filters.location} onValueChange={(value) => updateFilter("location", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Category</label>
              {filters.category && (
                <Button variant="ghost" size="sm" onClick={() => clearFilter("category")}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Language</label>
              {filters.language && (
                <Button variant="ghost" size="sm" onClick={() => clearFilter("language")}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select value={filters.language} onValueChange={(value) => updateFilter("language", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language} value={language}>{language}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Type</label>
              {filters.type && (
                <Button variant="ghost" size="sm" onClick={() => clearFilter("type")}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select value={filters.type} onValueChange={(value) => updateFilter("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Price Range (AVAX)</label>
              <span className="text-sm text-muted-foreground">
                {filters.priceRange[0]} - {filters.priceRange[1]}
              </span>
            </div>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilter("priceRange", value)}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Event Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange.from && dateRange.to ? dateRange : undefined}
                  onSelect={(range) => setDateRange(range || {})}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Clear All Filters */}
        <Button
          variant="outline"
          onClick={() => {
            onFiltersChange({
              location: "",
              category: "",
              language: "",
              type: "",
              priceRange: [0, 1000],
              dateRange: null
            });
            setDateRange({});
            onSearchChange("");
          }}
          className="w-full"
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );
}