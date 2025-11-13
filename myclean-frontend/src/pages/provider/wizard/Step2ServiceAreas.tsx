import React from "react";
import SuburbSelector from "../../../components/SuburbSelector";

type Step2ServiceAreasProps = {
  serviceSuburbs: string[];
  onChange: (suburbs: string[]) => void;
};

const Step2ServiceAreas: React.FC<Step2ServiceAreasProps> = ({ serviceSuburbs, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Select the Queensland suburbs where you provide cleaning services. Start typing a suburb name or postcode to see suggestions.
        </p>

        <SuburbSelector
          selectedSuburbs={serviceSuburbs}
          onChange={onChange}
          label="Service Suburbs"
          placeholder="Type suburb name or postcode (e.g., South Brisbane or 4101)..."
        />

        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: Adding more suburbs increases your visibility to potential customers in those areas.
        </p>
      </div>
    </div>
  );
};

export default Step2ServiceAreas;
