import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { categoriesAPI, locationsAPI, searchAPI } from '@/lib/api';

interface EventFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

// Static fallback data
const fallbackCategories = ["Concert", "Conference", "Sports", "Festival", "Workshop", "Theater", "Comedy"];
const fallbackLocations = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Pune", "Hyderabad"];
const fallbackLanguages = ["English", "Hindi", "Marathi", "Tamil", "Telugu", "Bengali"];
const fallbackTypes = ["Online", "In-person", "Hybrid"];

export function EventFilters({ filters, onFiltersChange, searchQuery, onSearchChange }: EventFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [categories, setCategories] = useState<string[]>(fallbackCategories);
  const [locations, setLocations] = useState<string[]>(fallbackLocations);
  const [languages, setLanguages] = useState<string[]>(fallbackLanguages);
  const [types, setTypes] = useState<string[]>(fallbackTypes);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [filterPresets, setFilterPresets] = useState<any[]>([]);
  const [apiErrors, setApiErrors] = useState<{[key: string]: boolean}>({});

  // Fetch categories from backend with fallback
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        setApiErrors(prev => ({ ...prev, categories: false }));
        
        const response = await categoriesAPI.getAll() as any;
        if (response && response.success && response.categories && Array.isArray(response.categories)) {
          const categoryNames = response.categories.map((cat: any) => cat.name || cat.title || cat);
          if (categoryNames.length > 0) {
            setCategories(categoryNames);
            return;
          }
        }
        
        // If primary API fails, try popular categories
        const popularResponse = await categoriesAPI.getPopular() as any;
        if (popularResponse && popularResponse.success && popularResponse.categories && Array.isArray(popularResponse.categories)) {
          const categoryNames = popularResponse.categories.map((cat: any) => cat.name || cat.title || cat);
          if (categoryNames.length > 0) {
            setCategories(categoryNames);
            return;
          }
        }
        
        // Use fallback if both APIs fail
        console.warn('Both category APIs failed, using fallback data');
        setApiErrors(prev => ({ ...prev, categories: true }));
        
      } catch (error) {
        console.error('Error fetching categories:', error);
        setApiErrors(prev => ({ ...prev, categories: true }));
        // Keep fallback categories on error
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch locations from backend with fallback
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoadingLocations(true);
        setApiErrors(prev => ({ ...prev, locations: false }));
        
        const response = await locationsAPI.getAll() as any;
        if (response && response.success && response.locations && Array.isArray(response.locations)) {
          const locationNames = response.locations.map((loc: any) => loc.name || loc.city || loc);
          if (locationNames.length > 0) {
            setLocations(locationNames);
            return;
          }
        }
        
        // If primary API fails, try popular locations
        const popularResponse = await locationsAPI.getPopular() as any;
        if (popularResponse && popularResponse.success && popularResponse.locations && Array.isArray(popularResponse.locations)) {
          const locationNames = popularResponse.locations.map((loc: any) => loc.name || loc.city || loc);
          if (locationNames.length > 0) {
            setLocations(locationNames);
            return;
          }
        }
        
        // Use fallback if both APIs fail
        console.warn('Both location APIs failed, using fallback data');
        setApiErrors(prev => ({ ...prev, locations: true }));
        
      } catch (error) {
        console.error('Error fetching locations:', error);
        setApiErrors(prev => ({ ...prev, locations: true }));
        // Keep fallback locations on error
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  // Fetch filter presets from backend with fallback
  useEffect(() => {
    const fetchFilterPresets = async () => {
      try {
        setIsLoadingFilters(true);
        setApiErrors(prev => ({ ...prev, presets: false }));
        
        const response = await searchAPI.getFilterPresets() as any;
        if (response && response.success && response.presets && Array.isArray(response.presets)) {
          setFilterPresets(response.presets);
        } else {
          // Use empty array if API fails
          setFilterPresets([]);
          setApiErrors(prev => ({ ...prev, presets: true }));
        }
      } catch (error) {
        console.error('Error fetching filter presets:', error);
        setFilterPresets([]);
        setApiErrors(prev => ({ ...prev, presets: true }));
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchFilterPresets();
  }, []);

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Update date range filter
  const updateDateRange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range);
    onFiltersChange({ 
      ...filters, 
      dateRange: range.from && range.to ? { from: range.from, to: range.to } : null 
    });
  };

  const clearFilter = (key: string) => {
    onFiltersChange({ ...filters, [key]: key === "priceRange" ? [0, 1000] : "" });
  };

  const applyAdvancedFilters = async (advancedFilters: any) => {
    try {
      setIsLoadingFilters(true);
      setApiErrors(prev => ({ ...prev, advanced: false }));
      
      const response = await searchAPI.applyAdvancedFilters(advancedFilters) as any;
      if (response && response.success) {
        // Update filters with backend-validated data
        onFiltersChange(response.filters || advancedFilters);
      } else {
        // Fallback to local filter update
        onFiltersChange(advancedFilters);
        setApiErrors(prev => ({ ...prev, advanced: true }));
      }
    } catch (error) {
      console.error('Error applying advanced filters:', error);
      // Fallback to local filter update
      onFiltersChange(advancedFilters);
      setApiErrors(prev => ({ ...prev, advanced: true }));
    } finally {
      setIsLoadingFilters(false);
    }
  };

  const quickCategories = categories.slice(0, 4); // Show first 4 categories

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-10 text-sm"
        />
      </div>

      {/* Quick Category Chips */}
      <div className="flex flex-wrap gap-2">
        {isLoadingCategories ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-muted-foreground">Loading categories...</span>
          </div>
        ) : (
          <>
            {quickCategories.map((category) => (
              <Badge
                key={category}
                variant={filters.category === category ? "default" : "outline"}
                className="cursor-pointer hover:scale-105 transition-transform px-3 py-1 text-xs"
                onClick={() => updateFilter("category", filters.category === category ? "" : category)}
              >
                {category}
              </Badge>
            ))}
            {apiErrors.categories && (
              <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                Using fallback data
              </div>
            )}
          </>
        )}
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
      <div className={`${isFilterOpen || "hidden lg:block"} space-y-4 card-elevated p-4`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Button variant="ghost" size="sm" onClick={() => setIsFilterOpen(false)} className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
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
                <SelectValue placeholder={isLoadingLocations ? "Loading locations..." : "Select location"} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingLocations ? (
                  <div className="flex items-center justify-center py-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-sm text-muted-foreground">Loading locations...</span>
                  </div>
                ) : (
                  <>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                    {apiErrors.locations && (
                      <div className="px-2 py-1 text-xs text-amber-600 bg-amber-50">
                        Using fallback data
                      </div>
                    )}
                  </>
                )}
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
                {apiErrors.categories && (
                  <div className="px-2 py-1 text-xs text-amber-600 bg-amber-50">
                    Using fallback data
                  </div>
                )}
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
              <label className="text-sm font-medium">Price Range (₹)</label>
              <span className="text-sm text-muted-foreground">
                ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
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
            {/* Quick Price Presets */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Free", range: [0, 0] },
                { label: "Budget", range: [0, 50] },
                { label: "Mid-Range", range: [50, 200] },
                { label: "Premium", range: [200, 1000] }
              ].map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilter("priceRange", preset.range)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
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
                  selected={dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
                  onSelect={(range) => updateDateRange(range || {})}
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

        {/* API Status Indicators */}
        {(apiErrors.categories || apiErrors.locations || apiErrors.presets) && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-sm text-amber-800">
              <div className="font-medium mb-1">API Status:</div>
              <div className="space-y-1 text-xs">
                {apiErrors.categories && <div>• Categories: Using fallback data</div>}
                {apiErrors.locations && <div>• Locations: Using fallback data</div>}
                {apiErrors.presets && <div>• Filter presets: Unavailable</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}