import MapView from "@/components/map/MapView";

export function meta() {
  return [
    { title: "Stadia Map View | JCB Booking Marketplace" },
    { name: "description", content: "Interactive Stadia Maps MapView" },
  ];
}

export default function MapRoute() {
  return (
    <div className="h-[100dvh] w-full overflow-hidden">
      <MapView />
    </div>
  );
}
