import React, { useState } from "react";
import { SERVICE_GROUPS } from "./constants";
import { WizardServiceSelection } from "./types";

type Step3ServicesProps = {
  selected: WizardServiceSelection[];
  onChange: (services: WizardServiceSelection[]) => void;
};

const Step3Services: React.FC<Step3ServicesProps> = ({ selected, onChange }) => {
  const [editingPrice, setEditingPrice] = useState<string | null>(null);

  const isSelected = (name: string, category: string) =>
    selected.some((service) => service.name === name && service.category === category);

  const getSelectedService = (name: string, category: string): WizardServiceSelection | undefined =>
    selected.find((service) => service.name === name && service.category === category);

  const toggleService = (name: string, category: string) => {
    if (isSelected(name, category)) {
      onChange(selected.filter((service) => !(service.name === name && service.category === category)));
    } else {
      onChange([
        ...selected,
        {
          id: `${category}-${name}`.toLowerCase(),
          name,
          category,
          pricePerHour: undefined, // User can set price after selection
        },
      ]);
    }
  };

  const updateServicePrice = (name: string, category: string, price: number | undefined) => {
    onChange(
      selected.map((service) =>
        service.name === name && service.category === category
          ? { ...service, pricePerHour: price }
          : service
      )
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Select every service you provide and set your hourly rate for each service.
      </p>

      {SERVICE_GROUPS.map((group) => (
        <div key={group.category} className="border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-800 mb-3">{group.category}</p>
          <div className="grid gap-3 md:grid-cols-2">
            {group.services.map((service) => {
              const selectedService = getSelectedService(service, group.category);
              const isServiceSelected = isSelected(service, group.category);
              
              return (
                <div
                  key={service}
                  className={`rounded-lg border px-4 py-3 transition ${
                    isServiceSelected
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={isServiceSelected}
                      onChange={() => toggleService(service, group.category)}
                    />
                    <span className="text-sm text-gray-800 flex-1">{service}</span>
                  </label>
                  
                  {isServiceSelected && (
                    <div className="mt-3 pt-3 border-t border-indigo-200">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Price per hour ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={selectedService?.pricePerHour ?? ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                          updateServicePrice(service, group.category, value);
                        }}
                        placeholder="0.00"
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {selected.length === 0 && (
        <p className="text-sm text-red-600">Select at least one service to continue.</p>
      )}
      {selected.length > 0 && selected.some((s) => !s.pricePerHour || s.pricePerHour <= 0) && (
        <p className="text-sm text-yellow-600">
          ⚠ Please set a price for all selected services.
        </p>
      )}
    </div>
  );
};

export default Step3Services;
