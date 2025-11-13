import React, { useState, KeyboardEvent } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";

type Step2ServiceAreasProps = {
  servicePostcodes: string[];
  onChange: (postcodes: string[]) => void;
};

const Step2ServiceAreas: React.FC<Step2ServiceAreasProps> = ({ servicePostcodes, onChange }) => {
  const [newPostcode, setNewPostcode] = useState("");

  const handleAddPostcode = () => {
    const trimmed = newPostcode.trim();
    if (trimmed && !servicePostcodes.includes(trimmed)) {
      onChange([...servicePostcodes, trimmed]);
      setNewPostcode("");
    }
  };

  const handleRemovePostcode = (postcodeToRemove: string) => {
    onChange(servicePostcodes.filter((p) => p !== postcodeToRemove));
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPostcode();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Areas (Postcodes)
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Add all postcodes where you provide cleaning services. Customers will find you when they search for cleaners in these areas.
        </p>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newPostcode}
            onChange={(e) => setNewPostcode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter postcode (e.g., 3000)"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            maxLength={10}
          />
          <button
            type="button"
            onClick={handleAddPostcode}
            disabled={!newPostcode.trim() || servicePostcodes.includes(newPostcode.trim())}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FaPlus /> Add
          </button>
        </div>

        {servicePostcodes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {servicePostcodes.map((postcode) => (
              <span
                key={postcode}
                className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
              >
                {postcode}
                <button
                  type="button"
                  onClick={() => handleRemovePostcode(postcode)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <FaTimes size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {servicePostcodes.length === 0 && (
          <p className="text-sm text-red-600 mt-2">
            Please add at least one service postcode to continue.
          </p>
        )}
      </div>
    </div>
  );
};

export default Step2ServiceAreas;

