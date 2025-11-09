export const SERVICE_GROUPS = [
  {
    category: "General",
    services: ["Deep Clean", "Standard Clean", "Move-out Clean"],
  },
  {
    category: "Kitchen",
    services: ["Oven Cleaning", "Refrigerator Interior"],
  },
  {
    category: "Rooms",
    services: ["Carpet Cleaning", "Window Washing"],
  },
] as const;

export const findServiceCategory = (name: string): string => {
  const lower = name.toLowerCase();
  for (const group of SERVICE_GROUPS) {
    if (group.services.some((service) => service.toLowerCase() === lower)) {
      return group.category;
    }
  }
  return "General";
};

export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
