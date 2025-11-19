import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaStar, FaShieldAlt } from "react-icons/fa";
import Card from "../../components/Card";
import FilterSidebar, { FilterState } from "../../components/search/FilterSidebar";
import SortDropdown from "../../components/search/SortDropdown";
import { buildApiUrl } from "../../Services/api";

const SERVICE_OPTIONS = ["Deep Clean", "Standard Clean", "Move-out Clean", "Oven Cleaning", "Window Washing", "Carpet Cleaning"];

interface CleanerResult {
  id: number;
  name: string;
  bio: string;
  city: string; // Deprecated
  state: string; // Deprecated
  serviceSuburbs?: string[]; // Array of "Suburb (Postcode)"
  averageRating: number;
  totalReviews: number;
  minPrice: number | null;
  maxPrice: number | null;
  services: Array<{ id: number; serviceName: string; pricePerHour: number; durationMin: number }>;
  profileImage: string | null;
}

const INITIAL_FILTERS: FilterState = {
  priceRange: [0, 250],
  minRating: 0,
  radiusInKm: 20, // Not used anymore but kept for FilterState compatibility
  selectedServices: [],
  date: null,
  postcode: "",
  suburb: null,
};

const SearchProviders: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState("rating_desc");
  const [cleaners, setCleaners] = useState<CleanerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCleaners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, unknown> = {
        sortBy,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
        minRating: filters.minRating || undefined,
      };

      if (filters.selectedServices.length) {
        params.service = filters.selectedServices;
      }

      if (filters.date) {
        params.date = filters.date.toISOString().split("T")[0];
      }

      // Send suburb filter (new) or postcode (old) for backward compatibility
      if (filters.suburb) {
        params.suburb = filters.suburb.trim();
      } else if (filters.postcode) {
        params.postcode = filters.postcode.trim();
      }

      const response = await axios.get<{ providers: CleanerResult[] }>(buildApiUrl("/api/cleaners/search"), {
        params,
        withCredentials: true,
      });
      setCleaners(response.data.providers ?? []);
    } catch (requestError) {
      console.error("Search failed", requestError);
      setError("Failed to load cleaners. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]);

  useEffect(() => {
    void fetchCleaners();
  }, [fetchCleaners]);

  const handleFilterChange = (changes: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...changes }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-indigo-600 font-semibold uppercase tracking-wide">Find a cleaner</p>
              <h1 className="text-3xl font-bold text-gray-900">Search & filter professionals</h1>
            </div>
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
          <FilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            availableServices={SERVICE_OPTIONS}
          />

          <div className="space-y-6">
            {/* Active filters display */}
            <div className="bg-white rounded-2xl shadow px-4 py-3 flex flex-wrap items-center justify-between gap-3 border border-gray-100">
              <div className="text-sm text-gray-600">
                {filters.suburb ? (
                  <span className="font-medium text-indigo-700">
                    📍 Showing cleaners available in {filters.suburb}
                  </span>
                ) : (
                  <span>
                    {filters.selectedServices.length > 0
                      ? `Filtering by ${filters.selectedServices.join(", ")}`
                      : "Showing all services"}
                  </span>
                )}
                {filters.date && ` · Available on ${filters.date.toLocaleDateString()}`}
                {filters.selectedServices.length > 0 && filters.suburb && 
                  ` · Services: ${filters.selectedServices.join(", ")}`}
              </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>}

            {loading ? (
              <Card>
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
                  <p className="text-gray-600">Searching cleaners…</p>
                </div>
              </Card>
            ) : cleaners.length === 0 ? (
              <Card>
                <div className="py-12 text-center text-gray-600">No cleaners match your filters.</div>
              </Card>
            ) : (
              <div className="space-y-4">
                {cleaners.map((cleaner) => (
                  <Card key={cleaner.id} className="p-5 shadow hover:shadow-lg transition">
                    <div className="flex flex-col md:flex-row gap-5">
                      <img
                        src={
                          cleaner.profileImage ??
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(cleaner.name)}&background=2563eb&color=fff`
                        }
                        alt={cleaner.name}
                        className="w-24 h-24 rounded-2xl object-cover border border-gray-100"
                      />
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-semibold text-gray-900">{cleaner.name}</h2>
                          <span className="flex items-center text-sm font-medium text-yellow-500">
                            <FaStar className="mr-1" />
                            {cleaner.averageRating?.toFixed(1) ?? "New"} ({cleaner.totalReviews ?? 0})
                          </span>
                          <span className="flex items-center text-xs uppercase tracking-wide text-green-600 font-semibold">
                            <FaShieldAlt className="mr-1" /> Verified
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{cleaner.bio || "No bio provided."}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          {/* Service Suburbs Display */}
                          {cleaner.serviceSuburbs && cleaner.serviceSuburbs.length > 0 ? (
                            <span className="flex items-center">
                              <FaMapMarkerAlt className="mr-1 text-indigo-500" />
                              Services: {cleaner.serviceSuburbs.slice(0, 3).join(", ")}
                              {cleaner.serviceSuburbs.length > 3 && ` +${cleaner.serviceSuburbs.length - 3} more`}
                            </span>
                          ) : (
                            <span>
                              {cleaner.city}, {cleaner.state}
                            </span>
                          )}
                          {cleaner.minPrice != null && (
                            <span>
                              From ${cleaner.minPrice.toFixed(0)}/hr · up to ${cleaner.maxPrice?.toFixed(0) ?? cleaner.minPrice.toFixed(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cleaner.services.slice(0, 6).map((service) => (
                            <span key={service.id} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                              {service.serviceName}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/provider/${cleaner.id}`)}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                        >
                          View profile
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/provider/${cleaner.id}`, { state: { highlightServices: true } })}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-xl border-2 border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 transition"
                        >
                          Book now
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchProviders;
