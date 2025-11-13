import React, { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";

export interface Suburb {
  suburb: string;
  postcode: string;
}

interface SuburbSelectorProps {
  selectedSuburbs: string[]; // Array of "Suburb (Postcode)" strings
  onChange: (suburbs: string[]) => void;
  label?: string;
  placeholder?: string;
}

const SuburbSelector: React.FC<SuburbSelectorProps> = ({
  selectedSuburbs,
  onChange,
  label = "Service Suburbs",
  placeholder = "Type suburb name or postcode...",
}) => {
  const [suburbs, setSuburbs] = useState<Suburb[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suburb[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load suburbs data
  useEffect(() => {
    const loadSuburbs = async () => {
      try {
        const response = await fetch("/data/qld_suburbs.json");
        const data: Suburb[] = await response.json();
        setSuburbs(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading suburbs:", error);
        setLoading(false);
      }
    };

    loadSuburbs();
  }, []);

  // Handle input change and filter suggestions
  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = inputValue.toLowerCase().trim();
    
    // Check if input is a number (postcode search)
    const isPostcodeSearch = /^\d+$/.test(query);

    const filtered = suburbs.filter((suburb) => {
      if (isPostcodeSearch) {
        // Search by postcode
        return suburb.postcode.startsWith(query);
      } else {
        // Search by suburb name
        return suburb.suburb.toLowerCase().startsWith(query);
      }
    });

    // Limit to 10 suggestions
    setSuggestions(filtered.slice(0, 10));
    setShowSuggestions(true);
  }, [inputValue, suburbs]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuburb = (suburb: Suburb) => {
    const suburbString = `${suburb.suburb} (${suburb.postcode})`;
    
    // Check if already selected
    if (selectedSuburbs.includes(suburbString)) {
      setInputValue("");
      setShowSuggestions(false);
      return;
    }

    // Add to selected suburbs
    onChange([...selectedSuburbs, suburbString]);
    setInputValue("");
    setShowSuggestions(false);
    
    // Focus back on input for quick multiple additions
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleRemoveSuburb = (suburbToRemove: string) => {
    onChange(selectedSuburbs.filter((suburb) => suburb !== suburbToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter key
    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      handleSelectSuburb(suggestions[0]);
    }
    
    // Handle Escape key
    if (e.key === "Escape") {
      setShowSuggestions(false);
      setInputValue("");
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>

      {/* Selected suburbs as chips */}
      {selectedSuburbs.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {selectedSuburbs.map((suburb) => (
            <span
              key={suburb}
              className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
            >
              {suburb}
              <button
                type="button"
                onClick={() => handleRemoveSuburb(suburb)}
                className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
                aria-label={`Remove ${suburb}`}
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input field with autocomplete */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={loading}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suburb, index) => {
              const suburbString = `${suburb.suburb} (${suburb.postcode})`;
              const isAlreadySelected = selectedSuburbs.includes(suburbString);
              
              return (
                <button
                  key={`${suburb.suburb}-${suburb.postcode}-${index}`}
                  type="button"
                  onClick={() => handleSelectSuburb(suburb)}
                  disabled={isAlreadySelected}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none ${
                    isAlreadySelected
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "text-gray-900"
                  } ${index === 0 ? "rounded-t-lg" : ""} ${
                    index === suggestions.length - 1 ? "rounded-b-lg" : ""
                  }`}
                >
                  <span className="font-medium">{suburb.suburb}</span>
                  <span className="text-gray-500 ml-2">({suburb.postcode})</span>
                  {isAlreadySelected && (
                    <span className="text-xs text-gray-400 ml-2">✓ Already added</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* No results message */}
        {showSuggestions && inputValue && suggestions.length === 0 && !loading && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-3"
          >
            <p className="text-sm text-gray-500 text-center">
              No matching suburb found. Please check your spelling or try a different suburb.
            </p>
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500">
        Type a suburb name or postcode to search. Selected suburbs will appear as tags above.
        You can add multiple suburbs where you provide services.
      </p>

      {/* Validation message */}
      {selectedSuburbs.length === 0 && (
        <p className="text-xs text-red-600">
          Please add at least one suburb where you provide cleaning services.
        </p>
      )}
    </div>
  );
};

export default SuburbSelector;

