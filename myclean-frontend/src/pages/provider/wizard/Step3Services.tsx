import React from "react";
import { SERVICE_GROUPS } from "./constants";
import { WizardServiceSelection } from "./types";

type Step3ServicesProps = {
  selected: WizardServiceSelection[];
  onChange: (services: WizardServiceSelection[]) => void;
};

const Step3Services: React.FC<Step3ServicesProps> = ({ selected, onChange }) => {
  const isSelected = (name: string, category: string) =>
    selected.some((service) => service.name === name && service.category === category);

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
        },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Select every service you provide. You can edit prices on your dashboard later.
      </p>

      {SERVICE_GROUPS.map((group) => (
        <div key={group.category} className="border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-800 mb-3">{group.category}</p>
          <div className="grid gap-3 md:grid-cols-2">
            {group.services.map((service) => (
              <label
                key={service}
                className={`flex items-center space-x-3 rounded-lg border px-4 py-3 cursor-pointer transition ${
                  isSelected(service, group.category)
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={isSelected(service, group.category)}
                  onChange={() => toggleService(service, group.category)}
                />
                <span className="text-sm text-gray-800">{service}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      {selected.length === 0 && (
        <p className="text-sm text-red-600">Select at least one service to continue.</p>
      )}
    </div>
  );
};

export default Step3Services;
