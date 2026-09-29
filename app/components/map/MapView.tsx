import { useEffect, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

const STADIA_KEY =
  import.meta.env.VITE_STADIA_KEY || "abd1cf7c-c8ca-4b47-a786-de5a7d41aaa6";
const STYLE_URL = `https://tiles.stadiamaps.com/styles/alidade_smooth.json?api_key=${STADIA_KEY}`;

export interface MapViewProps {
  initialLongitude?: number;
  initialLatitude?: number;
  initialZoom?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function MapView({
  initialLongitude = 77.101,
  initialLatitude = 13.3409,
  initialZoom = 12,
  style = { width: "100%", height: "100dvh" },
  children,
}: MapViewProps) {
  const [MapModule, setMapModule] = useState<any>(null);

  useEffect(() => {
    import("react-map-gl/maplibre").then((mod) => {
      setMapModule(mod);
    });
  }, []);

  if (!MapModule) {
    return (
      <div
        style={style}
        className="flex items-center justify-center bg-slate-900 text-slate-400 font-bold"
      >
        <div className="flex items-center gap-2">
          <div className="size-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span>Loading Stadia Map...</span>
        </div>
      </div>
    );
  }

  const { default: Map, Marker, NavigationControl, GeolocateControl } = MapModule;

  return (
    <Map
      initialViewState={{
        longitude: initialLongitude,
        latitude: initialLatitude,
        zoom: initialZoom,
      }}
      style={style}
      mapStyle={STYLE_URL}
    >
      <NavigationControl position="top-right" />
      <GeolocateControl position="top-right" />
      <Marker longitude={initialLongitude} latitude={initialLatitude} />
      {children}
    </Map>
  );
}

export { MapView };
