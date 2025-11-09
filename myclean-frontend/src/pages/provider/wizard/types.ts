export type WizardServiceSelection = {
  id: string;
  name: string;
  category: string;
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
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceRadius: number;
  services: WizardServiceSelection[];
  availability: DayAvailability[];
}
