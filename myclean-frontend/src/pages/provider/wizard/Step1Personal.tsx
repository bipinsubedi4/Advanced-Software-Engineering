import React, { ChangeEvent } from "react";
import { ProfileWizardState } from "./types";

type PersonalFields = Pick<ProfileWizardState, "profileImageUrl" | "fullName" | "phone" | "bio">;

type Step1PersonalProps = {
  data: PersonalFields;
  onChange: (changes: Partial<PersonalFields>) => void;
  onUploadPhoto: (file: File) => Promise<void>;
  uploading: boolean;
  uploadError: string | null;
};

const Step1Personal: React.FC<Step1PersonalProps> = ({ data, onChange, onUploadPhoto, uploading, uploadError }) => {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    onChange({ [name]: value });
  };

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await onUploadPhoto(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Profile Picture</p>
        <div className="flex items-center space-x-4">
          <img
            src={data.profileImageUrl ?? `https://placehold.co/120x120?text=${encodeURIComponent((data.fullName || "Cleaner").charAt(0) || "C")}`}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border border-gray-200"
          />
          <div>
            <label
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md cursor-pointer hover:bg-indigo-700 transition-colors"
            >
              {uploading ? "Uploading..." : "Upload Photo"}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={uploading} />
            </label>
            <p className="text-xs text-gray-500 mt-1">JPG or PNG, max 5MB.</p>
            {uploadError && <p className="text-sm text-red-600 mt-2">{uploadError}</p>}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={data.fullName}
          onChange={handleInputChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          placeholder="Jane Doe"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={data.phone}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder="+61 400 000 000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="bio">
          Short Bio / Summary
        </label>
        <textarea
          id="bio"
          name="bio"
          value={data.bio}
          onChange={handleInputChange}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          placeholder="10+ years of experience in residential cleaning..."
        />
        <p className="text-xs text-gray-500 mt-1">Share your experience, specialties, or certifications.</p>
      </div>
    </div>
  );
};

export default Step1Personal;
