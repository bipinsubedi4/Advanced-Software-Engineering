import React from "react";
import Slider from "rc-slider";
import DatePicker from "react-datepicker";
import "rc-slider/assets/index.css";
import "react-datepicker/dist/react-datepicker.css";

export type FilterState = {
  priceRange: [number, number];
  minRating: number;
  radiusInKm: number;
  selectedServices: string[];
  date: Date | null;
  postcode: string; // Deprecated - kept for backward compatibility
  suburb: string; // New: suburb name for filtering
};

type FilterSidebarProps = {
  filters: FilterState;
  onChange: (changes: Partial<FilterState>) => void;
  onReset: () => void;
  availableServices: string[];
};

const ratingOptions = [
  { label: "Any rating", value: 0 },
  { label: "3★ & up", value: 3 },
  { label: "4★ & up", value: 4 },
  { label: "4.5★ & up", value: 4.5 },
];

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onChange, onReset, availableServices }) => {
  const toggleService = (service: string) => {
    if (filters.selectedServices.includes(service)) {
      onChange({ selectedServices: filters.selectedServices.filter((name) => name !== service) });
    } else {
      onChange({ selectedServices: [...filters.selectedServices, service] });
    }
  };

  return (
    <aside className="bg-white rounded-2xl shadow-lg p-5 space-y-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <button type="button" onClick={onReset} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
          Reset
        </button>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Price range (${filters.priceRange[0]}–${filters.priceRange[1]})</p>
        <Slider
          range
          value={filters.priceRange}
          min={0}
          max={250}
          step={5}
          allowCross={false}
          onChange={(value) => {
            if (Array.isArray(value) && value.length === 2) {
              onChange({ priceRange: [value[0] as number, value[1] as number] });
            }
          }}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Service Suburb or Postcode</p>
        <input
          type="text"
          value={filters.suburb || filters.postcode || ""}
          onChange={(e) => onChange({ suburb: e.target.value, postcode: "" })}
          placeholder="Enter suburb or postcode (e.g., South Brisbane or 4101)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <p className="text-xs text-gray-500 mt-1">
          Find cleaners who service this suburb or postcode area
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Minimum rating</p>
        <div className="grid gap-2">
          {ratingOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ minRating: option.value })}
              className={`text-sm px-3 py-2 rounded-lg border transition ${
                filters.minRating === option.value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 text-gray-700 hover:border-indigo-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Distance (km)</p>
        <Slider
          value={filters.radiusInKm}
          min={5}
          max={50}
          step={5}
          onChange={(value) => onChange({ radiusInKm: value as number })}
        />
        <p className="text-xs text-gray-500 mt-1">Within {filters.radiusInKm} km of your location.</p>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Services</p>
        <div className="space-y-2">
          {availableServices.map((service) => (
            <label key={service} className="flex items-center space-x-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={filters.selectedServices.includes(service)}
                onChange={() => toggleService(service)}
              />
              <span>{service}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Availability</p>
        <DatePicker
          selected={filters.date}
          onChange={(newDate) => onChange({ date: newDate ?? null })}
          minDate={new Date()}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
          placeholderText="Select a date"
        />
      </div>
    </aside>
  );
};

export default FilterSidebar;
