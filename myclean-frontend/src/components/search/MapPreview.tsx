import React from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

type MapPreviewProps = {
  locations: Array<{ id: number; lat?: number | null; lng?: number | null }>;
  center?: { lat: number; lng: number } | null;
};

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "360px",
  borderRadius: "1rem",
};

const MapPreview: React.FC<MapPreviewProps> = ({ locations, center }) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const hasValidData = Boolean(apiKey && locations.some((location) => typeof location.lat === "number" && typeof location.lng === "number"));

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey ?? "",
  });

  if (!apiKey || !hasValidData) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow p-4 text-sm text-gray-500">
        Add a valid `REACT_APP_GOOGLE_MAPS_API_KEY` and cleaners with latitude/longitude to see the interactive map.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow p-2">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={
            center ??
            locations.find((location) => typeof location.lat === "number" && typeof location.lng === "number") ?? {
              lat: -37.8136,
              lng: 144.9631,
            }
          }
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
    </div>
  );
};

export default React.memo(MapPreview);
