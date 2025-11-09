-- Rename profileComplete column to isProfileComplete
ALTER TABLE "ProviderProfile"
  RENAME COLUMN "profileComplete" TO "isProfileComplete";
