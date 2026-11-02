import { RealtimeMap } from "@/components/map/realtime-map";

export function meta() {
  return [
    { title: "Realtime Map | DigiMitra JCB Booking Marketplace" },
    { name: "description", content: "High-precision satellite realtime map" },
  ];
}

export default function MapRoute() {
  return (
    <div className="h-[100dvh] w-full overflow-hidden">
      <RealtimeMap fullScreen />
    </div>
  );
}
