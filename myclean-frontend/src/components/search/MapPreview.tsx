import React from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

type MapPreviewProps = {
  locations: Array<{ id: number; lat?: number | null; lng?: number | null }>;
  center?: { lat: number; lng: number } | null;
};

type ValidLocation = { id: number; lat: number; lng: number };

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "360px",
  borderRadius: "1rem",
};

const isValidLocation = (location: MapPreviewProps["locations"][number]): location is ValidLocation =>
  typeof location.lat === "number" && typeof location.lng === "number";

const defaultCenter = { lat: -37.8136, lng: 144.9631 };

const MapPreview: React.FC<MapPreviewProps> = ({ locations, center }) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const hasValidLocations = locations.some(isValidLocation);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey ?? "",
  });

  const firstValidLocation = React.useMemo(() => locations.find(isValidLocation), [locations]);
  const resolvedCenter = center ?? (firstValidLocation ? { lat: firstValidLocation.lat, lng: firstValidLocation.lng } : defaultCenter);

  if (!apiKey) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow p-4 text-sm text-gray-500">
        Add a valid `REACT_APP_GOOGLE_MAPS_API_KEY` in your environment configuration to enable the interactive map.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow p-2">
      {loadError ? (
        <div className="p-6 text-center text-red-600 text-sm">Unable to load Google Maps. Please verify your API key configuration.</div>
      ) : isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={resolvedCenter}
          zoom={11}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          {locations.map((location) => {
            if (typeof location.lat !== "number" || typeof location.lng !== "number") {
              return null;
            }
            return <Marker key={location.id} position={{ lat: location.lat, lng: location.lng }} />;
          })}
        </GoogleMap>
      ) : (
        <div className="p-6 text-center text-gray-500 text-sm">Loading map…</div>
      )}
      {!hasValidLocations && (
        <div className="px-4 py-3 text-center text-sm text-gray-500 border-t border-gray-100">
          Add latitude and longitude to provider profiles to show their pins on the map.
        </div>
      )}
    </div>
  );
};

export default React.memo(MapPreview);
