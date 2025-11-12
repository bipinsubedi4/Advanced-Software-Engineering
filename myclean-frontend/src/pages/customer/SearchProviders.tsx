import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaStar, FaShieldAlt } from "react-icons/fa";
import Card from "../../components/Card";
import FilterSidebar, { FilterState } from "../../components/search/FilterSidebar";
import SortDropdown from "../../components/search/SortDropdown";
import MapPreview from "../../components/search/MapPreview";
import { buildApiUrl } from "../../Services/api";

const SERVICE_OPTIONS = ["Deep Clean", "Standard Clean", "Move-out Clean", "Oven Cleaning", "Window Washing", "Carpet Cleaning"];

interface CleanerResult {
  id: number;
  name: string;
  bio: string;
  city: string;
  state: string;
  averageRating: number;
  totalReviews: number;
  minPrice: number | null;
  maxPrice: number | null;
  services: Array<{ id: number; serviceName: string; pricePerHour: number; durationMin: number }>;
  serviceRadius: number;
  distanceKm: number | null;
  profileImage: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

const INITIAL_FILTERS: FilterState = {
  priceRange: [0, 250],
  minRating: 0,
  radiusInKm: 20,
  selectedServices: [],
  date: null,
};

const SearchProviders: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState("rating_desc");
  const [cleaners, setCleaners] = useState<CleanerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientLocation, setClientLocation] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });

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

      if (clientLocation.lat != null && clientLocation.lng != null) {
        params.lat = clientLocation.lat;
        params.lng = clientLocation.lng;
        params.radiusInKm = filters.radiusInKm;
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
  }, [filters, sortBy, clientLocation]);

  useEffect(() => {
    void fetchCleaners();
  }, [fetchCleaners]);

  const handleFilterChange = (changes: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...changes }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setClientLocation({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        });
      },
      () => setError("Unable to retrieve your location."),
      { enableHighAccuracy: true }
    );
  };

  const mapLocations = useMemo(
    () =>
      cleaners
        .map((cleaner) => ({
          id: cleaner.id,
          lat: cleaner.latitude ?? null,
          lng: cleaner.longitude ?? null,
        }))
        .filter((location) => location.lat != null && location.lng != null),
    [cleaners]
  );

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
            <div className="bg-white rounded-2xl shadow px-4 py-3 flex flex-wrap items-center justify-between gap-3 border border-gray-100">
              <div className="text-sm text-gray-600">
                {filters.selectedServices.length > 0
                  ? `Filtering by ${filters.selectedServices.join(", ")}`
                  : "Showing all services"}
                {filters.date && ` · Available on ${filters.date.toLocaleDateString()}`}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={requestLocation}
                  className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <FaMapMarkerAlt className="mr-1" /> Use my location
                </button>
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
                          {cleaner.distanceKm != null && (
                            <span className="text-sm text-gray-500 flex items-center">
                              <FaMapMarkerAlt className="mr-1 text-indigo-500" />
                              {cleaner.distanceKm.toFixed(1)} km away
                            </span>
                          )}
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
                          <span>
                            {cleaner.city}, {cleaner.state}
                          </span>
                          {cleaner.minPrice != null && (
                            <span>
                              From ${cleaner.minPrice.toFixed(0)}/hr · up to ${cleaner.maxPrice?.toFixed(0) ?? cleaner.minPrice.toFixed(0)}
                            </span>
                          )}
                          <span>Radius {cleaner.serviceRadius} km</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cleaner.services.slice(0, 6).map((service) => (
                            <span key={service.id} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                              {service.serviceName}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col justify-between">
                        <a
                          href={`/provider/${cleaner.id}`}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                        >
                          View profile
                        </a>
                        <button
                          type="button"
                          className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          Book now
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <MapPreview locations={mapLocations} center={clientLocation.lat && clientLocation.lng ? { lat: clientLocation.lat, lng: clientLocation.lng } : null} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchProviders;
