import React from "react";

type SortDropdownProps = {
  value: string;
  onChange: (value: string) => void;
};

const sortOptions = [
  { label: "Highest rated", value: "rating_desc" },
  { label: "Lowest price", value: "price_asc" },
  { label: "Highest price", value: "price_desc" },
  { label: "Closest to me", value: "distance_asc" },
  { label: "Name (A–Z)", value: "name_asc" },
];

const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => (
  <div className="flex items-center space-x-2">
    <span className="text-sm text-gray-600">Sort by</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
    >
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default SortDropdown;
