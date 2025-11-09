import React, { ChangeEvent } from "react";
import { ProfileWizardState } from "./types";

type LocationFields = Pick<
  ProfileWizardState,
  "address" | "city" | "state" | "zipCode" | "serviceRadius" | "latitude" | "longitude"
>;

type Step2LocationProps = {
  data: LocationFields;
  onChange: (changes: Partial<LocationFields>) => void;
};

const RADIUS_OPTIONS = [5, 10, 25, 50];

const Step2Location: React.FC<Step2LocationProps> = ({ data, onChange }) => {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    if (name === "serviceRadius") {
      onChange({ [name]: Number(value) });
    } else if (name === "latitude" || name === "longitude") {
      onChange({ [name]: value ? Number(value) : null });
    } else {
      onChange({ [name]: value });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
          Primary Address
        </label>
        <input
          id="address"
          name="address"
          type="text"
          value={data.address}
          onChange={handleInputChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          placeholder="123 Main Street"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="city">
            City
          </label>
          <input
            id="city"
            name="city"
            type="text"
            value={data.city}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder="Melbourne"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="state">
            State / Territory
          </label>
          <input
            id="state"
            name="state"
            type="text"
            value={data.state}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder="VIC"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="zipCode">
            Postal Code
          </label>
          <input
            id="zipCode"
            name="zipCode"
            type="text"
            value={data.zipCode}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder="3000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location Coordinates</label>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="number"
            step="0.000001"
            name="latitude"
            value={data.latitude ?? ""}
            onChange={handleInputChange}
            placeholder="-37.8136"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <input
            type="number"
            step="0.000001"
            name="longitude"
            value={data.longitude ?? ""}
            onChange={handleInputChange}
            placeholder="144.9631"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            if (!navigator.geolocation) return;
            navigator.geolocation.getCurrentPosition(
              (position) => {
                onChange({
                  latitude: Number(position.coords.latitude.toFixed(6)),
                  longitude: Number(position.coords.longitude.toFixed(6)),
                });
              },
              () => undefined,
              { enableHighAccuracy: true }
            );
          }}
          className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Use my current location
        </button>
        <p className="text-xs text-gray-500">Coordinates help us run accurate distance matches.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="serviceRadius">
          Service Radius
        </label>
        <select
          id="serviceRadius"
          name="serviceRadius"
          value={data.serviceRadius}
          onChange={handleInputChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        >
          {RADIUS_OPTIONS.map((value) => (
            <option key={value} value={value}>
              Up to {value} km
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">We use this radius to match you with nearby jobs.</p>
      </div>
    </div>
  );
};

export default Step2Location;
