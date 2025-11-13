export type WizardServiceSelection = {
  id: string;
  name: string;
  category: string;
  pricePerHour?: number; // Price in dollars
};

export type AvailabilityBlock = {
  id: string;
  startTime: string;
  endTime: string;
};

export type DayAvailability = {
  day: string;
  blocks: AvailabilityBlock[];
};

export interface ProfileWizardState {
  profileImageUrl: string | null;
  fullName: string;
  phone: string;
  bio: string;
  servicePostcodes: string[];
  services: WizardServiceSelection[];
  availability: DayAvailability[];
}
